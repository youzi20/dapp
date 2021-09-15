import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

const withShowDom = (WrappedComponent: any, props: any, unmount: () => void) => {
    return class extends React.Component {

        render() {
            return <WrappedComponent {...props} onCloseAfter={unmount} />
        }
    }
}

export const showDom = (WrappedComponent: any, props: any) => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const unmount = () => {
        setTimeout(() => {
            // unmountComponentAtNode(container);
            // container.parentNode && container.parentNode.removeChild(container);
        }, 1000);
    }

    const NodeWithShow = withShowDom(WrappedComponent, props, unmount);

    render(<NodeWithShow />, container);
}


