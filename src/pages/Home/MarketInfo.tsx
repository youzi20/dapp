import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Trans, t } from '@lingui/macro';

import Button from '../../components/Button';
import Tips, { TipsPrice } from '../../components/Tips';
import Table, { TableColumn } from '../../components/Table';
import { message } from '../../components/Message';

import {
    MarketStatusEnums,
    useState as useMatketState,
    useEthPrice,
    useMarketMap,
    useSupplyMap,
    useBorrowMap,
    useCoinAddress
} from '../../state/market';
import { useState as useAfterState, useAfterSupply, useAfterBorrow } from '../../state/after';

import { useEnabled, useSwapRate } from '../../hooks/contract/handle';
import { useReload } from '../../hooks/contract/reload';

import { Font, Flex } from '../../styled';

import { getRatio, numberDelimiter, numberRuler, fullNumber, ethToPriceTips, ethToPrice, getTableTheme } from '../../utils';

import CoinIcon from '../CoinIcon';

interface MarketInterface {
    price: string
    symbol: string
    amount: string
    totalSupply: string
    totalBorrow: string
}

const Wrapper = styled.div`
margin: 25px 0 45px;
`;

const Title = styled.div`
margin-bottom: 25px;
`;

const renderCoinIcon = (value: any) => <CoinIcon name={value} />;
const renderRatioText = (value: number) => getRatio(value * 100);
const renderAmountTips = ({ symbol, amount }: MarketInterface) => <Flex><Tips text={fullNumber(amount)} ><div>{numberRuler(amount)} {symbol}</div></Tips></Flex>;
const renderPriceTips = (value: string, price?: number) => <Flex><TipsPrice price={ethToPriceTips(value, price)} /></Flex>;
const renderRatioTips = (value: number) => {
    const ratio = value * 100;

    return <Flex><Tips text={fullNumber(ratio)} ><div>{getRatio(ratio)}</div></Tips></Flex>;
};
const renderRatioDisabledTips = (value: number) => <Flex><Tips text={t`不可用`} ><div style={{ opacity: 0.5 }}>{getRatio(value * 100)}</div></Tips></Flex>;
const renderSupplyTips = ({ price: ethPrice, totalSupply }: MarketInterface, price?: number) => {
    const [priceStr, priceUnit] = ethToPrice(Number(ethPrice) * Number(totalSupply), price);

    return <Flex><TipsPrice price={[numberRuler(fullNumber(priceStr)), numberDelimiter(fullNumber(priceStr)), priceUnit]} /></Flex>
};
const renderApplyTips = ({ price: ethPrice, symbol, totalSupply, totalBorrow }: MarketInterface, price?: number) => {
    const supply = Number(totalSupply);
    const borrow = Number(totalBorrow);

    const ratio = getRatio(borrow / supply * 100);
    const circulate = supply - borrow;

    const [priceStr, priceUnit] = ethToPrice(Number(ethPrice) * circulate, price);

    const amount = numberRuler(circulate);

    return <Flex justifyContent="flex-end">
        <Tips text={`市场流动性: ${amount} ${symbol} (${priceUnit ?? ""}${numberRuler(priceStr)})`} >
            <div>{ratio}</div>
        </Tips>
    </Flex>
};

const EnabledSupply = ({ symbol, amount, usageAsCollateralEnableds }: { symbol: string, amount: string, usageAsCollateralEnableds: boolean }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const address = useCoinAddress(symbol, true);

    const reload = useReload();
    const enabled = useEnabled(address, !usageAsCollateralEnableds);

    const onClick = () => {
        setLoading(true);

        enabled().then((res: any) => {
            console.log(res);

            res.wait().then((res: any) => {
                console.log(res);
                message.success(t`操作成功`);

                reload();
                setLoading(false);
            }).catch((error: any) => {
                setLoading(false);
                message.error(error.message);
                console.error(error);
            });
        }).catch((error: any) => {
            setLoading(false);
            message.error(error.message);
            console.error(error);
        });
    }

    return <Button disabled={amount === "0"} loading={loading} theme="gray" size="sm" onClick={onClick}>
        {usageAsCollateralEnableds ?
            <Trans>停用</Trans> :
            <Trans>启用</Trans>}
    </Button>
}

const renderEnabledSupply = ({ symbol, amount, usageAsCollateralEnableds }: { symbol: string, amount: string, usageAsCollateralEnableds: boolean }) => {
    return <EnabledSupply {...{ symbol, amount, usageAsCollateralEnableds }} />
}

const ChangeRate = ({ symbol, amount, loanType }: { symbol: string, amount: string, loanType: number }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const address = useCoinAddress(symbol, true);

    const reload = useReload();
    const swapRate = useSwapRate(address, loanType === 2 ? 2 : 1);

    const onClick = () => {
        setLoading(true);

        swapRate().then((res: any) => {
            console.log(res);

            res.wait().then((res: any) => {
                console.log(res);
                message.success(t`操作成功`);

                reload();
                setLoading(false);
            }).catch((error: any) => {
                setLoading(false);
                message.error(error.message);
                console.error(error);
            });
        }).catch((error: any) => {
            setLoading(false);
            message.error(error.message);
            console.error(error);
        });
    }

    return <Button disabled={amount === "0"} loading={loading} theme="gray" size="sm" onClick={onClick} style={{ width: 150 }}>
        {loanType === 2 ?
            <Trans>To variable</Trans> :
            <Trans>To stable</Trans>}
    </Button>
}

