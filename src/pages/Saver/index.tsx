import { useState } from 'react';

import { UserStatusEnums, useState as useUserState } from '../../state/user';
import { SaverStatusEnums, useState as useSaverState } from '../../state/saver';

import { Container } from '../../styled';

import Loading from '../Loading';
import CreateWallet from '../CreateWallet';
import CreateSaver from '../CreateSaver';
import WalletConnect from '../WalletConnect';

import Setting from './Setting';
import Info from './Info';

const Saver = () => {
    const [show, setShow] = useState(false);
    const { status: userStatus } = useUserState();
    const { status: saverStatus } = useSaverState();

    return <div>
        <WalletConnect>
            <Container>
                {userStatus === UserStatusEnums.CREATE && <CreateWallet />}

                {userStatus === UserStatusEnums.SUCCESS && saverStatus === SaverStatusEnums.LOADING && <Loading />}

                {saverStatus === SaverStatusEnums.CLOSE && !show && <CreateSaver onClick={() => setShow(true)} />}

                {saverStatus === SaverStatusEnums.OPEN && !show && <Info onUpdate={() => setShow(true)} />}

                {show ? <Setting onCancel={() => setShow(false)} /> : null}
            </Container>
        </WalletConnect>
    </div>
}

export default Saver;