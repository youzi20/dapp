import { useEffect, useMemo } from 'react';

import { useTokenPrice } from '../contract/useMarketInfo';

import { useAppDispatch } from '../../state/hooks';
import { useTokenAddressArray } from '../../state/market';
import { useState as useAfterState, updateState } from '../../state/after';


import { HandleType, fullNumber } from '../../utils';

export const useReloadAfter = () => {
    const dispatch = useAppDispatch();

    return () => {
        dispatch(updateState({ loading: false, type: undefined, supply: undefined, borrow: undefined }));
    }
}

export const useHandleAfter = (type: HandleType, amount?: string, token?: string, tokenTo?: string) => {
    const dispatch = useAppDispatch();
    const reloadAfter = useReloadAfter();

    const { type: afterType } = useAfterState();

    const tokenArray = useMemo(() => {
        if (["Boost", "Repay"].indexOf(type) >= 0 && token && tokenTo) {
            if (token === "ETH" && tokenTo === "ETH") return [];
            else if (token === "ETH") return [tokenTo];
            else if (tokenTo === "ETH") return [token];

            return [token, tokenTo];
        } else if (["Supply", "Withdraw", "Borrow", "Payback"].indexOf(type) >= 0 && token) {
            if (token === "ETH") return [];
            return [token];
        }
    }, [token, tokenTo]);

    const tokenAddressArray = useTokenAddressArray(tokenArray);

    const { loading, tokenPrice } = useTokenPrice(tokenAddressArray);

    const change = () => {
        if (afterType && afterType !== type && !amount) return;

        if (!amount ||
            !Number(amount) ||
            !tokenPrice ||
            (["Boost", "Repay"].indexOf(type) >= 0 && (!token || !tokenTo)) ||
            (["Supply", "Withdraw", "Borrow", "Payback"].indexOf(type) >= 0 && !token)
        ) {
            reloadAfter();
            return;
        }

        dispatch(updateState({ type, loading }));

        if (!loading && tokenPrice) {
            let fromPrice, toPrice, supplyInfo, borrowInfo;

            if (token !== "ETH" && tokenTo !== "ETH") {
                [fromPrice, toPrice] = tokenPrice;
            } else if (token === "ETH") {
                fromPrice = "1";
                [toPrice] = tokenPrice;
            } else if (tokenTo === "ETH") {
                toPrice = "1";
                [fromPrice] = tokenPrice;
            } else if (tokenPrice.length === 1) {
                [fromPrice] = tokenPrice;
                toPrice = "0";
            }

            const toAmount = fullNumber(Number(amount) * Number(fromPrice) / Number(toPrice));
            const fromInfo = { price: fromPrice, amount, symbol: token ?? "" };
            const toInfo = { price: toPrice, amount: toAmount, symbol: tokenTo ?? "" };

            if (type === "Boost" && token && tokenTo) {
                supplyInfo = { ...toInfo };
                borrowInfo = { ...fromInfo }
            }

            if (type === "Repay" && token && tokenTo) {
                supplyInfo = { ...fromInfo };
                borrowInfo = { ...toInfo }
            }

            if (["Supply", "Withdraw"].indexOf(type) >= 0 && token) {
                supplyInfo = { ...fromInfo }
            }

            if (["Borrow", "Payback"].indexOf(type) >= 0 && token) {
                borrowInfo = { ...fromInfo }
            }

            dispatch(updateState({
                type,
                loading,
                supply: supplyInfo,
                borrow: borrowInfo,
            }))
        }
    }

    useEffect(() => {
        change();
    }, [amount, token, tokenTo, tokenPrice]);
}