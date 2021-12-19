import { useEffect, useState } from 'react';

import { useMobile } from '../../state/config';
import { UserStatusEnums, useState as useUserState } from '../../state/user';
import { MarketStatusEnums, useState as useMatketState, } from '../../state/market';

import { Container, Font } from '../../styled';


import Loading from '../Loading';
import CreateWallet from '../CreateWallet';
import Account from './Account';
import Market from './Market';
import Contorl from './Contorl';
import MobileContorl from './MobileContorl';

import WalletConnect from '../WalletConnect';

const Home = () => {
    const isMobile = useMobile();
    // const [data, setData] = useState();

    const { status } = useUserState()
    const { loanStatus } = useMatketState();

    // useEffect(() => {
    //     // @ts-ignore
    //     setData(navigator.userAgent);
    // }, []);

    return <div>
        <WalletConnect>
            <Container>
                {/* <Font>{data}</Font> */}

                {status === UserStatusEnums.CREATE && <CreateWallet />}

                {status === UserStatusEnums.SUCCESS && loanStatus === MarketStatusEnums.LOADING && <Loading />}

                {loanStatus === MarketStatusEnums.SUCCESS && <>
                    <Account />
                    {isMobile ? <MobileContorl /> : <Contorl />}
                </>}

                <Market />

            </Container>
        </WalletConnect>
    </div>
}

export default Home;