import styled from 'styled-components';
import { Trans, t } from '@lingui/macro';

import Tips, { TipsPrice } from '../../components/Tips';
import Table, { TableColumn } from '../../components/Table';

import {
    MarketStatusEnums,
    useState as useMatketState,
    useEthPrice,
    useSupply,
    useLoan
} from '../../state/market';


import { Font, Flex } from '../../styled';

import { getRatio, numberRuler, fullNumber, ethToPriceTips } from '../../utils';

import CoinIcon from './CoinIcon';

const Title = styled.div`
margin: 25px 0;
`;

const renderCoinIcon = (value: any) => <CoinIcon name={value} />;
const renderAmountTips = (value: number) => <Flex><Tips text={fullNumber(value)} ><div>{numberRuler(value)}</div></Tips></Flex>;
const renderRatioTips = (value: number) => <Flex><Tips text={fullNumber(value)} ><div>{getRatio(value)}</div></Tips></Flex>;
const renderRatioDisabledTips = (value: number) => <Flex><Tips text={t`不可用`} ><div style={{ opacity: 0.5 }}>{getRatio(value)}</div></Tips></Flex>;
const renderPriceTips = (value: number, price: number | null) => <Flex><TipsPrice price={ethToPriceTips(value, price)} /></Flex>;
const renderSupplyTips = ({ price: ethPrice, totalSupply }: any, price: number | null) => <Flex><TipsPrice price={ethToPriceTips(ethPrice * totalSupply, price)} /></Flex>;
const renderApplyTips = ({ price: ethPrice, symbol, totalSupply, totalBorrow }: any, price: number | null) => {
    const ratio = getRatio(totalBorrow / totalSupply * 100);
    const circulate = totalSupply - totalBorrow;

    const [priceStr, _, priceUnit] = ethToPriceTips(ethPrice * circulate, price);

    const amount = numberRuler(circulate);

    return <Flex justifyContent="flex-end">
        <Tips text={`市场流动性: ${amount} ${symbol} (${priceUnit ?? ""}${priceStr})`} >
            <div>{ratio}</div>
        </Tips>
    </Flex>
};

const MarketInfo = () => {
    const { marketData, marketStatus, loanStatus } = useMatketState();
    const supplyData = useSupply();
    const loanData = useLoan();

    const price = useEthPrice();

    console.log("MarketInfo", marketData, supplyData, loanData);

    return <>

        {supplyData?.length ?
            <>
                <Title>
                    <Font fontSize="20px" fontWeight="700"><Trans>供应中</Trans></Font>
                </Title>
                <Table dataSource={supplyData ?? []} loading={loanStatus === MarketStatusEnums.LOADING}>
                    <TableColumn width="196px" title={t`资产`} dataKey="symbol" render={renderCoinIcon} />
                    <TableColumn width="168px" title={t`已供应`} dataKey="amount" render={renderAmountTips} />
                    <TableColumn width="196px" title={t`已供应($)`} dataKey="priceETH" render={(value) => renderPriceTips(value, price)} />
                    <TableColumn width="190px" title={t`供应 APY`} dataKey="rate" render={renderRatioTips} />
                    <TableColumn width="120px" title={t`抵押因素`} dataKey="ltv" render={getRatio} />
                    <TableColumn width="100px" align="right" title={t`抵押物`} />
                </Table>
            </> : ""}

        {loanData?.length ?
            <>
                <Title>
                    <Font fontSize="20px" fontWeight="700"><Trans>贷款中</Trans></Font>
                </Title>
                <Table dataSource={loanData ?? []} loading={loanStatus === MarketStatusEnums.LOADING}>
                    <TableColumn width="140px" title={t`资产`} dataKey="symbol" render={renderCoinIcon} />
                    <TableColumn width="160px" title={t`已借贷`} dataKey="amount" render={renderAmountTips} />
                    <TableColumn width="170px" title={t`已借贷($)`} dataKey="priceETH" render={(value) => renderPriceTips(value, price)} />
                    <TableColumn width="140px" title={t`贷款 APY`} dataKey="rate" render={renderRatioTips} />
                    <TableColumn width="160px" title={t`Interest Rate`} dataKey="loanType" render={(value) => value === 2 ? t`Stable` : t`Variable`} />
                    <TableColumn width="190px" title={t`Change interest rate`} />
                    <TableColumn width="100px" align="right" title={t`限制`} dataKey="ratio" render={(value) => getRatio(value * 100)} />
                </Table>
            </> : ""}

        <Title>
            <Flex justifyContent="space-between">
                <Font fontSize="20px" fontWeight="700"><Trans>市场信息</Trans></Font>
                {/* <div>仅显示自有资产</div> */}
            </Flex>
        </Title>
        <Table dataSource={marketData ?? []} loading={marketStatus === MarketStatusEnums.LOADING}>
            <TableColumn width="120px" title={t`资产`} dataKey="symbol" render={renderCoinIcon} />
            <TableColumn width="120px" title={t`价格`} dataKey="price" render={(value) => renderPriceTips(value, price)} />
            <TableColumn width="120px" title={t`供应 APY`} dataKey="supplyRate" render={renderRatioTips} />
            <TableColumn width="120px" title={t`抵押因素`} dataKey="collateralFactor" render={getRatio} />
            <TableColumn width="190px" title={t`Variable B. APY`} dataKey="borrowRateVariable" render={renderRatioTips} />
            <TableColumn width="160px" title={t`Stable B. APY`} dataKey="borrowRateStable"
                render={(value, _, { stableBorrowRateEnabled }) =>
                    stableBorrowRateEnabled ? renderRatioTips(value) : renderRatioDisabledTips(value)
                }
            />
            <TableColumn width="120px" title={t`市场规模`} dataKey="totalSupply" render={(_, __, value) => renderSupplyTips(value, price)} />
            <TableColumn width="110px" align="right" title={t`利用率`} render={(_, __, value) => renderApplyTips(value, price)} />
        </Table>
    </>

}


export default MarketInfo;