import { useState } from 'react';
import styled from 'styled-components';

import { Grid } from '../../styled';

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

interface TabDatabase {
    title: string | React.ReactNode
    content?: string | React.ReactNode
}

const Tab = ({ values, active: propsActive, onChange }: {
    values?: TabDatabase[]
    active?: number
    onChange?: () => void
}) => {
    const [active, setActive] = useState(propsActive ?? 0);

    const handleChange = (key: number) => {
        setActive(key);
        onChange && onChange();
    }

    return <>
        <Grid template="repeat(3, 1fr)" columnGap="25px">
            {values?.length && values.map((item, key) =>
                <TabTitle
                    key={key}
                    className={key === active ? "active" : ""}
                    onClick={() => handleChange(key)}
                >
                    {item.title}
                </TabTitle>
            )}
        </Grid>
        <TabPanel>
            {(values?.length && values[active]?.content) || ""}
        </TabPanel>
    </>
}

export default Tab;