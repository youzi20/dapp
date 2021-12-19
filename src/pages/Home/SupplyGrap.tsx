import { t, Trans } from '@lingui/macro';

import PercentGrap from '../../components/PercentGrap';

import { useSupplyRatio } from '../../state/market';
import { useAfterSupplyRatio } from '../../state/after';

// import { PercentageGraphWrapper, PercentageGraphItem } from './styled';


const SupplyGrap = ({ theme }: { theme: string[] }) => {
    // const { type, loading } = useAfterState();

    const supplyRatio = useSupplyRatio();
    const afterSupplyRatio = useAfterSupplyRatio();

    // console.log("SupplyPercentage", supplyRatio, afterSupplyRatio);

    return <>

        <PercentGrap
            title={t`Supply composition:`}
            theme={theme}
            ratio={supplyRatio}
        />

        {afterSupplyRatio &&
            <PercentGrap
                size='sm'
                title={t`之后`}
                theme={theme}
                ratio={afterSupplyRatio}
            />}

        {/* <Font fontSize="20px" color="#939DA7" lineHeight="32px"><Trans>Supply composition:</Trans></Font>
        <PercentageGraphWrapper>
            {supplyRatio?.length ? supplyRatio.map(({ ratio, amount, symbol }, i) => {
                const ratioText = getRatio(ratio * 100);

                return <Tips text={`${numberRuler(amount)} ${symbol} (${ratioText})`} key={symbol}>
                    <PercentageGraphItem width={ratioText} background={theme[i % 2]} key={i} />
                </Tips>
            }) : ""}
        </PercentageGraphWrapper> */}

        {/* {type && <>
            <Font fontSize="14px" color="#939DA7" lineHeight="25px"><Trans>之后</Trans></Font>
            <PercentageGraphWrapper size="sm">
                {afterSupplyRatio?.length ? afterSupplyRatio.map(({ ratio, amount, symbol }, i) => {
                    const ratioText = getRatio(ratio * 100);

                    return <Tips text={`${numberRuler(amount)} ${symbol} (${ratioText})`} key={symbol}>
                        <PercentageGraphItem width={ratioText} background={theme[i % 2]} key={i} />
                    </Tips>
                }) : ""}
            </PercentageGraphWrapper>
        </>} */}
    </>
}

export default SupplyGrap;