import React, { useEffect } from 'react';
import styled from 'styled-components';

import AaveLogo from '../../assets/svg/aave.svg';

import Wallet from '../../components/Wallet';
import Button from '../../components/Button';
import { ContentStyle } from '../../theme';

import useSmartWallet from '../../hooks/smartWallet';

import { Font } from '../../styled';

const HeaderFrameStyle = styled.div`
display: flex;
align-items: center;
justify-content: space-between;
padding: 20px 0;
margin-bottom: 20px;
border-bottom: 1px solid #37B06F;
`

const HomeTitleStyle = styled.div`
    display: flex;
    align-items: center;
    font-size: 28px;
    color: #FFFFFF;
`;

const WrapperStyle = styled.div`
border-radius: 3px;
background: linear-gradient(to bottom, #2B3943, #1A242B);
overflow: hidden;
`;

const WalletHeaderStyle = styled.div`
height: 52px;
line-height: 52px;
padding: 0 20px;
background: linear-gradient(to bottom, #2A5648, #264F42);
`;

const WalletBodyStyle = styled.div`
display: flex;
height: 330px;
`;


const SupplyBalanceStyle = styled.div`
width: 300px;
padding: 0 20px;
background: linear-gradient(180deg, #36444D 0%, #21454D 100%);
`;

const BorrowBlanceStyle = styled.div`
display: flex;
flex: 1;
padding: 0 20px;
`;

const DataItemStyle = styled.div`
display: flex;
flex-direction: column;
justify-content: center;
flex-grow: 1;
height: 135px;
border-bottom: 1px solid #37B06F;
`;


interface DataItemInterface {
    label: string
    quantity: number | null

}



const DataItem: React.FC<DataItemInterface> = (props) => {
    const { label, quantity } = props;

    return <DataItemStyle>
        <Font fontSize="14px" color="#939DA7">{label}</Font>
        <Font fontSize="42px" color="#fff">{quantity}</Font>
    </DataItemStyle>
}

const Home = () => {
    const { status, address, build } = useSmartWallet();

    console.log(status);

    return <ContentStyle>
        <HeaderFrameStyle>
            <HomeTitleStyle>
                <img style={{ width: 30, marginRight: 10 }} src={AaveLogo} alt="" />
                Aave
            </HomeTitleStyle>
            <Wallet />
        </HeaderFrameStyle>
        {!status ?
            <WrapperStyle>
                <div style={{ padding: 45 }}>
                    <h2><Font fontSize="20px" fontFamily="medium">创建智能钱包</Font></h2>
                    <br />
                    <p>
                        <Font fontSize="14px" color="#939DA7">
                            为了使用应用的高级功能，您首先需要创建一个智能钱包——您的个人智能合约钱包可以使用高级功能。     <br />
                            请注意，使用智能钱包，您将无法与其他 app 兼容。
                        </Font>
                    </p>
                    <br />
                    <div><Button variant="contained" color="primary" onClick={build}>创建</Button></div>
                </div>
            </WrapperStyle> :
            <WrapperStyle>
                <WalletHeaderStyle>
                    <Font fontSize="14" fontFamily="medium">智能钱包: </Font> <Font fontSize="14">{address}</Font>
                </WalletHeaderStyle>
                <WalletBodyStyle>
                    <SupplyBalanceStyle>
                        <DataItem label="储蓄余额:" quantity={0} />
                    </SupplyBalanceStyle>
                    <BorrowBlanceStyle>
                        <DataItem label="贷款余额:" quantity={0} />
                        <DataItem label="安全比率 (最小值 100%):" quantity={0} />
                    </BorrowBlanceStyle>
                </WalletBodyStyle>
            </WrapperStyle>}


    </ContentStyle>
}


export default Home;