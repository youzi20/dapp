import React, { useEffect, isValidElement } from 'react';
import styled from 'styled-components';


import Wallet from '../../components/Wallet';
import Lang from '../../components/Lang';

import { useUserInfo } from '../../hooks/contract/useUserInfo';
import { useMarketInit } from '../../hooks/contract/useMarketInfo';
import { useReset } from '../../hooks/contract/reload';

import { useState as useWalletState, WalletStatusEnums } from '../../state/wallet';

import { Flex, Grid, Font, Content } from '../../styled';

import { AAVE_SVG } from '../../utils/images';

import UserInfo from './UserInfo';
import Control from './Control';
import MarketInfo from './MarketInfo';


const HomeWrapper = styled.div`
padding-bottom: 25px;
`;

export const TitleWrapper = styled.div`
padding: 25px 0;
margin-bottom: 20px;
border-bottom: 1px solid var(--theme);

.logo {
    width: 30px;
    margin-right: 10px;
}
`;

const Title = ({ action }: { action?: string | React.ReactNode }) => {
    return <TitleWrapper>
        <Flex justifyContent="space-between" alignItems="center">
            <Flex alignItems="center">
                <img className="logo" src={AAVE_SVG} alt="" />
                <Font color="#fff" fontSize="28px" fontWeight="700">Aave</Font>
            </Flex>

            {action ? isValidElement(action) ? action : <Font>{action}</Font> : null}
        </Flex>
    </TitleWrapper>
}

const TitleAction = () => {
    return <Grid template="auto auto" columGap="10px">
        <Wallet />
        <Lang />
    </Grid>
}

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

    return <HomeWrapper>
        <Content>
            <Title action={<TitleAction />} />

            <UserInfo />
            <Control />
            <MarketInfo />
        </Content>
    </HomeWrapper>
}


export default Home;