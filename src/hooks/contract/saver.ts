import { useSmartWalletContract } from './index';
import { useAddressAndABI, useFuncEncode, useTokenAddress } from './hooks';

import { useAddress } from '../../state/user';
import { useState as useSaverState } from '../../state/saver';
import { getParseWei } from '../../utils';

export const useSubscribe = (optimalType: number) => {
    const address = useAddress();
    const { minRatio, maxRatio, optimalBoost, optimalRepay, enabled } = useSaverState();

    const marketAddress = useTokenAddress("AAVE_MARKET");
    const smartWalletContract = useSmartWalletContract(address);

    const { address: SAVER_ADDRESS, abi: SAVER_ABI } = useAddressAndABI("SAVER");

    // console.log(optimalType, minRatio, maxRatio, optimalBoost, optimalRepay, enabled);

    const value = optimalType === 1 ?
        [marketAddress, getParseWei(minRatio), getParseWei(maxRatio), getParseWei(optimalBoost), getParseWei(optimalRepay), 0, 0, enabled, optimalType, 0] :
        [marketAddress, 0, 0, 0, 0, 0, 0, enabled, optimalType, 0];

    const userSaverSubscribeEncode = useFuncEncode(SAVER_ABI, "subscribe", value);

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
