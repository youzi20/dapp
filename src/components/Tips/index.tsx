import React from 'react';
import styled from 'styled-components';
import Tooltip from '@material-ui/core/Tooltip';

import { IconWrapper } from '../Icon';

import { Font } from '../../styled';

const TipsWrapper = styled.div`
min-height: 25px;
line-height: 24px;
text-align: center;
padding: 0 8px;
background-color: var(--tips);
border-bottom: 1px solid var(--theme);
`;

const TipsInfoWrapper = styled.div`
margin-right: 4px;
cursor: pointer;

img {
    display: block;
    width: 16px;
    opacity: .5;
}

&:hover img {
    opacity: .8;
}
`;

const Tips: React.FC<{
    text?: string | React.ReactNode
    placement?:
    | 'bottom-end'
    | 'bottom-start'
    | 'bottom'
    | 'left-end'
    | 'left-start'
    | 'left'
    | 'right-end'
    | 'right-start'
    | 'right'
    | 'top-end'
    | 'top-start'
    | 'top';
    children: React.ReactElement<any, any>;
}> = ({ text, placement = "top", children }) => {

    return text ?
        <Tooltip title={<TipsWrapper><Font size="14px" weight="700">{text}</Font></TipsWrapper>} placement={placement}>
            {children}
        </Tooltip> :
        <>{children}</>
}

export const TipsInfo: React.FC<{
    text?: string | React.ReactNode
}> = ({ text }) => {
    return <Tips text={text}>
        <TipsInfoWrapper>
            <IconWrapper name="dapp-info" />
        </TipsInfoWrapper>
    </Tips>
}

export default Tips;

