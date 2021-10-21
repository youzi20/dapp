import { Trans } from '@lingui/macro';

import { useState as useUserState } from '../state/user';

import { Font, WrapperHeader } from '../styled';


const SmartAddress = () => {
    const { address } = useUserState();

    return <WrapperHeader>
        <Font fontSize="14px" fontWeight="700"><Trans>智能钱包</Trans></Font><Font fontSize="13px">: {address ?? ""}</Font>
    </WrapperHeader>
}

export default SmartAddress;