import { useEffect } from 'react';

import Title, { TitleAction } from '../../components/Title';

import { useUserInfo } from '../../hooks/contract/useUserInfo';
import { useMarketInit } from '../../hooks/contract/useMarketInfo';
import { useSaverInfo } from '../../hooks/contract/useSaverInfo';
import { useReset } from '../../hooks/contract/reload';

import { UserStatusEnums, useState as useUserState } from '../../state/user';
import { WalletStatusEnums, useState as useWalletState } from '../../state/wallet';

import { Content } from '../../styled';

import Core from './Core';

const Saver = () => {
    const reset = useReset();
    const { status: walletStatus } = useWalletState();
    const { status: userStatus } = useUserState();

    useUserInfo(WalletStatusEnums.SUCEESS === walletStatus);
    useMarketInit(WalletStatusEnums.SUCEESS === walletStatus);
    useSaverInfo(WalletStatusEnums.SUCEESS === walletStatus && UserStatusEnums.SUCCESS === userStatus);

    useEffect(() => {
        if (!walletStatus) {
            reset();
        }
    }, [walletStatus]);

    return <div>
        <Content>
            <Title action={<TitleAction />} />

            <Core />
        </Content>
    </div>
}

export default Saver;