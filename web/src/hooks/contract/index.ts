

import { useMemo } from 'react';

import { Contract } from '@ethersproject/contracts'

import { useWeb3ReactCore } from '../wallet';
import { getContract } from '../../utils';

import SMART_WALLET_ABI from '../../abis/smart_wallet.json';

export function useContract<T extends Contract = Contract>(
    addressOrAddressMap: string | { [chainId: number]: string } | undefined,
    ABI: any,
    withSignerIfPossible = true
): T | null {
    const { library, account, chainId } = useWeb3ReactCore();

    return useMemo(() => {
        if (!addressOrAddressMap || !ABI || !library || !chainId || chainId !== 42) return null
        let address: string | undefined
        if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
        else address = addressOrAddressMap[chainId]
        if (!address) return null
        try {
            return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined)
        } catch (error) {
            console.error('Failed to get contract', error)
            return null
        }
    }, [addressOrAddressMap, ABI, library, chainId, withSignerIfPossible, account]) as T
}

export function useSmartWalletContract() {
    return useContract("0x64A436ae831C1672AE81F674CAb8B6775df3475C", SMART_WALLET_ABI);
}
