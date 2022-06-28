

import { useCallback, useEffect, useState } from 'react';

import { useWeb3React } from '@web3-react/core'


import { getWalletForConnector, injected } from './connectors';
import SUPPORTED_WALLETS from './options';
import CHAIN_IDS from './chainId';
import { isMobile } from './userAgent';

const toHex = (num) => {
    const val = Number(num);
    return "0x" + val.toString(16);
};

const networkParams = {
    "0x63564c40": {
        chainId: "0x63564c40",
        rpcUrls: ["https://api.harmony.one"],
        chainName: "Harmony Mainnet",
        nativeCurrency: { name: "ONE", decimals: 18, symbol: "ONE" },
        blockExplorerUrls: ["https://explorer.harmony.one"],
        iconUrls: ["https://harmonynews.one/wp-content/uploads/2019/11/slfdjs.png"]
    },
    "0xa4ec": {
        chainId: "0xa4ec",
        rpcUrls: ["https://forno.celo.org"],
        chainName: "Celo Mainnet",
        nativeCurrency: { name: "CELO", decimals: 18, symbol: "CELO" },
        blockExplorerUrl: ["https://explorer.celo.org"],
        iconUrls: [
            "https://celo.org/images/marketplace-icons/icon-celo-CELO-color-f.svg"
        ]
    }
};


function handleClickExternalLink(event) {
    const { href } = event.currentTarget
    alert(href + encodeURIComponent(window.location.href))
    window.location.href = href + encodeURIComponent("https://nft.coinbase.com/@barmstrong?param1=hello&param2=world")
}

const Wallet = () => {
    const { connector, account, chainId, isActive, provider } = useWeb3React();
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);

    // console.log(connector, account, chainId, isActive, provider);

    const tryActivation = useCallback(
        async (connector) => {
            const wallet = getWalletForConnector(connector)

            setShow(false);
            setLoading(true);

            try {
                await connector.activate()

                setLoading(false);
                setSelectedWallet(wallet);
                localStorage.setItem("selectedWallet", wallet);
            } catch (error) {
                setLoading(false);
                setShow(true);
                console.debug(`web3-react connection error: ${error}`)
            }
        }, [])

    const disconnect = () => {
        setSelectedWallet(undefined);
        connector.deactivate ? connector.deactivate() : connector.resetState();
    }

    const switchNetwork = async () => {
        try {
            await provider.provider.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: toHex(1) }]
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await provider.provider.request({
                        method: "wallet_addEthereumChain",
                        params: [networkParams[toHex(1)]]
                    });
                } catch (error) {
                    console.log(error);
                }
            }
        }
    };

    useEffect(() => {
        if (selectedWallet !== null) {
            if (selectedWallet && isActive) {
                localStorage.setItem("selectedWallet", selectedWallet);
            } else {
                localStorage.removeItem("selectedWallet");
            }
        }
    }, [selectedWallet]);

    useEffect(() => {
        if (connector) {
            const wallet = getWalletForConnector(connector)

            if (selectedWallet !== wallet) setSelectedWallet(wallet);
        }
    }, [connector])

    return <div className='wallet'>
        {isActive && <div>
            {account}
            {chainId && <span className='wallet-network'>{CHAIN_IDS[chainId]}</span>}
        </div>}

        <div className='wallet-group'>
            {loading ?
                <div className='wallet-button'>Loading...</div> :
                !isActive ?
                    <div className='wallet-button' onClick={() => setShow(true)}>Connect Wallet</div> :
                    <>
                        <div className='wallet-button' onClick={disconnect}>Disconnect</div>
                        <div className='wallet-button' onClick={switchNetwork}>Switch Network</div>
                    </>
            }
        </div>

        <div className={"wallet-modal " + (show ? "show" : "")}>
            <div className='wallet-list'>
                <div className='wallet-close' onClick={() => setShow(false)}>×</div>
                {Object.values(SUPPORTED_WALLETS).map(item => {
                    let child = <div className='wallet-item'
                        onClick={() => {
                            if (!item.href && !!item.connector && (item.connector !== connector || !isActive)) {
                                tryActivation(item.connector)
                            }
                        }}
                        key={item.wallet}
                    >
                        <img src={item.iconURL} />
                    </div>;

                    if (isMobile) {
                        if (!item.mobile) child = null;
                    } else if (!(window.web3 || window.ethereum) && item.connector === injected && item.name === 'MetaMask') {
                        item.href = "https://metamask.io/";
                    }

                    return item.href ? <a href={item.href} key={item.wallet} onClick={handleClickExternalLink}>{child}</a> : child;
                })}
            </div>
        </div>

    </div>
}

export default Wallet;