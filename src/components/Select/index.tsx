import React, { useEffect, useState, cloneElement, isValidElement } from 'react';
import styled from 'styled-components';

import { IconWrapper } from '../Icon';

import usePopover from '../../hooks/popover';
import { Font, OptionWrapper, OptionItemWrapper } from '../../styled';


const selectDefaultDatasource = (dataSource: (string | SelectValueInterface)[]) => {
    return dataSource.map(item => (typeof item === "string" ? { name: item, value: item } : item));
}

const selectDefaultValue = (defaultValue: string | SelectValueInterface) => {
    return typeof defaultValue === "string" ? { value: defaultValue, name: defaultValue } : defaultValue;
}

const SelectWrapper = styled.div<{ width?: string, height?: string, disabled?: boolean }>`
width: ${({ width }) => width ?? "100%"};
height: ${({ height }) => height ?? "100%"};
background-color: var(--select);

${({ disabled }) => disabled ? "cursor: not-allowed;" : "cursor: pointer;"}

&.active {
    background-color: var(--select-active);
}
`;

const SelectValueWrapper = styled.div<{ disabled?: boolean }>`
display: flex;
justify-content: space-between;
align-items: center;
height: 100%;
padding-left: 15px;


${({ disabled }) => disabled && "pointer-events: none;"}

img {
    flex: 0 1 auto;
    margin: 8px;
}
`;

export const SelectOptionItemWrapper = styled(OptionItemWrapper)`
font-size: 14px;
color: #fff;
padding: 10px;
`;

export interface SelectInterface {
    contentWidth?: string
    contentHeight?: string
    contentMaxHeight?: string
    height?: string
    dataSource: (SelectValueInterface | string)[]
    defaultValue?: any
    disabled?: boolean
    value?: string | SelectValueInterface
    valueRender?: string | React.ReactNode
    optionItemRender?: React.ReactNode
    optionPopoverProps?: {}
    onChange?: (value: SelectValueInterface) => void
}

export interface SelectValueInterface {
    name: string | React.ReactNode,
    value: string | number
}

const Select = ({
    dataSource: propsDataSource,
    defaultValue: propsDefaultValue,
    value: propsValue,
    valueRender,
    optionItemRender,
    optionPopoverProps,
    contentWidth = "100px",
    contentHeight,
    contentMaxHeight,
    disabled,
    onChange,
    ...other
}: SelectInterface) => {
    const [dataSource, setDataSource] = useState(selectDefaultDatasource(propsDataSource));
    const [value, setValue] = useState(selectDefaultValue(propsDefaultValue));
    const { open, setAnchorEl, Popover } = usePopover();

    const handleChange = (value: any) => {
        onChange && onChange(value);
        setValue(value);
        setAnchorEl(null);
    }

    useEffect(() => {
        setDataSource(selectDefaultDatasource(propsDataSource));
    }, [propsDataSource]);

    useEffect(() => {
        setValue(selectDefaultValue(propsDefaultValue));
    }, [propsDefaultValue])

    useEffect(() => {
        if (propsValue) {
            const value = selectDefaultValue(propsValue);
            setValue(value);
            onChange && onChange(value);
        }
    }, [propsValue]);

    const valueDom = (isValidElement(valueRender) && cloneElement(valueRender, { option: value })) || <Font size="16px">{value?.name}</Font>

    return <SelectWrapper className={open ? "active" : ""} disabled={disabled} {...other} >
        <SelectValueWrapper disabled={disabled} onClick={(e) => setAnchorEl(e.currentTarget)}>
            <div>{valueDom}</div>
            <IconWrapper name="dapp-drop-down" style={{ color: "#fff", flex: "0 1 auto", margin: 8 }} />
        </SelectValueWrapper>

        <Popover
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
        >
            <OptionWrapper {...{ contentWidth, contentHeight, contentMaxHeight }}>
                {dataSource?.map((item: any) => {
                    if (isValidElement(optionItemRender)) {
                        return cloneElement(optionItemRender, { option: value, item, handleChange });
                    }

                    return <SelectOptionItemWrapper
                        key={item.value}
                        className={value && value.value === item.value ? "active" : ""}
                        // contentWidth="100px"
                        onClick={() => handleChange(item)}
                    >
                        {item.name}
                    </SelectOptionItemWrapper>
                })}
            </OptionWrapper>
        </Popover>
    </SelectWrapper >
}

export const ThemeSelect = styled(Select)`
width: 200px;
height: 44px;
margin-left: 20px;
border-radius: 3px;
background: #37B06F;
`;

export default Select;