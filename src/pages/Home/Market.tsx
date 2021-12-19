import { useState, useMemo, useEffect } from 'react';
import { t, Trans } from '@lingui/macro';
import styled from 'styled-components';


import Button, { ButtonStatus } from '../../components/Button';
import { message } from '../../components/Message';
import Table, { TableColumn } from '../../components/Table';
import {
    renderCoinInfo,
    renderPriceTips,
    renderAmountTips,
    renderRatio,
    renderRatioTips,
    renderRatioDisabledTips,
    renderApplyTips
} from '../../components/TableRender';
import Modal from '../../components/Modal';
import { IconWrapper } from '../../components/Icon';

import { useEnabled, useSwapRate } from '../../hooks/contract/handle';

import { useAppDispatch } from '../../state/hooks';
import { useMobile, updateConfigReload } from '../../state/config';
import { useUserInfo } from '../../state/user';
import {
    MarketStatusEnums,
    useState as useMatketState,
    useMarketMap,
    useSupplyMap,
    useBorrowMap,
    useTokenAddress,
    useCoinMaxLoanableAndLiquidation
} from '../../state/market';
import { useState as useAfterState, useAfterSupply, useAfterBorrow } from '../../state/after';

import { Font, Grid, TableAbove } from '../../styled';


const TableWrapper = styled.div`
&:not(:last-child) {
    margin-bottom: 20px;
}
`;

const useEnabledSupplyInfo = ({ symbol, enabled }: {
    symbol: string
    enabled: boolean
}): { disabled: boolean, EnabledSupplyInfo: React.FC<React.ReactNode> } => {
    const { price } = useMatketState();
    const { totalDebtETH } = useUserInfo() ?? {};
    const maxLoanableAndLiquidation = useCoinMaxLoanableAndLiquidation();

    const borrow = useMemo(() => {
        if (!maxLoanableAndLiquidation || !totalDebtETH) return;

        let totalLoanable = 0, afterLoanable = 0, totalLiquidation = 0;

        maxLoanableAndLiquidation.forEach(item => {
            if (item.enabled) {
                totalLoanable += item.loanable;
                totalLiquidation += item.liquidation;

                if (symbol !== item.symbol) {
                    afterLoanable += item.loanable;
                }
            }

            if (!enabled && symbol === item.symbol) afterLoanable += item.loanable;
        });

        return [totalLoanable, afterLoanable, totalDebtETH / totalLoanable, totalDebtETH > afterLoanable ? undefined : totalDebtETH / afterLoanable];
    }, [maxLoanableAndLiquidation, totalDebtETH]);

    const [loanable, loanableAfter, ratio, ratioAfter] = borrow ?? [];

    const EnabledSupplyInfo = () => {
        return <>
            {!ratioAfter ?
                <Font fontColor="#939DA7" size="14px" style={{ marginBottom: 30 }}>
                    <Trans>该资产是被用来支撑您所借的资金。停用资产作为抵押品会使您的仓位被清算。 在停用该资产前，请偿还所贷款或提供不同的资产作为抵押品。</Trans>
                </Font> : null}

            <Grid column={2} rowGap="20px" alignItems="center" justifyContent="space-between">
                <Font size="14px" weight="700"><Trans>贷款限额:</Trans></Font>
                <Grid column={3} justifyContent="flex-end" alignItems="center" columnGap="5px">
                    <Font size="20px">{renderPriceTips(loanable, price)}</Font>
                    <IconWrapper iconColor="#939DA7" name="dapp-drop-down" style={{ transform: "rotate(-90deg)" }} />
                    <Font size="20px">{renderPriceTips(loanableAfter, price)}</Font>
                </Grid>

                <Font size="14px" weight="700"><Trans>已使用借款额度:</Trans></Font>
                <Grid column={3} justifyContent="flex-end" alignItems="center" columnGap="5px">
                    <Font size="20px">{!!ratio ? renderRatio(ratio) : "-"}</Font>
                    <IconWrapper iconColor="#939DA7" name="dapp-drop-down" style={{ transform: "rotate(-90deg)" }} />
                    <Font size="20px">{!!ratioAfter ? renderRatio(ratioAfter) : <Trans>清算</Trans>}</Font>
                </Grid>
            </Grid>
        </>
    }

    return { disabled: !!ratioAfter, EnabledSupplyInfo };
}

