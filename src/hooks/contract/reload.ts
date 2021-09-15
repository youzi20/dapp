import { useMarketData, useUserData } from "./useMarketInfo";
import { useEthBalances } from "../wallet";

import { useAppDispatch } from '../../state/hooks';

import { updateState as updateMarketState } from "../../state/market";
import { updateState as updateUserState } from "../../state/user";


export const useReload = () => {
    const marketData = useMarketData();
    const userData = useUserData();
    const balances = useEthBalances();

    return () => {
        userData();
        marketData();
        balances();
    }
}

export const useReset = () => {
    const dispatch = useAppDispatch();


    return () => {
        dispatch(updateMarketState());
        dispatch(updateUserState());
    }
}