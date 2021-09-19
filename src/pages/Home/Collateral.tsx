import { useState, useEffect, useMemo } from "react";
import { Trans, t } from "@lingui/macro";

import { TipsInfo } from "../../components/Tips";
import { message } from "../../components/Message";

import { useReload } from "../../hooks/contract/reload";
import { useDeposit, useWithdraw } from '../../hooks/contract/handle';
import { StatusEnums as TokenStatusEnums, useTokenBalances } from '../../hooks/contract/erc20';

import { useSupplyCoins, useSupplyMap, useCoinAddress } from '../../state/market';
import { useState as useWalletState, WalletStatusEnums } from '../../state/wallet';

import { getWithdrawMax } from "../../utils";

import Handle from "./Handle";

import { TabPanelGrid, InputMax } from './styled';

export const Supply = () => {
    const [token, setToken] = useState<string | null>("ETH");
    const [amount, setAmount] = useState<string | null>(null);
    const [loadingButton, setLoadingButton] = useState<boolean>();
    const [reloadCount, setReload] = useState(0);

    const { status: ethStatus, balances: ethBalances } = useWalletState();
    const { status: supplyStatus, balance: supplayBalances } = useTokenBalances(token === "ETH" ? null : token, reloadCount);

    const address = useCoinAddress(token);
    const supplyCoins = useSupplyCoins();
    const deposit = useDeposit(address, amount);
    const reload = useReload();

    const coins = useMemo(() => supplyCoins ? ["ETH", ...supplyCoins] : [], [supplyCoins]);

    const handleClick = async () => {
        setLoadingButton(true);

        deposit(token).then((res: any) => {
            console.log(res);
            res.wait().then((res: any) => {
                console.log(res);
                message.success(t`操作成功`);

                setLoadingButton(false);
                setAmount(null);
                setReload(reloadCount + 1);
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

    const max = token === "ETH" ? ethBalances : supplayBalances;
    const loading = token === "ETH" ? ethStatus === WalletStatusEnums.LOADING : supplyStatus === TokenStatusEnums.LOADING;

    console.log("max", max);

    return <Handle
        isAuthorize
        type="Supply"
        max={max}
        labelText={<Trans>质押：</Trans>}
        labelTips={<Trans>储蓄您的资产开始赚取收益。</Trans>}
        rightText={loading ? t`加载中~` : <InputMax max={max} />}
        coins={coins}
        inputValue={amount ?? ""}
        selectValue={token ?? ""}
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


const Withdraw = () => {
    const [token, setToken] = useState<string | null>(null);
    const [amount, setAmount] = useState<string | null>(null);
    const [loadingButton, setLoadingButton] = useState<boolean>();
    const [max, setMax] = useState(0);

    const supplyMap = useSupplyMap();
    const address = useCoinAddress(token);

    const withdraw = useWithdraw(address, amount);
    const reload = useReload();

    const coins = useMemo(() => supplyMap ? Object.keys(supplyMap) : [], [supplyMap]);

    const handleClick = () => {
        setLoadingButton(true);

        withdraw().then((res: any) => {
            console.log(res);
            res.wait().then((res: any) => {
                console.log(res);
                message.success(t`操作成功`);

                setLoadingButton(false);
                setAmount(null);
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
        if (supplyMap && coins.length) {
            if (!token) {
                const coin = coins[0];
                setToken(coin);
                setMax(supplyMap[coin].amount)
            } else {
                setMax(supplyMap[token].amount);
            }
        }
    }, [supplyMap]);

    // getWithdrawMax(supplyMap,);
    console.log("supplyMap", supplyMap);

    return <Handle
        type="Withdraw"
        // max={max}
        labelText={<Trans>减少质押：</Trans>}
        labelTips={<Trans>从您的Aave储蓄中提取资产。</Trans>}
        // rightText={max ? <InputMax max={max} /> : ""}
        coins={coins ?? {}}
        inputValue={amount ?? ""}
        selectValue={token ?? ""}
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
    return <TabPanelGrid>
        <Supply />
        <Withdraw />
    </TabPanelGrid>
}

export default Collateral;