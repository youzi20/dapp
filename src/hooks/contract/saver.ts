import { useSmartWalletContract } from "./index";
import { useAddressAndABI, useFuncEncode, useTokenAddress } from "./hooks";

import { useAddress } from "../../state/user";
import { useState as useSaverState } from '../../state/saver';
import { getWei } from "../../utils";

export const useSubscribe = () => {
    const address = useAddress();
    const { minRatio, maxRatio, optimalBoost, optimalRepay, enabled } = useSaverState();

    const marketAddress = useTokenAddress("AAVE_MARKET");
    const smartWalletContract = useSmartWalletContract(address);

    const { address: SAVER_ADDRESS, abi: SAVER_ABI } = useAddressAndABI("SAVER");

    const userSaverSubscribeEncode = useFuncEncode(SAVER_ABI, "subscribe", [marketAddress, getWei(minRatio), getWei(maxRatio), getWei(optimalBoost), getWei(optimalRepay), 0, 0, enabled, 1, 0]);

    return () => {
        if (!smartWalletContract) return;

        try {
            return smartWalletContract.execute(SAVER_ADDRESS, userSaverSubscribeEncode);
        } catch (error) {
            console.error(error);
        }
    }
}

export const useUnsubscribe = () => {
    const address = useAddress();

    const smartWalletContract = useSmartWalletContract(address);

    const { address: SAVER_ADDRESS, abi: SAVER_ABI } = useAddressAndABI("SAVER");

    const userSaverUnsubscribeEncode = useFuncEncode(SAVER_ABI, "unsubscribe");

    return () => {
        if (!smartWalletContract) return;

        try {
            return smartWalletContract.execute(SAVER_ADDRESS, userSaverUnsubscribeEncode);
        } catch (error) {
            console.error(error);
        }
    }
}
