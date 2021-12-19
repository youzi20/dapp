import React from 'react';
import styled from 'styled-components';
import ButtonUi from '@material-ui/core/Button';
import { LoadingIcon } from '../Icon';


const ButtonWrapper = styled.div<{ theme: string[], size?: "lg" | "default" | "sm" }>`
.button-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    color: #fff;
    line-height: 16px;
    ${({ size }) => size === "sm" ? "padding: 7px 15px;" : "padding: 14px 32px;"}
    border-radius: 3px;
    background-color: ${({ theme }) => theme[0]};
    transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

button:disabled .button-box {
    background-color:  ${({ theme }) => theme[2]};
    color: ${({ theme }) => theme[3]};
    cursor: not-allowed;
}

button:not(:disabled):hover .button-box{
    background-color:  ${({ theme }) => theme[1]};
}
`;



const ThemeList = {
    primary: ["#37B06F", "#239C5B", "#1A4A30", "#89A998"],
    gray: ["#61717E", "#7F8F9C", "#61717E", "#89939D"],
    buy: ["#318D70", "#14bd88", "#61717E", "#89939D"],
    sell: ["#C26E5C", "#ca604a", "#61717E", "#89939D"],
}

export type ButtonStatus = "default" | "disabled" | "loading" | undefined;

export type ButtonTheme = keyof typeof ThemeList;

const Button: React.FC<{
    theme?: ButtonTheme
    size?: "lg" | "default" | "sm"
    status?: ButtonStatus
    style?: any
    onClick?: () => void
}> = ({ theme = "primary", size, children, status = "default", ...other }) => {

    return <ButtonWrapper className="button-wrap" theme={ThemeList[theme]} size={size}>
        <ButtonUi {...other} disabled={status !== "default"}  >
            <div className="button-box">
                {status === "loading" ? <LoadingIcon size="14px" iconColor="#89939D" style={{ marginRight: 4 }} /> : null}
                {children}
            </div>
        </ButtonUi>
    </ButtonWrapper >
}

export default Button;