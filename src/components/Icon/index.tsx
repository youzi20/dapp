import React, { useEffect, useState } from 'react';
import styled from 'styled-components';


interface IconProps extends React.SVGAttributes<SVGSVGElement> {
    className?: string
    name: string
    link?: string
    blank?: boolean
    isHover?: boolean
}

const Base: React.FC<IconProps> = (props) => {
    const { className, name: propsName, isHover, ...other } = props;
    const [name, setName] = useState(propsName);


    useEffect(() => {
        setName(propsName ?? name);
    }, [propsName]);

    useEffect(() => {
        setName(propsName);
    }, [propsName]);

    return <svg
        className={"dapp-icon " + (className || "")}
        aria-hidden="true"
        {...other}>
        <use xlinkHref={"#" + name} />
    </svg>
};

const Icon: React.FC<IconProps> = (props) => {
    const { link, blank, ...other } = props;
    return link ?
        <a href={link} target={blank ? "_blank" : ""}>
            <Base {...other} />
        </a> :
        <Base {...other} />
}


export const IconWrapper = styled(({ className, style, name, ...other }: {
    className?: string
    fontSize?: string
    color?: string
    name: string
    style?: any
}) => {
    return <div {...{ className, style }}><Base name={name} /></div>
})`
font-size:  ${({ fontSize }) => fontSize ?? "inherit"};
color: ${({ color }) => color ?? "inherit"};
line-height: 1em;
`;


export const LoadingIcon = styled(({ className, style, ...other }: {
    className?: string
    fontSize?: string
    color?: string
    style?: any
}) => {
    return <div {...{ className, style }}><Base name="dapp-loading" /></div>
})`
font-size:  ${({ fontSize }) => fontSize ?? "50px"};
color: ${({ color }) => color ?? "#37B06F"};
height: 1em;
animation: 2s linear 0s infinite normal none running LoadingAnimation;
`;

export const SuccessIcon = styled(({ className, style, ...other }: {
    className?: string
    fontSize?: string
    background?: string
    style?: any
}) => {
    return <div {...{ className, style }}><Base name="dapp-checked" /></div>
})`
display: flex;
justify-content: center;
align-items: center;
font-size:  ${({ fontSize }) => fontSize ?? "12px"};
color: #fff;
width: 1.5em;
height: 1.5em;
background: ${({ background }) => background ?? "#0CA700"};
border-radius: 50%;
`;




export default Icon;