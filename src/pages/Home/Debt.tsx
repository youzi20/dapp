import { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { Trans, t } from "@lingui/macro";

import { TipsInfo } from "../../components/Tips";
import { message } from "../../components/Message";
import Modal from "../../components/Modal";

import { useReload } from "../../hooks/contract/reload";
import { useBorrow, usePayback } from '../../hooks/contract/handle';
import { StatusEnums as TokenStatusEnums, useTokenBalances } from '../../hooks/contract/erc20';

import { useBorrowCoins, useBorrowMap, useCoinAddress, useTokenInfo } from '../../state/market';
import { useState as useUserState } from "../../state/user";
import { useState as useWalletState, WalletStatusEnums } from '../../state/wallet';

import { Font, Flex } from '../../styled';
import { WARNING_SVG } from "../../utils/images";

import Handle from "./Handle";

import { TabPanelGrid, InputMax, SelectOptionItem, APYSelect } from './styled';

const WarnWrapper = styled.div`
display: grid;
grid-template-columns: auto 1fr;
grid-column-gap: 10px;
align-items: center;
margin-top: 25px;
padding: 12px;
border-radius: 3px;
background-color: rgba(242,201,76,0.3);
`;

export const Borrow = () => {
    const [token, setToken] = useState<string | null>(null);
    const [amount, setAmount] = useState<string | null>(null);
    const [loadingButton, setLoadingButton] = useState<boolean>();
    const [open, setOpen] = useState<boolean>(false);
    const [apy, setApy] = useState<number | null>(null);

    const coins = useBorrowCoins();
    const address = useCoinAddress(token);

    const { price, stableBorrowRateEnabled } = useTokenInfo(token);
    const { dataInfo } = useUserState();

    const { availableBorrowsETH } = dataInfo ?? {};

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
        if (!token || !amount) return;

        setOpen(true);
    }

    useEffect(() => {
        if (coins.length) {
            if (!token) {
                const coin = coins[0];
                setToken(coin);
            }
        }
    }, [coins]);

    const max = useMemo(() => availableBorrowsETH && price ? availableBorrowsETH / price : 0, [availableBorrowsETH, price]);

    const labelStyle = { fontSize: "16px", color: "rgba(255, 255, 255, .5)" };

    return <>
        <Handle
            type="Borrow"
            // max={max}
            labelText={<Trans>借币：</Trans>}
            labelTips={<Trans>从Aave中借贷。在借款前您需要储蓄资产作为抵押物。</Trans>}
            // rightText={!max && max !== 0 ? t`加载中~` : <InputMax max={max} />}
            coins={coins ?? {}}
            inputValue={amount ?? ""}
            selectValue={token ?? ""}
            buttonProps={{
                text: t`借币`,
                theme: "buy",
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
                <WarnWrapper>
                    <img src={WARNING_SVG} alt="" />
                    <Font fontSize="14px"><Trans>This asset is unsupported for stable rate borrow</Trans></Font>
                </WarnWrapper>}
            <APYSelect stable={!stableBorrowRateEnabled} onChange={setApy} />
        </Modal>
    </>
}


export const Payback = () => {
    const [token, setToken] = useState<string | null>(null);
    const [amount, setAmount] = useState<string | null>(null);
    const [loadingButton, setLoadingButton] = useState<boolean>();
    const [reloadCount, setReload] = useState(0);

    const [symbol, apy] = token ? token.split("_") : [];

    const borrowMap = useBorrowMap();
    const address = useCoinAddress(symbol);
    const payback = usePayback(address, amount, apy ? Number(apy) - 1 : null);
    const reload = useReload();

    const { status: ethStatus, balances: ethBalances } = useWalletState();
    const { status: supplyStatus, balance: supplayBalances } = useTokenBalances(symbol === "ETH" ? null : symbol, reloadCount);

    const coins = useMemo(() =>
        borrowMap ?
            Object.entries(borrowMap)
                .map(([_, item]: [string, any]) => ({
                    name: item.symbol, value: item.symbol + "_" + item.loanType, loanType: item.loanType
                })) : [],
        [borrowMap]);

    const handleClick = () => {
        setLoadingButton(true);

        payback().then((res: any) => {
            console.log(res);
            res.wait().then((res: any) => {
                console.log(res);
                message.success(t`操作成功`);

                setLoadingButton(false);
                setAmount(null);
                reload();
                setReload(reloadCount + 1);
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
        if (borrowMap && coins.length && !token) {
            setToken(coins[0].value);
        }
    }, [borrowMap]);

    const max = token === "ETH" ? ethBalances : supplayBalances;
    const loading = token === "ETH" ? ethStatus === WalletStatusEnums.LOADING : supplyStatus === TokenStatusEnums.LOADING;

    const labelStyle = { fontSize: "16px", color: "rgba(255, 255, 255, .5)" };

    return <Handle
        isAuthorize
        type="Payback"
        max={max}
        labelText={<Trans>还币：</Trans>}
        labelTips={<Trans>还贷资产。</Trans>}
        rightText={loading ? t`加载中~` : <InputMax max={max} />}
        coins={coins ?? {}}
        inputValue={amount ?? ""}
        selectValue={token ?? ""}
        selectOptionItemRender={<SelectOptionItem />}
        buttonProps={{
            text: t`还币`,
            theme: "sell",
            loading: loadingButton,
            click: handleClick
        }}
        onInputChange={setAmount}
        onSelectChange={setToken}
    />
}

const Debt = () => {
    return <TabPanelGrid>
        <Borrow />
        <Payback />
    </TabPanelGrid>
}

export default Debt;