import { useEffect } from 'react';

import Title, { TitleAction } from '../../components/Title';

import { useUserInfo } from '../../hooks/contract/useUserInfo';
import { useMarketInit } from '../../hooks/contract/useMarketInfo';
import { useReset } from '../../hooks/contract/reload';

import { useState as useWalletState, WalletStatusEnums } from '../../state/wallet';

import { Content } from '../../styled';


import UserInfo from './UserInfo';
import Control from './Control';
import MarketInfo from './MarketInfo';

const Home = () => {
    const reset = useReset();
    const { status } = useWalletState();

    useUserInfo(status === WalletStatusEnums.SUCEESS);
    useMarketInit(status === WalletStatusEnums.SUCEESS);

    useEffect(() => {
        if (!status) {
            reset();
        }
    }, [status]);

    return <div>
        <Content>
            <Title action={<TitleAction />} />

            <UserInfo />
            <Control />
            <MarketInfo />
        </Content>
    </div>
}


export default Home;