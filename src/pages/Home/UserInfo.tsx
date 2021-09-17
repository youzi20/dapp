import React, { useState } from 'react';
import styled from 'styled-components';
import { Trans, t } from '@lingui/macro';

// Import Swiper React components
import SwiperCore, { Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/swiper.scss';
import 'swiper/components/pagination/pagination.scss';

import Tips, { TipsInfo, TipsPrice } from '../../components/Tips';
import Button from '../../components/Button';
import { message } from '../../components/Message';
import { EmptyLoading } from '../../components/Empty';

import { useBuild, useProxies } from '../../hooks/contract/useUserInfo';

import { WalletStatusEnums, useState as useWalletState } from '../../state/wallet';
import { UserStatusEnums, useState as useUserState } from '../../state/user';
import { useEthPrice, useLiquidationInfo } from '../../state/market';

import { Font, Flex, TextOverflowWrapper } from '../../styled';

import { ethToPriceTips, getRatio, number2fixed } from '../../utils';

import SupplyPercentage from './SupplyPercentage';
import LoanPercentage from './LoanPercentage';


SwiperCore.use([Pagination]);

const Wrapper = styled.div`
margin-bottom: 25px;
border-radius: 3px;
background: var(--user-info);
overflow: hidden;
`;

const WalletHeader = styled.div`
display: flex;
align-items: center;
height: 52px;
padding: 0 20px;
background: var(--user-info-header);
`;

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
width: 280px;
margin: 0;

.swiper-pagination {
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

const Loading = () => {
    return <Wrapper>
        <EmptyLoading />
    </Wrapper>
}


const Create = () => {
    const { status } = useWalletState();

    const [loading, setLoading] = useState(false);

    const build = useBuild();
    const proxies = useProxies();

    const handleBuild = () => {

        if (status !== WalletStatusEnums.SUCEESS) {
            message.error(t`请先连接钱包`);
            return;
        }

        setLoading(true);

        build()
            .then(res => {
                res.wait()
                    .then((res: any) => {
                        setLoading(false);

                        message.success(t`创建成功`);

                        proxies();
                    })
                    .catch((error: any) => {
                        message.error(error.message);
                        console.error(error);
                        setLoading(false);
                    });
            })
            .catch((error: any) => {
                message.error(error.message);
                console.error(error);
                setLoading(false);
            });
    }

    return <Wrapper>
        <div style={{ padding: 45 }}>
            <h2><Font fontSize="20px" fontWeight="700"><Trans>创建智能钱包</Trans></Font></h2>
            <br />
            <p>
                <Font fontSize="14px" color="#939DA7" fontWeight="500">
                    <Trans>
                        为了使用应用的高级功能，您首先需要创建一个智能钱包 —— 您的个人智能合约钱包可以使用高级功能。<br />
                        请注意，使用智能钱包，您将无法与其他 app 兼容。
                    </Trans>
                </Font>
            </p>
            <br />
            <div><Button loading={loading} theme="primary" onClick={handleBuild}><Trans>创建</Trans></Button></div>
        </div>
    </Wrapper>
}

const DataItem: React.FC<{
    label: string | React.ReactNode
    quantity: string | number | React.ReactNode
    className?: string
}> = ({ label, quantity, className }) => {

    return <DataItemWrapper className={className}>
        <Font fontSize="14px" color="rgba(255, 255, 255, .5)">
            <Flex alignItems="center">{label}</Flex>
        </Font>
        <Font fontSize="42px" color="#fff">{quantity ?? 0}</Font>
    </DataItemWrapper>
}

const LabelItem: React.FC<{
    label: string | React.ReactNode
    quantity: string | number | React.ReactNode
}> = ({ label, quantity }) => {
    return <LabelItemWrapper>
        <Font fontSize="14px" color="rgba(255, 255, 255, .5)">
            <Flex alignItems="center">{label}</Flex>
        </Font>
        <Font fontSize="25px" color="#fff" style={{ display: "flex", justifyContent: "flex-end" }}>{quantity ?? 0}</Font>
    </LabelItemWrapper>
}

const Info: React.FC<{
    address: string | null
}> = ({ address }) => {
    const { dataInfo } = useUserState();
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH, ratio } = dataInfo ?? {};

    const price = useEthPrice();
    const [collateral, liquidation] = useLiquidationInfo() || [];

    // console.log("dataInfo", dataInfo);


    return <Wrapper>
        <WalletHeader>
            <Font fontSize="14px" fontWeight="700"><Trans>智能钱包</Trans></Font><Font fontSize="13px">: {address ?? ""}</Font>
        </WalletHeader>
        <WalletBody>
            <SupplyBalance>
                <DataBoxWrapper>
                    <DataItem
                        label={<>
                            <TipsInfo text={t`您提供的抵押品总数。`} />
                            <span><Trans>储蓄余额:</Trans></span>
                        </>}
                        quantity={<TipsPrice price={ethToPriceTips(totalCollateralETH, price)} />}
                    />
                </DataBoxWrapper>

                <GraphBoxWrapper>
                    <Font fontSize="20px" color="#939DA7" lineHeight="32px"><Trans>Supply composition:</Trans></Font>

                    <SupplyPercentage theme={["#36b4c4", "#0e8c9c"]} />
                </GraphBoxWrapper>
            </SupplyBalance>
            <BorrowBlance>
                <DataBoxWrapper>
                    <DataItem
                        label={<>
                            <TipsInfo text={t`您的借贷资金总额。`} />
                            <span><Trans>贷款总额:</Trans></span>
                        </>}
                        quantity={<TipsPrice price={ethToPriceTips(totalDebtETH, price)} />}
                    />
                    <HighlightedWrapper>
                        <DataItem
                            label={<>
                                <TipsInfo text={t`您的借款限额与借贷资金的比率低于${getRatio(collateral / liquidation * 100)}将被清算。`} />
                                <span><Trans>安全比率 (最小值 100%):</Trans></span>
                            </>}
                            quantity={<Tips text={ratio * 100}>
                                <Flex>
                                    {ratio ?
                                        <>
                                            <TextOverflowWrapper>{number2fixed(ratio * 100, 3)}</TextOverflowWrapper>
                                            <span>%</span>
                                        </>
                                        : "-"}</Flex>
                            </Tips>}
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
                                    label={<><TipsInfo text={t`您可以借贷的最大金额。`} /> <span><Trans>贷款限额:</Trans></span></>}
                                    quantity={<TipsPrice price={ethToPriceTips(totalDebtETH + availableBorrowsETH, price)} />}
                                />
                                <LabelItem
                                    label={<span><Trans>剩余可借款额:</Trans></span>}
                                    quantity={<TipsPrice price={ethToPriceTips(availableBorrowsETH, price)} />}
                                />
                            </SwiperSlideWrapper>
                        </SwiperSlide>
                        <SwiperSlide>
                            <SwiperSlideWrapper>
                                <LabelItem
                                    label={<>
                                        <TipsInfo text={t`Safety ratio below which your position will face liquidation.`} />
                                        <span><Trans>Liquidation ratio:</Trans></span>
                                    </>}
                                    quantity={<Tips text={collateral / liquidation * 100}><div>{getRatio(collateral / liquidation * 100)}</div></Tips>}
                                />
                                <LabelItem
                                    label={<>
                                        <TipsInfo text={t`Value of borrowed funds above which your position will face liquidation.`} />
                                        <span><Trans>Liquidation limit:</Trans></span>
                                    </>}
                                    quantity={<TipsPrice price={ethToPriceTips(liquidation, price)} />}
                                />
                            </SwiperSlideWrapper>
                        </SwiperSlide>
                    </SwiperWrapper>
                </DataBoxWrapper>

                <GraphBoxWrapper>
                    <Font fontSize="20px" color="#939DA7" lineHeight="32px"><Trans>已使用借款额度:</Trans></Font>
                    <LoanPercentage theme={["#68b3eb", "#3b9de7"]} />
                </GraphBoxWrapper>
            </BorrowBlance>
        </WalletBody>
    </Wrapper >
}

const UserInfo = () => {
    const { status, address } = useUserState();

    if (UserStatusEnums.CREATE === status) return <Create />;

    if (UserStatusEnums.LOADING === status) return <Loading />;

    return <Info address={address} />
}

export default UserInfo;