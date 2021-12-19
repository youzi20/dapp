import { StrictMode } from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import { Web3ReactProvider } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

// import { SupportedChainId } from '../connectors';

import Title from '../components/Title';
import { WalletManager } from '../components/Wallet';

import { Body } from '../styled';

import AppInit from './AppInit';
import Home from './Home';
import Saver from './Saver';

import './App.scss';


// const Web3ProviderNetwork = createWeb3ReactRoot("NETWORK");
// @ts-ignore
// if (!!window.ethereum) {
//   // @ts-ignore
//   window.ethereum.autoRefreshOnNetworkChange = false
// }

// const NETWORK_POLLING_INTERVALS: { [chainId: number]: number } = {
//   [SupportedChainId.ARBITRUM_ONE]: 1000,
//   [SupportedChainId.ARBITRUM_RINKEBY]: 1000,
//   [SupportedChainId.OPTIMISM]: 1000,
//   [SupportedChainId.OPTIMISTIC_KOVAN]: 1000,
// }

// function getLibrary(provider: any): Web3Provider {
//   const library = new Web3Provider(provider,
//     typeof provider.chainId === 'number' ?
//       provider.chainId :
//       typeof provider.chainId === 'string' ?
//         parseInt(provider.chainId) : 'any'
//   )

//   library.pollingInterval = 15000

//   library.detectNetwork().then((network) => {
//     const networkPollingInterval = NETWORK_POLLING_INTERVALS[network.chainId]
//     if (networkPollingInterval) {
//       console.debug('Setting polling interval', networkPollingInterval)
//       library.pollingInterval = networkPollingInterval
//     }
//   })

//   return library
// }

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider, 'any')
  library.pollingInterval = 15000
  return library
}

function App() {
  return (
    <StrictMode>
      <Web3ReactProvider getLibrary={getLibrary}>
        {/* <Web3ProviderNetwork getLibrary={getLibrary}> */}
        <WalletManager />
        <AppInit />
        <Body>
          <Title />
          <Switch>
              <Route exact path="/" component={Home} />
              <Route exact path="/saver" component={Saver} />
            </Switch>
        </Body>
        {/* </Web3ProviderNetwork> */}
      </Web3ReactProvider>
    </StrictMode>
  );
}


export default withRouter(App);