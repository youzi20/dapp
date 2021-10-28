import { useEffect } from 'react';

import Title, { TitleAction } from '../../components/Title';

import { useReset } from '../../hooks/contract/reload';

import { useState as useWalletState } from '../../state/wallet';

import { Content } from '../../styled';


import UserInfo from './UserInfo';
import Control from './Control';
import MarketInfo from './MarketInfo';

const Home = () => {
    const reset = useReset();

    const { status } = useWalletState();

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