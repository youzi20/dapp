import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { PortisConnector } from '@web3-react/portis-connector'
import { FortmaticConnector } from '@web3-react/fortmatic-connector'

import { AAVE_SVG } from '../utils/images';

const SUPPORTED_CHAIN_IDS = [1, 4, 3, 42, 5];

const INFURA_KEY = process.env.REACT_APP_INFURA_KEY;
const PORTIS_DAPP_ID = process.env.REACT_APP_PORTIS_DAPP_ID as string;
const FORTMATIC_API_KEY = process.env.REACT_APP_FORTMATIC_API_KEY as string;

const NETWORK_URLS: {
  [chainId: number]: string
} = {
  1: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
  4: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
  3: `https://ropsten.infura.io/v3/${INFURA_KEY}`,
  5: `https://goerli.infura.io/v3/${INFURA_KEY}`,
  42: `https://kovan.infura.io/v3/${INFURA_KEY}`,
}

export enum SupportedChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GOERLI = 5,
  KOVAN = 42,

  ARBITRUM_ONE = 42161,
  ARBITRUM_RINKEBY = 421611,
  OPTIMISM = 10,
  OPTIMISTIC_KOVAN = 69,
}

const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = [
  SupportedChainId.MAINNET,
  SupportedChainId.ROPSTEN,
  SupportedChainId.RINKEBY,
  SupportedChainId.GOERLI,
  SupportedChainId.KOVAN,

  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.ARBITRUM_RINKEBY,
  SupportedChainId.OPTIMISM,
  SupportedChainId.OPTIMISTIC_KOVAN,
]

export const injected = new InjectedConnector({
  supportedChainIds: SUPPORTED_CHAIN_IDS
});

export const walletconnect = new WalletConnectConnector({
  supportedChainIds: ALL_SUPPORTED_CHAIN_IDS,
  rpc: NETWORK_URLS,
  qrcode: true,
})

export const walletlink = new WalletLinkConnector({
  url: NETWORK_URLS[1],
  appName: 'AAVE',
  appLogoUrl: AAVE_SVG,
});

export const portis = new PortisConnector({ dAppId: PORTIS_DAPP_ID, networks: [1, 100] })

export const fortmatic = new FortmaticConnector({ apiKey: FORTMATIC_API_KEY, chainId: 4 })
