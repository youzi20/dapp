import { useEffect, useMemo } from 'react';
import { createReducer, createAction } from '@reduxjs/toolkit';

import { TokenMapKey } from '../hooks/contract/hooks';

import { AppState } from './index';
import { useAppDispatch, useAppSelector } from './hooks';

import { useState as useUserState } from './user';


export enum MarketStatusEnums {
    INIT,
    LOADING,
    SUCCESS,
    ERROR,
}

interface MarketState {
    readonly ethPrice: number | null,
    readonly marketData: any[]
    readonly marketStatus: MarketStatusEnums
    readonly loanData: any[]
    readonly loanStatus: MarketStatusEnums
}

const initialState: MarketState = {
    ethPrice: null,
    marketData: [],
    marketStatus: MarketStatusEnums.INIT,
    loanData: [],
    loanStatus: MarketStatusEnums.INIT
}

export const updateState = createAction<MarketState | undefined>('market/updateState');
export const updateEthPrice = createAction<number | null>('market/updateEthPrice');
export const updateMaeketData = createAction<any[]>('market/updateMaeketData');
export const updateMarketStatus = createAction<MarketStatusEnums>('market/updateMarketStatus');
export const updateLoanData = createAction<any[]>('market/updateLoanData');
export const updateLoanStatus = createAction<MarketStatusEnums>('market/updateLoanStatus');


export function useEthPrice(): number | null {
    return useAppSelector((state: AppState) => state.market.ethPrice);
}

// loanType: 1 质押 2 固定汇率贷款 3 动态汇率贷款
export function useSupply(): any[] {
    return useAppSelector((state: AppState) => state.market.loanData.filter((item: any) => item.loanType === 1));
}

export function useLoan(): any[] | null {
    const { dataInfo } = useUserState();
    const loan = useAppSelector((state: AppState) => state.market.loanData.filter((item: any) => [2, 3].indexOf(item.loanType) >= 0));

    return useMemo(() => {
        if (!dataInfo || !loan) return null;

        const { totalDebtETH, availableBorrowsETH } = dataInfo

        const totalLoan = totalDebtETH + availableBorrowsETH;

        return loan.map((item: any) => ({ ratio: item.priceETH / totalLoan, ...item }));
    }, [dataInfo, loan]);
}

export function useSupplyCoins() {
    return useAppSelector((state: AppState) => state.market.marketData.filter(item => item.usageAsCollateralEnabled).map(item => item.symbol));
}

export function useBorrowCoins() {
    return useAppSelector((state: AppState) => state.market.marketData.filter(item => item.borrowinEnabled).map(item => item.symbol));
}

export function useMarketMap(): { [k: string]: any } | null {
    return useAppSelector((state: AppState) => {
        if (!state.market.loanData.length) return null;

        const data: { [k: string]: any } = {};

        state.market.marketData.forEach((item: any) => {
            const symbol: string = item.symbol;
            data[symbol] = item;
        });

        return data;
    });
}

export function useSupplyMap(): { [k: string]: any } | null {
    return useAppSelector((state: AppState) => {
        if (!state.market.loanData.length) return null;

        const data: { [k: string]: any } = {};

        state.market.loanData.forEach((item: any) => {
            if (item.loanType === 1) {
                const symbol: string = item.symbol;
                data[symbol] = item;
            }
        });

        return data;
    });
}

export function useBorrowMap(): { [k: string]: any } | null {
    return useAppSelector((state: AppState) => {
        if (!state.market.loanData.length) return null;

        const data: { [k: string]: any } = {};

        state.market.loanData.forEach((item: any) => {
            const { symbol, loanType, ...other } = item;

            if ([2, 3].indexOf(loanType) >= 0) {
                data[symbol + "_" + loanType] = { symbol, loanType, ...other };
            }
        });

        return data;
    });
}

export function useSupplyRatio(): any[] | null {
    const { dataInfo } = useUserState();
    const supply = useSupply();

    return useMemo(() => {
        if (!dataInfo || !supply) return null;

        const { totalCollateralETH } = dataInfo

        return supply
            .map((item: any) => ({
                ratio: item.priceETH / totalCollateralETH,
                symbol: item.symbol,
                amount: item.amount,
            }))
            .sort((a, b) => b.ratio - a.ratio)
    }, [dataInfo, supply]);
}

export function useLoanRatio(): any[] | null {
    const loan = useLoan();

    return useMemo(() => {
        if (!loan) return null;

        return loan
            .map((item: any) => ({
                ratio: item.ratio,
                symbol: item.symbol,
                amount: item.amount,
            }))
            .sort((a, b) => b.ratio - a.ratio)
    }, [loan]);
}

export function useLiquidationInfo() {
    const market = useMarketMap();
    const supply = useSupply();

    if (!market || !supply) return null;

    return supply.reduce((prev, current) => {
        const { symbol, priceETH } = current;
        const { collateralFactor, liquidationRatio } = market[symbol];

        return [prev[0] + priceETH * collateralFactor * 10e-3, prev[1] + priceETH * liquidationRatio * 10e-3]
    }, [0, 0]);
}

export function useCoinAddress(token: TokenMapKey | string | null): string | null {
    const market = useMarketMap();

    if (!token) return null;

    if (token === "ETH") {
        return "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
    }

    return token && market ? market[token].underlyingTokenAddress : null;
}

export function useTokenInfo(token: TokenMapKey | string | null): any {
    const market = useMarketMap();

    if (!token) return {};

    return market ? market[token] : {};
}

export function useSupplyTokenInfo(token: TokenMapKey | string | null): any {
    const supplyMap = useSupplyMap();

    return token && supplyMap ? supplyMap[token] : {};
}

export function useBoorowTokenInfo(token: TokenMapKey | string | null): any {
    const borrowMap = useBorrowMap();

    return token && borrowMap ? borrowMap[token] : {};
}

const stableCoins = ["DAI", "USDT", "USDC", "BUSD", "TUSD", "SUSD"];

export function useStableCoins() {
    return useAppSelector((state: AppState) => state.market.marketData.filter((item: any) => item.borrowinEnabled && stableCoins.indexOf(item.symbol) >= 0).map(item => item.symbol));
}

export function useOtherCoins() {
    return useAppSelector((state: AppState) => state.market.marketData.filter((item: any) => item.usageAsCollateralEnabled && stableCoins.indexOf(item.symbol) < 0).map(item => item.symbol));
}

export function useState(): MarketState {
    return useAppSelector((state: AppState) => state.market);
}

export const marketReducer = createReducer(initialState, (builder) =>
    builder
        .addCase(updateState, (state, action) => {
            Object.entries(action.payload ?? initialState).forEach(([key, value]) => {
                // @ts-ignore
                state[key] = value;
            });
        })
        .addCase(updateEthPrice, (state, action) => {
            state.ethPrice = action.payload;
        })
        .addCase(updateMaeketData, (state, action) => {
            state.marketData = [...action.payload];
        })
        .addCase(updateMarketStatus, (state, action) => {
            state.marketStatus = action.payload;
        })
        .addCase(updateLoanData, (state, action) => {
            state.loanData = [...action.payload];
        })
        .addCase(updateLoanStatus, (state, action) => {
            state.loanStatus = action.payload;
        })
)
