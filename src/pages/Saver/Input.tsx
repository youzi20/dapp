import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Font, Grid } from '../../styled';

const InputWrapper = styled.div<{ error?: boolean }>`
border-radius: 3px;
border: 1px solid ${({ error }) => error ? "var(--handle-error-border)" : "var(--handle-border)"} ;
`;

const InputContent = styled.div`
display: flex;
height: 64px;
line-height: 62px;

.label {
    flex: 1 0 auto;
    padding: 0 10px 0 20px;
}

input {
    width: 100%;
    font-weight: 700;
    font-size: 20px;
    color: #37B06F;
    text-align: right;
    padding: 0 2px;
}

.label-after {
    flex: 1 0 auto;
    padding: 0 20px 0 4px;
}

&.disabled {
    opacity: .3;
    cursor: not-allowed;

    > * {
        pointer-events: none;
    }
}
`;

const InputError = styled.div`
    font-size: 13px;
    font-weight: 500;
    color: #fff;
    padding: 10px 20px;
    border-top: 1px solid var(--handle-error-border);
    background-color: var(--handle-error-bg);
`;

const InputColumnGrid = styled(Grid)`
margin-top: 40px;
`;

const InputColumnWrapper = styled.div`
display: grid;
grid-template-columns: repeat(2, 335px);
justify-content: space-between;
align-items: start;
`;

interface InputColumnProps {
    title?: string | React.ReactNode
    error?: string | React.ReactNode
}

export const InputColumn: React.FC<InputColumnProps> = ({ title, error, children, ...other }) => {
    return <InputColumnGrid rowGap="20px">
        {title && <Font size="16px">{title}</Font>}
        {error}
        <InputColumnWrapper {...other}>
            {children}
        </InputColumnWrapper>
    </InputColumnGrid>
}

interface InputProps {
    label: string | React.ReactNode
    value?: string
    disabled?: boolean
    error?: { isError: boolean, message: string | React.ReactNode }
    rule?: { format: (value: string) => boolean | RegExp, message: string }[]
    onChange?: (value: string) => void
}

const Input: React.FC<InputProps> = ({ label, value: propsValue, disabled, error, onChange }) => {
    const [value, setValue] = useState<string>();

    const handleChange = (value: string) => {
        console.log(value);
        setValue(value);
        onChange && onChange(value);
    }

    useEffect(() => {
        if (propsValue) setValue(propsValue);
    }, [propsValue]);

    return <InputWrapper error={error?.isError} >
        <InputContent className={disabled ? "disabled" : ""}>
            <label className="label"><Font size="16px" fontColor="rgba(255, 255, 255, .5)">{label}</Font></label>
            <input type="number" value={value} onChange={(e) => handleChange(e.target.value)} />
            <label className="label-after"><Font size="20px">%</Font></label>
        </InputContent>
        {error?.isError && <InputError>{error.message}</InputError>}
    </InputWrapper >
}

export default Input;