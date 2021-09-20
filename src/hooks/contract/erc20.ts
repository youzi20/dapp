import { useState, useEffect } from 'react';
import { MaxUint256 } from "@ethersproject/constants";

import { useState as useUserState } from '../../state/user';

import { useWeb3ReactCore } from '../wallet';
import { getFormatNumber, getWei } from '../../utils';

import { useERC20Contract } from './index';
import { TokenMapKey } from './hooks';

export enum StatusEnums {
    FINISH,
    LOADING,
    ERROR,
}

export const useTokenBalances = (token: TokenMapKey | string | null) => {
    const { account } = useWeb3ReactCore();

    const [status, setStaus] = useState<StatusEnums>(StatusEnums.FINISH);
    const [balance, setBalance] = useState<string>();

    const erc20Contract = useERC20Contract(token);

    // console.log("erc20Contract", erc20Contract);

    const getTokenBalance = async () => {
        if (!erc20Contract || !account || !token) return;

        setStaus(StatusEnums.LOADING);

        try {
            const balance = await erc20Contract.balanceOf(account);

            setBalance(getFormatNumber(balance));
            setStaus(StatusEnums.FINISH);
        } catch (error) {
            setStaus(StatusEnums.ERROR);

            console.error(error);
        }
    }

    useEffect(() => {
        getTokenBalance();
    }, [erc20Contract, token]);

    return { status, balance, reload: getTokenBalance };
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

export const useAllowance = (token: string | null) => {
    const { address } = useUserState();
    const { account } = useWeb3ReactCore();
    const [allowance, setAllowance] = useState<string>();

    const erc20Contract = useERC20Contract(token);

    // console.log("erc20Contract", erc20Contract);

    const getAllowanceValue = async () => {
        if (!erc20Contract || !address || !account || !token) return;

        try {
            const value = await erc20Contract.allowance(account, address);
            setAllowance(getFormatNumber(value));
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        getAllowanceValue();
    }, [erc20Contract, token]);

    return { allowance, reload: getAllowanceValue };
}