import React from 'react';
import styled from 'styled-components';

import AAVEIconSVG from '../assets/coin/AAVE.svg';
import BATIconSVG from '../assets/coin/BAT.svg';
import BUSDIconSVG from '../assets/coin/BUSD.svg';
import DAIIconSVG from '../assets/coin/DAI.svg';
import ENJIconSVG from '../assets/coin/ENJ.svg';
import ETHIconSVG from '../assets/coin/ETH.svg';
import KNCLIconSVG from '../assets/coin/KNCL.svg';
import LINKIconSVG from '../assets/coin/LINK.svg';
import MANAIconSVG from '../assets/coin/MANA.svg';
import MKRIconSVG from '../assets/coin/MKR.svg';
import RENIconSVG from '../assets/coin/REN.svg';
import SNXIconSVG from '../assets/coin/SNX.svg';
import SUSDIconSVG from '../assets/coin/SUSD.svg';
import TUSDIconSVG from '../assets/coin/TUSD.svg';
import UNIIconSVG from '../assets/coin/UNI.svg';
import USDCIconSVG from '../assets/coin/USDC.svg';
import USDTIconSVG from '../assets/coin/USDT.svg';
import WBTCIconSVG from '../assets/coin/WBTC.svg';
import YFIIconSVG from '../assets/coin/YFI.svg';
import ZRXIconSVG from '../assets/coin/ZRX.svg';


const ICON_DATA = {
    "AAVE": AAVEIconSVG,
    "BAT": BATIconSVG,
    "BUSD": BUSDIconSVG,
    "DAI": DAIIconSVG,
    "ENJ": ENJIconSVG,
    "ETH": ETHIconSVG,
    "KNCL": KNCLIconSVG,
    "LINK": LINKIconSVG,
    "MANA": MANAIconSVG,
    "MKR": MKRIconSVG,
    "REN": RENIconSVG,
    "SNX": SNXIconSVG,
    "SUSD": SUSDIconSVG,
    "TUSD": TUSDIconSVG,
    "UNI": UNIIconSVG,
    "USDC": USDCIconSVG,
    "USDT": USDTIconSVG,
    "WBTC": WBTCIconSVG,
    "YFI": YFIIconSVG,
    "ZRX": ZRXIconSVG,
};



const CoinIconStyle = styled.div`
display: flex;
align-items: center;

.coin {
    width: 30px;
    height: 30px;
    margin-right: 13px;
    border-radius: 50%;
    overflow: hidden;

    img {
        width: 100%;
    }
}
`;


interface CoinIconInterface {
    name: string
}

const CoinIcon: React.FC<CoinIconInterface> = ({ name }) => {

    // @ts-ignore
    const icon_url = ICON_DATA[name];

    return <CoinIconStyle>
        <span className="coin"><img src={icon_url} alt="" /></span>
        {name}
    </CoinIconStyle>

}

export default CoinIcon;
