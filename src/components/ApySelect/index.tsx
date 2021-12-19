import { useState, useEffect } from 'react';
import { t } from '@lingui/macro';
import styled from 'styled-components';

import { Font } from '../../styled';

const APYWrapper = styled.div`
display: grid;
grid-template-columns: repeat(2, 1fr);
grid-column-gap: 5px;
line-height: 32px;
padding: 7px;
border-radius: 3px;
background: var(--apy);
`;

const APYItemWrapper = styled.div`
text-align: center;
border-radius: 3px;
cursor: pointer;

> div{
    &:hover {
        background: var(--apy-item-hover);
    }

    &.active {
        background: var(--apy-item-active);
    }
}

&.disabled {
    cursor: not-allowed;

     > div {
        color: #89939D;
        pointer-events: none;
    }
}
`;

const APYSelect = ({ stable, onChange }: { stable?: boolean, onChange?: (value: number) => void }) => {
    const data = [
        { value: 1, name: t`Stable`, disabled: stable },
        { value: 2, name: t`Variable` },
    ];

    const [value, setValue] = useState<number>();

    const handleChange = (val: number) => {
        setValue(val);
        onChange && onChange(val);
    }

    useEffect(() => {
        handleChange(2);
    }, []);

    return <APYWrapper>
        {data.map(item =>
            <APYItemWrapper
                className={item.disabled ? "disabled" : ""}
                key={item.value}
            >
                <Font
                    className={value === item.value ? "active" : ""}
                    size="14px"
                    onClick={() => handleChange(item.value)}
                >
                    {item.name}
                </Font>
            </APYItemWrapper>
        )}
    </APYWrapper>
}

export default APYSelect;