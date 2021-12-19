import React from 'react';
import { t } from '@lingui/macro';
import styled from 'styled-components';


import { Font } from '../../styled';
import { TIPS_WARNING_SVG, ERROR_WARNING_SVG } from '../../utils/images';

const TipsBoxWrapper = styled.div<{ theme: string }>`
display: grid;
grid-template-columns: auto 1fr;
grid-column-gap: 10px;
align-items: center;
padding: 12px;
border-radius: 3px;
background-color: ${({ theme }) => theme};
`;

const TipsBox = ({ isShow, src, text, theme }: {
    isShow?: boolean
    src?: string
    text?: string | React.ReactNode
    theme?: string
}) => {
    if (!isShow) return <></>;

    return <TipsBoxWrapper theme={theme}>
        <img src={src} alt="" />
        <Font size="14px">{text}</Font>
    </TipsBoxWrapper>
}

export const TipsBoxWarning = ({ isShow, text }: {
    isShow?: boolean,
    text?: string | React.ReactNode
}) => {
    return <TipsBox isShow={isShow} theme="rgb(145 114 44)" src={TIPS_WARNING_SVG} text={text ?? t`This asset is unsupported for stable rate borrow`} />
}

export const TipsBoxError = ({ isShow, text }: {
    isShow?: boolean,
    text?: string | React.ReactNode
}) => {
    return <TipsBox isShow={isShow} theme="var(--handle-error-bg)" src={ERROR_WARNING_SVG} text={text ?? ""} />
}

export default TipsBox;


