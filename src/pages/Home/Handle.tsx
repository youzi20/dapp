import React, { useState, useMemo, createContext, useContext, useEffect } from 'react';
import styled from 'styled-components';
import { t, Trans } from '@lingui/macro';

import Tips, { TipsInfo } from '../../components/Tips';
import { IconWrapper } from '../../components/Icon'
import Select, { SelectInterface, SelectValueInterface, SelectOptionItemWrapper } from '../../components/Select';
import Button, { ButtonStatus } from '../../components/Button';
import { message } from "../../components/Message";

import { useApprove } from '../../hooks/contract/erc20';


import { useAppDispatch } from '../../state/hooks';
import { updateConfigReload } from '../../state/config';
import { useState as useUserState } from '../../state/user';

import { Flex, Font, ButtonGroupGrid } from '../../styled';
import { HandleClass, getNumberTips } from '../../utils';

interface HandleContextprops {
    status?: "disabled" | "default"
    theme?: HandleClass
    max?: string
    approve?: boolean
    amount?: string
    token?: string
    tokenLoanType?: number
    tokenTo?: string
    tokenToLoanType?: number
    tokenAddress?: string
    tokenDecimals?: number
    handleButton?: { tips: string, disabled: boolean }
    setTheme?: (value: string) => void
    setAmount?: (value: string) => void
    setToken?: (value: string) => void
    setTokenLoanType?: (value: number) => void
    setTokenTo?: (value: string) => void
    setTokenToLoanType?: (value: number) => void
    setStatus?: (value: "disabled" | "default") => void
}

export const HandleContext = createContext<HandleContextprops>({});

const HandleWrapper = styled.div`
@media screen and (max-width: 768px) {
    padding: 15px;
}
`;

const AboveWrapper = styled.div`
display: flex;
align-items: center;
justify-content: space-between;
height: 18px;
line-height: 18px;
margin-bottom: 4px;

@media screen and (max-width: 768px) {
    height: auto;
    display: grid;
    grid-template-columns: 180px 120px;
    align-items: end;
    justify-items: end
}
`;

const AboveMaxWrapper = styled.div`
opacity: .7;
cursor: pointer;
transition: all .3s ease;

&:hover {
    opacity: 1;
}
`;

const BodyWrapper = styled.div`
position: relative;
display: flex;
flex-wrap: wrap;
height: 64px;
padding-left: 9px;
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
}

&.buy:before {
    ${({ theme }) => theme ? `background-color: #14bd88;` : ""}
}

&.sell:before {
    ${({ theme }) => theme ? `background-color: #cc5e47;` : ""}
}

@media screen and (max-width: 768px) {
    height: auto;
}
`;

const InputWrapper = styled.div<{ theme?: string }>`
flex: 1;

@media screen and (max-width: 768px) {
    flex: none;
    width: 100%;
    border-bottom: 1px solid var(--handle-border);
}

.input-label {
    flex: 1 0 auto;
    padding: 0 10px;
    line-height: 62px;
}

input {
    display: block;
    width: 100%;
    height: 62px;
    font-weight: bold;
    font-size: 20px;
    color: inherit;
    text-align: right;
    padding: 0 10px  0 0;
    border: none;
    background: transparent;
    min-width: 0;

    &:disabled {
        cursor: not-allowed;
    }
}

&.buy {
    color: ${({ theme }) => theme ? "#14bd88" : "#fff"};
}

&.sell {
    color: ${({ theme }) => theme ? "#cc5e47" : "#fff"};
}
`;

const SelectWrapper = styled.div`
flex: 0 0 auto;
width: 100px;
border-left: 1px solid var(--handle-border);

