
import { useMemo } from 'react'


import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { WalletConnect } from '@web3-react/walletconnect'
import { CoinbaseWallet } from '@web3-react/coinbase-wallet'

import CoinbaseIcon from '../assets/coinbase.svg';

export const SupportedChainId = {
    MAINNET: 1,
    ROPSTEN: 3,
    RINKEBY: 4,
    GOERLI: 5,
    KOVAN: 42,
    BINANCE: 56,
}

export const WalletKey = {
    INJECTED: 'INJECTED',
    WALLET_CONNECT: 'WALLET_CONNECT',
    COINBASE_WALLET: 'COINBASE_WALLET',
    COINBASE_LINK: 'COINBASE_LINK',
}

const INFURA_KEY = process.env.REACT_APP_INFURA_KEY

const INFURA_NETWORK_URLS = {
    [SupportedChainId.MAINNET]: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
    [SupportedChainId.RINKEBY]: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
    [SupportedChainId.ROPSTEN]: `https://ropsten.infura.io/v3/${INFURA_KEY}`,
    [SupportedChainId.GOERLI]: `https://goerli.infura.io/v3/${INFURA_KEY}`,
    [SupportedChainId.KOVAN]: `https://kovan.infura.io/v3/${INFURA_KEY}`,
    // [SupportedChainId.BINANCE]: `https://bsc-dataseed1.ninicoin.io`,
}

export const BACKFILLABLE_WALLETS = [WalletKey.INJECTED, WalletKey.COINBASE_WALLET, WalletKey.WALLET_CONNECT]
export const SELECTABLE_WALLETS = [...BACKFILLABLE_WALLETS]

function onError(error) {
    console.debug(`web3-react error: ${error}`)
}

export function getWalletForConnector(connector) {
    switch (connector) {
        case injected:
            return WalletKey.INJECTED
        case coinbaseWallet:
            return WalletKey.COINBASE_WALLET
        case walletConnect:
            return WalletKey.WALLET_CONNECT
        default:
            throw Error('unsupported connector')
    }
}

export function getConnectorForWallet(wallet) {
    switch (wallet) {
        case WalletKey.INJECTED:
            return injected
        case WalletKey.COINBASE_WALLET:
            return coinbaseWallet
        case WalletKey.WALLET_CONNECT:
            return walletConnect
    }
}

export function getHooksForWallet(wallet) {
    switch (wallet) {
        case WalletKey.INJECTED:
            return injectedHooks
        case WalletKey.COINBASE_WALLET:
            return coinbaseWalletHooks
        case WalletKey.WALLET_CONNECT:
            return walletConnectHooks
    }
}

export const [injected, injectedHooks] = initializeConnector((actions) => new MetaMask({ actions, onError }))

export const [walletConnect, walletConnectHooks] = initializeConnector(
    (actions) =>
        new WalletConnect({
            actions,
            options: {
                rpc: INFURA_NETWORK_URLS,
                qrcode: true,
            },
            onError,
        })
)

export const [coinbaseWallet, coinbaseWalletHooks] = initializeConnector(
    (actions) =>
        new CoinbaseWallet({
            actions,
            options: {
                url: INFURA_NETWORK_URLS[SupportedChainId.MAINNET],
                appName: 'app',
                appLogoUrl: CoinbaseIcon,
            },
            onError,
        })
)

function getConnectorListItemForWallet(wallet) {
    return {
        connector: getConnectorForWallet(wallet),
        hooks: getHooksForWallet(wallet),
    }
}

export function useConnectors(selectedWallet) {
    return useMemo(() => {
        const connectors = []
        if (selectedWallet) {
            connectors.push(getConnectorListItemForWallet(selectedWallet))
        }
        connectors.push(
            ...SELECTABLE_WALLETS.filter((wallet) => wallet !== selectedWallet).map(getConnectorListItemForWallet)
        )

        const web3ReactConnectors = connectors.map(({ connector, hooks }) => [
            connector,
            hooks,
        ])
        return web3ReactConnectors
    }, [selectedWallet])
}