import { useUserInfo } from '../hooks/contract/useUserInfo';
import { useMarketInit } from '../hooks/contract/useMarketInfo';
import { useSaverInfo } from '../hooks/contract/useSaverInfo';

import { UserStatusEnums, useState as useUserState } from '../state/user';
import { WalletStatusEnums, useState as useWalletState } from '../state/wallet';

const AppInit = () => {
    const { status: walletStatus } = useWalletState();
    const { status: userStatus } = useUserState();

    useUserInfo(WalletStatusEnums.SUCEESS === walletStatus);
    useMarketInit(WalletStatusEnums.SUCEESS === walletStatus);
    useSaverInfo(WalletStatusEnums.SUCEESS === walletStatus && UserStatusEnums.SUCCESS === userStatus);

    // console.log(walletStatus);

    return <div></div>
}

export default AppInit;