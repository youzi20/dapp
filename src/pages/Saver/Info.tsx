import { t, Trans } from '@lingui/macro';
import styled from 'styled-components';

import Button from '../../components/Button';
import { message } from '../../components/Message';

import { useUnsubscribe } from '../../hooks/contract/saver';

import { useState as useUserState } from '../../state/user';
import { useState as useSaverState } from '../../state/saver';


import { Flex, Font, Grid, Content, Wrapper } from '../../styled';
import { getRatio } from '../../utils';

import SmartAddress from '../SmartAddress';

import Bar from './Bar';

const ButtonGroupGrid = styled(Grid)`
justify-content: end;
margin-top: 20px;
`;

const Info = ({ onUpdate }: { onUpdate: () => void }) => {
    const { dataInfo } = useUserState();
    const { optimalType, minRatio, maxRatio, optimalBoost, optimalRepay } = useSaverState();

    const { ratio } = dataInfo ?? {};

    const unsubscribe = useUnsubscribe();

    const handleDeactivate = () => {
        unsubscribe().then((res: any) => {
            console.log(res);
            res.wait().then((res: any) => {
                console.log(res);
                message.success(t`操作成功`);
            }).catch((error: any) => {
                message.error(error.message);
                console.error(error);
            });
        }).catch((error: any) => {
            message.error(error.message);
            console.error(error);
        });
    }

    // console.log(optimalType, minRatio, maxRatio, optimalBoost, optimalRepay);

    return <Wrapper>
        <SmartAddress />

        <Content width="704px" style={{ padding: "50px 0" }}>
            <h2 style={{ marginBottom: 22 }}><Font fontSize="20px"><Trans>Aave Automation Setup</Trans></Font></h2>

            <Grid rowGap="10px">
                <Flex alignItems="center">
                    <Font color="#fff"><Trans>当前比例：</Trans></Font>
                    <Font fontWeight="700" fontSize="20px" color="#37B06F">{getRatio(ratio * 100)}</Font>
                </Flex>

                <Flex>
                    <Font><Trans>自动化模式：</Trans>{optimalType === 1 ? <Trans>半自动化</Trans> : <Trans>全自动化</Trans>}</Font>
                </Flex>
            </Grid>

            {optimalType === 1 && <>
                <Bar ratio={Number(ratio) * 100} />

                <Font fontSize="14px" color="#939DA7" style={{ display: "flex", alignItems: "center" }}>
                    <Trans>
                        清算保护：如果低于
                        <Font color="#fff" style={{ margin: "0 3px" }}>{getRatio(Number(minRatio))}</Font>
                        减杠杆至
                        <Font color="#fff" style={{ margin: "0 3px" }}>{getRatio(Number(optimalRepay))}</Font>
                    </Trans>
                </Font>

                <Font fontSize="14px" color="#939DA7" style={{ display: "flex", alignItems: "center" }}>
                    <Trans>
                        杠杆增加：如果超过
                        <Font color="#fff" style={{ margin: "0 3px" }}>{getRatio(Number(maxRatio))}</Font>
                        加杠杆至
                        <Font color="#fff" style={{ margin: "0 3px" }}>{getRatio(Number(optimalBoost))}</Font>
                    </Trans>
                </Font>
            </>}

            <ButtonGroupGrid template="max-content max-content" columGap="20px">
                <Button theme="gray" onClick={handleDeactivate}><Trans>停用</Trans></Button>
                <Button theme="primary" onClick={onUpdate}><Trans>更新</Trans></Button>
            </ButtonGroupGrid>
        </Content>
    </Wrapper>
}

export default Info;