const EnabledSupply = ({ symbol, amount, usageAsCollateralEnableds, disabled }: {
    symbol: string,
    amount: string,
    usageAsCollateralEnableds: boolean
    disabled: boolean
}) => {
    const dispatch = useAppDispatch();

    const [open, setOpen] = useState(false);
    const [buttonStatus, setButtonStatus] = useState<ButtonStatus>();
    const [confirmStatus, setConfirmStatus] = useState<ButtonStatus>();

    const { disabled: tokenDisabled, EnabledSupplyInfo } = useEnabledSupplyInfo({ symbol, enabled: usageAsCollateralEnableds });

    const address = useTokenAddress(symbol, true);
    const enabled = useEnabled(address, !usageAsCollateralEnableds);

    const enabledHandle = () => {
        setConfirmStatus("loading");

        enabled().then((res: any) => {
            console.log(res);

            res.wait().then((res: any) => {
                console.log(res);
                message.success(t`操作成功`);

                dispatch(updateConfigReload());
                setButtonStatus(undefined);
                setConfirmStatus(undefined);
                setOpen(false);
            }).catch((error: any) => {
                console.error(error);
                message.error(error.message);

                setConfirmStatus(undefined);
            });
        }).catch((error: any) => {
            console.error(error);
            message.error(error.message);

            setConfirmStatus(undefined);
        });
    }

    const onClick = () => {
        setOpen(true);
        setButtonStatus("loading");
    }

    const onCancel = () => {
        setOpen(false);
        setButtonStatus(undefined);
    }

    useEffect(() => {
        setConfirmStatus(!tokenDisabled ? "disabled" : "default");
    }, [tokenDisabled]);

    useEffect(() => {
        if (disabled) setButtonStatus("disabled");
    }, [disabled]);

    return <>
        <Button theme="gray" size="sm" status={buttonStatus} onClick={onClick}>
            {usageAsCollateralEnableds ? <Trans>停用</Trans> : <Trans>启用</Trans>}
        </Button>
        <Modal
            open={open}
            type="warning"
            width="430px"
            title={usageAsCollateralEnableds ? t`停用抵押品` : t`启用抵押品`}
            onCancel={onCancel}
            onConfirm={enabledHandle}
            cancelStatus={confirmStatus === "loading" ? "disabled" : "default"}
            confirmStatus={confirmStatus}
            confirmText={usageAsCollateralEnableds ? t`停用` : t`启用`}
        >
            <EnabledSupplyInfo />
        </Modal>
    </>
}

const renderEnabledSupply = (symbol: string, amount: string, usageAsCollateralEnableds: boolean, disabled: boolean) => {
    return <EnabledSupply {...{ symbol, amount, usageAsCollateralEnableds, disabled }} />
}

const ChangeRate = ({ symbol, amount, loanType, disabled, }: { symbol: string, amount: string, loanType: number, disabled: boolean }) => {
    const dispatch = useAppDispatch();

    const [buttonStatus, setButtonStatus] = useState<ButtonStatus>();

    const address = useTokenAddress(symbol, true);
    const swapRate = useSwapRate(address, loanType === 2 ? 2 : 1);

    const onClick = () => {
        setButtonStatus("loading");

        swapRate().then((res: any) => {
            console.log(res);

            res.wait().then((res: any) => {
                console.log(res);
                message.success(t`操作成功`);

                dispatch(updateConfigReload());
                setButtonStatus(undefined);
            }).catch((error: any) => {
                console.error(error);
                message.error(error.message);

                setButtonStatus(undefined);
            });
        }).catch((error: any) => {
            console.error(error);
            message.error(error.message);

            setButtonStatus(undefined);
        });
    }

    useEffect(() => {
        if (disabled) setButtonStatus("disabled");
    }, [disabled]);

    return <Button theme="gray" size="sm" status={buttonStatus} onClick={onClick} style={{ width: 150 }}>
        {loanType === 2 ? <Trans>To variable</Trans> : <Trans>To stable</Trans>}
    </Button>
}

const renderChangeRate = (symbol: string, amount: string, loanType: number, disabled: boolean) => {
    return <ChangeRate {...{ symbol, amount, loanType, disabled }} />
}

