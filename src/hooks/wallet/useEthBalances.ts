import { useAppDispatch } from '../../state/hooks';

import { WalletBalancesEnums, updateBalancesStatus, updateETHBalances } from '../../state/wallet';

import { getNumber } from '../../utils';

import useWeb3ReactCore from './useWeb3ReactCore';

export const useEthBalances = () => {
    const dispatch = useAppDispatch();
    const { library, account } = useWeb3ReactCore();

    return () => {
        dispatch(updateBalancesStatus(WalletBalancesEnums.LOADING));

        library
            .getBalance(account)
            .then((balance: any) => {
                dispatch(updateETHBalances(getNumber(balance)));
                dispatch(updateBalancesStatus(WalletBalancesEnums.FINISH));
            })
            .catch((error: any) => {
                dispatch(updateBalancesStatus(WalletBalancesEnums.ERROR));
                console.error(error);
            });
    }
}

export default useEthBalances;