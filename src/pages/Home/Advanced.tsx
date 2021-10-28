import React, { useState, useEffect, useMemo } from "react";
import { Trans, t } from "@lingui/macro";

import Button from "../../components/Button";
import Select from '../../components/Select';
import Modal from "../../components/Modal";
import Tips, { TipsInfo } from "../../components/Tips";
import { EmptyLoading } from "../../components/Empty";
import { message } from "../../components/Message";

import { useReload } from "../../hooks/contract/reload";
import { useBoost, useRepay } from '../../hooks/contract/handle';
import { useTokenPrice } from "../../hooks/contract/useMarketInfo";

import { useReloadAfter, useAdvancedAfter } from "../../hooks/after";

import { useUserInfo } from "../../state/user";
import {
    useStableCoins,
    useOtherCoins,
    useSupplyMap,
    useBorrowMap,
    useCoinAddressArray,
    useTokenInfo,
} from '../../state/market';
import { useState as useSaverState } from '../../state/saver';
import { useState as useAfterState } from "../../state/after";

import { Font, Flex } from '../../styled';
import { numberDelimiter, numberRuler, fullNumber, getBoostMax, getRepayMax, getHandleTheme } from "../../utils";
import { HandleType } from "../../types";


import {
    TabPanelGrid,
    HandleText,
    HandleWrapper,
    InputControl,
    SelectControl,
    SelectEmpty,
    InputMax,
    SelectOptionItem,
    APYSelect
} from './styled';

const SelectRender: React.FC<{
    value: string
    text: string
}> = ({ value, text }) => {
    return <Flex flexDirection="column">
        <Font>{value}</Font>
        <Font fontSize="12px" color="#939DA7">{text}</Font>
    </Flex>
}

