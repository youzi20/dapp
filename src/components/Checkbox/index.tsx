import React, { ChangeEvent } from 'react';
import styled from 'styled-components';

const CheckboxWrapper = styled.div`
input {
    display: none;
}

label {
    display: flex;
    align-items: center;
    height: 100%;
    color: #fff;
    cursor: pointer;
}

span {
    width: 20px;
    height: 20px;
    padding: 4px;
    margin-right: 8px;
    border-radius: 3px;
    border: 1px solid #61717E;
}

input:checked + label span:after {
    content: "";
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 1px;
    background: #37B06F;
}
`;

interface CheckboxProps {
    id: string
    label?: string | React.ReactNode
    checked?: boolean
    onChange?: (value: boolean) => void
}

const Checkbox: React.FC<CheckboxProps> = ({ id, label, checked, onChange, ...other }) => {

    const handleChange = (value: boolean) => {
        console.log(value);

        onChange && onChange(value);
    }

    return <CheckboxWrapper {...other}>
        <input type="checkbox" id={id} onChange={(e) => handleChange(e.target.checked)} checked={checked} />

        <label htmlFor={id}>
            <span></span>
            {label}
        </label>
    </CheckboxWrapper>
}


export default Checkbox;