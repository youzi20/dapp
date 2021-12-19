import { useEffect } from 'react';
import { useWeb3ReactCore } from '../wallet';


import { useUserInfoContract } from './index';

import { useAppDispatch } from '../../state/hooks';
import { updateAddress, updateStatus, UserStatusEnums } from '../../state/user';

import { isInvalidAddress } from './index';

export enum UserStatusEnmus {
    CREATE = "create",
    LOADING = "loading",
    SUCEESS = "success",
}

export const useUserInfo = (status: boolean) => {
    const { account } = useWeb3ReactCore();

    const proxies = useProxies();

    useEffect(() => {
        if (status && account) {
            proxies();
        }
    }, [account, status]);
}

export const useBuild = () => {
    const { account } = useWeb3ReactCore();

    const userInfoContract = useUserInfoContract();

    // console.log("userInfoContract", userInfoContract);

    return async () => {
        if (!userInfoContract) return;

        try {
            return userInfoContract["build(address)"](account);
        } catch (error) {
            console.error(error);
        }
    }
}

export const useProxies = () => {
    const dispatch = useAppDispatch();
    const { account } = useWeb3ReactCore();

    const userInfoContract = useUserInfoContract();

    return async () => {
        if (!userInfoContract || !account) return;

        dispatch(updateStatus(UserStatusEnums.LOADING));

        const address = await userInfoContract.proxies(account);

        // console.log(address);

        if (address && !isInvalidAddress(address)) {
            dispatch(updateAddress(address));
            dispatch(updateStatus(UserStatusEnums.SUCCESS));
        } else {
            dispatch(updateStatus(UserStatusEnums.CREATE));
        }
    }
}