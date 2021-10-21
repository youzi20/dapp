import { useEffect } from 'react';
import { useWeb3ReactCore } from '../wallet';

import { useSaverInfoContract } from "./index";

import { useAppDispatch } from '../../state/hooks';

import { useState as useUserState } from '../../state/user';
import { SaverStatusEnums, updateStatus, updateState } from '../../state/saver';

import { getFormatNumber, fullNumber } from "../../utils";

export const useSaverInfo = (status: boolean) => {
    const { account } = useWeb3ReactCore();

    const isSubscribed = useSubscribed();
    const getSaverParams = useSaverParams();

    useEffect(() => {
        if (status && account) {
            isSubscribed();
            getSaverParams();
        }
    }, [account, status]);
}

export const useSubscribed = () => {
    const dispatch = useAppDispatch();
    const { address } = useUserState();

    const saveInfoContract = useSaverInfoContract();

    console.log("saveInfoContract", saveInfoContract);

    return async () => {
        if (!saveInfoContract) return;

        dispatch(updateStatus(SaverStatusEnums.LOADING));

        try {
            const isSubscribed = await saveInfoContract.isSubscribed(address);

            console.log(isSubscribed);

            if (isSubscribed) {
                dispatch(updateStatus(SaverStatusEnums.OPEN));
            } else {
                dispatch(updateStatus(SaverStatusEnums.CLOSE));
            }
        } catch (error) {
            console.error(error);
            dispatch(updateStatus(SaverStatusEnums.CLOSE));
        }
    }
}

export const useSaverParams = () => {
    const dispatch = useAppDispatch();
    const { address } = useUserState();

    const saveInfoContract = useSaverInfoContract();

    console.log("saveInfoContract", saveInfoContract);

    return async () => {
        if (!saveInfoContract) return;

        dispatch(updateStatus(SaverStatusEnums.LOADING));

        try {
            const info = await saveInfoContract.getHolder(address);

            const [addr, minRatio, maxRatio, optimalBoost, optimalRepay, , enabled,] = info ?? [];

            console.log({
                addr,
                minRatio: Number(getFormatNumber(minRatio)),
                maxRatio: Number(getFormatNumber(maxRatio)),
                optimalBoost: Number(getFormatNumber(optimalBoost)),
                optimalRepay: Number(getFormatNumber(optimalRepay)),
                enabled,
            });

            dispatch(updateState({
                minRatio: String(Number(getFormatNumber(minRatio))),
                maxRatio: String(Number(getFormatNumber(maxRatio))),
                optimalBoost: String(Number(getFormatNumber(optimalBoost))),
                optimalRepay: String(Number(getFormatNumber(optimalRepay))),
                enabled: !!enabled
            }));
        } catch (error) {
            console.error(error);
        }
    }
}

