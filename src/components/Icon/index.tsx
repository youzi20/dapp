import React from 'react';
import styled from 'styled-components';


interface BasePros extends React.SVGAttributes<SVGSVGElement> {
    name: string
    className?: string
}

const Base = ({ className, name, ...other }: BasePros) => {

    return <svg
        className={"dapp-icon " + (className || "")}
        aria-hidden="true"
        {...other}>
        <use xlinkHref={"#" + name} />
    </svg>
};


interface IconProps extends BasePros {
    link?: string
    blank?: boolean
    linkProps?: any
}

const Icon = ({ link, blank, linkProps, ...other }: IconProps) => {
    return link ?
        <a href={link} target={blank ? "_blank" : ""} {...linkProps}>
            <Base {...other} />
        </a> :
        <Base {...other} />
}

interface WrapperProps extends IconProps {
    size?: string
    iconColor?: string
    iconCursor?: boolean
}

export const IconWrapper = styled(({ className, style, name }: WrapperProps) => {
    return <div {...{ className, style }}><Base name={name} /></div>
})`
font-size:  ${({ size }) => size ?? "inherit"};
color: ${({ iconColor }) => iconColor ?? "inherit"};
height: 1em;
line-height: 1em;
${({ iconCursor = false }) => iconCursor ? "cursor: pointer;" : ""}
`;


export const LoadingIcon = styled(({ size, iconColor, ...other }: Omit<WrapperProps, 'name'>) => {
    return <IconWrapper name="dapp-loading" {...{ size: size ?? "50px", iconColor: iconColor ?? "#37B06F", ...other }} />
})`

${({ iconCursor = false }) => iconCursor ? "cursor: pointer;" : ""}
animation: 2s linear 0s infinite normal none running LoadingAnimation;
`;

export const SuccessIcon = styled(({ size, ...other }: { background?: string } & Omit<WrapperProps, 'name'>) => {
    return <IconWrapper name="dapp-checked" {...{ size: size ?? "12px", iconColor: "#fff", ...other }} />
})`
display: flex;
justify-content: center;
align-items: center;
width: 1.5em;
height: 1.5em;
background: ${({ background }) => background ?? "#0CA700"};
border-radius: 50%;
`;




export default Icon;