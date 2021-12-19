import { useState, useEffect } from 'react';
import { MaxUint256 } from '@ethersproject/constants';

import { useState as useUserState } from '../../state/user';

import { useWeb3ReactCore } from '../wallet';
import { getFormatNumber } from '../../utils';

import { useERC20Contract } from './index';

export enum StatusEnums {
    FINISH,
    LOADING,
    ERROR,
}

export const useTokenBalances = (tokenAddress?: string, tokenDecimals?: number) => {
    const { account } = useWeb3ReactCore();

    const [status, setStaus] = useState<StatusEnums>(StatusEnums.FINISH);
    const [balances, setBalances] = useState<string>();

    const erc20Contract = useERC20Contract(tokenAddress);

    // console.log("erc20Contract", erc20Contract);

    const getTokenBalances = async () => {
        if (!erc20Contract || !account || !tokenAddress) return;

        setStaus(StatusEnums.LOADING);

        try {
            const balance = await erc20Contract.balanceOf(account);

            setBalances(getFormatNumber(balance, tokenDecimals ? Number(tokenDecimals) : "ether"));
            setStaus(StatusEnums.FINISH);
        } catch (error) {
            setStaus(StatusEnums.ERROR);

            console.error(error);
        }
    }

    useEffect(() => {
        getTokenBalances();
    }, [erc20Contract, tokenAddress]);

    return { status, balances, reload: getTokenBalances };
};

export const useDecimals = (address?: string) => {
    const erc20Contract = useERC20Contract(address);

    return async () => {
        if (!erc20Contract) return;

        try {
            return erc20Contract.decimals();
        } catch (error) {
            console.error(error);
        }
    }
}

export const useApprove = (tokenAddress?: string) => {
    const erc20Contract = useERC20Contract(tokenAddress);

    return async (address?: string) => {
        if (!erc20Contract || !address) return;

        try {
            return erc20Contract.approve(address, MaxUint256);
        } catch (error) {
            console.error(error);
        }
    }
}

export const useAllowance = (tokenAddress?: string) => {
    const { address } = useUserState();
    const { account } = useWeb3ReactCore();
    const [allowance, setAllowance] = useState<string>();

    const erc20Contract = useERC20Contract(tokenAddress);

    // console.log("erc20Contract", erc20Contract);

    const getAllowanceValue = async () => {
        if (!erc20Contract || !address || !account || !tokenAddress) return;

        try {
            const value = await erc20Contract.allowance(account, address);
            setAllowance(getFormatNumber(value));
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        setAllowance(undefined);
        getAllowanceValue();
    }, [erc20Contract, tokenAddress]);

    return { allowance, reload: getAllowanceValue };
}