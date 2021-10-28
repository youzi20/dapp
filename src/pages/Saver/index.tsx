import { useEffect } from 'react';

import Title, { TitleAction } from '../../components/Title';

import { useReset } from '../../hooks/contract/reload';

import { useState as useWalletState } from '../../state/wallet';

import { Content } from '../../styled';

import Core from './Core';

const Saver = () => {
    const reset = useReset();

    const { status } = useWalletState();

    useEffect(() => {
        if (!status) {
            reset();
        }
    }, [status]);

    return <div>
        <Content>
            <Title action={<TitleAction />} />

            <Core />
        </Content>
    </div>
}

export default Saver;