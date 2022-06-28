
import { useEffect } from 'react';
import { Web3ReactProvider } from '@web3-react/core'


import Wallet from './wallet';

import { WalletKey, BACKFILLABLE_WALLETS, getConnectorForWallet, injected, useConnectors } from './wallet/connectors';
import { isMobile } from './wallet/userAgent';


import './App.css';

const connect = async (connector) => {
  try {
    if (connector.connectEagerly) {
      await connector.connectEagerly()
    } else {
      await connector.activate()
    }
  } catch (error) {
    console.debug(`web3-react eager connection error: ${error}`)
  }
}

function App() {
  const selectedWallet = localStorage.getItem("selectedWallet");

  const connectors = useConnectors(selectedWallet);

  const isMetaMask = !!window.ethereum?.isMetaMask

  useEffect(() => {
    if (selectedWallet) {
      if (WalletKey.INJECTED === selectedWallet) {
        if (isMetaMask) injected.activate()
      } else {
        connect(getConnectorForWallet(selectedWallet))
      }
    }

    if (isMobile && isMetaMask) {
      // injected.activate()
    } else if (selectedWallet) {
      // connect(getConnectorForWallet(selectedWallet))
    } else {
      // BACKFILLABLE_WALLETS.map(getConnectorForWallet).forEach(connect)
    }
  }, [])

  return (
    <Web3ReactProvider connectors={connectors}>
      <Wallet />
    </Web3ReactProvider>
  );
}

export default App;
