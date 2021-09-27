import { useMemo } from 'react';
import { Trans, t } from '@lingui/macro';

import Tips from '../../components/Tips';

import { useUserInfo } from '../../state/user';
import { useEthPrice, useBorrowRatio, useLiquidationInfo } from '../../state/market';
import { useState as useAfterState, useAfterBorrowRatio, useAfterUserInfo } from '../../state/after';

import { Font } from '../../styled';

import { getRatio, numberRuler, ethToPrice, fullNumber, numberToFixed } from '../../utils';

import {
    PercentageGraphConetnt,
    PercentageGraphWrapper,
    PercentageGraphItem,
    PercentageGraphLabel,
    PercentagePointWrapper
} from "./styled";

interface PercentageInfoProps {
    totalDebtETH: number
    borrowETH: number
    liquidationETH: number
}

const usePercentageInfo = ({ totalDebtETH, borrowETH, liquidationETH }: PercentageInfoProps) => {
    const price = useEthPrice();

    const max = useMemo(() => liquidationETH && borrowETH ? liquidationETH / borrowETH : null, [liquidationETH, borrowETH]);

    const totalPercent = useMemo(() => {
        if (!max) return null;

        const percent = totalDebtETH / borrowETH;
        const left = percent / max;

        return [left < 0 ? 0 : left, percent < 0 ? 0 : percent];
    }, [max, totalDebtETH, borrowETH]);

    const percentText = useMemo(() => max ? [1 / max, 1] : null, [max]);
    const percentPrice = useMemo(() => {
        if (!borrowETH) return null;

        let [priceStr, priceUnit] = ethToPrice(borrowETH, price);

        priceStr = numberToFixed(priceStr);

        return priceUnit === "ETH" ? `${priceStr} ${priceUnit}` : `${priceUnit}${priceStr}`;
    }, [price, borrowETH]);

    return { max, totalPercent, percentText, percentPrice };
}

const PercentagePoint = ({ tips, left, color, text, size }: { tips: (value: string) => string, left?: number, color: string, text?: number, size?: "lg" | "sm" }) => {
    const value = text || text === 0 ? getRatio(text * 100) : "";

    return <Tips text={tips(value)}>
        <PercentagePointWrapper {...{ color, left, size }}>
            <span>{value}</span>
        </PercentagePointWrapper>
    </Tips>
};

const BorrowPercentage = ({ theme }: { theme: string[] }) => {
    const { type, loading } = useAfterState();

    const { totalDebtETH } = useUserInfo() ?? {};
    const [borrowETH, liquidationETH] = useLiquidationInfo() || [];

    const { totalDebtETH: afterTotalDebtETH, totalBorrowETH, totalLiquidationETH } = useAfterUserInfo() ?? {};

    const borrowRatio = useBorrowRatio();
    const afterBorrowRatio = useAfterBorrowRatio();

    const { max, totalPercent, percentText, percentPrice } = usePercentageInfo({ totalDebtETH, borrowETH, liquidationETH });

    const { max: afterMax, totalPercent: afterTotalPercent, percentText: afterPercentText, percentPrice: afterPercentPrice } =
        usePercentageInfo({ totalDebtETH: afterTotalDebtETH, borrowETH: totalBorrowETH, liquidationETH: totalLiquidationETH });

    // console.log("BorrowPercentage", borrowRatio, afterBorrowRatio);

    return <>
        <Font fontSize="20px" color="#939DA7" lineHeight="32px"><Trans>已使用借款额度:</Trans></Font>
        <PercentageGraphConetnt>
            <PercentageGraphWrapper>
                {borrowRatio?.length && max && <>
                    <PercentageGraphLabel>
                        <Font fontSize="14px" color="#939DA7">0%</Font>
                        {max &&
                            <Tips text="Liquidation">
                                <Font fontSize="14px" color="#939DA7">{getRatio(max * 100)}</Font>
                            </Tips>}
                    </PercentageGraphLabel>

                    <PercentagePoint
                        color="#FFF000"
                        left={totalPercent?.[0]}
                        text={totalPercent?.[1]}
                        tips={(value) => t`总计 (${value})`}
                    />

                    <PercentagePoint
                        color="#fff"
                        left={percentText?.[0]}
                        text={percentText?.[1]}
                        tips={(value) => t`贷款限额: ${percentPrice} (${value})`}
                    />

                    {borrowRatio.map(({ ratio, amount, symbol }, i) => {
                        const width = getRatio(ratio / max * 100);
                        const text = getRatio(ratio * 100);

                        return <Tips text={`${numberRuler(amount)} ${symbol} (${text})`} key={text}>
                            <PercentageGraphItem width={width} background={theme[i % 2]} key={i} />
                        </Tips>
                    })}
                </>}
            </PercentageGraphWrapper>
        </PercentageGraphConetnt>

        {type && <>
            <Font fontSize="14px" color="#939DA7" lineHeight="25px"><Trans>之后</Trans></Font>
            <PercentageGraphConetnt>
                <PercentageGraphWrapper size="sm">
                    {afterBorrowRatio?.length && afterMax && <>
                        <PercentagePoint
                            size="sm"
                            color="#FFF000"
                            left={afterTotalPercent?.[0]}
                            text={afterTotalPercent?.[1]}
                            tips={(value) => t`总计 (${value})`}
                        />

                        <PercentagePoint
                            size="sm"
                            color="#fff"
                            left={afterPercentText?.[0]}
                            text={afterPercentText?.[1]}
                            tips={(value) => t`贷款限额: ${afterPercentPrice} (${value})`}
                        />

                        {afterBorrowRatio.map(({ ratio, amount, symbol }, i) => {
                            const width = getRatio(ratio / afterMax * 100);
                            const text = getRatio(ratio * 100);

                            return <Tips text={`${numberRuler(amount)} ${symbol} (${text})`} key={text}>
                                <PercentageGraphItem width={width} background={theme[i % 2]} key={i} />
                            </Tips>
                        })}
                    </>}
                </PercentageGraphWrapper>
            </PercentageGraphConetnt>
        </>}

    </>
}

export default BorrowPercentage;