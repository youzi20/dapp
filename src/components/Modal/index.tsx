import React from 'react';
import styled from 'styled-components';

import { t } from '@lingui/macro';

import Button from '../Button';
import Portal from '../Portal';
import { showDom } from '../../HOC/show';

const ModalWrapper = styled.div`
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
display: flex;
align-items: center;
justify-content: center;
z-index: 9;
`;

const ModalContent = styled.div`
min-width: 350px;
border-radius: 3px 3px 0 0;
background: var(--modal);
box-shadow: var(--modal-shadow);
`;

const ModalTitle = styled.div`
display: flex;
justify-content: flex-start;
font-weight: 600;
color: #fff;
align-items: center;
line-height: 17px;
padding: 15px 20px;
border-radius: 3px 3px 0 0;
background-color: var(--modal-title);
`;

const ModalBody = styled.div`
padding: 30px 20px;
background: var(--modal-body);
`;

const ModalFooter = styled.div`
display: inline-flex;
float: right;

.button-wrap  {
    &:first-child .button-box {
        border-radius: 0;
        border-bottom-left-radius: 3px;
    }

    &:last-child .button-box {
        border-radius: 0;
        border-bottom-right-radius: 3px;
    }
}
`;

interface ButtonInterface {
    text?: string
    disabled?: boolean
    loading?: boolean
    onClick?: () => void
}

interface ModalContainerInterface {
    title?: string | React.ReactNode
    width?: number | string
    cancelButtonProps?: ButtonInterface
    confirmButtonProps?: ButtonInterface
}

const ModalWrap: React.FC<ModalContainerInterface> = ({ children, title, width, cancelButtonProps, confirmButtonProps }) => {

    return <ModalWrapper>
        <div style={{ width }}>
            <ModalContent>
                <ModalTitle>{title ?? ""}</ModalTitle>
                <ModalBody>{children}</ModalBody>
            </ModalContent>
            <ModalFooter>
                <Button
                    theme="gray"
                    disabled={confirmButtonProps?.loading}
                    onClick={cancelButtonProps?.onClick}
                >
                    {cancelButtonProps?.text ?? t`取消`}
                </Button>
                <Button
                    theme="primary"
                    disabled={confirmButtonProps?.disabled}
                    loading={confirmButtonProps?.loading}
                    onClick={confirmButtonProps?.onClick}
                >
                    {confirmButtonProps?.text ?? t`确认`}
                </Button>
            </ModalFooter>
        </div>
    </ModalWrapper>
}

interface ModalInterface extends ModalContainerInterface {
    open?: boolean
}

interface ModalFuncProps extends ModalContainerInterface {
    content?: string | React.ReactNode
}

const Modal: React.FC<ModalInterface> = ({ open, ...other }) => {

    return <Portal disablePortal={open}>
        <ModalWrap {...other} />
    </Portal>
}


export default Modal;

export const modal = {
    show({ content, ...other }: ModalFuncProps) {
        showDom(ModalWrap, { children: content, ...other });
    }
}

