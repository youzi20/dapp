import { useEffect, useState } from 'react';

import { injected } from '../../connectors';

import useWeb3ReactCore from './useWeb3ReactCore';

export function useWalletStatus() {
    const [status, setStatus] = useState(false);
    const { activate } = useWeb3ReactCore();

    useEffect(() => {
        injected.isAuthorized().then(isAuthorized => {
            console.log("isAuthorized: " + isAuthorized);

            if (isAuthorized) {
                activate(injected, undefined, true).then(() => {
                    setStatus(true);
                })
            }
        });
    }, []);

    console.log("status: " + status);


    return status;
}

export default useWalletStatus