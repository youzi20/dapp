import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Trans } from '@lingui/macro';


import Message, { MessageType } from '../Message';

import useWallet, { SupportedWallet, SUPPORTED_WALLETS, useWeb3ReactCore } from '../../hooks/wallet';
import usePopover from '../../hooks/popover';

import { WalletStatusEnums, useState as useWalletState } from '../../state/wallet';


import { Grid, Flex, Font, Image, Container, WrappeContainer, OptionWrapper, OptionItemWrapper } from '../../styled';
import { getAccountSecrecy, numberToFixed } from '../../utils';


const WalletButton = styled.div`
display: flex;
align-items: center;
justify-content: center;
height: 38px;
border-radius: 3px;
background: var(--wallet-button);
cursor: pointer;
`;

const WalletButtonText = styled(Font)`
padding: 0 12px;
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

const WalletOptionItemWrapper = styled(OptionItemWrapper)`
display: grid;
grid-template-columns: repeat(2, max-content);
column-gap: 10px;
font-size: 14px;
color: #fff;
padding: 10px;
`;

const WalletInfo: React.FC<{ handleOpen: (e: any) => void }> = ({ handleOpen }) => {
    const { account } = useWeb3ReactCore();
    const { wallet, network, balances } = useWalletState();

    // console.log(balances);

    return <Grid column={2} columnGap="8px">

        <Flex flexDirection="column" alignItems="flex-end">
            <WalletAddress>
                <Font size="14px" fontColor="#939DA7">{getAccountSecrecy(account ?? "")}</Font>
            </WalletAddress>

            <Flex justifyContent="flex-end" alignItems="center">
                {network ? <WalletNetwork>
                    <Font size="12px">{network}</Font>
                </WalletNetwork> : ""}

                {balances ?
                    <WalletAccount>
                        <Font size="12px" fontColor="#939DA7">{numberToFixed(balances) + " ETH"}</Font>
                    </WalletAccount> : ""}
            </Flex>
        </Flex>

        {wallet ? <WalletButton onClick={handleOpen} style={{ padding: "0 7px" }}>
            <Image src={SUPPORTED_WALLETS[wallet].iconURL} width={24} />
        </WalletButton> : ""}
    </Grid>
}

const Wallet = () => {
    const [options] = useState<SupportedWallet[]>(['METAMASK', 'FORTMATIC', 'WALLETCONNECT', 'COINBASE', 'PORTIS']);

    const tryActivation = useWallet();
    const { setAnchorEl, Popover } = usePopover();
    const { status, wallet } = useWalletState();

    return <>
        {status === WalletStatusEnums.OFFLINE &&
            <WalletButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <WalletButtonText size="14px">
                    <Trans>连接您的钱包</Trans>
                </WalletButtonText>
            </WalletButton>}

        {status === WalletStatusEnums.LOADING &&
            <WalletButton>
                <WalletButtonText size="14px">
                    <Trans>正在连接...</Trans>
                </WalletButtonText>
            </WalletButton>}

        {status === WalletStatusEnums.SUCEESS &&
            <WalletInfo {...{ handleOpen(e) { setAnchorEl(e.currentTarget) } }} />}

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
            <OptionWrapper>
                {options.map(item => {
                    const option = SUPPORTED_WALLETS[item];

                    return <WalletOptionItemWrapper
                        key={item}
                        className={item === wallet ? "active" : ""}
                        onClick={() => {
                            setAnchorEl(null);
                            tryActivation(option.connector, item);
                        }}
                    >
                        <Image src={option.iconURL} width={20} />
                        {option.name}
                    </WalletOptionItemWrapper>
                })}
            </OptionWrapper>
        </Popover>
    </>
}

const WalletBoxList = styled(Flex)`
flex-wrap: wrap;
justify-content: space-between;
align-items: center;
`;

const WalletBoxItem = styled(Grid)`
justify-items: center;
align-content: center;
width: 180px;
height: 100px;
background: var(--wallet-box);
border-radius: 3px;
transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
cursor: pointer;

&:hover {
    background: var(--wallet-box-hover);
}

@media screen and (max-width: 768px) {
    width: 48%;
    height: 90px;
    margin: 5px 0;
}
`;

export const WalletBox = () => {
    const [options] = useState<SupportedWallet[]>(['METAMASK', 'FORTMATIC', 'WALLETCONNECT', 'COINBASE', 'PORTIS']);
    const tryActivation = useWallet();

    return <Container>
        <WrappeContainer>
            <Font size="20px" style={{ marginBottom: 10 }}><Trans>Connect wallet</Trans></Font>
            <Font size="14px" fontColor="#939DA7" style={{ marginBottom: 28 }}><Trans>Manage your positions using advanced actions.</Trans></Font>
            <WalletBoxList>
                {options.map(item => {
                    const option = SUPPORTED_WALLETS[item];

                    return <WalletBoxItem
                        rowGap="8px"
                        key={item}
                        onClick={() => {
                            tryActivation(option.connector, item);
                        }}
                    >
                        <Image src={option.iconURL} width={30} />
                        {option.name}
                    </WalletBoxItem>
                })}
            </WalletBoxList>
        </WrappeContainer>
    </Container>
}

export const WalletManager = () => {
    const { account, active } = useWeb3ReactCore();
    const { status, error } = useWalletState();

    const [message, setMessage] = useState<string | React.ReactNode>("");
    const [severity, setSeverity] = useState<MessageType | null>(null);
    const [open, setOpen] = useState(false);

    const showMessage = (severity: MessageType, message: string | React.ReactNode) => {
        setOpen(true);
        setSeverity(severity);
        setMessage(message);
    }

    useEffect(() => {
        if (status && active && account) {
            showMessage("success", <Font size="16px" lineHeight="24px" align="center" ><Trans>MetaMask 账户已连接</Trans> <br /> {account}</Font>);
        }
    }, [status, active, account]);

    useEffect(() => {
        if (!status && error) {
            showMessage("error", <Font size="16px" lineHeight="24px" align="center" >{error}</Font>);
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


export default Wallet;