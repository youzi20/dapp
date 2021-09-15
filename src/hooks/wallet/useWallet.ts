import { useEffect, useRef, useState } from 'react';
import { UnsupportedChainIdError } from '@web3-react/core';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { InjectedConnector } from '@web3-react/injected-connector'

import { message } from '../../components/Message';

import { injected } from '../../connectors';

import { useAppDispatch } from '../../state/hooks';
import { WalletStatusEnums, updateStatus, updateNetwork, updateError } from '../../state/wallet';

import useWeb3ReactCore from './useWeb3ReactCore';
import useEthBalances from './useEthBalances';

const NETWORK_LABELS: { [chainId: number]: string } = {
    [4]: 'Rinkeby',
    [3]: 'Ropsten',
    [5]: 'Görli',
    [42]: 'Kovan',
}

function useWallet(): (connector: AbstractConnector | undefined) => void {
    const dispatch = useAppDispatch();
    const { active, account, library, chainId, activate, deactivate } = useWeb3ReactCore();

    const [injectedStatus, setInjectedStatus] = useState(false);

    const balances = useEthBalances();

    const initRef = useRef(true);

    const tryActivation = (connector: AbstractConnector | undefined) => {

        if (connector instanceof InjectedConnector && injectedStatus && chainId !== 42) {
            message.error("请将 MetaMask 网络设置为 Kovan");
            return;
        }

        dispatch(updateStatus(WalletStatusEnums.LOADING));

        connector &&
            activate(connector, (error) => console.log(error), true).catch((error) => {
                if (error instanceof UnsupportedChainIdError) {
                    activate(connector) // a little janky...can't use setError because the connector isn't set
                } else {
                    message.error(error.message);
                    dispatch(updateStatus(WalletStatusEnums.OFFLINE));
                }
            });
    }

    useEffect(() => {
        if (!!account && !!library) {
            balances();
        }
    }, [account, library]);

    useEffect(() => {
        if (initRef.current) {
            initRef.current = false;
            return;
        }
        // console.log(active, chainId);

        if (!active) {
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

            setInjectedStatus(isAuthorized);

            if (isAuthorized) {
                tryActivation(injected);
            }
        });
    }, []);

    return tryActivation;
}



export default useWallet;