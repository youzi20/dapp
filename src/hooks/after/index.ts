import { useEffect } from 'react';

import { useTokenPrice } from '../contract/useMarketInfo';

import { useAppDispatch } from '../../state/hooks';
import { useState as useAfterState, updateState } from '../../state/after';
import { fullNumber } from '../../utils';

import { HandleType } from '../../types';

export const useReloadAfter = () => {
    const dispatch = useAppDispatch();

    return () => {
        dispatch(updateState({ loading: false, type: undefined, supply: undefined, borrow: undefined }));
    }
}

export const useAdvancedAfter = (type: HandleType, amount?: string, tokens?: string[], tokenAddressArray?: string[]) => {
    const dispatch = useAppDispatch();
    const reloadAfter = useReloadAfter();

    const { type: afterType } = useAfterState();
    const { loading, prices } = useTokenPrice(tokenAddressArray);

    const change = () => {
        if (afterType && afterType !== type && !amount) return;

        if (!amount || !Number(amount) || !tokens || !tokenAddressArray) {
            reloadAfter();
            return;
        }

        dispatch(updateState({ type, loading }));

        if (!loading && prices) {
            const [from, to] = tokens;
            const [fromPrice, toPrice] = prices;

            const toAmount = fullNumber(Number(amount) * Number(fromPrice) / Number(toPrice));

            if (!toAmount) {
                console.log(toAmount);
                return
            }

            const fromInfo = { price: fromPrice, amount, symbol: from, };
            const toInfo = { price: toPrice, amount: toAmount, symbol: to, };

            dispatch(updateState({
                type,
                loading,
                supply: type === "Boost" ? toInfo : fromInfo,
                borrow: type === "Boost" ? fromInfo : toInfo,
            }))
        }
    }

    useEffect(() => {
        change();
    }, [prices, amount, tokens, tokenAddressArray]);
}

export const useCollateralAfter = (type: HandleType, amount?: string, token?: string, tokenAddress?: string) => {
    const dispatch = useAppDispatch();
    const reloadAfter = useReloadAfter();

    const { type: afterType } = useAfterState();
    let { loading, prices } = useTokenPrice(tokenAddress);

    const change = () => {
        if (afterType && afterType !== type && !amount) return;

        if (!amount || !Number(amount) || !token || !tokenAddress) {
            reloadAfter();
            return;
        }

        dispatch(updateState({ type, loading }));

        const [price] = token === "ETH" ? ["1"] : prices ?? [];

        if (!loading && price) {
            dispatch(updateState({
                type,
                loading,
                supply: { price, amount, symbol: token, },
                borrow: undefined
            }))
        }
    }

    useEffect(() => {
        change();
    }, [prices, amount, token, tokenAddress]);
}

export const useDebtAfter = (type: HandleType, amount?: string, token?: string, tokenAddress?: string) => {
    const dispatch = useAppDispatch();
    const reloadAfter = useReloadAfter();

    const { type: afterType } = useAfterState();
    let { loading, prices } = useTokenPrice(tokenAddress);

    const change = () => {
        if (afterType && afterType !== type && !amount) return;

        if (!amount || !Number(amount) || !token || !tokenAddress) {
            reloadAfter();
            return;
        }

        dispatch(updateState({ type, loading }));

        const [price] = token === "ETH" ? ["1"] : prices ?? [];

        if (!loading && price) {
            dispatch(updateState({
                type,
                loading,
                supply: undefined,
                borrow: { price, amount, symbol: token, },
            }))
        }
    }

    useEffect(() => {
        change();
    }, [prices, amount, token, tokenAddress]);
}



