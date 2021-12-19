import styled from "styled-components";

import { Font } from "../../styled";

import usePopover from '../../hooks/popover';

import { SupportedLocale, useActiveLocale } from "../../hooks/lang";

import { useAppDispatch } from '../../state/hooks';
import { updateUserLocale } from "../../state/lang";


import { OptionWrapper, OptionItemWrapper } from "../../styled";

const LangButton = styled.div`
display: flex;
align-items: center;
justify-content: center;
width: 38px;
height: 38px;
border-radius: 3px;
background: var(--wallet-button);
cursor: pointer;
`;

const LangOptionItemWrapper = styled(OptionItemWrapper)`
width: 100px;
font-size: 14px;
color: #fff;
padding: 10px;
`;

const LANG_LIST: { [key in SupportedLocale]: string[] } = {
    "zh-CN": ["中文", "ZH"],
    "en-US": ["English", "EN"],
}

const Lang = () => {
    const dispatch = useAppDispatch();
    const locale = useActiveLocale();

    const { setAnchorEl, Popover } = usePopover();

    const changeLocale = (val: SupportedLocale) => {
        dispatch(updateUserLocale(val));
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    return <>
        <LangButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Font size="14px">{LANG_LIST[locale][1]}</Font>
        </LangButton>
        <Popover
            style={{ marginTop: 5 }}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
        >
            <OptionWrapper>
                {Object.entries(LANG_LIST).map(([key, value]) => {
                    return <LangOptionItemWrapper
                        key={key}
                        className={key === locale ? "active" : ""}
                        onClick={() => {
                            if (key === locale) return;
                            // setActive(item);
                            setAnchorEl(null);
                            // @ts-ignore
                            changeLocale(key);
                        }}
                    >
                        {value[0]}
                    </LangOptionItemWrapper>
                })}
            </OptionWrapper>
        </Popover>
    </>

}



export default Lang;