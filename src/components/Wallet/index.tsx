import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Trans } from '@lingui/macro';

import Message, { Color } from '../Message';

import usePopover from '../../hooks/popover';
import useWallet, { useWeb3ReactCore } from '../../hooks/wallet';

import { WalletStatusEnums, useState as useWalletState, useETHBalances } from '../../state/wallet';

import { Font, Flex, Grid, DropWrapper, DropOption } from '../../styled'

import { accountSplit, number2fixed } from '../../utils';

import SUPPORTED_WALLETS from './options';

const WalletButton = styled.div`
display: flex;
align-items: center;
justify-content: center;
padding: 0 12px;
height: 38px;
border-radius: 3px;
background: var(--wallet-button);
cursor: pointer;
`;

const WalletAddress = styled.div`
line-height: 18px;
margin-bottom: 2px;
`;

const WalletAccount = styled.div`
line-height: 15px;
margin-left: 4px;
`;

const WalletNetwork = styled.div`
line-height: 15px;
padding: 0 4px;
border-radius: 2px;
background: var(--wallet-network);
`;

const WalletIcon = styled.div`
display: flex;
align-items: center;
justify-content: center;
width: 38px;
height: 38px;
margin-left: 8px;
border-radius: 3px;
background: var(--wallet-button);
cursor: pointer;

img {
    width: 24px;
}
`;

type WalletOptions = 'METAMASK' | 'FORTMATIC' | 'WALLETCONNECT' | 'COINBASE' | 'PORTIS';

const defaultOptions = ['METAMASK', 'FORTMATIC', 'WALLETCONNECT', 'COINBASE', 'PORTIS'];

const WalletInfo: React.FC<{
    active?: WalletOptions | null
    handleOpen: (e: any) => void
}> = ({ active, handleOpen }) => {
    const { account } = useWeb3ReactCore();
    const { network } = useWalletState();

    const balances = useETHBalances();

    return <Flex>

        <Flex flexDirection="column" alignItems="flex-end">
            <WalletAddress>
                <Font fontSize="14px" color="#939DA7">{accountSplit(account ?? "")}</Font>
            </WalletAddress>

            <Flex justifyContent="flex-end" alignItems="center">
                {network ? <WalletNetwork>
                    <Font fontSize="12px">{network}</Font>
                </WalletNetwork> : ""}

                {balances ?
                    <WalletAccount>
                        <Font fontSize="12px" color="#939DA7">{number2fixed(balances) + " ETH"}</Font>
                    </WalletAccount> : ""}
            </Flex>
        </Flex>

        {active ? <WalletIcon onClick={handleOpen}>
            <img src={SUPPORTED_WALLETS[active].iconURL} />
        </WalletIcon> : ""}
    </Flex>
}

export default function Wallet({ options = defaultOptions }: { options?: any[] }) {
    const [active, setActive] = useState<WalletOptions | null>(null);
    const { setAnchorEl, Popover } = usePopover();
    const { status } = useWalletState();

    const tryActivation = useWallet();

    useEffect(() => {
        if (status === WalletStatusEnums.SUCEESS && !active) setActive("METAMASK");
        if (status === WalletStatusEnums.OFFLINE && active) setActive(null);
    }, [status]);

    return <>
        {status === WalletStatusEnums.OFFLINE &&
            <WalletButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <Font fontSize="14px">
                    <Trans>连接您的钱包</Trans>
                </Font>
            </WalletButton>}

        {status === WalletStatusEnums.LOADING &&
            <WalletButton>
                <Font fontSize="14px">
                    <Trans>正在连接...</Trans>
                </Font>
            </WalletButton>}

        {status === WalletStatusEnums.SUCEESS &&
            <WalletInfo
                {...{ active, handleOpen(e) { setAnchorEl(e.currentTarget) } }}
            />}

        <Popover
            style={{ marginTop: 5 }}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
        >
            <DropWrapper>
                {options.map(item => {
                    const option = SUPPORTED_WALLETS[item];

                    return <DropOption
                        key={item}
                        className={item === active ? "active" : ""}
                        onClick={() => {
                            setActive(item);
                            setAnchorEl(null);
                            tryActivation(option.connector);
                        }}
                    >
                        <Grid template="auto auto" columGap="10px">
                            <img src={option.iconURL} alt="" style={{ width: 20 }} />
                            {option.name}
                        </Grid>
                    </DropOption>
                })}
            </DropWrapper>
        </Popover>
    </>
}

export function WalletManager() {
    const { account, active } = useWeb3ReactCore();
    const { status, error } = useWalletState();

    const [message, setMessage] = useState<string | React.ReactNode>("");
    const [severity, setSeverity] = useState<Color | null>(null);
    const [open, setOpen] = useState(false);

    const showMessage = (severity: Color, message: string | React.ReactNode) => {
        setOpen(true);
        setSeverity(severity);
        setMessage(message);
    }

    useEffect(() => {
        if (status && active) {
            showMessage("success", <Font fontSize="16px" lineHeight="24px" align="center" ><Trans>MetaMask 账户已连接</Trans> <br /> {account}</Font>);
        }
    }, [active]);

    useEffect(() => {
        if (!status && error) {
            showMessage("error", <Font fontSize="16px" lineHeight="24px" align="center" >{error}</Font>);
        }
    }, [status, error]);

    return <div>
        <Message
            open={open}
            text={message}
            severity={severity ?? "success"}
            onClose={() => setOpen(false)}
        />
    </div>
}