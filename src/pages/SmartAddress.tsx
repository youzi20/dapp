
import { Trans } from '@lingui/macro';
import styled from 'styled-components';

import { useState as useUserState } from '../state/user';
import { useMobile } from '../state/config';

import { Font } from '../styled';

const WrapperHeader = styled.div`
display: flex;
align-items: center;
height: 52px;
padding-left: 15px;
background: var(--user-info-header);
`;

const SmartAddress = () => {
    const isMobile = useMobile();
    const { address } = useUserState();

    return <WrapperHeader>
        <Font size={isMobile ? "12px" : "14px"} weight="700"><Trans>智能钱包</Trans></Font>
        <Font size={isMobile ? "10px" : "13px"}>: {address ?? ""}</Font>
    </WrapperHeader>
}

export default SmartAddress;