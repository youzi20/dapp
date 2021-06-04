import React, { useState } from "react"
import PopoverUi from '@material-ui/core/Popover';

export interface PopoverOrigin {
    vertical: 'top' | 'center' | 'bottom' | number;
    horizontal: 'left' | 'center' | 'right' | number;
}

const anchorOriginDefault = {
    vertical: 'bottom',
    horizontal: 'center',
};

const transformOriginDefault = {
    vertical: 'top',
    horizontal: 'center',
}

interface PopoverInterface {
    anchorOrigin?: PopoverOrigin | undefined;
    transformOrigin?: PopoverOrigin | undefined;
}

const usePopover = (): [(e: Element | null) => any, React.FC<React.ReactNode & PopoverInterface>] => {
    const [anchorEl, setAnchorEl] = useState<Element | null>(null);

    const open = Boolean(anchorEl);

    const Popover = (props: PopoverInterface) => {
        const { anchorOrigin, transformOrigin, ...other } = props;

        return <PopoverUi
            open={open}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            // @ts-ignore
            anchorOrigin={anchorOrigin ?? anchorOriginDefault}
            // @ts-ignore
            transformOrigin={transformOrigin ?? transformOriginDefault}
            {...other}
        />
    }

    return [setAnchorEl, Popover]
}


export default usePopover;