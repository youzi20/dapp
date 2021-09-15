import { useMemo } from 'react';
import { Contract } from '@ethersproject/contracts';

import useWeb3ReactCore from '../wallet/useWeb3ReactCore';

import { getContract } from '../../utils';


import { ContractMapKey, useAddressAndABI, TokenMapKey, useTokenAddress } from './hooks';


export function useContract<T extends Contract = Contract>(
    contractKey: ContractMapKey,
    otherAddress?: string | null,
    withSignerIfPossible = true
): T | null {
    const { library, account, chainId } = useWeb3ReactCore();

    let { address, abi } = useAddressAndABI(contractKey);

    if (otherAddress) address = otherAddress;

    return useMemo(() => {
        if (!address || !abi || !library || !chainId) return null

        try {
            return getContract(address, abi, library, withSignerIfPossible && account ? account : undefined)
        } catch (error) {
            console.error('Failed to get contract', error)
            return null
        }
    }, [address, abi, library, chainId, withSignerIfPossible, account]) as T
}

export const useMarketContract = () => {
    return useContract("MARKET");
}

export const useUserInfoContract = () => {
    return useContract("USER_INFO");
}

export const useUserHandleContract = () => {
    return useContract("USER_HANDLE");
}

export const useUserHandleOtherContract = () => {
    return useContract("USER_HANDLE_OTHER");
}

export const useSmartWalletContract = (address: string | null) => {
    return useContract("SMART_WALLET", address);
}

export const useERC20Contract = (token: TokenMapKey | string | null) => {
    const address = useTokenAddress(token);

    return useContract("ERC20", address);
}