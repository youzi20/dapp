import React, { useState } from 'react';
import { createPortal } from 'react-dom';

import { useEnhancedEffect } from '../../hooks/enhancedHooks';
import { getContainer } from '../../utils';


interface PortalInterface {
    disablePortal?: boolean
    container?: React.ReactNode
    children?: React.ReactNode
}

export default function Portal(props: PortalInterface) {
    const { children, container, disablePortal = false } = props;
    const [mountNode, setMountNode] = useState<Element>(document.body);

    useEnhancedEffect(() => {
        if (!disablePortal && container) {
            setMountNode(getContainer(container));
        }
    }, [container, disablePortal]);

    if (!disablePortal) return <></>;

    return mountNode ? createPortal(children, mountNode) : mountNode;
}