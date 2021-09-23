import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { t } from '@lingui/macro';


import Tips from "../../components/Tips";
import { IconWrapper } from '../../components/Icon';
import { OptionItemWrapper } from '../../components/Select';

import { Font, Flex } from '../../styled';
import { getRatio, numberToFixed } from '../../utils';

export const TabPanelGrid = styled.div`
display: grid;
grid-template-columns: repeat(2, 1fr);
column-gap: 60px;
`;

export const PercentageGraphConetnt = styled.div`
position: relative;
`;

export const PercentageGraphWrapper = styled.div<{ size?: "lg" | "sm" }>`
display: flex;
${({ size }) => size === "sm" ? "height: 8px; margin-bottom: 22px;" : "height: 38px; margin: 22px 0;"}
border-radius: 3px;
background-color: var(--percentage-bg);
overflow: hidden;
`;

export const PercentageGraphItem = styled.div<{
    width: string
    background: string
}>`
flex: 0 0 ${({ width }) => width};
background: ${({ background }) => background} ;
cursor: pointer;
`;

export const PercentageGraphLabel = styled(Flex)`
position: absolute;
top: 2px;
left: 0;
width: 100%;
justify-content: space-between;
`;

export const PercentagePointWrapper = styled.div<{ left?: number, size?: "lg" | "sm", color: string }> `
position: absolute;
left: ${({ left }) => left || left === 0 ? getRatio(left * 100) : ""};
${({ size }) => size === "sm" ? "height: 8px;" : "top: 22px; height: 42px;"}
width: 4px;
background: ${({ color }) => color};
cursor: pointer;

span {
    position: absolute;
    ${({ size }) => size === "sm" ? "top: 10px;" : "top: 42px;"}
    ${({ left }) => left === 0 ? "left: 0;" : "right: 0;"};
    font-weight: 700;
    font-size: 14px;
    color: ${({ color }) => color};
}
`;

export const HandleText = styled.div`
display: flex;
justify-content: space-between;
height: 18px;
margin-bottom: 4px;
`;

export const HandleWrapper = styled.div`
position: relative;
display: flex;
height: 64px;
margin-bottom: 10px;
border-radius: 3px;
border: 1px solid var(--handle-border);
background: var(--handle-bg);
transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);

&:before {
    position: absolute;
    top: -1px;
    left: -1px;
    content: '';
    width: 10px;
    height: calc(100% + 2px);
    border-radius: 3px 0 0 3px;
    background-color: ${({ theme }) => theme ?? "#C379FF"};
}
`;

export const InputControl = styled.div`
flex: 1;

.input-label {
    flex: 1 0 auto;
    padding: 0 10px 0 20px;
    line-height: 62px;
}

input {
    display: block;
    width: 100%;
    height: 62px;
    font-weight: bold;
    font-size: 20px;
    color: ${({ theme }) => theme ?? "#fff"};;
    text-align: right;
    padding: 0 10px  0 0;
    border: none;
    background: transparent;
    min-width: 0;
}
`;

export const SelectControl = styled.div`
flex: 0 0 auto;
width: 100px;
border-left: 1px solid var(--handle-border);
`;


export const EmptyContainer = styled.div`
display: flex;
flex-direction: column;
justify-content: space-around;
align-items: flex-end;
height: 62px;
padding: 14px 12px 5px 10px;
`;

export const EmptyWrapper = styled.div<{ size?: "small" | "normal" | "large" }>`
display: flex;
align-items: center;
justify-content: center;
border-radius: 3px;
background: var(--handle-empty);
${({ size = "normal" }) => {
        if (size === "small") {
            return `width: 100%; height: 20px;`
        } else {
            return `width: 75px; height: 42px; margin: 10px 10px 10px 0;`
        }
    }}

cursor: not-allowed;

img {
    ${({ size = "normal" }) => {
        if (size === "small") {
            return `width: 10px;`
        }
    }}
    opacity: 0.7;
    transition: all .3s ease;
}

&:hover img {
    opacity: 1;
}
`;

const InputMaxWrapper = styled.div`
cursor: pointer;
transition: all .3s ease;

&:hover {
    opacity: .7;
}
`;

const APYWrapper = styled.div`
display: grid;
grid-template-columns: repeat(2, 1fr);
grid-column-gap: 5px;
line-height: 32px;
margin: 25px 15px 0 15px;
padding: 7px;
border-radius: 3px;
background: var(--apy);
`;

const APYItemWrapper = styled.div`
text-align: center;
border-radius: 3px;
cursor: pointer;

&:hover {
    background: var(--apy-item-hover);
}

&.active {
    background: var(--apy-item-active);
}

&.disabled {
    pointer-events: none;
}
`;

export const InputMax: React.FC<{
    max?: string
}> = ({ max }) => {
    return max ?
        <Tips text={max}><InputMaxWrapper>{`(${t`最大值`} ${numberToFixed(max, 2)})`}</InputMaxWrapper></Tips> :
        <>{t`加载中~`}</>;
}

export const SelectEmpty: React.FC<{
    text?: string
}> = ({ text }) => {

    return text ? <EmptyContainer>
        <Tips text={t`此操作无可用的抵押品或借贷资产。`}>
            <EmptyWrapper size="small">
                <IconWrapper name="dapp-disable" color="#b1b4b7" />
            </EmptyWrapper>
        </Tips>
        <Font fontSize="12px" color="#939DA7">{text}</Font>
    </EmptyContainer> :
        <Tips text={t`此操作无可用的抵押品或借贷资产。`}>
            <EmptyWrapper>
                <IconWrapper name="dapp-disable" fontSize="24px" color="#b1b4b7" />
            </EmptyWrapper>
        </Tips>
}

export const SelectOptionItem = (props: any) => {
    const { active, item, handleChange } = props;
    const { name, loanType } = item;

    return <OptionItemWrapper className={active ? "active" : ""} onClick={() => handleChange(item)}>
        <Font fontSize="14px">{name}</Font>
        <Font fontSize="12px" color="#939DA7">{loanType === 2 ? t`Stable` : t`Variable`}</Font>
    </OptionItemWrapper>
}

export const APYSelect = ({ stable, onChange }: { stable?: boolean, onChange?: (value: number) => void }) => {
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
        handleChange(stable ? 2 : 1);
    }, []);

    return <APYWrapper>
        {data.map(item =>
            <APYItemWrapper
                className={`${value === item.value ? "active" : ""} ${item.disabled ? "disabled" : ""}`}
                key={item.value}
                onClick={() => handleChange(item.value)}
            >
                <Font fontSize="14px">{item.name}</Font>
            </APYItemWrapper>
        )}
    </APYWrapper>
}
