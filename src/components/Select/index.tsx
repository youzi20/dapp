import React, { useEffect, useState, cloneElement, isValidElement } from 'react';
import styled from 'styled-components';

import { IconWrapper } from '../Icon';

import usePopover from '../../hooks/popover';
import { Font } from '../../styled';


const selectDefaultDatasource = (dataSource: (string | SelectValueInterface)[]) => {
    return dataSource.map(item => (typeof item === "string" ? { name: item, value: item } : item));
}

const selectDefaultValue = (defaultValue: string | SelectValueInterface) => {
    return typeof defaultValue === "string" ? { value: defaultValue, name: defaultValue } : defaultValue;
}

const SelectStyle = styled.div<{ width?: string, height?: string }>`
width: ${({ width }) => width ?? "100%"};
height: ${({ height }) => height ?? "100%"};
background-color: var(--select);

&.active {
    background-color: var(--select-active);
}
`;

const SelectValueStyle = styled.div<{ disabled?: boolean }>`
display: flex;
justify-content: space-between;
align-items: center;
height: 100%;
padding-left: 15px;

${({ disabled }) => disabled ? "pointer-events: none;" : "cursor: pointer;"}

img {
    flex: 0 1 auto;
    margin: 8px;
}
`;

const OptionWrapper = styled.div`
width: 100px;
`;

const OptionItemList = styled.div`
background-color: var(--select-option);
`;

export const OptionItemWrapper = styled.div`
display: grid;
align-content: center;
grid-row-gap: 2px;
padding: 10px;
cursor: pointer;

&:not(.active):hover {
    background: var(--select-option-hover);
}

&.active {
    background: var(--select-option-active);
}
`;

interface SelectValueInterface {
    name: string | React.ReactNode,
    value: number | string
}

interface OptionitemInterface {
    className?: string
    name: string
    onClick: () => void
}


const OptionItem: React.FC<OptionitemInterface> = ({ name, ...other }) => {
    return <OptionItemWrapper {...other}><Font fontSize="14px">{name}</Font></OptionItemWrapper>
}


const Select: React.FC<{
    width?: string
    height?: string
    dataSource: (SelectValueInterface | string)[]
    defaultValue?: any
    disabled?: boolean
    value?: string | SelectValueInterface
    render?: string | React.ReactNode
    optionItemRender?: React.ReactNode
    optionPopoverProps?: {}
    onChange?: (value: SelectValueInterface) => void
}> = ({ dataSource: propsDataSource, defaultValue: propsDefaultValue, value: propsValue, render, optionItemRender, optionPopoverProps, disabled, onChange, ...other }) => {
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
            setValue(selectDefaultValue(propsValue));
        }
    }, [propsValue]);

    return <SelectStyle className={open ? "active" : ""} {...other} >
        <SelectValueStyle disabled={disabled} onClick={(e) => setAnchorEl(e.currentTarget)}>
            <div>{render || <Font fontSize="16px">{value?.name}</Font>}</div>
            <IconWrapper name="dapp-drop-down" style={{ color: "#fff", flex: "0 1 auto", margin: 8 }} />
        </SelectValueStyle>

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
            <OptionWrapper {...optionPopoverProps}>
                <OptionItemList>
                    {dataSource?.map((item: any) => {
                        if (isValidElement(optionItemRender)) {
                            return cloneElement(optionItemRender, { active: value && value.value === item.value, item, handleChange });
                        }

                        return <OptionItem
                            className={value && value.value === item.value ? "active" : ""}
                            name={item.name}
                            key={item.value}
                            onClick={() => handleChange(item)}
                        />
                    })}
                </OptionItemList>
            </OptionWrapper>
        </Popover>
    </SelectStyle>
}


export default Select;