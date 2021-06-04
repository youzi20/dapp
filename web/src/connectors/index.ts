import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { PortisConnector } from '@web3-react/portis-connector'
import { FortmaticConnector } from '@web3-react/fortmatic-connector'

import LOGO_URL from '../assets/svg/logo.svg'

const SUPPORTED_CHAIN_IDS = [1, 4, 3, 42, 5];

const INFURA_KEY = process.env.REACT_APP_INFURA_KEY;
const PORTIS_DAPP_ID = process.env.REACT_APP_PORTIS_DAPP_ID as string;
const FORTMATIC_API_KEY = process.env.REACT_APP_FORTMATIC_API_KEY as string;
const WALLETCONNECT_BRIDGE_URL = process.env.REACT_APP_WALLETCONNECT_BRIDGE_URL as string;

const NETWORK_URLS: {
  [chainId: number]: string
} = {
  1: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
  4: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
  3: `https://ropsten.infura.io/v3/${INFURA_KEY}`,
  5: `https://goerli.infura.io/v3/${INFURA_KEY}`,
  42: `https://kovan.infura.io/v3/${INFURA_KEY}`,
}

export const injected = new InjectedConnector({
  supportedChainIds: SUPPORTED_CHAIN_IDS
});

export const walletconnect = new WalletConnectConnector({
  supportedChainIds: SUPPORTED_CHAIN_IDS,
  infuraId: INFURA_KEY, // obviously a hack
  bridge: WALLETCONNECT_BRIDGE_URL,
  qrcode: true,
  pollingInterval: 15000,
});

export const walletlink = new WalletLinkConnector({
  url: NETWORK_URLS[1],
  appName: 'DAISM',
  appLogoUrl: LOGO_URL,
});

export const portis = new PortisConnector({ dAppId: PORTIS_DAPP_ID, networks: [1, 100] })

export const fortmatic = new FortmaticConnector({ apiKey: FORTMATIC_API_KEY, chainId: 4 })
