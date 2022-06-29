

import { useCallback, useEffect, useState } from 'react';
import { useWeb3React } from '@web3-react/core'


import { Stack, Select, MenuItem, TextField, Button } from "@mui/material"

import { getWalletForConnector, network, injected, walletConnect } from './connectors';
import SUPPORTED_WALLETS from './options';
import CHAIN_IDS from './chainId';
import { isMobile } from './userAgent';

import { useApprove } from './useApprove';
import { contractAddress, contractApprove } from './api';

function handleClickExternalLink(event) {
    const { href } = event.currentTarget
    window.open = href;
}

const Wallet = () => {
    const { connector, account, chainId, isActive, provider } = useWeb3React();
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);

    const [contractInfo, setContractInfo] = useState();
    const [amount, setAmount] = useState();
    const [error, setError] = useState(false);

    const approve = useApprove(contractInfo?.token);

    console.log(chainId);

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

    const getContactAddress = async () => {
        if (isActive && chainId) {
            const res = await contractAddress(chainId);

            if (res) {
                setContractInfo({ contract: res.contract, token: res.token });
            }
        }
    }

    const handleNetwordChange = async (event) => {
        const chainId = event.target.value;

        connector.activate(chainId)
    };

    const handleAmountChange = (event) => {
        const value = event.target.value;
        setAmount(value);
        setError(!value);
    }

    const handleDisconnect = () => {
        setSelectedWallet(undefined);
        connector.deactivate ? connector.deactivate() : connector.resetState();
    }

    const handleApprove = () => {
        if (!account) {
            setError(true);
            return;
        }

        approve(contractInfo.contract, amount)
            .then(() => {
                contractApprove(chainId, { address: account, amount, ...contractInfo })
            });
    }


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

    useEffect(() => {
        if (isActive) {
            if (![1, 56].includes(chainId)) {
                connector.activate(56)
            } else {
                getContactAddress();
            }
        }
    }, [chainId, isActive]);

    return <div className='wallet'>
        {isActive && <div className='wallet-address'>
            {account}
            {chainId && <span className='wallet-network'>{CHAIN_IDS[chainId]}</span>}
        </div>}

        <Stack direction="row" spacing={2}>
            {loading ?
                <Button variant="contained" >Loading...</Button> :
                !isActive ?
                    <Button variant="contained" onClick={() => setShow(true)}>Connect Wallet</Button> :
                    <>
                        <Button variant="contained" onClick={handleDisconnect}>Disconnect</Button>
                        <Select
                            variant="standard"
                            value={chainId}
                            onChange={handleNetwordChange}
                        >
                            <MenuItem value={56}>BSC</MenuItem>
                            <MenuItem value={1}>ETH</MenuItem>
                        </Select>
                    </>
            }
        </Stack>

        {contractInfo && <>
            <div className='wallet-address'>
                {contractInfo.token}
            </div>
            <Stack direction="row" spacing={2} alignItems="flex-end">
                <TextField
                    size="small"
                    label="amount"
                    type="number"
                    value={amount} error={error}
                    variant="standard"
                    onChange={handleAmountChange}
                />
                <Button
                    variant="contained"
                    onClick={handleApprove}
                >
                    Approve
                </Button>
            </Stack>
        </>}

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