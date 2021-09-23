import { useMemo } from 'react';
import { createReducer, createAction } from '@reduxjs/toolkit';

import { AppState } from './index';
import { useAppDispatch, useAppSelector } from './hooks';
import { useMarketMap, useSupplyMap, useBorrowMap } from './market';

import { HandleType } from '../types';
import { fullNumber } from '../utils';

const isAdd = (type: HandleType) => {
    if (["Boost", "Supply", "Borrow"].indexOf(type) >= 0) return true;
    if (["Repay", "Withdraw", "Payback"].indexOf(type) >= 0) return false;
}

interface AfterState {
    readonly loading: boolean
    readonly type?: HandleType
    readonly supply?: {
        symbol: string
        amount: string
        price: string
    }
    readonly borrow?: {
        symbol: string
        amount: string
        price: string
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
        let totalCollateralETH = 0, totalLiquidationETH = 0, totalDebtETH = 0, totalBorrowETH = 0;

        if (supplyMap) {
            Object.values(supplyMap).forEach((item) => {
                totalCollateralETH += Number(item.priceETH);
                totalBorrowETH += Number(item.priceETH) * Number(item.collateralFactor);
                totalLiquidationETH += Number(item.priceETH) * Number(item.liquidationRatio);
            });
        }

        if (borrowMap) {
            Object.values(borrowMap).forEach((item) => {
                totalDebtETH += Number(item.priceETH);
            });
        }

        return {
            totalDebtETH,
            totalBorrowETH,
            totalCollateralETH,
            totalLiquidationETH
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

            const totalAmount = Number(supplyAmount) + (isAdd(type) ? 1 : -1) * Number(amount);

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



        if (borrowMap[symbol]) {
            const { amount: borrowAmount, price: borrowPrice, priceETH: borrowPriceETH, ...other } = borrowMap[symbol];

            const totalAmount = Number(borrowAmount) + (isAdd(type) ? 1 : -1) * Number(amount);

            borrowMap[symbol] = {
                price,
                amount: fullNumber(totalAmount),
                priceETH: fullNumber(totalAmount * Number(price)),
                ...other
            }
        } else if (marketMap[symbol]) {
            const { borrowRateVariable, collateralFactor, liquidationRatio } = marketMap[symbol];

            borrowMap[symbol] = {
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

        const { totalBorrowETH } = userInfo

        return Object.values(borrowMap).map((item: any) => ({
            ratio: item.priceETH / totalBorrowETH,
            symbol: item.symbol,
            amount: item.amount,
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
    const borrowRatio = useAfterBorrowRatio();

    const { type, borrow } = useAppSelector((state: AppState) => state.after);

    return useMemo(() => {
        if (!type || !borrowMap || !afterBorrowMap || !borrow || !borrowRatio) return null;

        const { symbol } = borrow;

        let ratio = 0;

        borrowRatio.forEach((item) => {
            if (item.symbol === symbol) ratio = item.ratio;
        });


        if (borrowMap[symbol]) {
            return {
                ...borrowMap[symbol],
                after: { ratio, ...afterBorrowMap[symbol] }
            };
        }

        return {
            ...afterBorrowMap[symbol],
            amount: "0",
            priceETH: "0",
            after: { ratio, ...afterBorrowMap[symbol] }
        };
    }, [borrowMap, afterBorrowMap, borrowRatio, type, borrow]);
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
            });
        })
);