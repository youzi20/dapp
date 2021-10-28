import { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { Trans, t } from "@lingui/macro";

import { message } from "../../components/Message";
import Modal from "../../components/Modal";

import { useReload } from "../../hooks/contract/reload";
import { useBorrow, usePayback } from '../../hooks/contract/handle';
import { StatusEnums as TokenStatusEnums, useTokenBalances } from '../../hooks/contract/erc20';
import { useReloadAfter, useDebtAfter } from "../../hooks/after";

import { useUserInfo } from "../../state/user";
import { useBorrowCoins, useBorrowMap, useCoinAddress, useTokenInfo } from '../../state/market';
import { useState as useWalletState, WalletStatusEnums } from '../../state/wallet';
import { useState as useSaverState } from '../../state/saver';
import { useState as useAfterState } from '../../state/after';

import { Font, TipsStyle } from '../../styled';

import { fullNumber } from "../../utils";
import { TIPS_WARNING_SVG } from "../../utils/images";
import { HandleType } from "../../types";

import Handle from "./Handle";
import { TabPanelGrid, InputMax, SelectOptionItem, APYSelect } from './styled';

export const Borrow = ({ handle }: { handle: HandleType }) => {
    const [token, setToken] = useState<string>();
    const [amount, setAmount] = useState<string>();
    const [loadingButton, setLoadingButton] = useState<boolean>();
    const [open, setOpen] = useState<boolean>(false);
    const [apy, setApy] = useState<number>();

    const { optimalType } = useSaverState();

    const { price, stableBorrowRateEnabled } = useTokenInfo(token) ?? {};
    const { availableBorrowsETH } = useUserInfo() ?? {};
    const borrowCoins = useBorrowCoins() ?? [];

    const address = useCoinAddress(token);
    useDebtAfter(handle, amount, token, address);
    const { type } = useAfterState();

    const max = useMemo(() => availableBorrowsETH && price ? fullNumber(availableBorrowsETH / price) : "0", [availableBorrowsETH, price]);

    const borrow = useBorrow(address, amount, apy);
    const reload = useReload();

    const borrowHandle = () => {
        setLoadingButton(true);

        borrow().then((res: any) => {
            console.log(res);
            res.wait().then((res: any) => {
                console.log(res);
                message.success(t`操作成功`);

                setLoadingButton(false);
                setOpen(false);
                setAmount(undefined);
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
        if (!token || !amount) return;

        setOpen(true);
    }

    useEffect(() => {
        if (borrowCoins?.length && !token) setToken(borrowCoins[0]);
    }, [borrowCoins]);

    useEffect(() => {
        if (type !== handle) setAmount(undefined);
    }, [type]);

    return <>
        <Handle
            type="Borrow"
            max={max}
            labelText={<Trans>借币：</Trans>}
            labelTips={<Trans>从Aave中借贷。在借款前您需要储蓄资产作为抵押物。</Trans>}
            rightText={<InputMax max={max} />}
            coins={borrowCoins}
            inputValue={amount ?? ""}
            selectValue={token ?? ""}
            buttonProps={{
                text: t`借币`,
                theme: "buy",
                disabled: optimalType === 2,
                disabledTips: t`已开启全自动化模式，禁用该操作`,
                click: handleClick
            }}
            onInputChange={setAmount}
            onSelectChange={setToken}
        />

        <Modal
            open={open}
            width={470}
            title="Select your interest rate"
            cancelButtonProps={{
                onClick() {
                    setOpen(false);
                }
            }}
            confirmButtonProps={{
                text: t`借币`,
                loading: loadingButton,
                onClick: borrowHandle
            }}
        >
            <Font fontSize="14px" color="#939DA7" lineHeight="21px" style={{ maxWidth: 380, margin: "0 auto" }}>
                <Trans>
                    <Font color="#939DA7" fontWeight="700" style={{ display: "inline" }}>Stable</Font> would be a good choice if you need to plan around a non-volatile rate over a longer period of time.
                    <br />
                    <br />
                    <Font color="#939DA7" fontWeight="700" style={{ display: "inline" }}>Variable</Font> is based on the supply and demand for the selected asset on Aave and is re-calculated every second, meaning the rate will be lower when there is less demand for the asset.
                    <br />
                    <br />
                    You can also switch between the two rates at any point in the future.
                </Trans>
            </Font>
            {!stableBorrowRateEnabled &&
                <TipsStyle theme="rgb(145 114 44)">
                    <img src={TIPS_WARNING_SVG} alt="" />
                    <Font fontSize="14px"><Trans>This asset is unsupported for stable rate borrow</Trans></Font>
                </TipsStyle>}
            <APYSelect stable={!stableBorrowRateEnabled} onChange={setApy} />
        </Modal>
    </>
}


export const Payback = ({ handle }: { handle: HandleType }) => {
    const [token, setToken] = useState<string>();
    const [amount, setAmount] = useState<string>();
    const [loadingButton, setLoadingButton] = useState<boolean>();

    const { optimalType } = useSaverState();

    const [symbol, apy] = token ? token.split("_") : [];

    const address = useCoinAddress(symbol);
    useDebtAfter(handle, amount, token, address);

    const { type } = useAfterState();

    const borrowMap = useBorrowMap();
    const boorowCoins = useMemo(() => borrowMap ? Object.entries(borrowMap).map(([key, item]) => ({ value: key, name: item.symbol, loanType: item.loanType })) : [], [borrowMap]);

    const { status: ethStatus, balances: ethBalances } = useWalletState();
    const { status: supplyStatus, balance: supplayBalances, reload: reloadTokenBalances } = useTokenBalances(symbol === "ETH" ? undefined : symbol);

    const max = useMemo(() => {
        if (token == "ETH" && ethBalances) {
            return fullNumber(ethBalances);
        } else if (token !== "ETH" && supplayBalances) {
            return fullNumber(supplayBalances);
        }
        return "0";
    }, [token, ethBalances, supplayBalances]);

    const loading = token === "ETH" ? ethStatus === WalletStatusEnums.LOADING : supplyStatus === TokenStatusEnums.LOADING;

    const payback = usePayback(address, amount, apy ? Number(apy) - 1 : undefined);
    const reload = useReload();

    const handleClick = () => {
        setLoadingButton(true);

        payback().then((res: any) => {
            console.log(res);
            res.wait().then((res: any) => {
                console.log(res);
                message.success(t`操作成功`);

                setLoadingButton(false);
                setAmount(undefined);
                reload();
                reloadTokenBalances();
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

    useEffect(() => {
        if (boorowCoins?.length && !token) setToken(boorowCoins[0].value);
    }, [boorowCoins]);

    useEffect(() => {
        if (type !== handle) setAmount(undefined);
    }, [type]);

    return <Handle
        isAuthorize
        type="Payback"
        max={max}
        labelText={<Trans>还币：</Trans>}
        labelTips={<Trans>还贷资产。</Trans>}
        rightText={loading ? t`加载中~` : <InputMax max={max} />}
        coins={boorowCoins}
        inputValue={amount}
        selectValue={token ?? ""}
        selectOptionItemRender={<SelectOptionItem />}
        buttonProps={{
            text: t`还币`,
            theme: "sell",
            loading: loadingButton,
            disabled: optimalType === 2,
            disabledTips: t`已开启全自动化模式，禁用该操作`,
            click: handleClick
        }}
        onInputChange={setAmount}
        onSelectChange={setToken}
    />
}

const Debt = () => {
    const reload = useReloadAfter();

    useEffect(() => {
        reload();
    }, []);

    return <TabPanelGrid>
        <Borrow handle="Borrow" />
        <Payback handle="Payback" />
    </TabPanelGrid>
}

export default Debt;