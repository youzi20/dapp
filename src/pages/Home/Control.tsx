import { useState } from 'react';
import styled from 'styled-components';
import { t } from "@lingui/macro";

import { useState as useUserState } from '../../state/user';

import Advanced from './Advanced';
import Collateral from './Collateral';
import Debt from './Debt';

const ContorlWrapper = styled.div`
margin-bottom: 25px;
`;


const TabWrapper = styled.div`
display: grid;
grid-template-columns: repeat(3, 1fr);
column-gap: 25px;
`;

const TabTitle = styled.div`
font-family: PingFangSC-Medium;
font-size: 16px;
color: #fff;
height: 52px;
line-height: 22px;
text-align: center;
padding: 15px 0;
border-radius: 3px 3px 0 0;
background: var(--tab-title);
transition: color .3s ease;
cursor: pointer;

&.active {
    background: var(--tab-title-active);
}

&:hover:not(.active) {
    color: rgba(255,255,255,.7);
}
`;

const TabPanel = styled.div`
padding: 40px 60px;
border-radius: 0 0 3px 3px;
background: var(--tab-panel);
`;

const Tab: React.FC<{
    values?: {
        title: string | React.ReactNode
        content?: string | React.ReactNode
    }[]
    active?: number
}> = (props) => {
    const { values, active: propsActive } = props;

    const [active, setActive] = useState(propsActive ?? 0);

    const handleChange = (key: number) => {
        setActive(key);
    }

    return <>
        <TabWrapper>
            {values?.length && values.map((item, key) =>
                <TabTitle
                    key={key}
                    className={key === active ? "active" : ""}
                    onClick={() => handleChange(key)}
                >
                    {item.title}
                </TabTitle>
            )}
        </TabWrapper>
        <TabPanel>
            {values?.length && values[active]?.content || ""}
        </TabPanel>
    </>
}

const Control = () => {
    const { address } = useUserState();

    return address ?
        <ContorlWrapper>
            <Tab
                active={0}
                values={[
                    { title: t`做多`, content: <Advanced /> },
                    { title: t`质押`, content: <Collateral /> },
                    { title: t`债务`, content: <Debt /> },
                ]}
            />
        </ContorlWrapper> :
        null;
}

export default Control;