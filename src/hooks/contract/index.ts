import { useMemo } from 'react';

import { getAddress } from '@ethersproject/address';
import { AddressZero } from '@ethersproject/constants';
import { Contract } from '@ethersproject/contracts';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';

import { useWeb3ReactCore } from '../wallet';

import { ContractMapKey, useAddressAndABI } from './hooks';


function isAddress(value: any): string | false {
    try {
        return getAddress(value)
    } catch {
        return false
    }
}

// account is not optional
function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
    return library.getSigner(account).connectUnchecked()
}

// account is optional
function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
    return account ? getSigner(library, account) : library
}

// account is optional
function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
    if (!isAddress(address) || address === AddressZero) {
        throw Error(`Invalid 'address' parameter '${address}'.`)
    }

    return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}

export function isInvalidAddress(value: string): boolean {
    const invalid = ["0x0000000000000000000000000000000000000000"];

    if (isAddress(value) && invalid.indexOf(value) < 0) return false;

    return true;
}

export function useContract<T extends Contract = Contract>(
    contractKey: ContractMapKey,
    otherAddress?: string | string[],
    withSignerIfPossible = true
): T | null {
    const { library, account, chainId } = useWeb3ReactCore();

    let { address, abi } = useAddressAndABI(contractKey);

    if (otherAddress) address = otherAddress;

    return useMemo(() => {
        if (!address || !abi || !library || !chainId) return null

        try {
            if (typeof address === "string") {
                return getContract(address, abi, library, withSignerIfPossible && account ? account : undefined);
            } else {
                return address.map(address => getContract(address, abi, library, withSignerIfPossible && account ? account : undefined));
            }
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

export const useSaverContract = () => {
    return useContract("SAVER");
}

export const useSaverInfoContract = () => {
    return useContract("SAVER_INFO");
}

export const useSmartWalletContract = (address?: string) => {
    return useContract("SMART_WALLET", address);
}

export const useERC20Contract = (address?: string | string[]) => {
    return useContract("ERC20", address);
}