import { useState } from 'react';
import { t, Trans } from '@lingui/macro';
import styled from 'styled-components';

import Checkbox from '../../components/Checkbox';
import Button from '../../components/Button';
import { message } from '../../components/Message';

import { useSubscribe } from '../../hooks/contract/saver';

import { useAppDispatch } from '../../state/hooks';
import { useState as useUserState } from '../../state/user';
import { useState as useSaverState, updateEnabled, updateHighRatio, updateOtherRatio } from '../../state/saver';

import { Flex, Font, Grid, Content, Wrapper } from '../../styled';
import { getRatio } from '../../utils';
import { ERROR_WARNING_SVG } from '../../utils/images';

import SmartAddress from '../SmartAddress';

import Input, { InputColumn } from './Input';
import Bar from './Bar';


const HighInputColumn = styled(InputColumn)`
padding-bottom: 30px;
border-bottom: 1px solid var(--theme);
`;

const HighCheckbox = styled(Checkbox)`
height: 100%;
`;

const ErrorWarning = styled.div`
display: flex;
align-items: center;
text-align: left;
padding: 12px;
border-radius: 3px;
background-color: var(--handle-error-bg);

img {
    margin-right: 10px;
}
`;

const ButtonGroupGrid = styled(Grid)`
justify-content: end;
`;

const Setting = ({ onCancel }: { onCancel: () => void }) => {
    const dispatch = useAppDispatch();

    // const [show, setShow] = useState<boolean>(false);
    const [boostDisabled, setBoostDisabled] = useState<boolean>(true);
    const { dataInfo } = useUserState();
    const { highRatio, minRatio, maxRatio, optimalBoost, optimalRepay } = useSaverState();

    const { ratio } = dataInfo ?? {};

    const subscribe = useSubscribe();

    const handleBoostCheckbox = (value: boolean) => {
        setBoostDisabled(value);
        dispatch(updateEnabled(value));
    }

    const handleHighRatio = (value: string) => {
        dispatch(updateHighRatio(Number(value)));
    }

    const handleOtherRatio = (key: "minRatio" | "maxRatio" | "optimalBoost" | "optimalRepay", value: string) => {
        dispatch(updateOtherRatio([key, value]));
    }

    const handleSubmit = () => {
        subscribe().then((res: any) => {
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

    return <Wrapper>
        <SmartAddress />

        <Content width="704px" style={{ padding: "50px 0" }}>
            <h2 style={{ marginBottom: 22 }}><Font fontSize="20px"><Trans>Aave Automation Setup</Trans></Font></h2>
            <p style={{ marginBottom: 30 }}>
                <Font fontSize="13px" color="#939DA7" lineHeight="18px">
                    <Trans>
                        Once Enabled, DeFi Saver will monitor your Aave ratio and automatically activate Repay if your Aave reaches the lower configured limit, or Boost if it reaches the upper one. Simply enter your target ratio, or configure manually below.
                    </Trans>
                </Font>
            </p>

            <Flex alignItems="center">
                <Font color="#fff"><Trans>当前比例：</Trans></Font>
                <Font fontWeight="700" fontSize="20px" color="#37B06F">{getRatio(ratio * 100)}</Font>
            </Flex>

            {/* <HighInputColumn
                title={<Flex alignItems="center">
                    <Trans>当前比例：</Trans>
                    <Font fontWeight="700" fontSize="20px" color="#37B06F">{getRatio(ratio * 100)}</Font>
                </Flex>}
            >
                <Input
                    label={t`保持比率在：`}
                    disabled={show}
                    value={highRatio}
                    error={(() => {
                        let isError = false, message = "";

                        if (Number(highRatio) < 120) {
                            isError = true;
                            message = t`必须超过 ${120}`;
                        }

                        return { isError, message }
                    })()}
                    onChange={handleHighRatio}
                />
                <HighCheckbox id="high-checkbox" label={t`高级`} onChange={(value: boolean) => setShow(value)} />
            </HighInputColumn> */}


            <InputColumn
                title={t`价格下跌时进行偿还`}
                error={Number(minRatio) - ratio * 100 >= 0 && <ErrorWarning>
                    <img src={ERROR_WARNING_SVG} alt="" />
                    <Font fontSize="14px"><Trans>自动减杠杆将在启用当前参数时被触发</Trans></Font>
                </ErrorWarning>}
            >
                <Input
                    label={t`如果比率低于：`}
                    value={minRatio}
                    error={(() => {
                        let isError = false, message = "";

                        if (Number(minRatio) < 115) {
                            isError = true;
                            message = t`必须超过 ${115}`;
                        } else if (boostDisabled && Number(optimalBoost) - Number(minRatio) <= 0) {
                            isError = true;
                            message = t`值值必须小于 "加杠杆至"`;
                        } else if (Number(optimalRepay) - Number(minRatio) <= 0) {
                            isError = true;
                            message = t`值必须小于 "减杠杆至"`;
                        }

                        return { isError, message }
                    })()}
                    onChange={(value: string) => handleOtherRatio("minRatio", value)}
                />
                <Input
                    label={t`减杠杆至：`}
                    value={optimalRepay}
                    error={(() => {
                        let isError = false, message = "";

                        console.log("optimalRepay", optimalRepay, minRatio, maxRatio);

                        if (Number(optimalRepay) - Number(minRatio) < 5 || (boostDisabled && Number(maxRatio) - Number(optimalRepay) < 5)) {
                            isError = true;
                            message = t`目标和限制比率之间的差值必须大于 5%`;
                        }

                        return { isError, message }
                    })()}

                    onChange={(value: string) => handleOtherRatio("optimalRepay", value)}
                />
            </InputColumn>

            <InputColumn
                title={<Checkbox
                    id="boost-checkbox"
                    label={t`价格上涨时加杠杆`}
                    checked={boostDisabled}
                    onChange={handleBoostCheckbox} />}
                error={Number(maxRatio) - ratio * 100 <= 0 && <ErrorWarning>
                    <img src={ERROR_WARNING_SVG} alt="" />
                    <Font fontSize="14px"><Trans>自动加杠杆将在启用当前参数时被触发</Trans></Font>
                </ErrorWarning>}
            >
                <Input
                    disabled={!boostDisabled}
                    label={t`如果比率超过：`}
                    value={maxRatio}
                    error={(() => {
                        let isError = false, message = "";

                        if (Number(maxRatio) < 115) {
                            isError = true;
                            message = t`必须超过 ${115}`;
                        }

                        return { isError, message }
                    })()}
                    onChange={(value: string) => handleOtherRatio("maxRatio", value)}
                />
                <Input
                    disabled={!boostDisabled}
                    label={t`加杠杆至：`}
                    value={optimalBoost}
                    error={(() => {
                        let isError = false, message = "";

                        console.log("optimalBoost", optimalBoost, minRatio, maxRatio);

                        if (boostDisabled && (Number(optimalBoost) - Number(minRatio) < 5 || Number(maxRatio) - Number(optimalBoost) < 5)) {
                            isError = true;
                            message = t`目标和限制比率之间的差值必须大于 5%`;
                        }

                        return { isError, message }
                    })()}

                    onChange={(value: string) => handleOtherRatio("optimalBoost", value)}
                />
            </InputColumn>

            <Bar ratio={Number(ratio) * 100} />

            <ButtonGroupGrid template="max-content max-content" columGap="20px">
                <Button theme="gray" onClick={onCancel}><Trans>取消</Trans></Button>
                <Button theme="primary" onClick={handleSubmit}><Trans>提交</Trans></Button>
            </ButtonGroupGrid>
        </Content>
    </Wrapper>
}

export default Setting;