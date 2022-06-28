import { coinbaseWallet, injected, WalletKey, walletConnect } from './connectors';

import MetaMaskIcon from '../assets/metamask.svg';
import WalletConnectIcon from '../assets/walletconnect.svg';
import CoinbaseIcon from '../assets/coinbase.svg';

export const SUPPORTED_WALLETS = {
    METAMASK: {
        connector: injected,
        wallet: WalletKey.INJECTED,
        name: 'MetaMask',
        iconURL: MetaMaskIcon
    },
    WALLET_CONNECT: {
        connector: walletConnect,
        wallet: WalletKey.WALLET_CONNECT,
        name: 'WalletConnect',
        iconURL: WalletConnectIcon,
        mobile: true
    },
    COINBASE: {
        connector: coinbaseWallet,
        wallet: WalletKey.COINBASE_WALLET,
        name: 'Coinbase',
        iconURL: CoinbaseIcon,
        mobile: true
    }
}

export default SUPPORTED_WALLETS;