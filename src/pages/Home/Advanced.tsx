import React, { useState, useEffect, useMemo, useContext } from 'react';
import { Trans, t } from '@lingui/macro';

import { CoinIcon } from '../../components/CoinInfo';
import { ButtonStatus } from '../../components/Button';
import { message } from '../../components/Message';
import Modal from '../../components/Modal';
import { EmptyLoading } from '../../components/Empty';
import APYSelect from '../../components/ApySelect';
import Tips from '../../components/Tips';
import { TipsBoxWarning } from '../../components/TipsBox';

import useHandle from '../../hooks/handle';
import { useBoost, useRepay } from '../../hooks/contract/handle';
import { useTokenPrice } from "../../hooks/contract/useMarketInfo";

import { useAppDispatch } from '../../state/hooks';
import { updateConfigReload } from '../../state/config';
import { useUserInfo } from "../../state/user";
import {
    useStableCoins,
    useOtherCoins,
    useSupplyMap,
    useBorrowMap,
    useTokenAddressArray,
    useTokenInfo,
} from '../../state/market';

import { Font, Grid, Flex } from '../../styled';
import { getParseWei, fullNumber, numberRuler, numberToFixed, getNumberTips } from '../../utils';

import Handle, { HandleContext, HandleAbove, HandleInput, HandleSelect, ValueRender, SelectOptionItem, HandleButton } from './Handle';

const TradeInfoItem = ({ symbol, amount, amountTips, text }: {
    symbol: string
    amount: string
    amountTips?: string
    text?: string | React.ReactNode
}) => {
    return <div>
        <Font size="14px" fontColor="#939DA7" style={{ marginBottom: 4 }}>{text}</Font>
        <Tips text={amountTips} >
            <Flex inline alignItems="center">
                <CoinIcon name={symbol} />
                <Flex alignItems="baseline">
                    <Font size="30px" style={{ marginLeft: 10 }}>{amount}</Font>
                    <Font size="20px" style={{ marginLeft: 3 }} fontColor="#939DA7">{symbol}</Font>
                </Flex>
            </Flex>
        </Tips>
    </div>
}


function getBoostMax(value: number, ratio: number, isFirst?: boolean): number {
    if (!value || !ratio) return value;

    if (isFirst) {
        return value + getBoostMax(value, ratio);
    } else {
        const val = value * ratio;
        if (val <= 1e-5) return 0;

        return val + getBoostMax(val, ratio);
    }
}

export const Boost = () => {
    const { state, setState } = useHandle("Boost");

    const { status, theme, amount, token, tokenTo, tokenAddress, tokenDecimals, handleButton } = state;
    const { setStatus, setMax, setAmount, setToken, setTokenTo } = setState;

    const [open, setOpen] = useState(false);

    const [buttonStatus, setButtonStatus] = useState<ButtonStatus>();

    const { availableBorrowsETH } = useUserInfo() ?? {};
    const { price, stableBorrowRateEnabled } = useTokenInfo(token) ?? {};
    const { collateralFactor } = useTokenInfo(tokenTo) ?? {};

    const stableCoins = useStableCoins() ?? [];
    const otherCoins = useOtherCoins() ?? [];

    const max = useMemo(() => {
        if (availableBorrowsETH && collateralFactor && price) {
            return fullNumber(getBoostMax(Number(availableBorrowsETH), Number(collateralFactor), true) / price);
        }

        if (!token || !tokenTo) return "0";

        return;
    }, [availableBorrowsETH, collateralFactor, price]);

    const onClick = () => {
        setOpen(true);
        setButtonStatus("loading");
        setStatus && setStatus("disabled");
    }

    const onCancel = () => {
        setOpen(false);
        setButtonStatus(undefined);
        setStatus && setStatus("default");
    }

    useEffect(() => {
        setMax(max);

        return () => { }
    }, [max]);

    return <HandleContext.Provider value={{
        status, theme, max, amount, token, tokenTo, tokenAddress, tokenDecimals, handleButton,
        setStatus, setAmount, setToken, setTokenTo
    }}>
        <Handle
            above={<HandleAbove text={token && tokenTo ? t`Borrow ${token} → Swap → Supply ${tokenTo}` : undefined} />}
            body={<>
                <HandleInput
                    labelText={<Trans>加杠杆</Trans>}
                    labelTips={<Trans>在单笔交易中完成增加债务购买更多抵押品 <br />并将其添加到储蓄中这三个步骤。</Trans>}
                />
                <HandleSelect
                    dataSource={stableCoins ?? []}
                    valueRender={<ValueRender text={t`贷款`} />}
                />
                <HandleSelect
                    type="to"
                    dataSource={otherCoins ?? []}
                    valueRender={<ValueRender text={t`质押`} />}
                />
            </>}
            button={<HandleButton status={buttonStatus} onClick={onClick}>
                <Trans>加杠杆</Trans>
            </HandleButton>}
        />

        {open && <BoostModal stable={!stableBorrowRateEnabled} onCancel={onCancel} />}
    </HandleContext.Provider>
}

