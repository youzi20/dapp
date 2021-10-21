import React, { useMemo, useState } from 'react';
import styled from "styled-components";
import { t } from '@lingui/macro';

import Tips from '../../components/Tips';

import { useState as useSaverState } from '../../state/saver';

import { Font, Flex } from '../../styled';
import { getRatio, numberRuler } from "../../utils";

const BarWrapper = styled.div`
margin: 60px 0;
`;

const ValueWrapper = styled.div`
position: relative;
height: 38px;
background-color: #192227;
border-radius: 3px 3px 0 0;
`;

const ValueBar = styled.div<{ width: string }>`
width: ${({ width }) => width};
height: 38px;
background-color: #37B06F;
border-top-left-radius: 3px;
`;

const ValueText = styled.div`
position: absolute;
top: 0;
left: 0;
height: 38px;
line-height: 38px;
padding: 0 15px;
`;

const ValueLine = styled.div<{ left: string, bg?: "error" | "default" }>`
position: absolute;
top: 0;
left: ${({ left }) => left};
width: 2px;
height: 38px;
margin-left: -1px;
background: ${({ bg }) => bg && bg === "error" ? "#B51A1A" : "#fff"};
opacity: .5;
`;

const ValueArrow = styled.div<{ arrowType: "up" | "down", contentWidth: string, left: string, arrowLeft: string, }>`
opacity: .5;

&::after {
    content: ${({ arrowType }) => arrowType === "up" ? '"▼"' : '"▲"'};
    position: absolute;
    ${({ arrowType }) => arrowType === "up" ? "top: -14px; margin-left: -6px;" : "top: 36px; margin-left: -6px;"}
    ${({ arrowLeft }) => `left: ${arrowLeft};`}
    font-size: 12px;
    color: #fff;
}

.arrow-span {
    position: absolute;
    ${({ arrowType }) => arrowType === "up" ? "top: -20px;" : "top: 44px;"}
    ${({ left }) => left ? `left: ${left};` : ""}
    ${({ contentWidth }) => contentWidth ? `width: ${contentWidth};` : ""}
    height: 16px;
    border: 2px solid #fff;
    ${({ arrowType }) => arrowType === "up" ? "border-bottom: 0;" : "border-top: 0;"}

    > div {
        margin: 0 -45px;
    }
}
`;

const ColorBar = styled.div`
height: 10px;
border-radius: 0 0 3px 3px;
`;


const colorArray = (max: number) => {
    const array = [
        { color: "rgb(181, 26, 26)", ratio: 100 },
        { color: "rgb(255, 141, 0)", ratio: 133 },
        { color: "rgb(36, 152, 62)", ratio: 166 }
    ];

    return `linear-gradient(to right, ${array.map(item => item.color + " " + getRatio(item.ratio / max * 100)).join(",")})`
}

interface BarProps {
    ratio: number
}

const Bar: React.FC<BarProps> = ({ ratio, ...other }) => {
    const [maxBar, setMaxBar] = useState(200);
    const { minRatio, maxRatio, optimalBoost, optimalRepay, enabled } = useSaverState();

    const background = useMemo(() => colorArray(maxBar), [maxBar]);

    const lineList = useMemo(() => {
        if (!minRatio && !maxRatio && !optimalBoost && !optimalRepay) return undefined;

        return [
            getRatio(100 / maxBar * 100),
            getRatio(Number(minRatio)),
            getRatio(Number(maxRatio)),
            getRatio(Number(optimalBoost)),
            getRatio(Number(optimalRepay)),
            getRatio(Number(minRatio) / maxBar * 100),
            getRatio(Number(maxRatio) / maxBar * 100),
            getRatio(Number(optimalBoost) / maxBar * 100),
            getRatio(Number(optimalRepay) / maxBar * 100),
            getRatio((Math.abs(Number(optimalBoost) - Number(maxRatio))) / maxBar * 100),
            getRatio((Math.abs(Number(optimalRepay) - Number(minRatio))) / maxBar * 100),
        ]
    }, [maxBar, minRatio, maxRatio, optimalBoost, optimalRepay]);

    const [error, minText, maxText, boostText, repayText, min, max, boost, repay, upWidth, downWidth] = lineList ?? [];

    return <BarWrapper {...other}>
        <ValueWrapper>
            <ValueBar width={getRatio(ratio / maxBar * 100)} />
            <ValueText>
                <Tips text={t`当前比例：` + numberRuler(ratio)}><Font fontSize="14px">{getRatio(ratio)}</Font></Tips>
            </ValueText>

            {lineList && <>
                <ValueLine left={error} bg="error" />
                <ValueLine left={min} />
                <ValueLine left={repay} />
                <ValueArrow arrowType="down" contentWidth={downWidth} left={minRatio > optimalRepay ? repay : min} arrowLeft={repay}>
                    <Tips text={t`如果低于 ${minText}，偿还至 ${repayText}`}>
                        <div className="arrow-span">
                            <Flex flexDirection={minRatio > optimalRepay ? undefined : "row-reverse"} justifyContent="space-between" style={{ marginTop: 12 }}>
                                <Font fontSize="14px">{repayText}</Font>
                                <Font fontSize="14px" style={{ borderBottom: "1px solid #fff" }}>{minText}</Font>
                            </Flex>
                        </div>
                    </Tips>
                </ValueArrow>

                {
                    enabled && <>
                        <ValueLine left={max} />
                        <ValueLine left={boost} />
                        <ValueArrow arrowType="up" contentWidth={upWidth} left={maxRatio > optimalBoost ? boost : max} arrowLeft={boost}>
                            <Tips text={t`如果超过 ${maxText}，则加杠杆至 ${boostText}`}>
                                <div className="arrow-span">
                                    <Flex flexDirection={maxRatio > optimalBoost ? undefined : "row-reverse"} justifyContent="space-between" style={{ marginTop: -12 }}>
                                        <Font fontSize="14px">{boostText}</Font>
                                        <Font fontSize="14px" style={{ borderTop: "1px solid #fff" }}>{maxText}</Font>
                                    </Flex>
                                </div>
                            </Tips>
                        </ValueArrow>
                    </>
                }
            </>}
        </ValueWrapper>

        <ColorBar style={{ background }} />
    </BarWrapper>
}


export default Bar;