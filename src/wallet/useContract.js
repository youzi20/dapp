
import { useMemo } from 'react';
import { useWeb3React } from '@web3-react/core'
import { getAddress } from '@ethersproject/address';
import { AddressZero } from '@ethersproject/constants'
import { Contract } from '@ethersproject/contracts';

import ERC20_ABI from '../abis/erc20.json';

function isAddress(value) {
    try {
        return getAddress(value)
    } catch {
        return false
    }
}

function getSigner(library, account) {
    return library.getSigner(account).connectUnchecked()
}

function getProviderOrSigner(library, account) {
    return account ? getSigner(library, account) : library
}

function getContract(address, ABI, library, account) {
    if (!isAddress(address) || address === AddressZero) {
        throw Error(`Invalid 'address' parameter '${address}'.`)
    }

    return new Contract(address, ABI, getProviderOrSigner(library, account))
}

const contractMap = {
    ERC20: { address: null, abi: ERC20_ABI },
};

function useAddressAndABI(key) {
    const { chainId } = useWeb3React();

    const { address, abi } = contractMap[key];

    return useMemo(() => chainId ? { address: address ? address[chainId] : "", abi } : {}, [chainId]);
}

export function useContract(contractKey, otherAddress, withSignerIfPossible = true) {
    const { provider, account, chainId } = useWeb3React();

    let { address, abi } = useAddressAndABI(contractKey);

    if (otherAddress) address = otherAddress;

    return useMemo(() => {
        if (!address || !abi || !provider || !chainId) return null

        try {
            if (typeof address === "string") {
                return getContract(address, abi, provider, withSignerIfPossible && account ? account : undefined);
            } else {
                return address.map(address => getContract(address, abi, provider, withSignerIfPossible && account ? account : undefined));
            }
        } catch (error) {
            console.error('Failed to get contract', error)
            return null
        }
    }, [address, abi, provider, chainId, withSignerIfPossible, account])
}

export const useERC20Contract = (address) => {
    return useContract("ERC20", address);
}