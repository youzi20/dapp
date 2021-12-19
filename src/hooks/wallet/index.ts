import { useEffect, useRef } from 'react';

import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { InjectedConnector } from '@web3-react/injected-connector'

import { injected } from '../../connectors';

import { message } from '../../components/Message';

import { useAppDispatch } from '../../state/hooks';
import { WalletStatusEnums, WalletBalancesEnums, updateStatus, updateBalances, updateBalancesStatus, updateWallet, updateNetwork, updateError } from '../../state/wallet';

import { getFormatNumber } from '../../utils';

import { SupportedWallet } from './options';

export * from './options';

export { useWeb3React as useWeb3ReactCore };

const NETWORK_LABELS: { [chainId: number]: string } = {
    [4]: 'Rinkeby',
    [3]: 'Ropsten',
    [5]: 'Görli',
    [42]: 'Kovan',
}

// export const useWeb3ReactCore = () => {
//     const context = useWeb3React();
//     const contextNetwork = useWeb3React("NETWORK");
//     return context.active ? context : contextNetwork;
// }

const useWallet = (): (connector: AbstractConnector | undefined, wallet: SupportedWallet) => void => {
    const dispatch = useAppDispatch();

    const { active, account, library, chainId, activate, deactivate } = useWeb3React();

    // console.log("useWallet", active, chainId, account);

    const initRef = useRef(true);
    const injectedStatus = useRef(false);

    const tryActivation = (connector: AbstractConnector | undefined, wallet: SupportedWallet) => {

        if (connector instanceof InjectedConnector && !injectedStatus.current && !active) {
            dispatch(updateStatus(WalletStatusEnums.LOADING));

            injectedStatus.current = true;

            connector &&
                activate(connector, (error) => console.log(error), true)
                    .then(() => {
                        dispatch(updateWallet(wallet));
                    })
                    .catch((error) => {
                        if (error instanceof UnsupportedChainIdError) {
                            // activate(connector) // a little janky...can't use setError because the connector isn't set
                            dispatch(updateWallet(wallet));
                        } else {
                            injectedStatus.current = false;
                            message.error(error.message);
                            dispatch(updateStatus(WalletStatusEnums.OFFLINE));
                        }
                    });
        }
    }

    useEffect(() => {
        if (!!account && !!library) {
            dispatch(updateBalancesStatus(WalletBalancesEnums.LOADING));

            library
                .getBalance(account)
                .then((balance: any) => {
                    dispatch(updateBalances(getFormatNumber(balance)));
                    dispatch(updateBalancesStatus(WalletBalancesEnums.FINISH));
                })
                .catch((error: any) => {
                    dispatch(updateBalancesStatus(WalletBalancesEnums.ERROR));
                    console.error(error);
                });
        }
    }, [account, library]);

    useEffect(() => {
        if (initRef.current) {
            initRef.current = false;
            return;
        }

        // console.log(active, chainId);

        if (!active) {
            injectedStatus.current = false;
            dispatch(updateStatus(WalletStatusEnums.OFFLINE));
            dispatch(updateError("已断开连接"));
        } else if (chainId !== 42) {
            dispatch(updateStatus(WalletStatusEnums.OFFLINE));
            dispatch(updateError("请将 MetaMask 网络设置为 Kovan"));
        } else {
            chainId && dispatch(updateNetwork(NETWORK_LABELS[chainId]));
            dispatch(updateStatus(active ? WalletStatusEnums.SUCEESS : WalletStatusEnums.OFFLINE));
        }
    }, [active, chainId]);

    useEffect(() => {
        injected.isAuthorized().then(isAuthorized => {
            // console.log("isAuthorized: " + isAuthorized);

            if (isAuthorized) {
                tryActivation(injected, "METAMASK");
            }
        });
    }, []);

    return tryActivation;
}

export default useWallet;