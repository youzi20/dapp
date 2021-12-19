import { t } from '@lingui/macro';

import Tips from '../Tips';

import CoinInfo from '../CoinInfo';

import { Flex, TextOverflowWrapper } from '../../styled';

import { ethToPrice, getNumberTips, getRatio, fullNumber, numberUnit } from '../../utils';

export const renderCoinInfo = (symbol: string) => <CoinInfo name={symbol} />;

export const renderAmountTips = (amount: number, symbol: string) => {
    const { numUnit, numTips } = getNumberTips(amount);

    return <Flex>
        <Tips text={numTips} >
            <div>{numUnit} {symbol}</div>
        </Tips>
    </Flex>
};

export const renderPriceTips = (count?: number, price?: number) => {
    if ((!count && count !== 0) || !price) return;

    const { value, currency } = ethToPrice(count, price);

    const { numUnit, numTips } = getNumberTips(value);

    const numDom = <TextOverflowWrapper>{numUnit}</TextOverflowWrapper>;

    return <Tips text={numTips}>
        <Flex>{numUnit ? currency === "ETH" ? <>{numDom}{currency}</> : <>{currency}{numDom}</> : "0"}</Flex>
    </Tips>
}

export const renderRatio = (value: number, int?: boolean) => value ? getRatio(value * 100, int) : undefined;

export const renderRatioTips = (value: number, int?: boolean) => {
    const ratio = value * 100;

    return <Flex><Tips text={fullNumber(ratio)} ><div>{getRatio(ratio, int)}</div></Tips></Flex>;
}

export const renderRatioDisabledTips = (value: number, int?: boolean) => <Flex><Tips text={t`不可用`} ><div style={{ opacity: 0.5 }}>{getRatio(value * 100, int)}</div></Tips></Flex>;

export const renderApplyTips = (ethPrice: number, symbol: string, totalSupply: number, totalBorrow: number, price?: number) => {
    const circulate = totalSupply - totalBorrow;
    const ratio = getRatio(circulate / totalSupply * 100);

    const { value, currency } = ethToPrice(ethPrice * circulate, price);

    const { numUnit } = getNumberTips(value);

    const [num, unit] = numberUnit(circulate);

    const circulateText = `${num}${unit ?? ""}`;

    return <Flex justifyContent="flex-end">
        <Tips text={`${t`市场流动性:`} ${circulateText} ${symbol} (${currency === "ETH" ? `${numUnit} ${currency}` : `${currency}${numUnit}`})`} >
            <div>{ratio}</div>
        </Tips>
    </Flex>
};