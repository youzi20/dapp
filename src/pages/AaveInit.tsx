import { useState } from 'react';
import { t, Trans } from '@lingui/macro';

import Button from '../components/Button';
import { message } from '../components/Message';

import { WalletStatusEnums, useState as useWalletState } from '../state/wallet';

import { useBuild, useProxies } from '../hooks/contract/useUserInfo';

import { Font, Wrapper } from '../styled';

const AaveInit = () => {
    const { status } = useWalletState();

    const [loading, setLoading] = useState(false);

    const build = useBuild();
    const proxies = useProxies();

    const handleBuild = () => {
        if (status !== WalletStatusEnums.SUCEESS) {
            message.error(t`请先连接钱包`);
            return;
        }

        setLoading(true);

        build().then(res => {
            res.wait().then((res: any) => {
                setLoading(false);
                message.success(t`创建成功`);
                proxies();
            }).catch((error: any) => {
                setLoading(false);
                message.error(error.message);
                console.error(error);
            });
        }).catch((error: any) => {
            setLoading(false);
            message.error(error.message);
            console.error(error);
        });
    }

    return <Wrapper>
        <div style={{ padding: 45 }}>
            <h2><Font fontSize="20px" fontWeight="700"><Trans>创建智能钱包</Trans></Font></h2>
            <br />
            <p>
                <Font fontSize="14px" color="#939DA7" fontWeight="500">
                    <Trans>
                        为了使用应用的高级功能，您首先需要创建一个智能钱包 —— 您的个人智能合约钱包可以使用高级功能。<br />
                        请注意，使用智能钱包，您将无法与其他 app 兼容。
                    </Trans>
                </Font>
            </p>
            <br />
            <div><Button loading={loading} theme="primary" onClick={handleBuild}><Trans>创建</Trans></Button></div>
        </div>
    </Wrapper>
}


export default AaveInit;