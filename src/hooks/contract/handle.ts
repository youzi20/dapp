import { useMemo } from 'react';
import { BigNumberish } from '@ethersproject/bignumber';


import { useSmartWalletContract } from './index';
import { useAddressAndABI, useFuncEncode, useTokenAddress } from './hooks';

import { useWeb3ReactCore } from '../wallet';

import { useAddress } from '../../state/user';
import { getParseWei, abiEncode } from '../../utils';

export const useEnabled = (aaveAddress: string, enabled: boolean) => {
    const address = useAddress();

    const marketAddress = useTokenAddress("AAVE_MARKET");
    const smartWalletContract = useSmartWalletContract(address);

    const { address: USER_HANDLE_ADDRESS, abi: USER_HANDLE_ABI } = useAddressAndABI("USER_HANDLE");

    const userHandleEnabledEncode = useFuncEncode(USER_HANDLE_ABI, "setUserUseReserveAsCollateral", aaveAddress ? [marketAddress, aaveAddress, enabled] : []);

    return () => {
        if (!smartWalletContract) return;

        try {
            return smartWalletContract.execute(USER_HANDLE_ADDRESS, userHandleEnabledEncode);
        } catch (error) {
            console.error(error);
        }
    }
}

export const useSwapRate = (aaveAddress: string, borrowRate: number) => {
    const address = useAddress();

    const marketAddress = useTokenAddress("AAVE_MARKET");
    const smartWalletContract = useSmartWalletContract(address);

    const { address: USER_HANDLE_ADDRESS, abi: USER_HANDLE_ABI } = useAddressAndABI("USER_HANDLE");

    const userHandleSwapRateEncode = useFuncEncode(USER_HANDLE_ABI, "swapBorrowRateMode", aaveAddress ? [marketAddress, aaveAddress, borrowRate] : []);

    return () => {
        if (!smartWalletContract) return;

        try {
            return smartWalletContract.execute(USER_HANDLE_ADDRESS, userHandleSwapRateEncode);
        } catch (error) {
            console.error(error);
        }
    }
}

const offchainData = ["0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", 0, 0, 0];

export const useBoost = (tokenAddressArray?: string[], amount?: BigNumberish, minPrice?: string, apy?: number) => {
    const { account } = useWeb3ReactCore();
    const address = useAddress();

    const marketAddress = useTokenAddress("AAVE_MARKET");
    const uniswapAddress = useTokenAddress("UNISWAP_WRAPPER");
    const smartWalletContract = useSmartWalletContract(address);

    const [fromAddress, toAddress] = tokenAddressArray ?? [];

    // console.log("smartWalletContract", smartWalletContract);

    const { address: USER_HANDLE_OTHER_ADDRESS, abi: USER_HANDLE_OTHER_ABI } = useAddressAndABI("USER_HANDLE_OTHER");

    const uniswapWrapper = useMemo(() => fromAddress && toAddress ? abiEncode(["address[]"], [[fromAddress, toAddress]]) : "", [fromAddress, toAddress]);

    const exchangeData = [fromAddress, toAddress, amount, 0, getParseWei(minPrice ?? "0"), 400, account, uniswapAddress, uniswapWrapper, offchainData];

    const userHandleBoostEncode = useFuncEncode(USER_HANDLE_OTHER_ABI, "boost", fromAddress && toAddress && amount && apy ? [marketAddress, exchangeData, apy, 0, 1] : []);

    // console.log(apy, userHandleBoostEncode);

    return () => {
        if (!smartWalletContract) return;

        try {
            return smartWalletContract.execute(USER_HANDLE_OTHER_ADDRESS, userHandleBoostEncode);
        } catch (error) {
            console.error(error);
        }
    }
}

export const useRepay = (tokenAddressArray?: string[], amount?: BigNumberish, minPrice?: string, apy?: number) => {
    const { account } = useWeb3ReactCore();
    const address = useAddress();

    const marketAddress = useTokenAddress("AAVE_MARKET");
    const uniswapAddress = useTokenAddress("UNISWAP_WRAPPER");
    const smartWalletContract = useSmartWalletContract(address);

    const [fromAddress, toAddress] = tokenAddressArray ?? [];

    // console.log("smartWalletContract", smartWalletContract);

    const { address: USER_HANDLE_OTHER_ADDRESS, abi: USER_HANDLE_OTHER_ABI } = useAddressAndABI("USER_HANDLE_OTHER");

    const uniswapWrapper = useMemo(() => fromAddress && toAddress ? abiEncode(["address[]"], [[fromAddress, toAddress]]) : "", [fromAddress, toAddress]);

    const exchangeData = [fromAddress, toAddress, amount, 0, getParseWei(minPrice ?? "0"), 400, account, uniswapAddress, uniswapWrapper, offchainData];

    // console.log(exchangeData);

    const userHandleRepayEncode = useFuncEncode(USER_HANDLE_OTHER_ABI, "repay", fromAddress && toAddress && amount && apy ? [marketAddress, exchangeData, apy, 0, 1] : []);

    // console.log(apy, userHandleRepayEncode);

    return () => {
        if (!smartWalletContract) return;

        try {
            return smartWalletContract.execute(USER_HANDLE_OTHER_ADDRESS, userHandleRepayEncode);
        } catch (error) {
            console.error(error);
        }
    }
}


