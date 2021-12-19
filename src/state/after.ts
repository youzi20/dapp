import { useMemo } from 'react';
import { createReducer, createAction } from '@reduxjs/toolkit';

import { AppState } from './index';
import { useAppDispatch, useAppSelector } from './hooks';
import { useMarketMap, useSupplyMap, useBorrowMap } from './market';

import { HandleType, fullNumber } from '../utils';

const isAdd = (type: HandleType) => {
    if (["Boost", "Supply", "Borrow"].indexOf(type) >= 0) return true;
    if (["Repay", "Withdraw", "Payback"].indexOf(type) >= 0) return false;
}

const getHandleTheme = (type?: HandleType) => {
    if (!type) return;

    if (["Boost", "Supply", "Borrow"].indexOf(type) >= 0) return ["#1e5a48", "#14bd88"];
    if (["Repay", "Withdraw", "Payback"].indexOf(type) >= 0) return ["#714238", "#cc5e47"];
}

const symbolInfo = (value: string) => {
    let symbol, loanType;

    if (value.match("_")) {
        const val = value.split("_");

        symbol = val[0];
        loanType = Number(val[1]);
    } else {
        symbol = value;
        loanType = 3;
    }

    return [symbol, loanType];
}

interface AfterState {
    readonly loading: boolean
    readonly type?: HandleType
    readonly theme?: string[]
    readonly supply?: {
        price?: string
        symbol: string
        amount: string
    }
    readonly borrow?: {
        price?: string
        symbol: string
        amount: string
    }
}

const initialState: AfterState = {
    loading: false,
    supply: undefined,
    borrow: undefined,
}

export const updateLoading = createAction<boolean>('after/updateLoading');
export const updateState = createAction<AfterState | undefined>('after/updateState');

export function useAfterUserInfo() {
    const supplyMap = useAfterSupplyMap();
    const borrowMap = useAfterBorrowMap();

    return useMemo(() => {
        let totalCollateralETH = 0, liquidationETH = 0, totalDebtETH = 0, borrowETH = 0;

        if (supplyMap) {
            Object.values(supplyMap).forEach((item) => {
                totalCollateralETH += Number(item.priceETH);
                borrowETH += Number(item.priceETH) * Number(item.collateralFactor);
                liquidationETH += Number(item.priceETH) * Number(item.liquidationRatio);
            });
        }

        if (borrowMap) {
            Object.values(borrowMap).forEach((item) => {
                totalDebtETH += Number(item.priceETH);
            });
        }

        return {
            totalDebtETH,
            totalCollateralETH,
            borrowETH,
            liquidationETH
        }
    }, [supplyMap, borrowMap]);
}

export function useAfterSupplyMap() {
    const marketMap = useMarketMap();
    const supplyMap = useSupplyMap();

    const { type, supply } = useAppSelector((state: AppState) => state.after);

    return useMemo(() => {
        if (!type || !marketMap || !supplyMap) return null;

        if (!supply) return supplyMap;

        const { symbol, amount, price } = supply;

        if (supplyMap[symbol]) {
            const { amount: supplyAmount, price: supplyPrice, priceETH: supplyPriceETH, ...other } = supplyMap[symbol];

            let totalAmount = Number(supplyAmount) + (isAdd(type) ? 1 : -1) * Number(amount);

            if (totalAmount < 0) totalAmount = 0;

            // console.log("useAfterSupplyMap", supplyAmount, supplyPrice, amount, totalAmount);

            supplyMap[symbol] = {
                price,
                amount: fullNumber(totalAmount),
                priceETH: fullNumber(totalAmount * Number(price)),
                ...other
            }
        } else if (marketMap[symbol]) {
            const { supplyRate, collateralFactor, liquidationRatio } = marketMap[symbol];

            supplyMap[symbol] = {
                price,
                amount,
                symbol,
                collateralFactor,
                liquidationRatio,
                rate: supplyRate,
                priceETH: fullNumber(Number(price) * Number(amount)),
            }
        }

        return supplyMap;
    }, [marketMap, supplyMap, type, supply]);
}

