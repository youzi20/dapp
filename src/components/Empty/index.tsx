
import React from 'react';
import styled from 'styled-components';
import { Trans, t } from '@lingui/macro';

import Icon, { LoadingIcon } from '../Icon';

import { Font } from '../../styled';

const EmptyWrapper = styled.div`
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
padding: 50px 0 30px;
`;

const NoDataWrapper = styled.div`
font-size: 100px;
color: rgb(125 125 125 / 20%);
`

export const EmptyLoading = ({ text }: { text?: string | React.ReactNode }) => {
    return <EmptyWrapper>
        <div style={{ marginBottom: 10 }}><LoadingIcon /></div>
        {text ?? <Font color="#7d7d7d" fontSize="12px"><Trans>加载中~</Trans></Font>}
    </EmptyWrapper>
}

export const EmptyNoData = ({ text }: { text?: string | React.ReactNode }) => {
    return <EmptyWrapper>
        <NoDataWrapper><Icon name="dapp-no-data" /></NoDataWrapper>
        {text ?? <Font color="#7d7d7d" fontSize="12px"><Trans>暂无数据~</Trans></Font>}
    </EmptyWrapper>
}