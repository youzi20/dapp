import { useState, useEffect, useMemo } from "react";
import { Trans, t } from "@lingui/macro";

import Tips, { TipsInfo } from "../../components/Tips";
import Button from "../../components/Button";
import Select from '../../components/Select';
import { message } from "../../components/Message";

import { useApprove, useAllowance } from '../../hooks/contract/erc20';

import { useState as useUserState } from "../../state/user";

import { Font, Flex } from '../../styled';

import { fullNumber, getHandleTheme } from "../../utils";

import { HandleTheme } from "../../types";

import { HandleText, HandleWrapper, InputControl, SelectControl, SelectEmpty } from './styled';

const Handle: React.FC<{
    type: HandleTheme
    max?: string
    labelText: string | React.ReactNode
    labelTips: string | React.ReactNode
    coins: any[]
    theme?: string
    leftText?: string | React.ReactNode
    rightText?: string | React.ReactNode
    isAuthorize?: boolean
    inputValue?: string
    selectValue?: string
    selectOptionItemRender?: React.ReactNode
    buttonProps: {
        text: string | React.ReactNode
        theme: "primary" | "gray" | "buy" | "sell"
        loading?: boolean
        click?: () => void
    }
    onInputChange?: (value: string | undefined) => void
    onSelectChange?: (value: string) => void
}> = ({
    type,
    labelText,
    labelTips,
    max,
    leftText,
    rightText,
    coins,
    isAuthorize,
    inputValue,
    selectValue,
    selectOptionItemRender,
    buttonProps,
    onInputChange,
    onSelectChange
}) => {
        const [value, setValue] = useState<string | null>(null);
        const [token, setToken] = useState<string | null>(null);
        const [loading, setLoading] = useState<boolean>(false);

        const { address } = useUserState();

        const [symbol] = token ? token.split("_") : [];

        const approve = useApprove(symbol !== "ETH" ? symbol : null);

        const { allowance, reload: reloadAllowance } = useAllowance(symbol);

        // console.log("allowance", allowance);

        const theme = useMemo(() => getHandleTheme(type), [type]);

        const isShowAuthorizeBtn = useMemo(() =>
            isAuthorize && token && token !== "ETH" && Number(allowance) < Number(value)
            , [isAuthorize, token, value, allowance]);

        const isDisabled = useMemo(() => {
            if (isShowAuthorizeBtn) {
                return { tips: t`需要先进行授权操作`, disabled: true }
            } else if (!coins.length) {
                return { tips: t`暂无可操作币种`, disabled: true }
            } else if (!value) {
                return { tips: t`未输入值`, disabled: true }
            } else if (Number(value) > Number(max)) {
                return { tips: t`数值大于最大值`, disabled: true }
            } else if (Number(value) <= 0) {
                return { tips: t`数值不能小于0`, disabled: true }
            } else return { tips: "", disabled: false }
        }, [isShowAuthorizeBtn, coins, value, max]);

        const handleInputChange = (value: any) => {
            setValue(value);
            onInputChange && onInputChange(value);
        };

        const handleSelectChange = (select: any) => {
            setToken(select.value);
            onSelectChange && onSelectChange(select.value);
        }

        const handleApprove = () => {
            setLoading(true);

            approve(address)
                .then((res: any) => {
                    console.log(res);
                    res.wait()
                        .then((res: any) => {
                            console.log(res);
                            message.success(t`授权成功`);
                            setLoading(false);
                            reloadAllowance();
                        }).catch((error: any) => {
                            message.error(error.message);
                            console.error(error);
                            setLoading(false);
                        });
                })
                .catch((error: any) => {
                    message.error(error.message);
                    console.error(error);
                    setLoading(false);
                });
        }

        useEffect(() => {
            if (inputValue !== value) {
                setValue(inputValue ?? null);
            }
        }, [inputValue])

        useEffect(() => {
            if (!token || selectValue !== token) {
                setToken(selectValue ?? null);
            }
        }, [selectValue]);

        return <div>
            <HandleText>
                <Font fontSize="13px" color="#939DA7">{leftText}</Font>
                <Font fontSize="13px" color="#939DA7" onClick={() => handleInputChange(max)}>{rightText}</Font>
            </HandleText>
            <HandleWrapper theme={theme}>
                <InputControl theme={theme}>
                    <label>
                        <Flex alignItems="center">
                            <div className="input-label">
                                <Font {...{ fontSize: "16px", color: "rgba(255, 255, 255, .5)" }}>
                                    <Flex alignItems="center">
                                        <TipsInfo text={labelTips} />
                                        <span>{labelText}</span>
                                    </Flex>
                                </Font>
                            </div>
                            <input disabled={loading || buttonProps?.loading} type="number" placeholder="0" value={value ?? ""} onChange={(e: any) => handleInputChange(e.target.value)} />
                        </Flex>
                    </label>
                </InputControl>

                {coins?.length ?
                    <SelectControl>
                        <Select
                            disabled={loading || buttonProps?.loading}
                            render={<Font fontSize="16px">{symbol}</Font>}
                            value={token ?? ""}
                            dataSource={coins}
                            optionItemRender={selectOptionItemRender}
                            optionPopoverProps={{ style: { maxHeight: 240 } }}
                            onChange={handleSelectChange}
                        />
                    </SelectControl> :
                    <SelectEmpty />}
            </HandleWrapper>
            <Flex justifyContent="flex-end">
                {isShowAuthorizeBtn &&
                    <Button
                        theme="primary"
                        style={{ marginRight: 10 }}
                        loading={loading}
                        onClick={handleApprove}
                    >
                        <Trans>授权</Trans>
                    </Button>}

                <Button
                    disabled={isDisabled.disabled}
                    theme={buttonProps.theme}
                    loading={buttonProps.loading}
                    onClick={buttonProps.click}
                >
                    <Tips text={isDisabled.tips} >
                        <div>{buttonProps.text}</div>
                    </Tips>
                </Button>

            </Flex>
        </div>
    }


export default Handle;