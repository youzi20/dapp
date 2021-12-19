import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Trans, t } from '@lingui/macro';

// Import Swiper React components
import SwiperCore, { Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/swiper.scss';
import 'swiper/components/pagination/pagination.scss';

import Tips, { TipsInfo } from '../../components/Tips';
import { renderPriceTips } from '../../components/TableRender';

import { useUserInfo } from '../../state/user';
import { useMobile } from '../../state/config';
import { useState as useMatketState, useLiquidationInfo } from '../../state/market';
import { SaverStatusEnums, useState as useSaverState } from '../../state/saver';
import { useState as useAfterState, useAfterUserInfo } from '../../state/after';

import { Font, Flex, Grid, Wrapper, TextOverflowWrapper } from '../../styled';
import { getRatio, getNumberTips } from '../../utils';
import { SAVER_SVG, SAVER_ACTIVE_SVG } from '../../utils/images';

import SmartAddress from '../SmartAddress';
import SupplyGrap from './SupplyGrap';
import BorrowGrap from './BorrowGrap';


SwiperCore.use([Pagination]);

const AccountWrapper = styled(Flex)`
height: 330px;

@media screen and (max-width: 768px) {
    flex-direction: column;
    height: auto;
}
`;

const Line = styled.div`
width: 100%;
height: 1px;
background: var(--theme);
`;


const ColumnBox = styled.div`
display: flex;
flex-direction: column;
width: 100%;
padding: 0 20px;

@media screen and (max-width: 768px) {
    height: auto;
    padding: 0;
}
`;

const SupplyWrapper = styled(ColumnBox)`
/* flex: 0 0 auto; */
max-width: 280px;
background: var(--user-info-supply);

@media screen and (max-width: 768px) {
    max-width: 100%;
}
`;


const BorrowWrapper = styled(ColumnBox)`


`;

const BorrowListWrapper = styled(Flex)`
@media screen and (max-width: 768px) {
    flex-direction: column;
}
`;

const SwiperWrapper = styled(Swiper)`
display: flex;
flex-direction: column-reverse;
justify-content: center;
width: 280px;
margin: 0;

@media screen and (max-width: 768px) {
    width: 100%;
}

.swiper-wrapper {
    height: auto;
}

.swiper-pagination {
    position: relative;
    bottom: 0;
    text-align: right;

    @media screen and (max-width: 768px) {
        padding: 0 20px;
    }

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

@media screen and (max-width: 768px) {
    padding: 0 20px;
}
`;

const BoxWrapper = styled.div`
display: flex;
flex-direction: column;
justify-content: center;
padding: 0 5px;

@media screen and (max-width: 768px) {
    padding: 0 20px;
}
`;

const AccountInfoItem = ({ tips, text, quantity, after, style, ...other }: {
    tips?: string | React.ReactNode,
    text: string | React.ReactNode,
    quantity: string | React.ReactNode,
    after?: string | React.ReactNode,
    style?: React.CSSProperties
}) => {
    const { theme, loading } = useAfterState();

    return <BoxWrapper style={{ height: 135, ...style }} {...other}>
        <Flex flexDirection="column" justifyContent="center" >
            <Font size="14px" fontColor="rgba(255, 255, 255, .5)">
                <Grid column={2} columnGap="4px" alignItems="center">
                    {tips && <TipsInfo text={tips} />}
                    <span>{text}</span>
                </Grid>
            </Font>

            <Font size="42px">{quantity}</Font>
        </Flex>

        {after && theme && <Flex alignItems="center">
            <Font size="14px" fontColor="#939DA7" style={{ flexShrink: 0 }}><Trans>之后:</Trans>    </Font>
            <Font size="20px" fontColor={theme[1]} style={{ overflow: "hidden" }}>{after}</Font>
        </Flex>}
    </BoxWrapper>
}

const HighlightItem = styled(AccountInfoItem)`
max-width: 280px;
padding: 0 20px !important;
background: var(--user-info-highlighted);

&.active {
    background: var(--user-info-highlighted-active);
}

@media screen and (max-width: 768px) {
    max-width: 100%;
}
`;


const SwiperInfoItem = ({ tips, text, quantity, after, ...other }: {
    tips?: string | React.ReactNode,
    text: string | React.ReactNode,
    quantity: string | React.ReactNode,
    after?: string | React.ReactNode,
}) => {
    const isMobile = useMobile();
    const { theme, loading } = useAfterState();

    return <div {...other}>
        <Flex justifyContent="space-between" alignItems="center">
            <Font size="14px" fontColor="rgba(255, 255, 255, .5)" style={{ marginRight: 5 }}>
                <Grid column={2} columnGap="4px" alignItems="center">
                    {tips && <TipsInfo text={tips} />}
                    <span>{text}</span>
                </Grid>
            </Font>

            <Font size="25px" style={{ maxWidth: isMobile ? 180 : 140 }}>{quantity}</Font>
        </Flex>

        {after && theme &&
            <Flex justifyContent="space-between" alignItems="center">
                <Font size="14px" fontColor="#939DA7" style={{ flexShrink: 0 }}><Trans>之后:</Trans></Font>
                <Font size="15px" fontColor={theme[1]} style={{ overflow: "hidden" }}>{after}</Font>
            </Flex>}
    </div>
}

const Ratio = ({ ratio }: { ratio: number | null }) => {
    if (!ratio) return <>-</>;

    const { numUnit, numTips } = getNumberTips(ratio);

    return <Tips text={numTips}>
        <Flex flex="1" style={{ overflow: "hidden" }}>
            <TextOverflowWrapper>{numUnit}</TextOverflowWrapper>
            <span>%</span>
        </Flex>
    </Tips>
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

const Account = () => {
    const isMobile = useMobile();
    const { price } = useMatketState();
    const [borrowETH, liquidationETH] = useLiquidationInfo() || [];

    const { totalCollateralETH, totalDebtETH, availableBorrowsETH, ratio } = useUserInfo() ?? {};
    const {
        totalCollateralETH: afterTotalCollateralETH,
        totalDebtETH: afterTotalDebtETH,
        borrowETH: afterBorrowETH,
        liquidationETH: afterLiquidationETH,
    } = useAfterUserInfo() ?? {};

    // console.log(totalCollateralETH, totalDebtETH, availableBorrowsETH, ratio);
    // console.log("after", afterTotalCollateralETH, afterTotalDebtETH, afterBorrowETH, afterLiquidationETH);

    const liquidationRatio = useMemo(() => borrowETH && liquidationETH ? borrowETH / liquidationETH * 100 : null, [borrowETH, liquidationETH]);

    const afterRatio = useMemo(() => afterBorrowETH && afterLiquidationETH ? afterLiquidationETH / afterBorrowETH : null, [afterBorrowETH, afterLiquidationETH]);
    const afterLiquidationRatio = useMemo(() => afterBorrowETH && afterLiquidationETH ? afterBorrowETH / afterLiquidationETH * 100 : null, [afterBorrowETH, afterLiquidationETH]);

    return <Wrapper>
        <SmartAddress />

        <AccountWrapper>
            <SupplyWrapper>
                <AccountInfoItem
                    text={t`储蓄余额:`}
                    tips={t`您提供的抵押品总数。`}
                    quantity={renderPriceTips(totalCollateralETH, price)}
                    after={renderPriceTips(afterTotalCollateralETH, price)}
                />

                <Line />

                <BoxWrapper style={{ height: isMobile ? 152 : 194 }} >
                    <SupplyGrap theme={["#36b4c4", "#0e8c9c"]} />
                </BoxWrapper>
            </SupplyWrapper>
            <BorrowWrapper>
                <BorrowListWrapper justifyContent="space-between">
                    <AccountInfoItem
                        text={t`贷款总额:`}
                        tips={t`您的借贷资金总额。`}
                        quantity={renderPriceTips(totalDebtETH, price)}
                        after={renderPriceTips(afterTotalDebtETH, price)}
                        style={isMobile ? undefined : { maxWidth: 220 }}
                    />

                    <HighlightItem
                        text={t`安全比率 (最小值 100%):`}
                        tips={liquidationRatio ? t`您的借款限额与借贷资金的比率低于${getRatio(liquidationRatio)}将被清算。` : ""}
                        quantity={<Flex><Ratio ratio={ratio * 100} /><SaverIcon /></Flex>}
                        after={afterRatio && <Ratio ratio={afterRatio * 100} />}
                    />

                    <SwiperWrapper loop pagination={{ clickable: true }}>
                        <SwiperSlide>
                            <SwiperSlideWrapper>
                                <SwiperInfoItem
                                    text={t`贷款限额:`}
                                    tips={t`您可以借贷的最大金额。`}
                                    quantity={renderPriceTips(Number(totalDebtETH) + Number(availableBorrowsETH), price)}
                                    after={renderPriceTips(afterBorrowETH, price)}
                                />

                                <SwiperInfoItem
                                    text={t`剩余可借款额:`}
                                    quantity={renderPriceTips(availableBorrowsETH, price)}
                                    after={renderPriceTips(afterBorrowETH - afterTotalDebtETH, price)}
                                />
                            </SwiperSlideWrapper>
                        </SwiperSlide>
                        <SwiperSlide>
                            <SwiperSlideWrapper>
                                <SwiperInfoItem
                                    text={t`Liquidation ratio:`}
                                    tips={t`Safety ratio below which your position will face liquidation.`}
                                    quantity={<Ratio ratio={liquidationRatio} />}
                                    after={<Ratio ratio={afterLiquidationRatio} />}
                                />

                                <SwiperInfoItem
                                    text={t`Liquidation limit:`}
                                    tips={t`Value of borrowed funds above which your position will face liquidation.`}
                                    quantity={renderPriceTips(liquidationETH, price)}
                                    after={renderPriceTips(afterLiquidationETH, price)}
                                />
                            </SwiperSlideWrapper>
                        </SwiperSlide>
                    </SwiperWrapper>
                </BorrowListWrapper>

                <Line />

                <BoxWrapper style={{ height: isMobile ? 152 : 194 }}>
                    <BorrowGrap theme={["#68b3eb", "#3b9de7"]} />
                </BoxWrapper>
            </BorrowWrapper>
        </AccountWrapper>
    </Wrapper>
}

export default Account;