const BoostModal = ({ stable, onCancel }: {
    stable: boolean
    onCancel: () => void
}) => {
    const dispatch = useAppDispatch();

    const { amount, token, tokenTo, tokenDecimals } = useContext(HandleContext);

    const [apy, setApy] = useState<number>();
    const [confirmStatus, setConfirmStatus] = useState<ButtonStatus>();

    const tokenArray = useMemo(() => {
        if (!token || !tokenTo) return;

        if (tokenTo === "ETH") return [token];

        return [token, tokenTo];
    }, [token, tokenTo]);

    const tokenAddressArray = useTokenAddressArray(tokenArray);
    const { loading, tokenPrice } = useTokenPrice(tokenAddressArray);

    const tradeInfo = useMemo(() => {
        if (!tokenPrice || !amount) return;

        let fromPrice, toPrice;
        if (tokenTo === "ETH") {
            toPrice = 1;
            [fromPrice] = tokenPrice;
        } else {
            [fromPrice, toPrice] = tokenPrice;
        }

        fromPrice = Number(fromPrice);
        toPrice = Number(toPrice);

        const { numTips: amountTips, numUnit: amountUnit } = getNumberTips(amount);
        const { numTips: buyTips, numUnit: buyUnit } = getNumberTips(Number(amount) * fromPrice / toPrice);

        const fromConvert = numberRuler(toPrice / fromPrice);
        const toConvert = numberRuler(fromPrice / toPrice);

        return { amountTips, amountUnit, buyTips, buyUnit, fromConvert, toConvert }
    }, [tokenPrice]);

    const AtRate = tradeInfo ? (<Tips text={`${tradeInfo.fromConvert} ${token}/${tokenTo} = ${tradeInfo.toConvert} ${tokenTo}/${token}`}>
        <Font fontColor="#fff" weight="500">{`${tradeInfo.fromConvert} ${token}/${tokenTo}`} </Font>
    </Tips>) : undefined;

    // console.log("BoostModal", loading, tokenPrice)

    const boost = useBoost(tokenAddressArray, getParseWei(numberToFixed(amount, tokenDecimals), tokenDecimals), undefined, apy);

    const handleClick = () => {
        setConfirmStatus("loading");

        boost().then((res: any) => {
            console.log(res);
            res.wait().then((res: any) => {
                console.log(res);
                message.success(t`操作成功`);

                onCancel();
                dispatch(updateConfigReload());
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

    useEffect(() => {
        setConfirmStatus(loading ? "disabled" : "default");

        return () => { }
    }, [loading]);

    return <Modal
        open
        width="430px"
        title={t`加杠杆`}
        onCancel={onCancel}
        onConfirm={handleClick}
        cancelStatus={confirmStatus === "loading" ? "disabled" : "default"}
        confirmStatus={confirmStatus}
        confirmText={t`加杠杆`}
    >
        {!token || !tokenTo || loading || !tradeInfo ?
            <EmptyLoading /> :
            <div style={{ margin: "-30px -20px" }}>
                <div style={{ padding: 20, background: "#3B4751" }}>
                    <Grid rowGap="15px">
                        <Font size="14px" fontColor="#939DA7">
                            <Trans>加杠杆是借入更多 {token} 以获得更多的 {tokenTo}。这将会以增加你的借贷能力为代价增加了你的杠杆。</Trans>
                        </Font>

                        <TradeInfoItem
                            text={t`贷款中`}
                            symbol={token}
                            amount={tradeInfo.amountUnit ?? "-"}
                            amountTips={tradeInfo.amountTips ?? ""}
                        />
                        <TradeInfoItem
                            text={<Grid column={2} columnGap="4px" alignItems="center">{t`正在购买 at rate: `} {AtRate}</Grid>}
                            symbol={tokenTo}
                            amount={tradeInfo.buyUnit ?? "-"}
                            amountTips={tradeInfo.buyTips ?? ""}
                        />
                    </Grid>
                </div>

                <Grid rowGap="15px" style={{ padding: 20, background: "#313D47" }}>
                    <TipsBoxWarning isShow={stable} />
                    <APYSelect stable={stable} onChange={setApy} />
                </Grid>
            </div>}
    </Modal>
}

function getRepayMax(from: any, to: any) {
    const { symbol: fromSymbol, priceETH: fromEthPrice, amount: fromAmount, price } = from;
    const { symbol: toSymbol, priceETH: toEthPrice, amount: toAmount, } = to;

    if (fromSymbol === toSymbol) return fromAmount - toAmount > 0 ? toAmount : fromAmount

    if (fromEthPrice <= toEthPrice) return fromAmount;

    const max = toEthPrice / price * 1.02;

    return fullNumber(max > fromAmount ? fromAmount : max);
}

export const Repay = () => {
    const { state, setState } = useHandle("Repay");

    const { status, theme, amount, token, tokenTo, tokenToLoanType, tokenAddress, tokenDecimals, handleButton } = state;
    const { setStatus, setMax, setAmount, setToken, setTokenTo, setTokenToLoanType } = setState;

    const [open, setOpen] = useState(false);

    const [buttonStatus, setButtonStatus] = useState<ButtonStatus>();

    const supplyMap = useSupplyMap();
    const borrowMap = useBorrowMap();

    const supplyCoins = useMemo(() => supplyMap ? Object.keys(supplyMap) : [], [supplyMap]);
    const boorowCoins = useMemo(() => borrowMap ? Object.values(borrowMap).map((item) => ({ value: item.symbol, name: item.symbol, loanType: item.loanType })) : [], [borrowMap]);

    const toeknInfo = useMemo(() => token && supplyMap ? supplyMap[token] : undefined, [token, supplyMap]);
    const toeknToInfo = useMemo(() => tokenTo && borrowMap ? borrowMap[`${tokenTo}_${tokenToLoanType}`] : undefined, [tokenTo, borrowMap]);

    const max = useMemo(() => {
        if (toeknInfo && toeknToInfo) {
            return getRepayMax(toeknInfo, toeknToInfo)
        } else {
            return "0";
        }
    }, [toeknInfo, toeknToInfo]);

    // console.log(supplyMap, borrowMap, token, tokenTo, tokenAddress, tokenDecimals);

    const onClick = () => {
        setOpen(true);
        setButtonStatus("loading");
        setStatus && setStatus("disabled");
    }

    const onCancel = () => {
        setOpen(false);
        setButtonStatus(undefined);
        setStatus && setStatus("default");
    }

    useEffect(() => {
        setMax(max);

        return () => { }
    }, [max]);

    return <HandleContext.Provider value={{
        status, theme, max, amount, token, tokenTo, tokenToLoanType, tokenAddress, tokenDecimals, handleButton,
        setStatus, setAmount, setToken, setTokenTo, setTokenToLoanType
    }}>
        <Handle
            above={<HandleAbove text={token && tokenTo ? t`Withdraw ${token} → Swap → Payback ${tokenTo}` : undefined} />}
            body={<>
                <HandleInput
                    labelText={<Trans>减杠杆</Trans>}
                    labelTips={<Trans>在单笔交易中完成取出储蓄抵押品<br />以购买借入资产并偿还债务三个步骤。</Trans>}
                />
                <HandleSelect
                    dataSource={supplyCoins ?? []}
                    valueRender={<ValueRender text={t`减少质押`} />}
                />
                <HandleSelect
                    type="to"
                    dataSource={boorowCoins ?? []}
                    valueRender={<ValueRender />}
                    optionItemRender={<SelectOptionItem />}
                />
            </>}
            button={<HandleButton status={buttonStatus} onClick={onClick}>
                <Trans>减杠杆</Trans>
            </HandleButton>}
        />

        {open && <RepayModal onCancel={onCancel} />}
    </HandleContext.Provider>
}


const RepayModal = ({ onCancel }: {
    onCancel: () => void
}) => {
    const dispatch = useAppDispatch();

    const { amount, token, tokenTo, tokenToLoanType, tokenDecimals } = useContext(HandleContext);

    const [confirmStatus, setConfirmStatus] = useState<ButtonStatus>();

    const tokenArray = useMemo(() => {
        if (!token || !tokenTo) return;

        if (token === "ETH" && tokenTo === "ETH") return [];
        else if (token === "ETH") return [tokenTo];
        else if (tokenTo === "ETH") return [token];

        return [token, tokenTo];
    }, [token, tokenTo]);

    const tokenAddressArray = useTokenAddressArray(tokenArray);
    const { loading, tokenPrice } = useTokenPrice(token !== tokenTo ? tokenAddressArray : undefined);

    const tradeInfo = useMemo(() => {
        const { numTips: amountTips, numUnit: amountUnit } = getNumberTips(amount);

        if (token === tokenTo) return { amountTips, amountUnit };

        if (!tokenPrice) return;

        let fromPrice, toPrice;
        if (token !== "ETH" && tokenTo !== "ETH") {
            [fromPrice, toPrice] = tokenPrice;
        } else if (token === "ETH") {
            fromPrice = 1;
            [toPrice] = tokenPrice;
        } else if (tokenTo === "ETH") {
            toPrice = 1;
            [fromPrice] = tokenPrice;
        }

        fromPrice = Number(fromPrice);
        toPrice = Number(toPrice);

        const { numTips: buyTips, numUnit: buyUnit } = getNumberTips(Number(amount) * fromPrice / toPrice);

        const fromConvert = numberRuler(toPrice / fromPrice);
        const toConvert = numberRuler(fromPrice / toPrice);

        return { amountTips, amountUnit, buyTips, buyUnit, fromConvert, toConvert }
    }, [tokenPrice]);

    const AtRate = tradeInfo ? (<Tips text={`${tradeInfo.toConvert} ${tokenTo}/${token} = ${tradeInfo.fromConvert} ${token}/${tokenTo}`}>
        <Font fontColor="#fff" weight="500">{`${tradeInfo.toConvert} ${tokenTo}/${token}`} </Font>
    </Tips>) : undefined;

    // console.log("RepayModal", token, tokenTo, numberToFixed(amount, tokenDecimals), amount, tokenDecimals);

    const repay = useRepay(tokenAddressArray, getParseWei(numberToFixed(amount, tokenDecimals), tokenDecimals), undefined, tokenToLoanType ? tokenToLoanType - 1 : undefined);

    const handleClick = () => {
        setConfirmStatus("loading");

        repay()
            .then((res: any) => {
                console.log(res);

                res.wait().then((res: any) => {
                    console.log(res);
                    message.success(t`操作成功`);

                    onCancel();
                    dispatch(updateConfigReload());
                })
                    .catch((error: any) => {
                        console.error(error);
                        message.error(error.message);

                        setConfirmStatus(undefined);
                    });
            })
            .catch((error: any) => {
                console.error(error);
                message.error(error.message);

                setConfirmStatus(undefined);
            });
    }

    useEffect(() => {
        if (token !== tokenTo) {
            setConfirmStatus(loading ? "disabled" : "default");
        }

        return () => { }
    }, [loading]);

    return <Modal
        open
        width="430px"
        title={t`减杠杆`}
        onCancel={onCancel}
        onConfirm={handleClick}
        cancelStatus={confirmStatus === "loading" ? "disabled" : "default"}
        confirmStatus={confirmStatus}
        confirmText={t`减杠杆`}
    >
        {!token || !tokenTo || (loading && token !== tokenTo) || !tradeInfo ?
            <EmptyLoading /> :
            <div style={{ margin: "-30px -20px", padding: 20, background: "#3B4751" }}>
                <Grid rowGap="15px">
                    <Font size="14px" fontColor="#939DA7">
                        <Trans>减杠杆是使用储蓄的 {token} 还款 {tokenTo} 债务。这降低了您的杠杆，但也降低了您的借贷能力，让您的仓位更安全。</Trans>
                    </Font>

                    <TradeInfoItem
                        text={t`取款中`}
                        symbol={token}
                        amount={tradeInfo.amountUnit ?? "-"}
                        amountTips={tradeInfo.amountTips ?? ""}
                    />

                    {token !== tokenTo &&
                        <TradeInfoItem
                            text={<Grid column={2} columnGap="4px" alignItems="center">{t`正在购买 at rate: `} {AtRate}</Grid>}
                            symbol={tokenTo}
                            amount={tradeInfo.buyUnit ?? "-"}
                            amountTips={tradeInfo.buyTips ?? ""}
                        />}
                </Grid>
            </div>}
    </Modal>
}
