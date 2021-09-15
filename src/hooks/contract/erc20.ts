import { useState, useEffect } from 'react';
import { MaxUint256 } from "@ethersproject/constants";

import { useState as useUserState } from '../../state/user';

import { useWeb3ReactCore } from '../wallet';
import { getNumber, getWei } from '../../utils';

import { useERC20Contract } from './index';
import { TokenMapKey } from './hooks';

export enum StatusEnums {
    FINISH,
    LOADING,
    ERROR,
}

export const useTokenBalances = (token: TokenMapKey | string | null, reload: number | null) => {
    const { account } = useWeb3ReactCore();

    const [status, setStaus] = useState<StatusEnums>(StatusEnums.FINISH);
    const [balance, setBalance] = useState<number>(0);

    const erc20Contract = useERC20Contract(token);

    // console.log("erc20Contract", erc20Contract);

    const getTokenBalance = async () => {
        if (!erc20Contract || !account || !token) return;

        setStaus(StatusEnums.LOADING);

        try {
            const balance = await erc20Contract.balanceOf(account);

            setBalance(getNumber(balance));
            setStaus(StatusEnums.FINISH);
        } catch (error) {
            setStaus(StatusEnums.ERROR);

            console.error(error);
        }
    }

    useEffect(() => {
        getTokenBalance();
    }, [erc20Contract, token, reload]);

    return { status, balance };
};


export const useApprove = (token: string | null) => {
    const erc20Contract = useERC20Contract(token);

    return async (address: string | null) => {
        if (!erc20Contract || !address) return;

        try {
            return erc20Contract.approve(address, MaxUint256);
        } catch (error) {
            console.error(error);
        }
    }
}

export const useAllowance = (token: string | null, reload: number | null) => {
    const { address } = useUserState();
    const { account } = useWeb3ReactCore();
    const [allowance, setAllowance] = useState(0);
    const erc20Contract = useERC20Contract(token);

    // console.log("erc20Contract", erc20Contract);

    const allowanceValue = async () => {
        if (!erc20Contract || !address || !account || !token) return;

        try {
            const value = await erc20Contract.allowance(account, address);
            setAllowance(getNumber(value));
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        allowanceValue();
    }, [erc20Contract, token, reload]);

    return { allowance };
}