const Handle: React.FC<{
    type: HandleType
    max: string
    labelText: string | React.ReactNode
    labelTips: string | React.ReactNode
    coins: any[][]
    leftText?: string | React.ReactNode
    rightText?: string | React.ReactNode
    inputValue?: string
    selectText: string[]
    selectValue?: string[]
    selectOptionItemRender?: React.ReactNode
    buttonProps: {
        text: string | React.ReactNode
        theme: "primary" | "gray" | "buy" | "sell"
        loading?: boolean
        disabled?: boolean
        disabledTips?: string
        click?: () => void
    }
    onInputChange?: (value?: string) => void
    onSelectChange?: (value: (string | null)[]) => void

}> = ({
    type,
    labelText,
    labelTips,
    max,
    leftText,
    rightText,
    coins,
    selectText,
    inputValue,
    selectValue,
    selectOptionItemRender,
    buttonProps,
    onInputChange,
    onSelectChange
}) => {
        const [[from, to], setTokens] = useState<(string | null)[]>([]);
        const [value, setValue] = useState<string | null>(null);

        const [symbol] = to ? to.split("_") : [];

        const [fromCoins, toCoins] = coins;

        const theme = useMemo(() => getHandleTheme(type), [type]);

        const isDisabled = useMemo(() => {
            if (buttonProps.disabled) {
                return { tips: buttonProps.disabledTips, disabled: buttonProps.disabled }
            } else if (!coins.length) {
                return { tips: t`暂无可操作币种`, disabled: true }
            } else if (!value) {
                return { tips: t`未输入值`, disabled: true }
            } else if (Number(value) > Number(max)) {
                return { tips: t`数值大于最大值`, disabled: true }
            } else if (Number(value) <= 0) {
                return { tips: t`数值不能小于0`, disabled: true }
            } else return { tips: "", disabled: false }
        }, [coins, value, max]);

        const handleInputChange = (value: any) => {
            setValue(value);
            onInputChange && onInputChange(value);
        };

        const handleSelectChange = (value: any) => {
            setTokens(value);
            onSelectChange && onSelectChange(value);
        };

        useEffect(() => {
            if (inputValue !== value) {
                setValue(inputValue ?? null);
            }
        }, [inputValue]);

        useEffect(() => {
            if (!selectValue || selectValue[0] !== from || selectValue[1] !== to) {
                setTokens(selectValue ?? []);
            }
        }, [selectValue]);

        return <div>
            <HandleText>
                <Font fontSize="13px" color="#939DA7">{leftText}</Font>
                <Font fontSize="13px" color="#939DA7" onClick={() => handleInputChange(max)}>{rightText}</Font>
            </HandleText>
            <HandleWrapper theme={theme}>
                <InputControl theme={theme}>
                    <label>
                        <Flex alignItems="center">
                            <div className="input-label">
                                <Font {...{ fontSize: "16px", color: "rgba(255, 255, 255, .5)" }}>
                                    <Flex alignItems="center">
                                        <TipsInfo text={labelTips} />
                                        <span>{labelText}</span>
                                    </Flex>
                                </Font>
                            </div>
                            <input type="number" placeholder="0" value={value ?? ""} onChange={(e: any) => handleInputChange(e.target.value)} />
                        </Flex>
                    </label>
                </InputControl>

                <SelectControl>
                    {fromCoins?.length ?
                        <Select
                            render={<SelectRender value={from ?? ""} text={selectText[0]} />}
                            value={from ?? ""}
                            dataSource={fromCoins}
                            optionPopoverProps={{ style: { maxHeight: 240 } }}
                            onChange={(select: any) => handleSelectChange([select.value, to])}
                        /> :
                        <SelectEmpty text={selectText[0]} />}
                </SelectControl>

                <SelectControl>
                    {toCoins?.length ?
                        <Select
                            render={<SelectRender value={symbol ?? ""} text={selectText[1]} />}
                            value={to ?? ""}
                            dataSource={toCoins}
                            optionItemRender={selectOptionItemRender}
                            optionPopoverProps={{ style: { maxHeight: 240 } }}
                            onChange={(select: any) => handleSelectChange([from, select.value])}
                        /> :
                        <SelectEmpty text={selectText[1]} />}
                </SelectControl>
            </HandleWrapper>
            <Flex justifyContent="flex-end">
                <Button
                    theme={buttonProps.theme}
                    disabled={isDisabled.disabled}
                    loading={buttonProps.loading}
                    onClick={buttonProps.click}
                >
                    <Tips text={isDisabled.tips} >
                        <div>{buttonProps.text}</div>
                    </Tips>
                </Button>
            </Flex>
        </div>
    }

const Boost = ({ handle }: { handle: HandleType }) => {
    const [open, setOpen] = useState<boolean>(false);
    const [tokens, setTokens] = useState<string[]>();
    const [amount, setAmount] = useState<string>();

    const { optimalType } = useSaverState();

    const stableCoins = useStableCoins() ?? [];
    const otherCoins = useOtherCoins() ?? [];

    const tokenAddressArray = useCoinAddressArray(tokens);
    useAdvancedAfter(handle, amount, tokens, tokenAddressArray);
    const { type } = useAfterState();

    const { availableBorrowsETH } = useUserInfo() ?? {};

    const [from, to] = tokens ?? [];

    const { price, stableBorrowRateEnabled } = useTokenInfo(from) ?? {};
    const { collateralFactor } = useTokenInfo(to) ?? {};

    const max = useMemo(() =>
        availableBorrowsETH && collateralFactor && price ?
            fullNumber(getBoostMax(Number(availableBorrowsETH), Number(collateralFactor), true) / price) : "0",
        [availableBorrowsETH, collateralFactor, price]);

    const reload = useReload();

    const handleClick = () => {
        if (!tokens || !amount) return;

        setOpen(true);
    }

    const handleReload = () => {
        reload();
        setAmount(undefined);
    }

    useEffect(() => {
        if (!tokens && stableCoins?.length && otherCoins?.length) {
            setTokens([stableCoins[0], otherCoins[0]])
        }
    }, [stableCoins, otherCoins]);

    useEffect(() => {
        if (type !== handle) setAmount(undefined);
    }, [type]);

    return <>
        <Handle
            type={handle}
            max={max ?? "0"}
            labelText={<Trans>加杠杆：</Trans>}
            labelTips={<Trans>在单笔交易中完成增加债务购买更多抵押品 <br />并将其添加到储蓄中这三个步骤。</Trans>}
            leftText={tokens ? t`Borrow ${tokens[0]} → Swap → Supply ${tokens[1]}` : ""}
            rightText={<InputMax max={max} />}
            coins={[stableCoins, otherCoins]}
            selectText={[t`借币`, t`质押`]}
            inputValue={amount ?? ""}
            selectValue={tokens}
            buttonProps={{
                text: t`加杠杆`,
                theme: "buy",
                disabled: optimalType === 2,
                disabledTips: t`已开启全自动化模式，禁用该操作`,
                click: handleClick
            }}
            onInputChange={setAmount}
            onSelectChange={(value: any) => setTokens(value)}
        />

        {open &&
            <BoostModal
                {...{ open, amount, tokens, tokenAddressArray, stable: stableBorrowRateEnabled }}
                onClose={() => setOpen(false)}
                onReload={handleReload}
            />}
    </>
}

