import { useState, useEffect } from 'react';

import { UserStatusEnums, useState as useUserState } from '../../state/user';
import { SaverStatusEnums, useState as useSaverState } from '../../state/saver';

import Loading from '../Loading';
import AaveInit from '../AaveInit';
import SaverInit from '../SaverInit';

import Setting from './Setting';
import Info from './Info';

const Core = () => {
    const [show, setShow] = useState(false);
    const { status: userStatus } = useUserState();
    const { status: saverStatus } = useSaverState();

    return <>
        {UserStatusEnums.LOADING === userStatus || SaverStatusEnums.LOADING === saverStatus ? <Loading /> : null}

        {UserStatusEnums.CREATE === userStatus ? <AaveInit /> : null}

        {UserStatusEnums.SUCCESS === userStatus && SaverStatusEnums.CLOSE === saverStatus && !show ?
            <SaverInit onClick={() => setShow(true)} /> : null}

        {SaverStatusEnums.OPEN == saverStatus && !show ? <Info onUpdate={() => setShow(true)} /> : null}

        {show ? <Setting onCancel={() => setShow(false)} /> : null}
    </>
}

export default Core;