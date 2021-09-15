import Tips from '../../components/Tips';

import { useSupplyRatio } from '../../state/market';

import { getRatio, numberRuler } from '../../utils';

import { PercentageGraphWrapper, PercentageGraphItem } from "./styled";


const SupplyPercentage = ({ theme }: { theme: string[] }) => {
    const supplyRatio = useSupplyRatio();

    return <PercentageGraphWrapper>
        {supplyRatio?.length ? supplyRatio.map(({ ratio, amount, symbol }, i) => {
            const ratioText = getRatio(ratio * 100);

            return <Tips text={`${numberRuler(amount)} ${symbol} (${ratioText})`} key={symbol}>
                <PercentageGraphItem width={ratioText} background={theme[i % 2]} key={i} />
            </Tips>
        }) : ""}
    </PercentageGraphWrapper>
}

export default SupplyPercentage;