import { useCallback, useEffect, useMemo, useState } from 'react';

import { useWeb3ReactCore } from '../wallet';
import { useSmartWalletContract } from '../contract';

import { SmartWalletInterface } from './types';


export default function useSmartWallet(): SmartWalletInterface {
    const [status, setStatus] = useState(false);
    const [address, setAddress] = useState(null);
    const { account } = useWeb3ReactCore();
    const smart = useSmartWalletContract();


    const isRegister = async () => {
        if (!smart) return;
        const res = await smart.proxies(account);
        if (res && !res.match("0x0")) {
            setStatus(true);
            setAddress(res);
        }
    }

    const build = useCallback(async () => {
        if (!smart) return;

        const res = await smart["build(address)"](account);
        console.log(res);

        res.wait().then((res: any) => {
            console.log(res);
            isRegister();
        });
    }, [smart]);

    useEffect(() => {
        console.log("useSmartWallet:", smart)
        isRegister();
    }, [smart]);

    return {
        status,
        address,
        build() {
            build();
        },
    }
}