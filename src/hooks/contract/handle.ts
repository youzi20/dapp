import { useMemo } from "react";

import { useSmartWalletContract } from "./index";
import { useAddressAndABI, useFuncEncode, useTokenAddress } from "./hooks";

import { useWeb3ReactCore } from "../wallet";

import { useAddress } from "../../state/user";
import { getWei, abiEncode } from '../../utils';

const offchainData = ["0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", 0, 0, 0];

export const useBoost = (fromAddress: string | null, toAddress: string | null, amount: string | null, apy: number | null) => {
    const { account } = useWeb3ReactCore();
    const address = useAddress();

    const marketAddress = useTokenAddress("AAVE_MARKET");
    const uniswapAddress = useTokenAddress("UNISWAP_WRAPPER");
    const smartWalletContract = useSmartWalletContract(address);

    // console.log("smartWalletContract", smartWalletContract);

    const { address: USER_HANDLE_OTHER_ADDRESS, abi: USER_HANDLE_OTHER_ABI } = useAddressAndABI("USER_HANDLE_OTHER");

    const uniswapWrapper = useMemo(() => fromAddress && toAddress ? abiEncode(["address[]"], [[fromAddress, toAddress]]) : "", [fromAddress, toAddress]);

    const exchangeData = [fromAddress, toAddress, getWei(amount ? amount : "0"), 0, 0, 400, account, uniswapAddress, uniswapWrapper, offchainData];

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

export const useRepay = (fromAddress: string | null, toAddress: string | null, amount: string | null, apy: number | null) => {
    const { account } = useWeb3ReactCore();
    const address = useAddress();

    const marketAddress = useTokenAddress("AAVE_MARKET");
    const uniswapAddress = useTokenAddress("UNISWAP_WRAPPER");
    const smartWalletContract = useSmartWalletContract(address);

    // console.log("smartWalletContract", smartWalletContract);

    const { address: USER_HANDLE_OTHER_ADDRESS, abi: USER_HANDLE_OTHER_ABI } = useAddressAndABI("USER_HANDLE_OTHER");

    const uniswapWrapper = useMemo(() => fromAddress && toAddress ? abiEncode(["address[]"], [[fromAddress, toAddress]]) : "", [fromAddress, toAddress]);

    const exchangeData = [fromAddress, toAddress, getWei(amount ? amount : "0"), 0, 0, 400, account, uniswapAddress, uniswapWrapper, offchainData];

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


export const useDeposit = (aaveAddress: string | null, amount: string | null) => {
    const address = useAddress();

    const marketAddress = useTokenAddress("AAVE_MARKET");
    const smartWalletContract = useSmartWalletContract(address);

    // console.log("smartWalletContract", smartWalletContract);

    const { address: USER_HANDLE_ADDRESS, abi: USER_HANDLE_ABI } = useAddressAndABI("USER_HANDLE");

    const userHandleDepositEncode = useFuncEncode(USER_HANDLE_ABI, "deposit", amount && aaveAddress ? [marketAddress, aaveAddress, getWei(amount)] : []);

    return (token: any, isGas?: boolean,) => {
        if (!smartWalletContract) return;

        try {
            if (token === "ETH") {
                if (isGas) {
                    return smartWalletContract.estimateGas.execute(USER_HANDLE_ADDRESS, userHandleDepositEncode, { value: getWei(amount) });
                } else {
                    return smartWalletContract.execute(USER_HANDLE_ADDRESS, userHandleDepositEncode, { value: getWei(amount) });
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

export const useWithdraw = (aaveAddress: string | null, amount: string | null) => {
    const address = useAddress();

    const marketAddress = useTokenAddress("AAVE_MARKET");
    const smartWalletContract = useSmartWalletContract(address);

    // console.log("smartWalletContract", smartWalletContract);

    const { address: USER_HANDLE_ADDRESS, abi: USER_HANDLE_ABI } = useAddressAndABI("USER_HANDLE");

    const userHandleWithdrawEncode = useFuncEncode(USER_HANDLE_ABI, "withdraw", amount && aaveAddress ? [marketAddress, aaveAddress, getWei(amount)] : []);

    return () => {
        if (!smartWalletContract) return;

        try {
            return smartWalletContract.execute(USER_HANDLE_ADDRESS, userHandleWithdrawEncode);
        } catch (error) {
            console.error(error);
        }
    }
}

export const useBorrow = (aaveAddress: string | null, amount: string | null, apy: number | null) => {
    const address = useAddress();

    const marketAddress = useTokenAddress("AAVE_MARKET");
    const smartWalletContract = useSmartWalletContract(address);

    const { address: USER_HANDLE_ADDRESS, abi: USER_HANDLE_ABI } = useAddressAndABI("USER_HANDLE");

    // 1 固定汇率 2 动态汇率
    const userHandleBorrowEncode = useFuncEncode(USER_HANDLE_ABI, "borrow", amount && aaveAddress && apy ? [marketAddress, aaveAddress, getWei(amount), apy] : []);

    return () => {
        if (!smartWalletContract) return;

        try {
            return smartWalletContract.execute(USER_HANDLE_ADDRESS, userHandleBorrowEncode);
        } catch (error) {
            console.error(error);
        }
    }
}

export const usePayback = (aaveAddress: string | null, amount: string | null, apy: number | null) => {
    const address = useAddress();

    const marketAddress = useTokenAddress("AAVE_MARKET");
    const smartWalletContract = useSmartWalletContract(address);

    const { address: USER_HANDLE_ADDRESS, abi: USER_HANDLE_ABI } = useAddressAndABI("USER_HANDLE");

    // 1 固定汇率 2 动态汇率
    const userHandlePaybackEncode = useFuncEncode(USER_HANDLE_ABI, "payback", aaveAddress && amount && apy ? [marketAddress, aaveAddress, getWei(amount), apy] : []);

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