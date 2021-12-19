import { useState } from 'react';
import { t, Trans } from '@lingui/macro';
import styled from 'styled-components';


import Button, { ButtonStatus } from '../components/Button';
import { message } from '../components/Message';

import { WalletStatusEnums, useState as useWalletState } from '../state/wallet';

import { useBuild, useProxies } from '../hooks/contract/useUserInfo';

import { Font, WrappeContainer } from '../styled';

const CreateWallet = () => {
    const { status } = useWalletState();

    const [buttonStatus, setButtonStatus] = useState<ButtonStatus>();

    const build = useBuild();
    const proxies = useProxies();

    const handleBuild = () => {
        if (status !== WalletStatusEnums.SUCEESS) {
            message.error(t`请先连接钱包`);
            return;
        }

        setButtonStatus("loading");

        build().then(res => {
            res.wait().then((res: any) => {
                setButtonStatus(undefined);
                message.success(t`创建成功`);
                proxies();
            }).catch((error: any) => {
                setButtonStatus(undefined);
                message.error(error.message);
                console.error(error);
            });
        }).catch((error: any) => {
            setButtonStatus(undefined);
            message.error(error.message);
            console.error(error);
        });
    }

    return <WrappeContainer>
        <h2><Font size="20px" weight="700"><Trans>创建智能钱包</Trans></Font></h2>
        <br />
        <p>
            <Font fontColor="#939DA7" size="14px" weight="500">
                <Trans>
                    为了使用应用的高级功能，您首先需要创建一个智能钱包 —— 您的个人智能合约钱包可以使用高级功能。<br />
                    请注意，使用智能钱包，您将无法与其他 app 兼容。
                </Trans>
            </Font>
        </p>
        <br />
        <div><Button theme="primary" status={buttonStatus} onClick={handleBuild}><Trans>创建</Trans></Button></div>
    </WrappeContainer>
}


export default CreateWallet;