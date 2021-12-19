import React from 'react';
import styled from 'styled-components';

import { t } from '@lingui/macro';

import { IconWrapper } from '../Icon';
import Button, { ButtonStatus } from '../Button';
import Portal from '../Portal';
import { showDom } from '../../HOC/show';

import { Font } from '../../styled';

import { TIPS_WARNING_BG } from '../../utils/images';

type ModalType = 'warning' | 'primary';

const ModalWrapper = styled.div`
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
display: flex;
align-items: center;
justify-content: center;
background: rgba(32,41,47,0.9);
z-index: 9;
`;

const ModalClose = styled.div`
display: flex;
justify-content: flex-end;
padding: 20px 0;
`;

const ModalContent = styled.div`
min-width: 350px;
border-radius: 3px;
overflow: hidden;
background: var(--modal);
`;

const ModalHeader = styled.div<{ type?: ModalType }>`
display: flex;
align-items: flex-end;
font-size: 20px;
font-weight: 600;
color: #fff;
height: 100px;
line-height: 24px;
padding: 20px 16px;
border-radius: 3px 3px 0 0;
${({ type }) => type === "warning" ?
        `background: rgb(242 201 76 / 50%) url(${TIPS_WARNING_BG}) no-repeat calc(100% - 15px) center;` :
        "background-color: var(--modal-title);"
    }
`;

const ModalBody = styled.div`
padding: 30px 20px;
background: var(--modal-body);
`;

const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    border-top: 3px solid #37B06F;

    .button-wrap {
        .button-box {
            border-radius: 0;
        }

        &:first-child .button-box {
            border-bottom-left-radius: 3px;
        }

        &:last-child .button-box {
            border-bottom-right-radius: 3px;
        }
    }
`;

interface ModalContainerInterface {
    type?: ModalType
    title?: string | React.ReactNode
    width?: number | string
    cancelButton?: boolean
    confirmButton?: boolean
    cancelText?: string | React.ReactNode
    confirmText?: string | React.ReactNode
    cancelStatus?: ButtonStatus
    confirmStatus?: ButtonStatus
    onClose?: () => void
    onCancel?: () => void
    onConfirm?: () => void
}

const ModalWrap: React.FC<ModalContainerInterface> = ({
    type = "primary",
    title,
    width,
    cancelButton = true,
    confirmButton = true,
    cancelStatus,
    confirmStatus,
    cancelText = t`取消`,
    confirmText = t`确认`,
    onClose,
    onCancel,
    onConfirm,
    children,
}) => {

    return <ModalWrapper>
        <div style={{ width }}>
            <ModalClose>
                <Font size="24px" onClick={onClose || onCancel}><IconWrapper iconCursor iconColor="#FFF" name="dapp-close" /></Font>
            </ModalClose>
            
            <ModalContent>
                <ModalHeader type={type}>{title ?? ""}</ModalHeader>

                <ModalBody>{children}</ModalBody>
            </ModalContent>
            <ModalFooter>
                {cancelButton &&
                    <Button  {...{ theme: "gray", status: cancelStatus, onClick: onCancel }}>
                        {cancelText}
                    </Button>}

                {confirmButton &&
                    <Button {...{ theme: "primary", status: confirmStatus, onClick: onConfirm }}>
                        {confirmText}
                    </Button>}
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

