import { useState, useEffect, useMemo } from 'react';
import { t, Trans } from '@lingui/macro';
import styled from 'styled-components';

import Checkbox from '../../components/Checkbox';
import { SelectValueInterface, ThemeSelect } from '../../components/Select';
import Button from '../../components/Button';
import Table, { TableColumn } from '../../components/Table';
import {
    renderCoinInfo,
    renderPriceTips,
    renderAmountTips
} from '../../components/TableRender';
import { message } from '../../components/Message';
import { TipsBoxWarning, TipsBoxError } from '../../components/TipsBox';


import { useSubscribe } from '../../hooks/contract/saver';

import { useAppDispatch } from '../../state/hooks';
import { MarketStatusEnums, useState as useMatketState, useEthPrice, useBorrowMap } from '../../state/market';
import { useState as useUserState } from '../../state/user';
import { useState as useSaverState, updateEnabled, updateOtherRatio } from '../../state/saver';

import { Flex, Font, Grid, Container, Wrapper, ButtonGroupGrid } from '../../styled';
import { getRatio } from '../../utils';


import SmartAddress from '../SmartAddress';

import Input, { InputColumn } from './Input';
import Bar from './Bar';

const Line = styled.div`
margin-top: 30px;
border-bottom: 1px solid var(--theme);
`;

const Setting = ({ onCancel }: { onCancel: () => void }) => {
    const dispatch = useAppDispatch();

    const [modeSelect] = useState([
        { name: t`全自动化`, value: 2 },
        { name: t`半自动化`, value: 1 }
    ]);

    const [mode, setMode] = useState<SelectValueInterface>();
    const [boostDisabled, setBoostDisabled] = useState<boolean>(true);

    const { loanStatus } = useMatketState();
    const price = useEthPrice();
    const borrowMap = useBorrowMap();

    const borrowData = useMemo(() => borrowMap ? Object.values(borrowMap) : null, [borrowMap]);

    const { dataInfo } = useUserState();
    const { optimalType, minRatio, maxRatio, optimalBoost, optimalRepay } = useSaverState();

    const { ratio } = dataInfo ?? {};

    const subscribe = useSubscribe(mode ? Number(mode?.value) : 0);

    const handleBoostCheckbox = (value: boolean) => {
        setBoostDisabled(value);
        dispatch(updateEnabled(value));
    }

    const handleRatio = (key: "minRatio" | "maxRatio" | "optimalBoost" | "optimalRepay", value: string) => {
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

    useEffect(() => {
        setMode(modeSelect[optimalType === 2 ? 0 : 1])
    }, [optimalType]);

    return <Wrapper>
        <SmartAddress />

        <Container width="704px" style={{ padding: "50px 0" }}>
            <h2 style={{ marginBottom: 22 }}><Font size="20px"><Trans>Aave Automation Setup</Trans></Font></h2>
            <p style={{ marginBottom: 30 }}>
                <Font size="13px" color="#939DA7" lineHeight="18px">
                    <Trans>
                        Once Enabled, DeFi Saver will monitor your Aave ratio and automatically activate Repay if your Aave reaches the lower configured limit, or Boost if it reaches the upper one. Simply enter your target ratio, or configure manually below.
                    </Trans>
                </Font>
            </p>

            <Grid rowGap="20px">
                <Flex alignItems="center">
                    <Font color="#fff"><Trans>当前比例：</Trans></Font>
                    <Font size="20px" weight="700" fontColor="#37B06F">{getRatio(ratio * 100)}</Font>
                </Flex>

                <Flex alignItems="center">
                    <Font><Trans>自动化模式：</Trans></Font>

                    <ThemeSelect
                        value={mode}
                        dataSource={modeSelect}
                        onChange={(value) => setMode(value)}
                    />
                </Flex>
            </Grid>

            {mode?.value === 1 && <>
                <Line />

                <InputColumn
                    title={t`价格下跌时进行偿还`}
                    error={<TipsBoxError isShow={Number(minRatio) - ratio * 100 >= 0} text={t`自动减杠杆将在启用当前参数时被触发`} />}
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
                        onChange={(value: string) => handleRatio("minRatio", value)}
                    />
                    <Input
                        label={t`减杠杆至：`}
                        value={optimalRepay}
                        error={(() => {
                            let isError = false, message = "";

                            // console.log("optimalRepay", optimalRepay, minRatio, maxRatio);

                            if (Number(optimalRepay) - Number(minRatio) < 5 || (boostDisabled && Number(maxRatio) - Number(optimalRepay) < 5)) {
                                isError = true;
                                message = t`目标和限制比率之间的差值必须大于 5%`;
                            }

                            return { isError, message }
                        })()}

                        onChange={(value: string) => handleRatio("optimalRepay", value)}
                    />
                </InputColumn>

                <InputColumn
                    title={<Checkbox id="boost-checkbox" label={t`价格上涨时加杠杆`} checked={boostDisabled} onChange={handleBoostCheckbox} />}
                    error={<TipsBoxError isShow={Number(maxRatio) - ratio * 100 <= 0} text={t`自动加杠杆将在启用当前参数时被触发`} />}
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
                        onChange={(value: string) => handleRatio("maxRatio", value)}
                    />
                    <Input
                        disabled={!boostDisabled}
                        label={t`加杠杆至：`}
                        value={optimalBoost}
                        error={(() => {
                            let isError = false, message = "";

                            // console.log("optimalBoost", optimalBoost, minRatio, maxRatio);

                            if (boostDisabled && (Number(optimalBoost) - Number(minRatio) < 5 || Number(maxRatio) - Number(optimalBoost) < 5)) {
                                isError = true;
                                message = t`目标和限制比率之间的差值必须大于 5%`;
                            }

                            return { isError, message }
                        })()}

                        onChange={(value: string) => handleRatio("optimalBoost", value)}
                    />
                </InputColumn>

                <Bar ratio={Number(ratio) * 100} />
            </>}

            {mode?.value === 2 && borrowData?.length && <Grid rowGap="20px" style={{ margin: "20px 0" }}>
                <TipsBoxWarning isShow text={t`使用全自动化模式请先偿还以下借贷`} />

                <Table
                    dataSource={borrowData ?? []}
                    loading={!!borrowData && loanStatus === MarketStatusEnums.LOADING}
                >
                    <TableColumn first width="140px" title={t`资产`} dataKey="symbol" render={renderCoinInfo} />
                    <TableColumn width="160px" title={t`已借贷`} render={(_, __, { amount, symbol }) => renderAmountTips(amount, symbol)} />
                    <TableColumn width="170px" title={t`已借贷($)`} dataKey="priceETH" render={(value) => renderPriceTips(value, price)} />
                </Table>
            </Grid>}

            <ButtonGroupGrid column={2} columnGap="20px">
                <Button theme="gray" onClick={onCancel}><Trans>取消</Trans></Button>
                <Button status={mode?.value === 2 && !!borrowData?.length ? "disabled" : undefined} onClick={handleSubmit}><Trans>启用</Trans></Button>
            </ButtonGroupGrid>
        </Container>
    </Wrapper>
}

export default Setting;