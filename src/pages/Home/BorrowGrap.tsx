import { useMemo } from 'react';
import { Trans, t } from '@lingui/macro';

import PercentGrap from '../../components/PercentGrap';

import { useUserInfo } from '../../state/user';
import { useEthPrice, useBorrowRatio, useLiquidationInfo } from '../../state/market';
import { useAfterUserInfo, useAfterBorrowRatio } from '../../state/after';

import { ethToPrice, getNumberTips } from '../../utils'

const usePercentInfo = (totalDebtETH: number, borrowETH: number, liquidationETH: number, ratio?: number) => {
    const price = useEthPrice();

    return useMemo(() => {
        if (!totalDebtETH || !borrowETH || !liquidationETH || !ratio) return;

        const max = liquidationETH / borrowETH;

        const totalPercent = totalDebtETH / borrowETH;
        const totalLeft = totalPercent / max;

        const maxPercent = 1;
        const maxLeft = 1 / max;

        const { value, currency } = ethToPrice(borrowETH, price);

        const { numUnit } = getNumberTips(value);

        const maxPrice = currency === "ETH" ? `${numUnit} ${currency}` : `${currency}${numUnit}`;

        let totalColor = "";

        [
            { color: "rgb(181, 26, 26)", ratio: 1 },
            { color: "rgb(255, 141, 0)", ratio: 1.33 },
            { color: "rgb(36, 152, 62)", ratio: 1.66 }
        ].forEach(item => {
            if (ratio > item.ratio) {
                totalColor = item.color;
            }
        });

        const point = [
            {
                color: totalColor,
                left: totalLeft,
                text: totalPercent,
                tips: (value: string) => t`总计 (${value})`
            },
            {
                color: "#FFF",
                left: maxLeft,
                text: maxPercent,
                tips: (value: string) => t`贷款限额: (${maxPrice} (${value})`
            }
        ];

        return { max, point };
    }, [totalDebtETH, borrowETH, liquidationETH, ratio]);
}

const BorrowGrap = ({ theme }: { theme: string[] }) => {
    const [borrowETH, liquidationETH] = useLiquidationInfo() || [];
    const { totalDebtETH, ratio } = useUserInfo() ?? {};

    const borrowRatio = useBorrowRatio();
    const percentInfo = usePercentInfo(totalDebtETH, borrowETH, liquidationETH, ratio);


    const { totalDebtETH: afterTotalDebtETH, borrowETH: afterBorrowETH, liquidationETH: afterLiquidationETH, } = useAfterUserInfo() ?? {};
    const afterBorrowRatio = useAfterBorrowRatio();
    const afterRatio = useMemo(() => afterBorrowETH && afterLiquidationETH ? afterLiquidationETH / afterBorrowETH : undefined, [afterBorrowETH, afterLiquidationETH]);
    const afterPercentInfo = usePercentInfo(afterTotalDebtETH, afterBorrowETH, afterLiquidationETH, afterRatio);


    // console.log(percentInfo);

    return <>
        <PercentGrap
            label
            title={t`已使用借款额度:`}
            theme={theme}
            max={percentInfo?.max}
            ratio={borrowRatio}
            point={percentInfo?.point}
        />
        {afterBorrowRatio &&
            <PercentGrap
                size='sm'
                title={t`之后`}
                theme={theme}
                max={afterPercentInfo?.max}
                ratio={afterBorrowRatio}
                point={afterPercentInfo?.point}
            />}
    </>
}

export default BorrowGrap;