export function useAfterBorrowMap() {
    const marketMap = useMarketMap();
    const borrowMap = useBorrowMap();

    const { type, borrow } = useAppSelector((state: AppState) => state.after);

    return useMemo(() => {
        if (!type || !marketMap || !borrowMap) return null;

        if (!borrow) return borrowMap;

        const { symbol, amount, price } = borrow;

        const [token, loan] = symbolInfo(symbol);

        const borrowSymbol = token + "_" + loan;

        if (borrowMap[borrowSymbol]) {
            const { amount: borrowAmount, price: borrowPrice, priceETH: borrowPriceETH, ...other } = borrowMap[borrowSymbol];

            let totalAmount = Number(borrowAmount) + (isAdd(type) ? 1 : -1) * Number(amount);

            if (totalAmount < 0) totalAmount = 0;

            // console.log("useAfterBorrowMap", borrowAmount, borrowPrice, amount, totalAmount);

            borrowMap[borrowSymbol] = {
                price,
                amount: fullNumber(totalAmount),
                priceETH: fullNumber(totalAmount * Number(price)),
                ...other
            }
        } else if (marketMap[symbol]) {
            const { borrowRateVariable, collateralFactor, liquidationRatio } = marketMap[symbol];

            borrowMap[borrowSymbol] = {
                price,
                amount,
                symbol,
                collateralFactor,
                liquidationRatio,
                loanType: 3,
                rate: borrowRateVariable,
                priceETH: fullNumber(Number(price) * Number(amount)),
            }
        }

        return borrowMap;
    }, [marketMap, borrowMap, type, borrow]);
}

export function useAfterSupplyRatio() {
    const userInfo = useAfterUserInfo();
    const supplyMap = useAfterSupplyMap();

    return useMemo(() => {
        if (!userInfo || !supplyMap) return null;

        const { totalCollateralETH } = userInfo

        return Object.values(supplyMap).map((item: any) => ({
            ratio: item.priceETH / totalCollateralETH,
            symbol: item.symbol,
            amount: item.amount,
        })).sort((a, b) => b.ratio - a.ratio)
    }, [userInfo, supplyMap]);
}

export function useAfterBorrowRatio() {
    const userInfo = useAfterUserInfo();
    const borrowMap = useAfterBorrowMap();

    return useMemo(() => {
        if (!userInfo || !borrowMap) return null;

        const { borrowETH } = userInfo

        return Object.values(borrowMap).map(({ symbol, amount, loanType, priceETH }: any) => ({
            symbol,
            amount,
            loanType,
            ratio: priceETH / borrowETH,
        })).sort((a, b) => b.ratio - a.ratio)
    }, [userInfo, borrowMap]);
}

export function useAfterSupply() {
    const supplyMap = useSupplyMap();
    const afterSupplyMap = useAfterSupplyMap();

    const { type, supply } = useAppSelector((state: AppState) => state.after);

    return useMemo(() => {
        if (!type || !supplyMap || !afterSupplyMap || !supply) return null;

        const { symbol } = supply;

        if (supplyMap[symbol]) {
            return {
                ...supplyMap[symbol],
                after: { ...afterSupplyMap[symbol] }
            };
        }

        return {
            ...afterSupplyMap[symbol],
            amount: "0",
            priceETH: "0",
            after: { ...afterSupplyMap[symbol] }
        };
    }, [supplyMap, afterSupplyMap, type, supply]);
}

export function useAfterBorrow() {
    const borrowMap = useBorrowMap();
    const afterBorrowMap = useAfterBorrowMap();
    const afterBorrowRatio = useAfterBorrowRatio();


    const { type, borrow } = useAppSelector((state: AppState) => state.after);

    return useMemo(() => {
        if (!type || !borrowMap || !afterBorrowMap || !borrow || !afterBorrowRatio) return null;

        const { symbol } = borrow;

        const [token, loan] = symbolInfo(symbol);

        const borrowSymbol = token + "_" + loan;

        let ratio = 0;

        afterBorrowRatio.forEach((item) => {
            if (item.symbol === symbol && item.loanType === loan) ratio = item.ratio;
        });

        // console.log(borrowMap, afterBorrowRatio, symbol, ratio);

        if (borrowMap[borrowSymbol]) {
            return {
                ...borrowMap[borrowSymbol],
                after: { ...afterBorrowMap[borrowSymbol], ratio }
            };
        }

        return {
            ...afterBorrowMap[borrowSymbol],
            amount: "0",
            priceETH: "0",
            after: { ...afterBorrowMap[borrowSymbol], ratio }
        };
    }, [borrowMap, afterBorrowMap, afterBorrowRatio, type, borrow]);
}

export function useState(): AfterState {
    return useAppSelector((state: AppState) => state.after);
}

export const afterReducer = createReducer(initialState, (builder) =>
    builder
        .addCase(updateState, (state, action) => {
            Object.entries(action.payload ?? initialState).forEach(([key, value]) => {
                // @ts-ignore
                state[key] = value;

                if (key === "type") {
                    state.theme = getHandleTheme(value);
                }
            });
        })
);