const BoostModal: React.FC<{
    open: boolean
    amount?: string
    tokens?: string[]
    tokenAddressArray?: string[]
    stable?: boolean
    onClose: () => void
    onReload: () => void
}> = ({ open, amount, tokens, tokenAddressArray, stable, onClose, onReload }) => {
    const [apy, setApy] = useState<number>();
    const [loading, setLoading] = useState<boolean>(false);

    const { loading: priceLoading, prices } = useTokenPrice(tokenAddressArray);

    const [from, to] = tokens ?? [];

    let [fromPrice, toPrice]: (number | string)[] = prices ?? [];

    const tradeInfo = useMemo(() => {
        if (!fromPrice || !toPrice || !amount) return null;

        fromPrice = Number(fromPrice);
        toPrice = Number(toPrice);

        const amountNumber = Number(amount);
        const amountTips = numberDelimiter(amount);
        const amountCount = numberRuler(amountNumber);

        const tokenCount = fromPrice * amountNumber / toPrice;
        const fromCount = numberRuler(toPrice / fromPrice);
        const toCount = numberRuler(fromPrice / toPrice);

        return { amountCount, amountTips, tokenCount, fromCount, toCount }
    }, [amount, fromPrice, toPrice]);

    const boost = useBoost(tokenAddressArray, amount, undefined, apy);

    // console.log("BoostModal", priceLoading, fromPrice, toPrice, tradeInfo);

    const handle = () => {
        setLoading(true);

        boost().then((res: any) => {
            console.log(res);

            res.wait().then((res: any) => {
                console.log(res);
                message.success(t`操作成功`);

                setLoading(false);
                onReload();
                onClose();
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

    return <Modal
        open={open}
        width={470}
        title={t`加杠杆`}
        cancelButtonProps={{ onClick: onClose }}
        confirmButtonProps={{
            text: t`加杠杆`,
            disabled: priceLoading,
            loading,
            onClick: handle
        }}
    >
        <Font fontSize="14px" color="#939DA7">
            <Trans>加杠杆是借入更多 {from} 以获得更多的 {to}。这将会以增加你<br />的借贷能力为代价增加了你的杠杆。</Trans>
        </Font>

        <br />
        {!priceLoading && tradeInfo ?
            <>
                <Font fontSize="14px" color="#939DA7">
                    <Trans>正在购买</Trans>
                </Font>

                <Font fontSize="30px"><Tips text={fullNumber(tradeInfo.tokenCount)}><span>{numberRuler(tradeInfo.tokenCount)} {to}</span></Tips></Font>

                <Font fontSize="14px" color="#939DA7">
                    <Trans>与&nbsp;</Trans>

                    <Tips text={tradeInfo.amountTips}><span> {tradeInfo.amountCount} {from} </span></Tips>

                    <Trans>&nbsp;按价格&nbsp;</Trans>

                    <Tips text={`${tradeInfo.fromCount} ${from}/${to} = ${tradeInfo.toCount} ${to}/${from}`}><span> {tradeInfo.fromCount} {from + "/" + to} </span></Tips>
                </Font>

                <APYSelect stable={!stable} onChange={setApy} />
            </> : <EmptyLoading />}
    </Modal>
}

const Repay = ({ handle }: { handle: HandleType }) => {
    const [open, setOpen] = useState<boolean>(false);
    const [tokens, setTokens] = useState<(string)[]>();
    const [amount, setAmount] = useState<string>();

    const { optimalType } = useSaverState();

    const supplyMap = useSupplyMap();
    const borrowMap = useBorrowMap();

    const supplyCoins = useMemo(() => supplyMap ? Object.keys(supplyMap) : [], [supplyMap]);
    const boorowCoins = useMemo(() => borrowMap ? Object.entries(borrowMap).map(([key, item]) => ({ value: key, name: item.symbol, loanType: item.loanType })) : [], [borrowMap]);

    const [from, symbol] = tokens ?? [];
    const [to, apy] = symbol ? symbol.split("_") : [];
    const tokenCopy = useMemo(() => [from, to], [from, to]);

    const tokenAddressArray = useCoinAddressArray(tokenCopy);
    useAdvancedAfter(handle, amount, tokens, tokenAddressArray);
    const { type } = useAfterState();

    const fromToeknInfo = supplyMap?.[from];
    const toToeknInfo = borrowMap?.[symbol];

    const max = useMemo(() => fromToeknInfo && toToeknInfo ? getRepayMax(fromToeknInfo, toToeknInfo) : "0", [fromToeknInfo, toToeknInfo]);

    const reload = useReload();

    const handleClick = () => {
        if (!tokens || !amount) return;

        setOpen(true);
    }

    const handleReload = () => {
        reload();
        setAmount(undefined);
    }

    useEffect(() => {
        if (!from && supplyCoins.length) setTokens([supplyCoins[0], symbol]);
    }, [supplyCoins]);

    useEffect(() => {
        if (!symbol && boorowCoins.length) setTokens([from, boorowCoins[0].value]);
    }, [boorowCoins]);

    useEffect(() => {
        if (type !== handle) setAmount(undefined);
    }, [type]);

    return <>
        <Handle
            type={handle}
            max={max ?? "0"}
            labelText={<Trans>减杠杆：</Trans>}
            labelTips={<Trans>在单笔交易中完成取出储蓄抵押品<br />以购买借入资产并偿还债务三个步骤。</Trans>}
            leftText={tokens ? t`Withdraw ${from} ${from === to ? "" : "→ Swap"} → Payback ${to}` : ""}
            rightText={<InputMax max={max} />}
            coins={[supplyCoins, boorowCoins]}
            selectText={[t`减少质押`, t`还币`]}
            inputValue={amount}
            selectValue={tokens}
            selectOptionItemRender={<SelectOptionItem />}
            buttonProps={{
                text: t`减杠杆`,
                theme: "sell",
                disabled: optimalType === 2,
                disabledTips: t`已开启全自动化模式，禁用该操作`,
                click: handleClick
            }}
            onInputChange={setAmount}
            onSelectChange={(value: any) => setTokens(value)}
        />

        {open &&
            <RepayModal
                {...{ open, amount, tokens: [from, to], tokenAddressArray, apy }}
                onClose={() => setOpen(false)}
                onReload={handleReload}
            />}
    </>
}

const RepayModal: React.FC<{
    open: boolean
    apy: string | null
    amount?: string
    tokens?: string[]
    tokenAddressArray?: string[]
    onClose: () => void
    onReload: () => void
}> = ({ open, apy, amount, tokens, tokenAddressArray, onClose, onReload }) => {
    const [loading, setLoading] = useState<boolean>(false);

    const [from, to] = tokens ?? [];

    const { loading: priceLoading, prices } = useTokenPrice(tokenAddressArray);

    let [fromPrice, toPrice]: (number | string)[] = prices ?? [];

    const tradeInfo = useMemo(() => {
        if (!fromPrice || !toPrice || !amount) return null;

        fromPrice = Number(fromPrice);
        toPrice = Number(toPrice);

        const amountNumber = Number(amount);
        const amountTips = numberDelimiter(amount);
        const amountCount = numberRuler(amountNumber);

        const tokenCount = fromPrice * amountNumber / toPrice;
        const fromCount = numberRuler(toPrice / fromPrice);
        const toCount = numberRuler(fromPrice / toPrice);

        return { amountCount, amountTips, tokenCount, fromCount, toCount }
    }, [amount, fromPrice, toPrice]);

    const repay = useRepay(tokenAddressArray, amount, undefined, Number(apy) - 1);

    // console.log("RepayModal", priceLoading, fromPrice, toPrice, tradeInfo);

    const handle = () => {
        setLoading(true);

        repay().then((res: any) => {
            console.log(res);
            res.wait().then((res: any) => {
                setLoading(false);
                console.log(res);
                message.success(t`操作成功`);

                onClose();
                onReload();
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

    return <Modal
        open={open}
        width={470}
        title={t`减杠杆`}
        cancelButtonProps={{ onClick: onClose }}
        confirmButtonProps={{
            text: t`减杠杆`,
            disabled: priceLoading,
            loading,
            onClick: handle
        }}
    >
        <Font fontSize="14px" color="#939DA7">
            <Trans>减杠杆是使用储蓄的 {from} 还款 {to} 债务。这降低了您的杠杆，<br /> 但也降低了您的借贷能力，让您的仓位更安全。</Trans>
        </Font>

        <br />
        {from !== to ?
            !priceLoading && tradeInfo ?
                <>
                    <Font fontSize="14px" color="#939DA7">
                        <Trans>还款中</Trans>
                    </Font>

                    <Font fontSize="30px"><Tips text={fullNumber(tradeInfo.tokenCount)}><span>{numberRuler(tradeInfo.tokenCount)} {to}</span></Tips></Font>

                    <Font fontSize="14px" color="#939DA7">
                        <Trans>与&nbsp;</Trans>

                        <Tips text={tradeInfo.amountTips}><span> {tradeInfo.amountCount} {from} </span></Tips>

                        <Trans>&nbsp;按价格&nbsp;</Trans>

                        <Tips text={`${tradeInfo.fromCount} ${from}/${to} = ${tradeInfo.toCount} ${to}/${from}`}><span> {tradeInfo.fromCount} {from + "/" + to} </span></Tips>
                    </Font>
                    <Font fontSize="14px" color="#939DA7">
                        <Tips text={<Trans>If debt is fully paid off by Repay, the remainder of the <br /> Repay amount will be returned to your wallet as DAI</Trans>}>
                            <span><Trans>(Remainder of collateral will be returned as {to})</Trans></span>
                        </Tips>
                    </Font>
                </> :
                <EmptyLoading /> :
            <>
                <Font fontSize="14px" color="#939DA7">
                    <Trans>还款中</Trans>
                </Font>

                <Font fontSize="30px"><Tips text={fullNumber(amount)}><span>{numberRuler(amount)} {to}</span></Tips></Font>
            </>
        }
    </Modal>
}

const Advanced = () => {
    const reload = useReloadAfter();

    useEffect(() => {
        reload();
    }, []);

    return <TabPanelGrid>
        <Boost handle="Boost" />
        <Repay handle="Repay" />
    </TabPanelGrid>
}

export default Advanced;