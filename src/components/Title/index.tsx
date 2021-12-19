import styled from 'styled-components';

import Nav from '../Nav';
import Wallet from '../Wallet';
import Lang from '../Lang';

import { Container, Image, Font, Flex, Grid, } from '../../styled';
import { AAVE_SVG } from '../../utils/images';


export const TitleWrapper = styled.div`
.logo {
    width: 30px;
}
`;

export const TitleTopWrapper = styled.div`
padding: 25px 0;
border-bottom: 1px solid var(--theme);

@media screen and (max-width: 768px) {
    padding: 15px;
}
`;

const Title = () => {
    return <TitleWrapper>
        <Container>
            <TitleTopWrapper>
                <Flex alignItems="center" justifyContent="space-between">
                    <Grid column={2} alignItems="center" columnGap="10px">
                        <Image src={AAVE_SVG} width={"30px"} />
                        <Font size="28px" weight="700">Aave</Font>
                    </Grid>

                    <Grid column={2} columnGap="10px">
                        <Wallet />
                        <Lang />
                    </Grid>
                </Flex>
            </TitleTopWrapper>
            <Nav />
        </Container>
    </TitleWrapper>
}

export default Title;