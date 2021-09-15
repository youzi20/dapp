import React, { useState, useEffect, useMemo } from "react";
import { Trans, t } from "@lingui/macro";

import Tips, { TipsInfo } from "../../components/Tips";
import Button from "../../components/Button";
import Select from '../../components/Select';
import { message } from "../../components/Message";
import Modal from "../../components/Modal";

import { useReload } from "../../hooks/contract/reload";
import { useBoost, useRepay } from '../../hooks/contract/handle';

import { useState as useUserState } from "../../state/user";
import {
    useStableCoins,
    useOtherCoins,
    useSupplyMap,
    useBorrowMap,
    useCoinAddress,
    useTokenInfo,
    useSupplyTokenInfo,
    useBoorowTokenInfo
} from '../../state/market';

import { Font, Flex } from '../../styled';
import { numberRuler, fullNumber, getBoostMax, getRepayMax } from "../../utils";

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
    max: number
    label: string | React.ReactNode
    coins: any[][]
    theme?: string
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
        click?: () => void
    }
    onInputChange?: (value: string | null) => void
    onSelectChange?: (value: (string | null)[]) => void

}> = ({
    theme,
    label,
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

        const isDisabled = (() => {
            if (!coins.length) {
                return { tips: t`暂无可操作币种`, disabled: true }
            } else if (!value) {
                return { tips: t`未输入值`, disabled: true }
            } else if (Number(value) > max) {
                return { tips: t`数值大于最大值`, disabled: true }
            } else if (Number(value) <= 0) {
                return { tips: t`数值不能小于0`, disabled: true }
            } else return { tips: "", disabled: false }
        })();

        const handleInputChange = (value: any) => {
            setValue(value);
            onInputChange && onInputChange(value);
        };

        const handleSelectChange = (value: any) => {
            setTokens(value);
            onSelectChange && onSelectChange(value);
        }

        useEffect(() => {
            if (inputValue !== value) {
                setValue(inputValue ?? null);
            }
        }, [inputValue])

        useEffect(() => {
            if (!selectValue || selectValue[0] !== from || selectValue[1] !== to) {
                setTokens(selectValue ?? []);
            }
        }, [selectValue]);

        return <div>
            <HandleText>
                <Font fontSize="13px" color="#939DA7">{leftText}</Font>
                <Font fontSize="13px" color="#939DA7" onClick={() => handleInputChange(fullNumber(max))}>{rightText}</Font>
            </HandleText>
            <HandleWrapper theme={theme}>
                <InputControl theme={theme}>
                    <label>
                        <Flex alignItems="center">
                            <div className="input-label">{label}</div>
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


const Boost = () => {
    const [tokens, setTokens] = useState<string[]>();
    const [amount, setAmount] = useState<string | null>(null);
    const [loadingButton, setLoadingButton] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(false);
    const [apy, setApy] = useState<number | null>(null);

    const stableCoins = useStableCoins();
    const otherCoins = useOtherCoins();

    const fromAddress = useCoinAddress(tokens ? tokens[0] : null);
    const toAddress = useCoinAddress(tokens ? tokens[1] : null);

    const { dataInfo } = useUserState();
    const { availableBorrowsETH } = dataInfo ?? {};

    const { price: fromPrice } = useTokenInfo(tokens ? tokens[0] : null);
    const { price: toPrice, collateralFactor } = useTokenInfo(tokens ? tokens[1] : null);

    const boost = useBoost(fromAddress, toAddress, amount, apy);
    const reload = useReload();

    const [from, to] = tokens ?? [];

    const amountNumber = numberRuler(Number(amount));
    const amountCount = fromPrice * Number(amount) / toPrice;
    const fromCount = numberRuler(toPrice / fromPrice);
    const toCount = numberRuler(fromPrice / toPrice);

    const boostHandle = () => {
        setLoadingButton(true);

        boost().then((res: any) => {
            console.log(res);

            res.wait().then((res: any) => {
                console.log(res);
                message.success(t`操作成功`);

                setLoadingButton(false);
                setAmount(null);
                setOpen(false);
                reload();
            }).catch((error: any) => {
                setLoadingButton(false);
                message.error(error.message);
                console.error(error);
            });
        }).catch((error: any) => {
            setLoadingButton(false);
            message.error(error.message);
            console.error(error);
        });
    }

    const handleClick = () => {
        if (!tokens || !amount) return;

        setOpen(true);
    }

    const handleChange = (value: any) => {
        setTokens(value)
    }

    useEffect(() => {
        if (!tokens && stableCoins.length && otherCoins.length) {
            setTokens([stableCoins[0], otherCoins[0]])
        }
    }, [stableCoins, otherCoins]);

    const max = useMemo(() =>
        availableBorrowsETH && collateralFactor && fromPrice ?
            getBoostMax(availableBorrowsETH, collateralFactor * 10e-3, true) / fromPrice : 0,
        [availableBorrowsETH, collateralFactor, fromPrice]);

    const labelStyle = { fontSize: "16px", color: "rgba(255, 255, 255, .5)" };

    return <>
        <Handle
            // theme="#C379FF"
            theme="#318D70"
            max={max}
            label={<Font {...labelStyle}>
                <Flex alignItems="center">
                    <TipsInfo text={<Trans>在单笔交易中完成增加债务购买更多抵押品 <br />并将其添加到储蓄中这三个步骤。</Trans>} />
                    <span><Trans>加杠杆：</Trans></span>
                </Flex>
            </Font>}
            leftText={tokens ? t`Borrow ${tokens[0]} → Swap → Supply ${tokens[1]}` : ""}
            rightText={!max ? t`加载中~` : <InputMax max={max} />}
            coins={[stableCoins, otherCoins]}
            selectText={[t`借币`, t`质押`]}
            inputValue={amount ?? ""}
            selectValue={tokens}
            buttonProps={{
                text: t`加杠杆`,
                theme: "buy",
                click: handleClick
            }}
            onInputChange={setAmount}
            onSelectChange={handleChange}
        />

        <Modal
            open={open}
            width={470}
            title={t`加杠杆`}
            cancelButtonProps={{
                onClick() {
                    setOpen(false);
                }
            }}
            confirmButtonProps={{
                text: t`加杠杆`,
                loading: loadingButton,
                onClick: boostHandle
            }}
        >
            <Font fontSize="14px" color="#939DA7">
                <Trans>
                    加杠杆是借入更多 {from} 以获得更多的 {to}。这将会以增加你
                    <br />
                    的借贷能力为代价增加了你的杠杆。
                </Trans>
                <br />
                <br />
                <Trans>正在购买</Trans>

                <Font fontSize="30px"><Tips text={amountCount}><span>{numberRuler(amountCount)} {to}</span></Tips></Font>

                <Trans>与&nbsp;</Trans>

                <Tips text={amountNumber}><span>{amountNumber} {from}</span></Tips>

                <Trans>&nbsp;按价格&nbsp;</Trans>

                <Tips text={`${fromCount} ${from}/${to} = ${toCount} ${to}/${from}`}><span>{fromCount} {from + "/" + to}</span></Tips>
            </Font>
            <APYSelect onChange={setApy} />
        </Modal>
    </>
}


const Repay = () => {
    const [tokens, setTokens] = useState<(string)[]>();
    const [amount, setAmount] = useState<string | null>(null);
    const [loadingButton, setLoadingButton] = useState<boolean>();
    const [open, setOpen] = useState<boolean>(false);

    const supplyMap = useSupplyMap();
    const borrowMap = useBorrowMap();

    const supplyCoins = useMemo(() => supplyMap ? Object.keys(supplyMap) : [], [supplyMap]);
    const boorowCoins = useMemo(() =>
        borrowMap ?
            Object.entries(borrowMap)
                .map(([_, item]: [string, any]) => ({
                    name: item.symbol, value: item.symbol + "_" + item.loanType, loanType: item.loanType
                })) : [],
        [borrowMap]);

    const [from, to] = tokens ?? [];
    const [symbol, apy] = to ? to.split("_") : [];

    const { price: fromPrice } = useTokenInfo(from);
    const { price: toPrice } = useTokenInfo(symbol);

    const fromToeknInfo = useSupplyTokenInfo(from);
    const toToeknInfo = useBoorowTokenInfo(to);

    const fromAddress = useCoinAddress(from);
    const toAddress = useCoinAddress(symbol);

    const repay = useRepay(fromAddress, toAddress, amount, Number(apy) - 1);
    const reload = useReload();

    const amountNumber = numberRuler(Number(amount));
    const amountCount = fromPrice * Number(amount) / toPrice;
    const fromCount = numberRuler(toPrice / fromPrice);
    const toCount = numberRuler(fromPrice / toPrice);

    const repayHandle = () => {
        setLoadingButton(true);

        repay().then((res: any) => {
            console.log(res);
            res.wait().then((res: any) => {
                console.log(res);
                message.success(t`操作成功`);

                setLoadingButton(false);
                setAmount(null);
                setOpen(false);
                reload();
            }).catch((error: any) => {
                setLoadingButton(false);
                message.error(error.message);
                console.error(error);
            });
        }).catch((error: any) => {
            setLoadingButton(false);
            message.error(error.message);
            console.error(error);
        });
    }

    const handleClick = () => {
        if (!tokens || !amount) return;

        setOpen(true);
    }

    const handleChange = (value: any) => {
        setTokens(value)
    }

    useEffect(() => {
        if (!tokens && supplyCoins.length && boorowCoins.length) {
            setTokens([supplyCoins[0], boorowCoins[0].value])
        }
    }, [supplyCoins, boorowCoins]);

    const max = useMemo(() => fromToeknInfo && toToeknInfo && fromPrice ? getRepayMax(fromToeknInfo, toToeknInfo, fromPrice) : 0, [fromToeknInfo, toToeknInfo, fromPrice]);

    const labelStyle = { fontSize: "16px", color: "rgba(255, 255, 255, .5)" };

    // console.log("tokens", borrowMap, fromToeknInfo, toToeknInfo, fromPrice, max);

    return <>
        <Handle
            // theme="#F2C94C"
            theme="#C26E5C"
            max={max}
            label={<Font {...labelStyle}>
                <Flex alignItems="center">
                    <TipsInfo text={<Trans>在单笔交易中完成取出储蓄抵押品<br />以购买借入资产并偿还债务三个步骤。</Trans>} />
                    <span><Trans>减杠杆：</Trans></span>
                </Flex>
            </Font>}
            leftText={tokens ? t`Withdraw ${from} ${from === symbol ? "" : "→ Swap"} → Payback ${symbol}` : ""}
            rightText={!max ? t`加载中~` : <InputMax max={max} />}
            coins={[supplyCoins, boorowCoins]}
            selectText={[t`减少质押`, t`还币`]}
            inputValue={amount ?? ""}
            selectValue={tokens}
            selectOptionItemRender={<SelectOptionItem />}
            buttonProps={{
                text: t`减杠杆`,
                theme: "sell",
                click: handleClick
            }}
            onInputChange={setAmount}
            onSelectChange={handleChange}
        />

        <Modal
            open={open}
            width={470}
            title={t`减杠杆`}
            cancelButtonProps={{
                onClick() {
                    setOpen(false);
                }
            }}
            confirmButtonProps={{
                text: t`减杠杆`,
                loading: loadingButton,
                onClick: repayHandle
            }}
        >
            <Font fontSize="14px" color="#939DA7">
                <Trans>
                    偿还是使用储蓄的 {from} 还款 {symbol} 债务。这降低了您的杠杆，
                    <br />
                    但也降低了您的借贷能力，让您的仓位更安全。
                </Trans>
                <br />
                <br />
                <Trans>还款中</Trans>

                <Font fontSize="30px"><Tips text={amountCount}><span>{numberRuler(amountCount)} {symbol}</span></Tips></Font>

                <Trans>与&nbsp;</Trans>

                <Tips text={amountNumber}><span>{amountNumber} {from}</span></Tips>

                <Trans>&nbsp;按价格&nbsp;</Trans>

                <Tips text={`${fromCount} ${from}/${symbol} = ${toCount} ${symbol}/${from}`}><span>{fromCount} {from + "/" + symbol}</span></Tips>
            </Font>
        </Modal>
    </>
}


const Advanced = () => {
    return <TabPanelGrid>
        <Boost />
        <Repay />
    </TabPanelGrid>
}

export default Advanced;