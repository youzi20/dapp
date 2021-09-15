import React, { useEffect, useState } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import { showDom } from '../../HOC/show';

const Alert = (props: any) => {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export type Color = 'success' | 'info' | 'warning' | 'error';

interface SnackbarOrigin {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
}

interface MessageProps {
    open?: boolean
    text: string | React.ReactNode
    severity: Color
    anchorOrigin?: SnackbarOrigin
    onClose?: () => any
    onCloseAfter?: () => any
}

const Message: React.FC<MessageProps> = ({ open: propsOpen, text, severity, onClose, onCloseAfter }) => {
    const [open, setOpen] = useState<boolean>(propsOpen ?? true);

    const close = () => {
        if (onClose) {
            onClose();
        } else {
            setOpen(false);
        }
        onCloseAfter && onCloseAfter();
    }

    useEffect(() => {
        setOpen(propsOpen ?? true);
    }, [propsOpen]);

    return <Snackbar open={open} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} autoHideDuration={2000} onClose={close}>
        <Alert variant="filled" icon={false} severity={severity}>{text}</Alert>
    </Snackbar>
}


const message = {
    success(text: string | React.ReactNode) {
        showDom(Message, { text, severity: "success" });
    },
    error(text: string) {
        showDom(Message, { text, severity: "error" });
    }
}


export default Message;
export { message };