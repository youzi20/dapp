
import { AbstractConnector } from '@web3-react/abstract-connector';
import { injected, portis, walletconnect, walletlink, fortmatic } from '../../connectors';

import MetaMaskIcon from '../../assets/wallet/metamask.svg';
import WalletConnectIcon from '../../assets/wallet/walletconnect.svg';
import CoinbaseIcon from '../../assets/wallet/coinbase.svg';
import FortmaticIcon from '../../assets/wallet/fortmatic.svg';
import PortisIcon from '../../assets/wallet/portis.png';


export interface WalletInfo {
    connector?: AbstractConnector
    name: string
    iconURL: string
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
    METAMASK: {
        connector: injected,
        name: 'MetaMask',
        iconURL: MetaMaskIcon,
    },
    FORTMATIC: {
        connector: fortmatic,
        name: 'Fortmatic',
        iconURL: FortmaticIcon,
    },
    WALLETCONNECT: {
        connector: walletconnect,
        name: 'WalletConnect',
        iconURL: WalletConnectIcon,
    },
    COINBASE: {
        connector: walletlink,
        name: 'Coinbase',
        iconURL: CoinbaseIcon,
    },
    PORTIS: {
        connector: portis,
        name: 'Portis',
        iconURL: PortisIcon,
    },
}

export default SUPPORTED_WALLETS;