import React from 'react';
import styled from 'styled-components';

import Tips from '../Tips';

import { Font, Flex } from '../../styled';
import { getNumberTips, getRatio } from '../../utils';

const PercentGraphWrapper = styled.div`
position: relative;
`;

const PercentGraphConetnt = styled.div<{ size?: "lg" | "sm" }>`
display: flex;
${({ size }) => size === "sm" ? "height: 8px; margin-bottom: 22px;" : "height: 38px; margin: 22px 0;"}
border-radius: 3px;
background-color: var(--percent-bg);
overflow: hidden;
`;

const PercentGraphItem = styled.div<{
    width: string
    background: string
}>`
flex: 0 0 ${({ width }) => width};
background: ${({ background }) => background} ;
cursor: pointer;
`;

const PercentGraphLabel = styled(Flex)`
position: absolute;
top: 2px;
left: 0;
width: 100%;
justify-content: space-between;
`;

const PercentPointWrapper = styled.div<{ left?: number, size?: "lg" | "sm", color: string }> `
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

interface PointProps {
    left?: number,
    text?: number,
    size?: "lg" | "sm"
    color: string,
    tips: (value: string) => string,
}

const PercentPoint = ({ tips, left, color, text, size }: PointProps) => {
    const value = text || text === 0 ? getRatio(text * 100) : "";

    return <Tips text={tips(value)}>
        <PercentPointWrapper {...{ color, left, size }}>
            <span>{value}</span>
        </PercentPointWrapper>
    </Tips>
};

const PercentGrap = ({ title, theme, size, max = 1, label, ratio, point }: {
    title: string | React.ReactNode,
    theme: string[]
    size?: "lg" | "sm"
    max?: number
    label?: boolean
    ratio?: { ratio: number, amount: number, symbol: string }[]
    point?: PointProps[]
}) => {

    return <>
        <Font size={size === "sm" ? "14px" : "20px"} fontColor="#939DA7" lineHeight={size === "sm" ? "25px" : "32px"}>{title}</Font>
        <PercentGraphWrapper>
            {label && max ? <PercentGraphLabel>
                <Font size="14px" fontColor="#939DA7">0%</Font>
                <Tips text="Liquidation">
                    <Font size="14px" fontColor="#939DA7">{getRatio(max * 100)}</Font>
                </Tips>
            </PercentGraphLabel> : null}

            {point?.map(item => <PercentPoint size={size} {...item} />)}

            <PercentGraphConetnt size={size}>
                {max && ratio?.map(({ ratio, amount, symbol }, i) => {
                    const width = getRatio(ratio / max * 100);
                    const text = getRatio(ratio * 100);

                    const { numUnit } = getNumberTips(amount);

                    return <Tips text={`${numUnit} ${symbol} (${text})`} key={i}>
                        <PercentGraphItem width={width} background={theme[i % 2]} key={i} />
                    </Tips>
                })}
            </PercentGraphConetnt>

        </PercentGraphWrapper>
    </>
}


export default PercentGrap;