const renderChangeRate = ({ symbol, amount, loanType }: { symbol: string, amount: string, loanType: number }) => {

    return <ChangeRate {...{ symbol, amount, loanType }} />
}


const MarketInfo = () => {
    const { marketStatus, loanStatus } = useMatketState();

    const { type, loading } = useAfterState();
    const [bg, color] = useMemo(() => getTableTheme(type), [type]) ?? [];

    const price = useEthPrice();

    const marketMap = useMarketMap();
    const supplyMap = useSupplyMap();
    const borrowMap = useBorrowMap();

    const marketData = useMemo(() => marketMap ? Object.values(marketMap) : [], [marketMap]);
    const supplyData = useMemo(() => supplyMap ? Object.values(supplyMap) : null, [supplyMap]);
    const borrowData = useMemo(() => borrowMap ? Object.values(borrowMap) : null, [borrowMap]);

    const afterSupply = useAfterSupply();
    const afterBorrow = useAfterBorrow();

    // console.log("MarketInfo", marketData, supplyData, borrowData, afterSupply, afterBorrow);

    return <>
        {supplyData ? <Wrapper>
            <Title>
                <Font fontSize="20px"><Trans>供应中</Trans></Font>
            </Title>
            <Table
                dataSource={supplyData ?? []}
                afterSource={afterSupply}
                afterBg={bg}
                afterColor={color}
                loading={loanStatus === MarketStatusEnums.LOADING}
            >
                <TableColumn first width="196px" title={t`资产`} dataKey="symbol" render={renderCoinIcon} />
                <TableColumn width="168px" title={t`已供应`} render={(_, __, value) => renderAmountTips(value)} />
                <TableColumn width="196px" title={t`已供应($)`} dataKey="priceETH" render={(value) => renderPriceTips(value, price)} />
                <TableColumn width="190px" title={t`供应 APY`} dataKey="rate" render={renderRatioTips} />
                <TableColumn width="120px" title={t`抵押因素`} dataKey="collateralFactor" render={renderRatioText} />
                <TableColumn hidden width="100px" align="right" title={t`抵押物`} render={(_, __, data) => renderEnabledSupply(data)} />
            </Table>
        </Wrapper> : ""}

        {borrowData ? <Wrapper>
            <Title>
                <Font fontSize="20px"><Trans>贷款中</Trans></Font>
            </Title>
            <Table
                dataSource={borrowData ?? []}
                afterSource={afterBorrow}
                afterBg={bg}
                afterColor={color}
                loading={loanStatus === MarketStatusEnums.LOADING}
            >
                <TableColumn first width="140px" title={t`资产`} dataKey="symbol" render={renderCoinIcon} />
                <TableColumn width="160px" title={t`已借贷`} render={(_, __, value) => renderAmountTips(value)} />
                <TableColumn width="170px" title={t`已借贷($)`} dataKey="priceETH" render={(value) => renderPriceTips(value, price)} />
                <TableColumn width="140px" title={t`贷款 APY`} dataKey="rate" render={renderRatioTips} />
                <TableColumn hidden width="160px" title={t`Interest Rate`} dataKey="loanType" render={(value) => value === 2 ? t`Stable` : t`Variable`} />
                <TableColumn hidden width="190px" title={t`Change interest rate`} render={(_, __, data) => renderChangeRate(data)} />
                <TableColumn width="100px" align="right" title={t`限制`} dataKey="ratio" render={renderRatioText} />
            </Table>
        </Wrapper> : ""}

        <Wrapper>
            <Title>
                <Flex justifyContent="space-between">
                    <Font fontSize="20px"><Trans>市场信息</Trans></Font>
                    {/* <div>仅显示自有资产</div> */}
                </Flex>
            </Title>
            <Table dataSource={marketData} loading={marketStatus === MarketStatusEnums.LOADING}>
                <TableColumn width="120px" title={t`资产`} dataKey="symbol" render={renderCoinIcon} />
                <TableColumn width="120px" title={t`价格`} dataKey="price" render={(value) => renderPriceTips(value, price)} />
                <TableColumn width="120px" title={t`供应 APY`} dataKey="supplyRate" render={renderRatioTips} />
                <TableColumn width="120px" title={t`抵押因素`} dataKey="collateralFactor" render={renderRatioText} />
                <TableColumn width="190px" title={t`Variable B. APY`} dataKey="borrowRateVariable" render={renderRatioTips} />
                <TableColumn width="160px" title={t`Stable B. APY`} dataKey="borrowRateStable"
                    render={(value, _, { stableBorrowRateEnabled }) =>
                        stableBorrowRateEnabled ? renderRatioTips(value) : renderRatioDisabledTips(value)
                    }
                />
                <TableColumn width="120px" title={t`市场规模`} dataKey="totalSupply" render={(_, __, data) => renderSupplyTips(data, price)} />
                <TableColumn width="110px" align="right" title={t`利用率`} render={(_, __, data) => renderApplyTips(data, price)} />
            </Table>
        </Wrapper>
    </>
}


export default MarketInfo;