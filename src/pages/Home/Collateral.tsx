import { useState, useEffect, useMemo } from "react";
import { Trans, t } from "@lingui/macro";

import { message } from "../../components/Message";

import { useReload } from "../../hooks/contract/reload";
import { useDeposit, useWithdraw } from '../../hooks/contract/handle';
import { StatusEnums as TokenStatusEnums, useTokenBalances } from '../../hooks/contract/erc20';

import { useReloadAfter, useCollateralAfter } from "../../hooks/after";

import { useUserInfo } from "../../state/user";
import { useSupplyCoins, useSupplyMap, useCoinAddress } from '../../state/market';
import { useState as useWalletState, WalletStatusEnums } from '../../state/wallet';
import { useState as useAfterState } from '../../state/after';

import { fullNumber, getWithdrawMax } from "../../utils";
import { HandleType } from "../../types";

import Handle from "./Handle";
import { TabPanelGrid, InputMax } from './styled';

export const Supply = ({ handle }: { handle: HandleType }) => {
    const [token, setToken] = useState<string>();
    const [amount, setAmount] = useState<string>();
    const [loadingButton, setLoadingButton] = useState<boolean>();

    const supplyCoins = useSupplyCoins() ?? [];

    const address = useCoinAddress(token);
    useCollateralAfter(handle, amount, token, address);
    const { type } = useAfterState();

    const { status: ethStatus, balances: ethBalances } = useWalletState();
    const { status: supplyStatus, balance: supplayBalances, reload: reloadTokenBalances } = useTokenBalances(token === "ETH" ? undefined : token);

    const max = useMemo(() => {
        if (token == "ETH" && ethBalances) {
            return fullNumber(ethBalances);
        } else if (token !== "ETH" && supplayBalances) {
            return fullNumber(supplayBalances);
        }
        return "0";
    }, [token, ethBalances, supplayBalances]);

    const loading = token === "ETH" ? ethStatus === WalletStatusEnums.LOADING : supplyStatus === TokenStatusEnums.LOADING;

    // console.log(max, supplayBalances);

    const deposit = useDeposit(address, amount);
    const reload = useReload();

    const handleClick = async () => {
        setLoadingButton(true);

        deposit(token).then((res: any) => {
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
                console.error(error.message);
            });
        }).catch((error: any) => {
            setLoadingButton(false);
            message.error(error.message);
            console.error(error.message);
        });
    }

    useEffect(() => {
        if (!token && supplyCoins?.length) setToken(supplyCoins[0]);
    }, [supplyCoins]);

    useEffect(() => {
        if (type !== handle) setAmount(undefined);
    }, [type]);

    return <Handle
        isAuthorize
        type={handle}
        max={max}
        labelText={<Trans>质押：</Trans>}
        labelTips={<Trans>储蓄您的资产开始赚取收益。</Trans>}
        rightText={loading ? t`加载中~` : <InputMax max={max} />}
        coins={supplyCoins}
        inputValue={amount ?? ""}
        selectValue={token}
        buttonProps={{
            text: t`质押`,
            theme: "buy",
            loading: loadingButton,
            click: handleClick
        }}
        onInputChange={setAmount}
        onSelectChange={setToken}
    />
}

const Withdraw = ({ handle }: { handle: HandleType }) => {
    const [token, setToken] = useState<string>();
    const [amount, setAmount] = useState<string>();
    const [loadingButton, setLoadingButton] = useState<boolean>();

    const supplyMap = useSupplyMap();
    const supplyCoins = useMemo(() => supplyMap ? Object.keys(supplyMap) : [], [supplyMap]);

    const address = useCoinAddress(token);
    useCollateralAfter(handle, amount, token, address);
    const { type } = useAfterState();

    const { totalCollateralETH, totalDebtETH } = useUserInfo() ?? {};

    const max = useMemo(() => supplyMap && token ? getWithdrawMax(supplyMap, token, totalCollateralETH, totalDebtETH) : "0", [supplyMap, token]);

    const withdraw = useWithdraw(address, amount);
    const reload = useReload();

    const handleClick = () => {
        setLoadingButton(true);

        withdraw().then((res: any) => {
            console.log(res);
            res.wait().then((res: any) => {
                console.log(res);
                message.success(t`操作成功`);

                setLoadingButton(false);
                setAmount(undefined);
                reload();
            }).catch((error: any) => {
                setLoadingButton(false);
                message.error(error.message);
                console.error(error.message);
            });
        }).catch((error: any) => {
            setLoadingButton(false);
            message.error(error.message);
            console.error(error.message);
        });
    }

    useEffect(() => {
        if (!token && supplyCoins?.length) setToken(supplyCoins[0]);
    }, [supplyCoins]);

    useEffect(() => {
        if (type !== handle) setAmount(undefined);
    }, [type]);

    return <Handle
        type={handle}
        max={max}
        labelText={<Trans>减少质押：</Trans>}
        labelTips={<Trans>从您的Aave储蓄中提取资产。</Trans>}
        rightText={<InputMax max={max} />}
        coins={supplyCoins}
        inputValue={amount ?? ""}
        selectValue={token}
        buttonProps={{
            text: t`减少质押`,
            theme: "sell",
            loading: loadingButton,
            click: handleClick
        }}
        onInputChange={setAmount}
        onSelectChange={setToken}
    />
}

const Collateral = () => {
    const reload = useReloadAfter();

    useEffect(() => {
        reload();
    }, []);

    return <TabPanelGrid>
        <Supply handle="Supply" />
        <Withdraw handle="Withdraw" />
    </TabPanelGrid>
}

export default Collateral;