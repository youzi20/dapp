import React, { StrictMode } from 'react';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

import { WalletManager } from '../components/Wallet'
import { BodyStyle, ContentStyle } from '../theme';

import Home from './Home';

import './App.scss';

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider, 'any')
  library.pollingInterval = 15000
  return library
}


function App() {
  return (
    <StrictMode>
      <Web3ReactProvider getLibrary={getLibrary}>
        <WalletManager />
        <BodyStyle>
          <Switch>
            {/* <Redirect from="/" to="/daos" /> */}
            <Route exact path="/" component={Home} />
          </Switch>
        </BodyStyle>
      </Web3ReactProvider>
    </StrictMode>
  );
}


export default withRouter(App);