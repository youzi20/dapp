import React from 'react';
import styled from 'styled-components';
import Tooltip from '@material-ui/core/Tooltip';

import { IconWrapper } from '../Icon';

import { Font, Flex, TextOverflowWrapper } from '../../styled';

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
    children: React.ReactElement<any, any>;
}> = ({ text, children }) => {

    return text ?
        <Tooltip title={<TipsWrapper><Font fontSize="14px" fontWeight="700">{text}</Font></TipsWrapper>} placement="top">
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

export const TipsPrice: React.FC<{
    price: (number | string | undefined)[]
}> = ({ price }) => {
    const [priceStr, priceTips, unit] = price;

    const Util = () => <span>{unit}</span>;
    const Text = () => <TextOverflowWrapper>{priceStr ?? ""}</TextOverflowWrapper>;

    return <Tips text={priceTips}>
        <Flex>
            {priceStr ?
                (unit === "ETH" ?
                    <>
                        <Text />
                        <Util />
                    </> :
                    <>
                        <Util />
                        <Text />
                    </>)
                : "-"}
        </Flex>
    </Tips>
}

export default Tips;

