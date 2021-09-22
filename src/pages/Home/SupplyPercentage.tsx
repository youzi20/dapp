import { Trans } from '@lingui/macro';

import Tips from '../../components/Tips';

import { useSupplyRatio } from '../../state/market';
import { useState as useAfterState, useAfterSupplyRatio } from '../../state/after';

import { Font } from '../../styled';

import { getRatio, numberRuler } from '../../utils';

import { PercentageGraphWrapper, PercentageGraphItem } from "./styled";


const SupplyPercentage = ({ theme }: { theme: string[] }) => {
    const { type, loading } = useAfterState();

    const supplyRatio = useSupplyRatio();
    const afterSupplyRatio = useAfterSupplyRatio();

    // console.log("SupplyPercentage", supplyRatio, afterSupplyRatio);

    return <>
        <Font fontSize="20px" color="#939DA7" lineHeight="32px"><Trans>Supply composition:</Trans></Font>
        <PercentageGraphWrapper>
            {supplyRatio?.length ? supplyRatio.map(({ ratio, amount, symbol }, i) => {
                const ratioText = getRatio(ratio * 100);

                return <Tips text={`${numberRuler(amount)} ${symbol} (${ratioText})`} key={symbol}>
                    <PercentageGraphItem width={ratioText} background={theme[i % 2]} key={i} />
                </Tips>
            }) : ""}
        </PercentageGraphWrapper>

        {type && <>
            <Font fontSize="14px" color="#939DA7" lineHeight="25px"><Trans>之后</Trans></Font>
            <PercentageGraphWrapper size="sm">
                {afterSupplyRatio?.length ? afterSupplyRatio.map(({ ratio, amount, symbol }, i) => {
                    const ratioText = getRatio(ratio * 100);

                    return <Tips text={`${numberRuler(amount)} ${symbol} (${ratioText})`} key={symbol}>
                        <PercentageGraphItem width={ratioText} background={theme[i % 2]} key={i} />
                    </Tips>
                }) : ""}
            </PercentageGraphWrapper>
        </>}
    </>
}

export default SupplyPercentage;