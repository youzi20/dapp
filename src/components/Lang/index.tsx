import styled from "styled-components";

import { Font } from "../../styled";

import usePopover from '../../hooks/popover';

import { SupportedLocale, useActiveLocale } from "../../hooks/lang";

import { useAppDispatch } from '../../state/hooks';
import { updateUserLocale } from "../../state/lang";


import { DropWrapper, DropOption } from "../../styled";

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
            <Font fontSize="14px">{LANG_LIST[locale][1]}</Font>
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
            <DropWrapper>
                {Object.entries(LANG_LIST).map(([key, value]) => {
                    return <DropOption
                        key={key}
                        width="100px"
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
                    </DropOption>
                })}
            </DropWrapper>
        </Popover>
    </>

}



export default Lang;