import React, { useMemo, useState } from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';
import { Trans, t } from '@lingui/macro';

// Import Swiper React components
import SwiperCore, { Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/swiper.scss';
import 'swiper/components/pagination/pagination.scss';

import Tips, { TipsInfo, TipsPrice } from '../../components/Tips';

import { UserStatusEnums, useState as useUserState, useUserInfo } from '../../state/user';
import { useEthPrice, useLiquidationInfo } from '../../state/market';
import { useState as useAfterState, useAfterUserInfo } from '../../state/after';
import { SaverStatusEnums, useState as useSaverState } from '../../state/saver';

import { Font, Flex, Grid, TextOverflowWrapper, Wrapper } from '../../styled';

import { getRatio, ethToPriceTips, numberToFixed, getHandleTheme } from '../../utils';
import { SAVER_SVG, SAVER_ACTIVE_SVG } from '../../utils/images';

import Loading from '../Loading';
import AaveInit from '../AaveInit';
import SmartAddress from '../SmartAddress';

import SupplyPercentage from './SupplyPercentage';
import BorrowPercentage from './BorrowPercentage';

SwiperCore.use([Pagination]);

const WalletBody = styled.div`
display: flex;
height: 330px;
`;

const SupplyBalance = styled.div`
flex: 0 0 auto;
max-width: 280px;
min-width: 255px;
padding: 0 20px;
background: var(--user-info-supply);
`;

const BorrowBlance = styled.div`
flex: 1;
padding: 0 20px;
`;

const DataBoxWrapper = styled.div`
display: flex;
justify-content: space-between;
height: 135px;
border-bottom: 1px solid var(--theme);
`;

const GraphBoxWrapper = styled.div`
display: flex;
flex-direction: column;
justify-content: center;
height: 194px;
`;

const DataItemWrapper = styled.div`
display: flex;
flex-direction: column;
justify-content: center;
height: 135px;
max-width: 240px;
`;

const LabelItemWrapper = styled.div`
display: grid;
grid-template-columns: auto minmax(auto, 160px);
align-items: center;
`;

const SwiperWrapper = styled(Swiper)`
display: flex;
flex-direction: column-reverse;
justify-content: center;
width: 280px;
margin: 0;

.swiper-wrapper {
    height: auto;
}

.swiper-pagination {
    position: relative;
    bottom: 0;
    text-align: right;

    .swiper-pagination-bullet {
        width: 10px;
        height: 10px;
        margin: 0;
        background: none !important;
        border: 3px solid transparent;

        &:after {
            content: "";
            display: block;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: #939DA7;
        }

        &.swiper-pagination-bullet-active:after {
            background: var(--theme);
        }
    }
}
`;

const SwiperSlideWrapper = styled.div`
display: grid;
align-content: center;
grid-row-gap: 10px;
height: 100%;
padding: 0 5px;
`;

const HighlightedWrapper = styled.div`
padding: 0 20px;
background: var(--user-info-highlighted);

&.active {
    background: var(--user-info-highlighted-active);
}
`;

interface LabelProps {
    text: string | React.ReactNode
    tips?: string | React.ReactNode
}

const Label = ({ text, tips }: LabelProps) => {
    return <Flex alignItems="center">
        {tips && <TipsInfo text={tips} />}
        <span>{text}</span>
    </Flex>
}

const Ratio = ({ ratio }: { ratio: number | null }) => {
    return ratio ? <Tips text={ratio * 100}>
        <Flex>
            <TextOverflowWrapper>{numberToFixed(ratio * 100)}</TextOverflowWrapper>
            <span>%</span>
        </Flex>
    </Tips> : <>-</>
}

const DataItem: React.FC<{
    label: string | React.ReactNode
    quantity: string | number | React.ReactNode
    className?: string
    color?: string
    after?: boolean
    afterValue?: string | React.ReactNode
}> = ({ className, label, quantity, color, after, afterValue }) => {

    return <DataItemWrapper className={className}>
        <Font fontSize="14px" color="#939DA7">{label}</Font>
        <Font fontSize="42px" color="#fff">{quantity}</Font>

        {after && <Grid template="repeat(2, max-content)" columGap="5px" alignItems="center">
            <Font fontSize="14px" color="rgba(255, 255, 255, .5)"><Trans>之后</Trans>:</Font>
            <Font fontSize="20px" color={color}>{afterValue}</Font>
        </Grid>}
    </DataItemWrapper>
}

const LabelItem: React.FC<{
    label: string | React.ReactNode
    quantity: string | number | React.ReactNode
    color?: string
    after?: boolean
    afterValue?: string | React.ReactNode
}> = ({ label, quantity, color, after, afterValue }) => {
    return <LabelItemWrapper>
        <Font fontSize="14px" color="rgba(255, 255, 255, .5)">{label}</Font>
        <Font fontSize="25px" color="#fff" style={{ display: "flex", justifyContent: "flex-end" }}>{quantity}</Font>

        {after && <>
            <Font fontSize="14px" color="rgba(255, 255, 255, .5)"><Trans>之后</Trans>:</Font>
            <Font fontSize="15px" color={color} style={{ display: "flex", justifyContent: "flex-end" }}>{afterValue}</Font>
        </>}
    </LabelItemWrapper>
}

const SaverIcon = () => {
    const { status, optimalType } = useSaverState();

    const tipsText = optimalType === 0 ? t`启用清算保护和自动杠杆自动化` : optimalType === 1 ? t`已启用半自动化` : t`已启用全动化`;

    return <Tips text={tipsText} >
        <Link to="./saver" style={{ display: "inherit" }}>
            <img src={SaverStatusEnums.OPEN !== status ? SAVER_SVG : SAVER_ACTIVE_SVG} alt="" />
        </Link>
    </Tips>
}

const Info = () => {
    const price = useEthPrice();
    const [borrowETH, liquidationETH] = useLiquidationInfo() || [];

    const { type, loading } = useAfterState();
    const color = useMemo(() => getHandleTheme(type), [type]);

    let userInfo;
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH, ratio } = userInfo = useUserInfo() ?? {};

    const {
        totalCollateralETH: afterTotalCollateralETH,
        totalDebtETH: afterTotalDebtETH,
        totalBorrowETH,
        totalLiquidationETH,
    } = useAfterUserInfo() ?? {};

    // console.log("UserInfo", userInfo);

    const liquidationRatio = useMemo(() => borrowETH && liquidationETH ? borrowETH / liquidationETH * 100 : null, [borrowETH, liquidationETH]);

    const afterRatio = useMemo(() => totalBorrowETH && totalLiquidationETH ? totalLiquidationETH / totalBorrowETH : null, [totalBorrowETH, totalLiquidationETH]);
    const afterLiquidationRatio = useMemo(() => totalBorrowETH && totalLiquidationETH ? totalBorrowETH / totalLiquidationETH * 100 : null, [totalBorrowETH, totalLiquidationETH]);

    const afterProps = { color, after: Boolean(type) };

    return <Wrapper>
        <SmartAddress />

        <WalletBody>
            <SupplyBalance>
                <DataBoxWrapper>
                    <DataItem
                        label={<Label text={t`储蓄余额:`} tips={t`您提供的抵押品总数。`} />}
                        quantity={<TipsPrice price={ethToPriceTips(totalCollateralETH, price)} />}
                        afterValue={<TipsPrice price={ethToPriceTips(afterTotalCollateralETH, price)} />}
                        {...afterProps}
                    />
                </DataBoxWrapper>

                <GraphBoxWrapper>
                    <SupplyPercentage theme={["#36b4c4", "#0e8c9c"]} />
                </GraphBoxWrapper>
            </SupplyBalance>
            <BorrowBlance>
                <DataBoxWrapper>
                    <DataItem
                        label={<Label text={t`贷款总额:`} tips={t`您的借贷资金总额。`} />}
                        quantity={<TipsPrice price={ethToPriceTips(totalDebtETH, price)} />}
                        afterValue={<TipsPrice price={ethToPriceTips(afterTotalDebtETH, price)} />}
                        {...afterProps}
                    />
                    <HighlightedWrapper>
                        <DataItem
                            label={<Label
                                text={t`安全比率 (最小值 100%):`}
                                tips={liquidationRatio ? t`您的借款限额与借贷资金的比率低于${getRatio(liquidationRatio)}将被清算。` : ""}
                            />}
                            quantity={<Flex alignItems="center">
                                <Ratio ratio={ratio} />
                                <SaverIcon />
                            </Flex>}
                            afterValue={<Ratio ratio={afterRatio} />}
                            {...afterProps}
                        />
                    </HighlightedWrapper>

                    <SwiperWrapper
                        loop
                        pagination={{ clickable: true }}
                    // onSlideChange={() => console.log('slide change')}
                    // onSwiper={(swiper) => console.log(swiper)}
                    >
                        <SwiperSlide>
                            <SwiperSlideWrapper>
                                <LabelItem
                                    label={<Label text={t`贷款限额:`} tips={t`您可以借贷的最大金额。`} />}
                                    quantity={<TipsPrice price={ethToPriceTips(Number(totalDebtETH) + Number(availableBorrowsETH), price)} />}
                                    afterValue={<TipsPrice price={ethToPriceTips(totalBorrowETH, price)} />}
                                    {...afterProps}
                                />
                                <LabelItem
                                    label={<Label text={t`剩余可借款额:`} />}
                                    quantity={<TipsPrice price={ethToPriceTips(availableBorrowsETH, price)} />}
                                    afterValue={<TipsPrice price={ethToPriceTips(totalBorrowETH - afterTotalDebtETH, price)} />}
                                    {...afterProps}
                                />
                            </SwiperSlideWrapper>
                        </SwiperSlide>
                        <SwiperSlide>
                            <SwiperSlideWrapper>
                                <LabelItem
                                    label={<Label text={t`Liquidation ratio:`} tips={t`Safety ratio below which your position will face liquidation.`} />}
                                    quantity={<Tips text={liquidationRatio}><div>{liquidationRatio ? getRatio(liquidationRatio) : "-"}</div></Tips>}
                                    afterValue={<Tips text={afterLiquidationRatio}><div>{afterLiquidationRatio ? getRatio(afterLiquidationRatio) : "-"}</div></Tips>}
                                    {...afterProps}
                                />
                                <LabelItem
                                    label={<Label text={t`Liquidation limit:`} tips={t`Value of borrowed funds above which your position will face liquidation.`} />}
                                    quantity={<TipsPrice price={ethToPriceTips(liquidationETH, price)} />}
                                    afterValue={<TipsPrice price={ethToPriceTips(totalLiquidationETH, price)} />}
                                    {...afterProps}
                                />
                            </SwiperSlideWrapper>
                        </SwiperSlide>
                    </SwiperWrapper>
                </DataBoxWrapper>

                <GraphBoxWrapper>
                    <BorrowPercentage theme={["#68b3eb", "#3b9de7"]} />
                </GraphBoxWrapper>
            </BorrowBlance>
        </WalletBody>
    </Wrapper >
}

const UserInfo = () => {
    const { status, address } = useUserState();

    if (UserStatusEnums.CREATE === status) return <AaveInit />;

    if (UserStatusEnums.LOADING === status) return <Loading />;

    return <Info />
}

export default UserInfo;