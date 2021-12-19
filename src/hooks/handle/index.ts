
import { useState, useEffect, useMemo } from 'react';
import { t } from '@lingui/macro';

import { useHandleAfter } from '../after';

import { useTokenDecimals, useTokenAddress, } from '../../state/market';
import { useState as useSaverState } from '../../state/saver';
import { useState as useAfterState } from "../../state/after";


import { HandleType, getHandleType } from '../../utils';

const useHandle = (type: HandleType) => {
    const [status, setStatus] = useState<"disabled" | "default">("default");

    const [max, setMax] = useState<string>();
    const [amount, setAmount] = useState<string>();

    const [token, setToken] = useState<string>();
    const [tokenTo, setTokenTo] = useState<string>();
    const [tokenLoanType, setTokenLoanType] = useState<number>();
    const [tokenToLoanType, setTokenToLoanType] = useState<number>();

    const tokenAddress = useTokenAddress(token);
    const tokenDecimals = useTokenDecimals(token);

    const tokenToAddress = useTokenAddress(tokenTo);
    const tokenToDecimals = useTokenDecimals(tokenTo);

    const theme = useMemo(() => getHandleType(type), [type]);

    const { optimalType } = useSaverState();
    const { type: afterType } = useAfterState();

    useHandleAfter(type, amount, token, tokenTo);

    const handleButton = useMemo(() => {
        if (optimalType === 2 && ["Boost", "Repay", "Supply", "Withdraw", "Payback"].indexOf(type) >= 0) {
            return { tips: t`已开启全自动化模式，禁止使用`, disabled: true }
        } else if (!amount) {
            return { tips: t`未输入值`, disabled: true }
        } else if (Number(amount) > Number(max)) {
            return { tips: t`数值大于最大值`, disabled: true }
        } else if (Number(amount) <= 0) {
            return { tips: t`数值不能小于0`, disabled: true }
        } else return { tips: "", disabled: false }
    }, [amount, max]);

    useEffect(() => {
        if (afterType && afterType !== type && amount) setAmount("");
    }, [afterType]);

    return {
        state: {
            status,
            theme,
            max,
            amount,
            token,
            tokenLoanType,
            tokenDecimals,
            tokenAddress,
            tokenTo,
            tokenToLoanType,
            tokenToDecimals,
            tokenToAddress,
            handleButton
        },
        setState: {
            setStatus,
            setMax,
            setAmount,
            setToken,
            setTokenLoanType,
            setTokenTo,
            setTokenToLoanType,
        }
    }
}

export default useHandle;