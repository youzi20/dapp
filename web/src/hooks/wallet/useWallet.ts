import { useEffect, useState } from 'react';
import { UnsupportedChainIdError } from '@web3-react/core';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { formatEther } from '@ethersproject/units';

import useWeb3ReactCore from './useWeb3ReactCore';

import { useWalletInterface, WalletStatus } from './types';

const NETWORK_LABELS: { [chainId: number]: string } = {
    [4]: 'Rinkeby',
    [3]: 'Ropsten',
    [5]: 'Görli',
    [42]: 'Kovan',
}

function useWallet(): useWalletInterface {
    const { active, account, chainId, library, connector: web3connector, activate, error: web3error } = useWeb3ReactCore();

    const [status, setStatus] = useState<WalletStatus>(WalletStatus.OFFINE);
    const [balance, setBalance] = useState<string | null | undefined>();
    const [network, setNetwork] = useState<string | null | undefined>();
    // const [error, setError] = useState(null);


    const tryActivation = (connector: AbstractConnector | undefined) => {
        setStatus(WalletStatus.LOADING);

        connector &&
            activate(connector, undefined, true).catch((error) => {
                if (error instanceof UnsupportedChainIdError) {
                    activate(connector) // a little janky...can't use setError because the connector isn't set
                } else {
                    // setPendingError(true)
                }
            })
    }

    useEffect(() => {
        setStatus(active ? WalletStatus.SUCEESS : WalletStatus.OFFINE);
    }, [active]);

    useEffect(() => {
        if (!!account && !!library) {
            setNetwork(chainId ? NETWORK_LABELS[chainId] : null);

            let stale = false;

            library
                .getBalance(account)
                .then((balance: any) => {
                    if (!stale) {
                        setBalance(parseFloat(formatEther(balance)).toFixed(2));
                    }
                })
                .catch(() => {
                    if (!stale) {
                        setBalance(null);
                    }
                })

            return () => {
                stale = true
                setBalance(undefined);
            }
        }
    }, [account, library, chainId]);


    // useEffect(() => {
    //     // connector(WalletType.INJECTED);

    //     injected.isAuthorized().then(isAuthorized => {
    //         console.log(isAuthorized)
    //     });

    //     // console.log(context.active ? context : contextNetwork);
    // }, []);

    // useEffect(() => {
    //     if (active) {
    //         setStatus(WalletStatus.SUCEESS);
    //     }

    //     injected.isAuthorized().then(isAuthorized => {
    //         console.log(isAuthorized)

    //         if (isAuthorized) {
    //             activate(injected, undefined, true).catch(() => {

    //             })
    //         }
    //     });

    //     console.log(active);
    // }, [active])

    return {
        status,
        account,
        balance,
        network,
        tryActivation
    }
}

export default useWallet;