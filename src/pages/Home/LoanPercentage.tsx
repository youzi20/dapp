import { useMemo } from 'react';
import { t } from '@lingui/macro';

import Tips from '../../components/Tips';

import { useState as useUserState } from '../../state/user';
import { useLoanRatio, useLiquidationInfo, useEthPrice } from '../../state/market';

import { Font } from '../../styled';

import { getRatio, numberRuler, ethToPriceTips } from '../../utils';

import {
    PercentageGraphConetnt,
    PercentageGraphWrapper,
    PercentageGraphItem,
    PercentageGraphLabel,
    PercentagePointWrapper
} from "./styled";

const PercentagePoint = ({ tips, left, color, text }: { tips: (value: string) => string, left?: number, color: string, text?: number }) => {
    const value = text ? getRatio(text * 100) : "";

    return <Tips text={tips(value)}>
        <PercentagePointWrapper {...{ color, left }}>
            <span>{value}</span>
        </PercentagePointWrapper>
    </Tips>
};

const LoanPercentage = ({ theme }: { theme: string[] }) => {
    const { dataInfo } = useUserState();
    const { totalDebtETH, availableBorrowsETH } = dataInfo ?? {};
    const [collateral, liquidation] = useLiquidationInfo() || [];

    const loanRatio = useLoanRatio();
    const price = useEthPrice();

    const max = useMemo(() => liquidation && collateral ? liquidation / collateral : null, [liquidation, collateral]);

    const totalPercent: number[] | null = useMemo(() => {
        if (!max) return null;

        const percent = totalDebtETH / (totalDebtETH + availableBorrowsETH);
        const left = percent / max;

        return [left, percent];
    }, [max, totalDebtETH, availableBorrowsETH]);

    const percentText: number[] | null = useMemo(() => max ? [1 / max, 1] : null, [max]);
    const percentPrice = useMemo(() => {
        if (!totalDebtETH || !availableBorrowsETH) return "";

        // const [s, n, u] = ethToPriceTips(totalDebtETH + availableBorrowsETH, price);

        // return u === "ETH" ? `${n} ${s}` : `${u}${s}`;
    }, [price, totalDebtETH, availableBorrowsETH]);

    return <PercentageGraphConetnt>
        {loanRatio?.length ?
            <>
                <PercentageGraphLabel>
                    <Font fontSize="14px" color="#939DA7">0%</Font>

                    <Tips text="Liquidation">
                        <Font fontSize="14px" color="#939DA7">{max ? getRatio(max * 100) : ""}</Font>
                    </Tips>
                </PercentageGraphLabel>

                <PercentagePoint
                    tips={(value) => t`总计 (${value})`}
                    color="#FFF000"
                    left={totalPercent?.[0]}
                    text={totalPercent?.[1]}
                />

                <PercentagePoint
                    tips={(value) => t`贷款限额: ${percentPrice} (${value})`}
                    color="#fff"
                    left={percentText?.[0]}
                    text={percentText?.[1]}
                />
            </> : null}

        <PercentageGraphWrapper>
            {loanRatio?.length && max ? loanRatio.map(({ ratio, amount, symbol }, i) => {

                const width = getRatio(ratio / max * 100);
                const text = getRatio(ratio * 100);

                return <Tips text={`${numberRuler(amount)} ${symbol} (${text})`} key={text}>
                    <PercentageGraphItem width={width} background={theme[i % 2]} key={i} />
                </Tips>
            }) : ""}
        </PercentageGraphWrapper>
    </PercentageGraphConetnt>
}

export default LoanPercentage;