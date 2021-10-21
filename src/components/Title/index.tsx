import React, { isValidElement } from 'react';
import styled from 'styled-components';

import Nav from '../Nav';
import Wallet from '../Wallet';
import Lang from '../Lang';

import { Flex, Grid, Font } from '../../styled';
import { AAVE_SVG } from '../../utils/images';


export const TitleWrapper = styled.div`
.logo {
    width: 30px;
    margin-right: 10px;
}
`;

export const TitleTopWrapper = styled.div`
padding: 25px 0;
border-bottom: 1px solid var(--theme);
`

const Title = ({ action }: { action?: string | React.ReactNode }) => {
    return <TitleWrapper>
        <TitleTopWrapper>
            <Flex justifyContent="space-between" alignItems="center">
                <Flex alignItems="center">
                    <img className="logo" src={AAVE_SVG} alt="" />
                    <Font color="#fff" fontSize="28px" fontWeight="700">Aave</Font>
                </Flex>

                {action ? isValidElement(action) ? action : <Font>{action}</Font> : null}
            </Flex>
        </TitleTopWrapper>
        <Nav />
    </TitleWrapper>
}

const TitleAction = () => {
    return <Grid template="auto auto" columGap="10px">
        <Wallet />
        <Lang />
    </Grid>
}


export default Title;
export {
    TitleAction
}