const Market = () => {
    const isMobile = useMobile();
    const { marketStatus, loanStatus, price } = useMatketState();

    const marketMap = useMarketMap();
    const supplyMap = useSupplyMap();
    const borrowMap = useBorrowMap();

    const marketData = useMemo(() => marketMap ? Object.values(marketMap) : undefined, [marketMap]);
    const supplyData = useMemo(() => supplyMap ? Object.values(supplyMap) : undefined, [supplyMap]);
    const borrowData = useMemo(() => borrowMap ? Object.values(borrowMap) : undefined, [borrowMap]);


    const { theme: afterTheme, loading } = useAfterState();
    const afterSupply = useAfterSupply();
    const afterBorrow = useAfterBorrow();

    // console.log(marketData, supplyData, borrowData, marketStatus, loanStatus);
    // console.log(afterSupply);

    return <>
        {supplyData ? <TableWrapper>
            <TableAbove>
                <Font size="20px"><Trans>供应中</Trans></Font>
            </TableAbove>
            <Table
                dataSource={supplyData ?? []}
                afterSource={afterSupply}
                afterTheme={afterTheme}
                loading={loanStatus === MarketStatusEnums.LOADING}
            >
                <TableColumn first width={isMobile ? "110px" : "196px"} title={t`资产`} dataKey="symbol" render={renderCoinInfo} />
                <TableColumn width={isMobile ? "120px" : "168px"} title={t`已供应`} render={(_, __, { amount, symbol }) => renderAmountTips(amount, symbol)} />
                <TableColumn width={isMobile ? "100px" : "196px"} title={t`已供应($)`} dataKey="priceETH" render={(value) => renderPriceTips(value, price)} />
                <TableColumn width={isMobile ? "100px" : "190px"} title={t`供应 APY`} dataKey="rate" render={(value) => renderRatioTips(value)} />
                <TableColumn width={isMobile ? "80px" : "120px"} title={t`抵押因素`} dataKey="collateralFactor" render={(value) => renderRatio(value, true)} />
                <TableColumn hidden width={isMobile ? "80px" : "100px"} align="right" title={t`抵押物`}
                    render={(_, __, { symbol, amount, usageAsCollateralEnableds }) => renderEnabledSupply(symbol, amount, usageAsCollateralEnableds, !!afterSupply)}
                />
            </Table>
        </TableWrapper> : null}

        {borrowData ? <TableWrapper>
            <TableAbove>
                <Font size="20px"><Trans>贷款中</Trans></Font>
            </TableAbove>
            <Table
                dataSource={borrowData ?? []}
                afterSource={afterBorrow}
                afterTheme={afterTheme}
                loading={loanStatus === MarketStatusEnums.LOADING}
            >
                <TableColumn first width={isMobile ? "110px" : "140px"} title={t`资产`} dataKey="symbol" render={renderCoinInfo} />
                <TableColumn width={isMobile ? "120px" : "160px"} title={t`已借贷`} render={(_, __, { amount, symbol }) => renderAmountTips(amount, symbol)} />
                <TableColumn width={isMobile ? "100px" : "170px"} title={t`已借贷($)`} dataKey="priceETH" render={(value) => renderPriceTips(value, price)} />
                <TableColumn width={isMobile ? "100px" : "140px"} title={t`贷款 APY`} dataKey="rate" render={(value) => renderRatioTips(value)} />
                <TableColumn hidden width={isMobile ? "120px" : "160px"} title={t`Interest Rate`} dataKey="loanType" render={(value) => value === 2 ? t`Stable` : t`Variable`} />
                <TableColumn hidden width={isMobile ? "160px" : "190px"} title={t`Change interest rate`}
                    render={(_, __, { symbol, amount, loanType }) => renderChangeRate(symbol, amount, loanType, !!afterBorrow)}
                />
                <TableColumn width={isMobile ? "80px" : "100px"} align="right" title={t`限制`} dataKey="ratio" render={(value) => renderRatio(value)} />
            </Table>
        </TableWrapper> : null}

        <TableWrapper>
            <TableAbove>
                <Font size="20px"><Trans>市场信息</Trans></Font>
            </TableAbove>

            <Table dataSource={marketData ?? []} loading={marketStatus === MarketStatusEnums.LOADING}>
                <TableColumn width={isMobile ? "110px" : "120px"} title={t`资产`} dataKey="symbol" render={renderCoinInfo} />
                <TableColumn width={isMobile ? "100px" : "120px"} title={t`价格`} dataKey="price" render={(value) => renderPriceTips(value, price)} />
                <TableColumn width={isMobile ? "100px" : "120px"} title={t`供应 APY`} dataKey="supplyRate" render={(value) => renderRatio(value)} />
                <TableColumn width={isMobile ? "80px" : "120px"} title={t`抵押因素`} dataKey="collateralFactor" render={(value) => renderRatio(value, true)} />
                <TableColumn width={isMobile ? "130px" : "190px"} title={t`Variable B. APY`} dataKey="borrowRateVariable"
                    render={(value, _, { borrowinEnabled }) =>
                        borrowinEnabled ? renderRatioTips(value) : renderRatioDisabledTips(value)
                    }
                />
                <TableColumn width={isMobile ? "120px" : "160px"} title={t`Stable B. APY`} dataKey="borrowRateStable"
                    render={(value, _, { stableBorrowRateEnabled }) =>
                        stableBorrowRateEnabled ? renderRatioTips(value) : renderRatioDisabledTips(value)
                    }
                />
                <TableColumn width={isMobile ? "100px" : "120px"} title={t`市场规模`} dataKey="totalSupply"
                    render={(_, __, { price: ethPrice, totalSupply }) =>
                        renderPriceTips(ethPrice * totalSupply, price)
                    }
                />
                <TableColumn width={isMobile ? "80px" : "110px"} align="right" title={t`利用率`}
                    render={(_, __, { price: ethPrice, symbol, totalSupply, totalBorrow }) => renderApplyTips(ethPrice, symbol, totalSupply, totalBorrow, price)}
                />
            </Table>
        </TableWrapper>

    </>
}

export default Market;