@media screen and (max-width: 768px) {
    flex: 1;
    height: 62px;

    &:nth-child(2) {
        border-left: none;
    }
}
`;

export const EmptyWrapper = styled.div`
display: flex;
flex-direction: column;
justify-content: space-around;
align-items: flex-end;
height: 62px;
padding: 14px 12px 5px 10px;
`;

export const EmptyIconWrapper = styled.div<{ size?: "small" | "normal" | "large" }>`
display: flex;
align-items: center;
justify-content: center;
border-radius: 3px;
background: var(--handle-empty);
${({ size = "normal" }) => {
        if (size === "small") {
            return `width: 100%; height: 20px;`
        } else {
            return `width: 75px; height: 42px; margin: 10px;`
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

const AboveMax: React.FC<{
    max?: string
}> = ({ max }) => {
    const { numUnit, numTips } = getNumberTips(max);

    return max ?
        <Tips text={numTips}><AboveMaxWrapper>{`(${t`最大值`} ${numUnit})`}</AboveMaxWrapper></Tips> :
        <Trans>加载中~</Trans>;
}

export const HandleAbove = ({ text }: {
    text?: React.ReactNode | string
}) => {
    const { max, setAmount } = useContext(HandleContext);

    const handleClick = () => {
        if (max && setAmount) setAmount(max);
    }

    return <>
        <Font size="13px" color="#939DA7">{text}</Font>
        <Font size="13px" color="#939DA7" onClick={handleClick}>
            <AboveMax max={max} />
        </Font>
    </>
}

export const HandleInput = ({ labelTips, labelText, disabled }: {
    labelTips: string | React.ReactNode
    labelText: string | React.ReactNode
    disabled?: boolean
}) => {
    const { status, theme, max, amount, setAmount } = useContext(HandleContext);

    const handleChange = (value: string) => {
        if (setAmount) {
            if (Number(value) < 0) value = "0";
            else if (max && Number(value) - Number(max) > 0) value = max;

            setAmount(value);
        }
    }

    return <InputWrapper className={theme ?? ""}>
        <label>
            <Flex alignItems="center">
                <div className="input-label">
                    <Font {...{ size: "16px", fontColor: "rgba(255, 255, 255, .5)" }}>
                        <Flex alignItems="center">
                            <TipsInfo text={labelTips} />
                            <span>{labelText}:</span>
                        </Flex>
                    </Font>
                </div>
                <input
                    type="number"
                    placeholder="0"
                    value={amount}
                    disabled={status === "disabled"}
                    onChange={(e: any) => handleChange(e.target.value)}
                />
            </Flex>
        </label>
    </InputWrapper>
}

interface HandleSelectInterface extends SelectInterface {
    type?: "from" | "to"
}

const SelectEmpty: React.FC<{
    text?: string
}> = ({ text }) => {

    const SelectIcon = (<Tips text={t`此操作无可用的抵押品或借贷资产。`}>
        <EmptyIconWrapper size={text ? "small" : "normal"}>
            <IconWrapper name="dapp-disable" size="24px" color="#b1b4b7" />
        </EmptyIconWrapper>
    </Tips>)

    if (!text) return SelectIcon;

    return <EmptyWrapper>
        {SelectIcon}
        <Font size="12px" color="#939DA7">{text}</Font>
    </EmptyWrapper>
}

export const HandleSelect = ({
    type = "from",
    dataSource,
    ...other
}: HandleSelectInterface) => {
    const { status, token, tokenTo, setToken, setTokenLoanType, setTokenTo, setTokenToLoanType } = useContext(HandleContext);

    const [value, setValue] = useState<any>();

    const handleChange = (item: SelectValueInterface | any) => {
        if (type === "from") {
            setToken && setToken(item.value);
            setTokenLoanType && setTokenLoanType(item.loanType);
        } else {
            setTokenTo && setTokenTo(item.value);
            setTokenToLoanType && setTokenToLoanType(item.loanType);
        }
    }

    useEffect(() => {
        if (dataSource?.length && (type === "from" ? !token : !tokenTo)) setValue(dataSource[0]);
    }, [dataSource]);

    return <SelectWrapper>
        {dataSource?.length ?
            <Select
                {...{ dataSource, ...other }}
                onChange={handleChange}
                value={value}
                disabled={status === "disabled"}
                // render={<Font size="16px">{symbol}</Font>}
                // optionItemRender={selectOptionItemRender}
                optionPopoverProps={{ style: { maxHeight: 240 } }}
            /> :
            <SelectEmpty />}
    </SelectWrapper>
}

export const ValueRender = (props: any) => {
    const { option, text } = props;

    return <>
        <Font size="16px">{option?.name}</Font>
        <Font size="12px" fontColor="#939DA7">{text ?? (option?.loanType === 2 ? t`Stable` : t`Variable`)}</Font>
    </>
}

export const SelectOptionItem = (props: any) => {
    const { option, item, handleChange } = props;
    const { name, value, loanType } = item;

    return <SelectOptionItemWrapper
        className={option.value === value && option.loanType === loanType ? "active" : ""}
        onClick={() => handleChange(item)}
    >
        <Font size="14px">{name}</Font>
        <Font size="12px" fontColor="#939DA7">{loanType === 2 ? t`Stable` : t`Variable`}</Font>
    </SelectOptionItemWrapper>
}


export const ApproveButton = () => {
    const dispatch = useAppDispatch();

    const { address } = useUserState();
    const { token, tokenAddress, setStatus } = useContext(HandleContext);

    const [buttonStatus, setButtonStatus] = useState<ButtonStatus>();

    const approve = useApprove(token !== "ETH" ? tokenAddress : undefined);

    const handleClick = () => {
        setButtonStatus("loading");
        setStatus && setStatus("disabled");

        approve(address)
            .then((res: any) => {
                console.log(res);
                res.wait()
                    .then((res: any) => {
                        console.log(res);
                        message.success(t`授权成功`);

                        dispatch(updateConfigReload());
                        setButtonStatus(undefined);
                        setStatus && setStatus("default");
                    }).catch((error: any) => {
                        message.error(error.message);
                        console.error(error);
                        setButtonStatus(undefined);
                        setStatus && setStatus("default");
                    });
            })
            .catch((error: any) => {
                message.error(error.message);
                console.error(error);
                setButtonStatus(undefined);
                setStatus && setStatus("default");
            });
    }

    return <Button status={buttonStatus} onClick={handleClick}>
        <Tips text={t`授权 DS 操作您的 ${token}`}>
            <Trans>授权</Trans>
        </Tips>
    </Button>
}

export const HandleButton = ({ status, children, onClick }: {
    status?: ButtonStatus
    children?: React.ReactNode | string
    onClick?: () => void
}) => {
    const { theme, approve, handleButton } = useContext(HandleContext);

    let tips, disabled;

    if (approve) {
        disabled = true;
        tips = t`需要先进行授权操作`;
    } else {
        disabled = handleButton?.disabled;
        tips = handleButton?.tips;
    }

    return <Button
        theme={theme}
        status={status ?? (disabled ? "disabled" : "default")}
        onClick={onClick}
    >
        <Tips text={tips} >
            <div>{children}</div>
        </Tips>
    </Button>
}

const Handle = ({ above, body, button, buttonColumn }: {
    above: React.ReactNode
    body: React.ReactNode
    button: React.ReactNode
    buttonColumn?: number
}) => {
    const { theme } = useContext(HandleContext);

    return <HandleWrapper>
        <AboveWrapper>{above}</AboveWrapper>
        <BodyWrapper className={theme ?? ""}>{body}</BodyWrapper>
        <ButtonGroupGrid column={buttonColumn}>{button}</ButtonGroupGrid>
    </HandleWrapper>
}

export default Handle;