import { useState } from 'react';
import { Trans } from '@lingui/macro';

import Button from '../components/Button';

import { Font, Wrapper } from '../styled';


const SaverInit = ({ onClick }: { onClick: () => void }) => {

    return <Wrapper>
        <div style={{ padding: 45 }}>
            <h2><Font fontSize="35px" fontWeight="700"><Trans>Aave Automation</Trans></Font></h2>
            <br />
            <p style={{ width: 415 }}>
                <Font fontSize="14px" color="#939DA7" fontWeight="500">
                    <Trans>
                        Keeps your Aave position at a certain ratio to protect it from liquidation or increase leverage based on market changes.
                    </Trans>
                </Font>
            </p>
            <br />
            <div><Button theme="primary" onClick={onClick}><Trans>设置</Trans></Button></div>
        </div>
    </Wrapper>
}

export default SaverInit;