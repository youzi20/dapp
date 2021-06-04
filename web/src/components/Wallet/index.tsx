import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import SUPPORTED_WALLETS from './options';

import { Font } from '../../styled'

import usePopover from '../../hooks/usePopover';
import useWallet, { useWalletStatus, useWalletListener, WalletStatus } from '../../hooks/wallet';

import { accountSplit } from '../../utils';


const WalletIconStyle = styled.div`
display: flex;
align-items: center;
justify-content: center;
width: 38px;
height: 38px;
background: linear-gradient(180deg, #2B3943 0%, rgba(43,57,67,0.46) 92.86%);
cursor: pointer;

img {
    width: 24px;
}
`;

const WalletButtonStyle = styled.div`
display: flex;
align-items: center;
justify-content: center;
font-size: 14px;
color: #fff;
width: 108px;
height: 38px;
background: linear-gradient(180deg, #2B3943 0%, rgba(43,57,67,0.46) 92.86%);
cursor: pointer;
`;

const WalletWrapperStyle = styled.div`
display: flex;
align-items: center;
`;


const WalletInfoStyle = styled.div`
display: flex;
flex-direction: column;
align-items: flex-end;
margin-right: 8px;
`;

const NetworkStyle = styled.span`
color: #fff;
padding: 0 4px;
margin-right: 4px;
border-radius: 2px;
background: #37B06F;
`;

const WalletMenuStyle = styled.div`
background-color: #20292F;
`;

const WalletOptionsStyle = styled.div`
display: flex;
align-items: center;
width: 160px;
font-size: 14px;
color: #fff;
padding: 10px;
cursor: pointer;

&:not(.active):hover {
    background: #2A3339;
}

&.active {
    background: #191F25;
}

img {
    width: 20px;
    margin-right: 10px;
}
`;


interface WalletInfoInterface {
    account?: string | null
    balance?: string | null
    network?: string | null
}

const WalletInfo: React.FC<WalletInfoInterface> = ({ account, balance, network }) => {

    return <WalletInfoStyle>
        <Font color="#939DA7" fontSize="14px">{accountSplit(account ?? "")}</Font>
        <Font color="#939DA7" fontSize="12px">
            {network && <NetworkStyle>{network}</NetworkStyle>}
            <span>{balance ?? 0} ETH</span>
        </Font>
    </WalletInfoStyle>
}

const defaultOptions = ['METAMASK', 'FORTMATIC', 'WALLETCONNECT', 'COINBASE', 'PORTIS'];

export default function Wallet({ options = defaultOptions }: { options?: string[] }) {
    const [setAnchorEl, Popover] = usePopover();
    const { status, account, balance, network, tryActivation } = useWallet();
    const [active, setActive] = useState<string | null>(null);


    console.log("Wallet: " + status);

    useEffect(() => {
        if (status === WalletStatus.SUCEESS && !active) setActive("METAMASK");
        if (status === WalletStatus.OFFINE && active) setActive(null);
    }, [status])

    return <div>
        <WalletWrapperStyle>
            {status === WalletStatus.OFFINE &&
                <WalletButtonStyle onClick={(e) => setAnchorEl(e.currentTarget)}>连接您的钱包</WalletButtonStyle>}

            {status === WalletStatus.LOADING &&
                <WalletButtonStyle>正在连接...</WalletButtonStyle>}

            {status === WalletStatus.SUCEESS &&
                <>
                    <WalletInfo {...{ account, balance, network }} />

                    <WalletIconStyle onClick={(e) => setAnchorEl(e.currentTarget)}>
                        {active && <img src={SUPPORTED_WALLETS[active].iconURL} />}
                    </WalletIconStyle>
                </>}
        </WalletWrapperStyle>

        <Popover
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
        >
            <WalletMenuStyle>
                {options.map(item => {
                    const option = SUPPORTED_WALLETS[item];

                    return <WalletOptionsStyle
                        key={item}
                        className={item === active ? "active" : ""}
                        onClick={() => {
                            setActive(item);
                            setAnchorEl(null);
                            tryActivation(option.connector);
                        }}
                    >
                        <img src={option.iconURL} alt="" />
                        {option.name}
                    </WalletOptionsStyle>
                })}

            </WalletMenuStyle>
        </Popover>
    </div>
}

export function WalletManager() {
    const status = useWalletStatus();

    useWalletListener(status);

    return <div></div>
}