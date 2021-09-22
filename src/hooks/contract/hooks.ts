import { useMemo } from 'react';
import { Interface } from '@ethersproject/abi';

import useWeb3ReactCore from '../wallet/useWeb3ReactCore';

import { AAVE_MARKET, UNISWAP_WRAPPER, BAT, UNI, DAI, USDC, USDT, WBTC, FEI, TRIBE, FRAX, FXS, renBTC, UMA, UST, MIR } from './addresses';
import { MARKET_ADDRESS, USER_INFO_ADDRESS, USER_HANDLE_ADDRESS, USER_HANDLE_OTHER_ADDRESS } from './addresses';

import USER_INFO_ABI from '../../abis/user_info.json';
import USER_HANDLE_ABI from '../../abis/user_handle.json';
import USER_HANDLE_OTHER_ABI from '../../abis/user_handle_other.json';
import SMART_WALLET_ABI from '../../abis/smart_wallet.json';
import MARKET_ABI from '../../abis/market.json';
import ERC20_ABI from '../../abis/erc20.json';

export type TokenMapKey = "AAVE_MARKET" | "UNISWAP_WRAPPER" | "BAT" | "UNI" | "DAI" | "USDC" | "USDT" | "WBTC" | "FEI" | "TRIBE" | "FRAX" | "FXS" | "renBTC" | "UMA" | "UST" | "MIR";
export type ContractMapKey = "ERC20" | "MARKET" | "USER_INFO" | "USER_HANDLE" | "USER_HANDLE_OTHER" | "SMART_WALLET";

const contractMap = {
    ERC20: { address: null, abi: ERC20_ABI },
    MARKET: { address: MARKET_ADDRESS, abi: MARKET_ABI },
    USER_INFO: { address: USER_INFO_ADDRESS, abi: USER_INFO_ABI },
    USER_HANDLE: { address: USER_HANDLE_ADDRESS, abi: USER_HANDLE_ABI },
    USER_HANDLE_OTHER: { address: USER_HANDLE_OTHER_ADDRESS, abi: USER_HANDLE_OTHER_ABI },
    SMART_WALLET: { address: null, abi: SMART_WALLET_ABI },
};

const tokenMap: any = { AAVE_MARKET, UNISWAP_WRAPPER, BAT, UNI, DAI, USDC, USDT, WBTC, FEI, TRIBE, FRAX, FXS, renBTC, UMA, UST, MIR };

export const useAddressAndABI = (key: ContractMapKey) => {
    const { chainId } = useWeb3ReactCore();

    const { address, abi } = contractMap[key];

    return useMemo(() => chainId ? { address: address ? address[chainId] : "", abi } : {}, [chainId]);
}

export const useTokenAddress = (key?: TokenMapKey | string | null) => {
    const { chainId } = useWeb3ReactCore();

    const addressMap = useMemo(() => key && tokenMap.hasOwnProperty(key) ? tokenMap[key] : null, [key]);

    return useMemo(() => chainId && addressMap ? addressMap[chainId] : null, [chainId, addressMap]);
}

export const useFuncEncode = (ABI: any, methodName: string, options: any[]) => {
    const { active } = useWeb3ReactCore();

    const contractInterface = useMemo(() => active ? new Interface(ABI) : null, [active, ABI]);

    const fragment = useMemo(() => active ? contractInterface?.getFunction(methodName) : null, [contractInterface, methodName]);

    return useMemo(() => active && options?.length ? contractInterface?.encodeFunctionData(fragment ?? "", options) : undefined, [fragment, options]);
}