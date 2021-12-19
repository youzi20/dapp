import React from 'react';

import { WalletBox } from '../components/Wallet';



import { WalletStatusEnums, useState as useWalletState } from '../state/wallet';
import { UserStatusEnums, useState as useUserState } from '../state/user';

import Connecting from './Connecting';

const WalletConnect = ({ children }: { children: React.ReactNode }) => {
    const { status: walletStatus } = useWalletState();
    const { status: userStatus } = useUserState();

    return <>
        {walletStatus === WalletStatusEnums.OFFLINE && <WalletBox />}

        {walletStatus === WalletStatusEnums.LOADING && userStatus === UserStatusEnums.LOADING && <Connecting />}

        {walletStatus === WalletStatusEnums.SUCEESS && userStatus !== UserStatusEnums.LOADING && children}
    </>
}

export default WalletConnect;