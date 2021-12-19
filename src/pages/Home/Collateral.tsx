import { useEffect, useMemo, useState } from 'react';
import { Trans, t } from '@lingui/macro';
import { MaxUint256 } from '@ethersproject/constants';

import { ButtonStatus } from '../../components/Button';
import { message } from '../../components/Message';

import { StatusEnums, useTokenBalances, useAllowance } from '../../hooks/contract/erc20';
import { useDeposit, useWithdraw } from '../../hooks/contract/handle';
import useHandle from '../../hooks/handle';

import { useAppDispatch } from '../../state/hooks';
import { updateConfigReload } from '../../state/config';
import { WalletBalancesEnums, useState as useWalletState } from '../../state/wallet';
import { useUserInfo } from "../../state/user";
import { useSupplyCoins, useSupplyMap } from '../../state/market';

import { fullNumber, getParseWei, numberToFixed } from '../../utils';

import Handle, { HandleContext, HandleAbove, HandleInput, HandleSelect, ApproveButton, HandleButton } from './Handle';

export const Supply = () => {
    const dispatch = useAppDispatch();

    const { state, setState } = useHandle("Supply");

    const { status, theme, amount, token, tokenAddress, tokenDecimals, handleButton } = state;
    const { setStatus, setMax, setAmount, setToken } = setState;

    const [buttonStatus, setButtonStatus] = useState<ButtonStatus>();

    const supplyCoins = useSupplyCoins();

    const { status: tokenStatus, balances: tokenBalances } = useTokenBalances(token !== "ETH" ? tokenAddress : undefined, tokenDecimals);
    const { balancesStatus: ethStatus, balances: ethBalances } = useWalletState();

    const { allowance } = useAllowance(token !== "ETH" ? tokenAddress : undefined);

    const max = useMemo(() => {
        if (token === "ETH" && WalletBalancesEnums.FINISH === ethStatus) return ethBalances;
        else if (StatusEnums.FINISH === tokenStatus) return tokenBalances;

        return;
    }, [token, status, ethStatus, tokenStatus, ethBalances]);

    const approve = useMemo(() => {
        if (allowance && token !== "ETH" && Number(allowance) < Number(amount)) return true;
        else return false
    }, [allowance, amount, token]);

    const deposit = useDeposit(tokenAddress, getParseWei(amount, tokenDecimals));

    const handleClick = async () => {
        setButtonStatus("loading");
        setStatus && setStatus("disabled");

        deposit(token)
            .then((res: any) => {
                console.log(res);

                res.wait()
                    .then((res: any) => {
                        console.log(res);
                        message.success(t`操作成功`);

                        dispatch(updateConfigReload());
                        setButtonStatus(undefined);
                        setStatus && setStatus("default");
                    })
                    .catch((error: any) => {
                        console.error(error);
                        message.error(error.message);

                        setButtonStatus(undefined);
                        setStatus && setStatus("default");
                    });
            })
            .catch((error: any) => {
                console.error(error);
                message.error(error.message);

                setButtonStatus(undefined);
                setStatus && setStatus("default");
            });
    }

    // console.log(token, tokenAddress, tokenDecimals, allowance, ethBalances);

    useEffect(() => {
        setMax(max);

        return () => { }
    }, [max]);

    return <HandleContext.Provider value={{ status, theme, approve, max, amount, token, tokenAddress, handleButton, setStatus, setAmount, setToken }}>
        <Handle
            above={<HandleAbove />}
            body={<>
                <HandleInput
                    labelText={<Trans>质押</Trans>}
                    labelTips={<Trans>储蓄您的资产开始赚取收益。</Trans>}
                />
                <HandleSelect dataSource={supplyCoins ?? []} />
            </>}
            button={<>
                {approve && <ApproveButton />}
                <HandleButton status={buttonStatus} onClick={handleClick}>
                    <Trans>质押</Trans>
                </HandleButton>
            </>}
            buttonColumn={approve ? 2 : 1}
        />
    </HandleContext.Provider>
}


function getWithdrawMax(supplyMap: any, token: string, totalDebt: number) {
    const totalSupply = Object.values(supplyMap).reduce((prev: number, item: any) => {
        if (item.symbol === token) return prev;

        return prev + item.priceETH * item.liquidationRatio;
    }, 0);

    // console.log("Withdraw", totalSupply, totalDebt);

    const { amount, price, priceETH, liquidationRatio } = supplyMap[token];

    if (totalSupply > totalDebt) return [true, amount];

    return [false, fullNumber((priceETH - (totalDebt - totalSupply) / liquidationRatio * 1.01) / price)];
}

export const Withdraw = () => {
    const dispatch = useAppDispatch();

    const { state, setState } = useHandle("Withdraw");

    const { status, theme, amount, token, tokenAddress, tokenDecimals, handleButton } = state;
    const { setStatus, setMax, setAmount, setToken } = setState;

    const [buttonStatus, setButtonStatus] = useState<ButtonStatus>();

    const { totalDebtETH } = useUserInfo() ?? {};

    const supplyMap = useSupplyMap();
    const supplyCoins = useMemo(() => supplyMap ? Object.keys(supplyMap) : [], [supplyMap]);

    const [isMax, max] = useMemo(() => supplyMap && token && totalDebtETH ? getWithdrawMax(supplyMap, token, totalDebtETH) : [false, undefined], [supplyMap, token,]);

    const withdraw = useWithdraw(tokenAddress, isMax && amount === max ? MaxUint256 : getParseWei(numberToFixed(amount, tokenDecimals), tokenDecimals));

    const handleClick = () => {
        setButtonStatus("loading");
        setStatus && setStatus("disabled");

        withdraw()
            .then((res: any) => {
                console.log(res);
                res.wait()
                    .then((res: any) => {
                        console.log(res);
                        message.success(t`操作成功`);

                        dispatch(updateConfigReload());
                        setButtonStatus(undefined);
                        setStatus && setStatus("default");
                    })
                    .catch((error: any) => {
                        console.error(error);
                        message.error(error.message);

                        setButtonStatus(undefined);
                        setStatus && setStatus("default");
                    });
            })
            .catch((error: any) => {
                console.error(error);
                message.error(error.message);

                setButtonStatus(undefined);
                setStatus && setStatus("default");
            });
    }

    useEffect(() => {
        setMax(max);

        return () => { }
    }, [max]);

    return <HandleContext.Provider value={{ status, theme, max, amount, token, handleButton, setStatus, setAmount, setToken }}>
        <Handle
            above={<HandleAbove />}
            body={<>
                <HandleInput
                    labelText={<Trans>减少质押</Trans>}
                    labelTips={<Trans>从您的Aave储蓄中提取资产。</Trans>}
                />
                <HandleSelect dataSource={supplyCoins ?? []} />
            </>}
            button={<HandleButton status={buttonStatus} onClick={handleClick}>
                <Trans>减少质押</Trans>
            </HandleButton>}
        />
    </HandleContext.Provider>
}