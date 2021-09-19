import { useMemo } from 'react';
import styled from 'styled-components';
import { Trans, t } from '@lingui/macro';

import Tips, { TipsPrice } from '../../components/Tips';
import Table, { TableColumn } from '../../components/Table';

import {
    MarketStatusEnums,
    useState as useMatketState,
    useEthPrice,
    useMarketMap,
    useSupplyMap,
    useBorrowMap
} from '../../state/market';

import { Font, Flex } from '../../styled';

import { getRatio, numberRuler, fullNumber, ethToPriceTips } from '../../utils';

import CoinIcon from './CoinIcon';

interface MarketInterface {
    price: string
    symbol: string
    amount: string
    totalSupply: string
    totalBorrow: string
}


const Title = styled.div`
margin: 25px 0;
`;

const renderCoinIcon = (value: any) => <CoinIcon name={value} />;
const renderRatioText = (value: number) => getRatio(value * 100);
const renderAmountTips = ({ symbol, amount }: MarketInterface) => <Flex><Tips text={fullNumber(amount)} ><div>{numberRuler(amount)} {symbol}</div></Tips></Flex>;
const renderRatioTips = (value: number) => {
    const ratio = value * 100;

    return <Flex><Tips text={fullNumber(ratio)} ><div>{getRatio(ratio)}</div></Tips></Flex>;
};
const renderRatioDisabledTips = (value: number) => {
    return <Flex><Tips text={t`不可用`} ><div style={{ opacity: 0.5 }}>{getRatio(value * 100)}</div></Tips></Flex>
};
const renderPriceTips = (value: string, price: number | null) => <Flex><TipsPrice price={ethToPriceTips(value, price)} /></Flex>;
const renderSupplyTips = ({ price: ethPrice, totalSupply }: MarketInterface, price: number | null) => <Flex><TipsPrice price={ethToPriceTips(Number(ethPrice) * Number(totalSupply), price)} /></Flex>;
const renderApplyTips = ({ price: ethPrice, symbol, totalSupply, totalBorrow }: MarketInterface, price: number | null) => {
    const supply = Number(totalSupply);
    const borrow = Number(totalBorrow);

    const ratio = getRatio(borrow / supply * 100);
    const circulate = supply - borrow;

    const [priceStr, _, priceUnit] = ethToPriceTips(Number(ethPrice) * circulate, price);

    const amount = numberRuler(circulate);

    return <Flex justifyContent="flex-end">
        <Tips text={`市场流动性: ${amount} ${symbol} (${priceUnit ?? ""}${priceStr})`} >
            <div>{ratio}</div>
        </Tips>
    </Flex>
};

const MarketInfo = () => {
    const { marketStatus, loanStatus } = useMatketState();

    const price = useEthPrice();

    const marketMap = useMarketMap();
    const supplyMap = useSupplyMap();
    const borrowMap = useBorrowMap();

    const marketData = useMemo(() => marketMap ? Object.values(marketMap) : [], [marketMap]);
    const supplyData = useMemo(() => supplyMap ? Object.values(supplyMap) : null, [supplyMap]);
    const borrowData = useMemo(() => borrowMap ? Object.values(borrowMap) : null, [borrowMap]);

    console.log("MarketInfo", marketData, supplyData, borrowData);

    return <>
        {supplyData ? <>
            <Title>
                <Font fontSize="20px" fontWeight="700"><Trans>供应中</Trans></Font>
            </Title>
            <Table dataSource={supplyData ?? []} loading={loanStatus === MarketStatusEnums.LOADING}>
                <TableColumn width="196px" title={t`资产`} dataKey="symbol" render={renderCoinIcon} />
                <TableColumn width="168px" title={t`已供应`} render={(_, __, value) => renderAmountTips(value)} />
                <TableColumn width="196px" title={t`已供应($)`} dataKey="priceETH" render={(value) => renderPriceTips(value, price)} />
                <TableColumn width="190px" title={t`供应 APY`} dataKey="rate" render={renderRatioTips} />
                <TableColumn width="120px" title={t`抵押因素`} dataKey="collateralFactor" render={renderRatioText} />
                <TableColumn width="100px" align="right" title={t`抵押物`} />
            </Table>
        </> : ""}

        {borrowData ? <>
            <Title>
                <Font fontSize="20px" fontWeight="700"><Trans>贷款中</Trans></Font>
            </Title>
            <Table dataSource={borrowData ?? []} loading={loanStatus === MarketStatusEnums.LOADING}>
                <TableColumn width="140px" title={t`资产`} dataKey="symbol" render={renderCoinIcon} />
                <TableColumn width="160px" title={t`已借贷`} render={(_, __, value) => renderAmountTips(value)} />
                <TableColumn width="170px" title={t`已借贷($)`} dataKey="priceETH" render={(value) => renderPriceTips(value, price)} />
                <TableColumn width="140px" title={t`贷款 APY`} dataKey="rate" render={renderRatioTips} />
                <TableColumn width="160px" title={t`Interest Rate`} dataKey="loanType" render={(value) => value === 2 ? t`Stable` : t`Variable`} />
                <TableColumn width="190px" title={t`Change interest rate`} />
                <TableColumn width="100px" align="right" title={t`限制`} dataKey="ratio" render={renderRatioText} />
            </Table>
        </> : ""}

        <Title>
            <Flex justifyContent="space-between">
                <Font fontSize="20px" fontWeight="700"><Trans>市场信息</Trans></Font>
                {/* <div>仅显示自有资产</div> */}
            </Flex>
        </Title>
        <Table dataSource={marketData} loading={marketStatus === MarketStatusEnums.LOADING}>
            <TableColumn width="120px" title={t`资产`} dataKey="symbol" render={renderCoinIcon} />
            <TableColumn width="120px" title={t`价格`} dataKey="price" render={(value) => renderPriceTips(value, price)} />
            <TableColumn width="120px" title={t`供应 APY`} dataKey="supplyRate" render={renderRatioTips} />
            <TableColumn width="120px" title={t`抵押因素`} dataKey="collateralFactor" render={renderRatioText} />
            <TableColumn width="190px" title={t`Variable B. APY`} dataKey="borrowRateVariable" render={renderRatioTips} />
            <TableColumn width="160px" title={t`Stable B. APY`} dataKey="borrowRateStable"
                render={(value, _, { stableBorrowRateEnabled }) =>
                    stableBorrowRateEnabled ? renderRatioTips(value) : renderRatioDisabledTips(value)
                }
            />
            <TableColumn width="120px" title={t`市场规模`} dataKey="totalSupply" render={(_, __, data) => renderSupplyTips(data, price)} />
            <TableColumn width="110px" align="right" title={t`利用率`} render={(_, __, data) => renderApplyTips(data, price)} />
        </Table>
    </>
}


export default MarketInfo;