import { Trans } from '@lingui/macro';

import Button from '../components/Button';

import { Font, WrappeContainer } from '../styled';


const CreateSaver = ({ onClick }: { onClick: () => void }) => {

    return <WrappeContainer>
        <h2><Font size="35px" weight="700"><Trans>Aave Automation</Trans></Font></h2>
        <br />
        <p>
            <Font size="14px" fontColor="#939DA7" weight="500">
                <Trans>
                    Keeps your Aave position at a certain ratio to protect it from liquidation or increase leverage based on market changes.
                </Trans>
            </Font>
        </p>
        <br />
        <div><Button onClick={onClick}><Trans>设置</Trans></Button></div>
    </WrappeContainer>
}

export default CreateSaver;