export const useDeposit = (aaveAddress?: string, amount?: BigNumberish) => {
    const address = useAddress();

    const marketAddress = useTokenAddress("AAVE_MARKET");
    const smartWalletContract = useSmartWalletContract(address);

    // console.log("smartWalletContract", smartWalletContract);

    const { address: USER_HANDLE_ADDRESS, abi: USER_HANDLE_ABI } = useAddressAndABI("USER_HANDLE");

    const userHandleDepositEncode = useFuncEncode(USER_HANDLE_ABI, "deposit", amount && aaveAddress ? [marketAddress, aaveAddress, amount] : []);

    return (token: any, isGas?: boolean,) => {
        if (!smartWalletContract) return;

        try {
            if (token === "ETH") {
                if (isGas) {
                    return smartWalletContract.estimateGas.execute(USER_HANDLE_ADDRESS, userHandleDepositEncode, { value: amount });
                } else {
                    return smartWalletContract.execute(USER_HANDLE_ADDRESS, userHandleDepositEncode, { value: amount });
                }
            } else {
                if (isGas) {
                    return smartWalletContract.estimateGas.execute(USER_HANDLE_ADDRESS, userHandleDepositEncode);
                } else {
                    return smartWalletContract.execute(USER_HANDLE_ADDRESS, userHandleDepositEncode);
                }
            }
        } catch (error) {
            console.error(error);
        }
    }
}

export const useWithdraw = (aaveAddress?: string, amount?: BigNumberish) => {
    const address = useAddress();

    const marketAddress = useTokenAddress("AAVE_MARKET");
    const smartWalletContract = useSmartWalletContract(address);

    // console.log("smartWalletContract", smartWalletContract);

    const { address: USER_HANDLE_ADDRESS, abi: USER_HANDLE_ABI } = useAddressAndABI("USER_HANDLE");

    const userHandleWithdrawEncode = useFuncEncode(USER_HANDLE_ABI, "withdraw", amount && aaveAddress ? [marketAddress, aaveAddress, amount] : []);

    return () => {
        if (!smartWalletContract) return;

        try {
            return smartWalletContract.execute(USER_HANDLE_ADDRESS, userHandleWithdrawEncode);
        } catch (error) {
            console.error(error);
        }
    }
}

export const useBorrow = (aaveAddress?: string, amount?: BigNumberish, apy?: number) => {
    const address = useAddress();

    const marketAddress = useTokenAddress("AAVE_MARKET");
    const smartWalletContract = useSmartWalletContract(address);

    const { address: USER_HANDLE_ADDRESS, abi: USER_HANDLE_ABI } = useAddressAndABI("USER_HANDLE");

    // 1 固定汇率 2 动态汇率
    const userHandleBorrowEncode = useFuncEncode(USER_HANDLE_ABI, "borrow", amount && aaveAddress && apy ? [marketAddress, aaveAddress, amount, apy] : []);

    return () => {
        if (!smartWalletContract) return;

        try {
            return smartWalletContract.execute(USER_HANDLE_ADDRESS, userHandleBorrowEncode);
        } catch (error) {
            console.error(error);
        }
    }
}

export const usePayback = (aaveAddress?: string, amount?: BigNumberish, apy?: number) => {
    const address = useAddress();

    const marketAddress = useTokenAddress("AAVE_MARKET");
    const smartWalletContract = useSmartWalletContract(address);

    const { address: USER_HANDLE_ADDRESS, abi: USER_HANDLE_ABI } = useAddressAndABI("USER_HANDLE");

    // 1 固定汇率 2 动态汇率
    const userHandlePaybackEncode = useFuncEncode(USER_HANDLE_ABI, "payback", aaveAddress && amount && apy ? [marketAddress, aaveAddress, amount, apy] : []);

    // console.log("usePayback", marketAddress, aaveAddress, amount, apy);

    return () => {
        if (!smartWalletContract) return;

        // console.log(USER_HANDLE_ADDRESS, userHandlePaybackEncode);

        try {
            return smartWalletContract.execute(USER_HANDLE_ADDRESS, userHandlePaybackEncode);
        } catch (error) {
            console.error(error);
        }
    }
}