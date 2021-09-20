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
    readonly marketData: any[]
    readonly marketStatus: MarketStatusEnums
    readonly loanData: any[]
    readonly loanStatus: MarketStatusEnums
    readonly ethPrice?: number,
}

const initialState: MarketState = {
    marketData: [],
    marketStatus: MarketStatusEnums.INIT,
    loanData: [],
    loanStatus: MarketStatusEnums.INIT
}

export const updateState = createAction<MarketState | undefined>('market/updateState');
export const updateEthPrice = createAction<number | undefined>('market/updateEthPrice');
export const updateMaeketData = createAction<any[]>('market/updateMaeketData');
export const updateMarketStatus = createAction<MarketStatusEnums>('market/updateMarketStatus');
export const updateLoanData = createAction<any[]>('market/updateLoanData');
export const updateLoanStatus = createAction<MarketStatusEnums>('market/updateLoanStatus');


export function useEthPrice(): number | undefined {
    return useAppSelector((state: AppState) => state.market.ethPrice);
}

export function useMarketMap(): { [k: string]: any } | null {
    const market = useAppSelector((state: AppState) => state.market.marketData);

    return useMemo(() => {
        if (!market?.length) return null;

        const data: { [k: string]: any } = {};

        market.forEach((item: any) => {
            const { symbol } = item;

            data[symbol] = item;
        });

        return data;
    }, [market]);
}

export function useLoanMap(): { [k: string]: any } | null {
    const marketMap = useMarketMap();
    const loan = useAppSelector((state: AppState) => state.market.loanData);

    return useMemo(() => {
        if (!marketMap || !loan?.length) return null;

        const data: { [k: string]: any } = {};

        loan.forEach((item: any) => {
            const symbol: string = item.symbol;
            data[symbol] = item;
        });

        return data;
    }, [marketMap, loan]);
}

export function useSupplyMap(): { [k: string]: any } | null {
    const marketMap = useMarketMap();
    const supply = useAppSelector((state: AppState) => state.market.loanData.filter((item: any) => item.loanType === 1));

    return useMemo(() => {
        if (!marketMap || !supply?.length) return null;

        const data: { [k: string]: any } = {};

        supply.forEach((item: any) => {
            const { symbol } = item;

            const { price, collateralFactor, liquidationRatio, underlyingTokenAddress } = marketMap[symbol];

            data[symbol] = {
                ...item,
                price,
                collateralFactor,
                liquidationRatio,
                underlyingTokenAddress
            };
        });

        return data;
    }, [marketMap, supply]);
}

export function useBorrowMap(): { [k: string]: any } | null {
    const { dataInfo } = useUserState();
    const marketMap = useMarketMap();
    const borrow = useAppSelector((state: AppState) => state.market.loanData.filter((item: any) => [2, 3].indexOf(item.loanType) >= 0));

    return useMemo(() => {
        if (!dataInfo || !marketMap || !borrow?.length) return null;

        const data: { [k: string]: any } = {};

        const { totalDebtETH, availableBorrowsETH } = dataInfo

        const totalLoan = totalDebtETH + availableBorrowsETH;

        borrow.forEach((item: any) => {
            const { symbol, priceETH, loanType } = item;

            const { price, collateralFactor, liquidationRatio, underlyingTokenAddress } = marketMap[symbol];

            data[`${symbol}_${loanType}`] = {
                ...item,
                ratio: priceETH / totalLoan,
                price,
                collateralFactor,
                liquidationRatio,
                underlyingTokenAddress
            };
        });
        return data;
    }, [marketMap, borrow, dataInfo]);
}

const stableCoins = ["DAI", "USDT", "USDC", "BUSD", "TUSD", "SUSD"];

export function useStableCoins() {
    const marketMap = useMarketMap();

    return useMemo(() => {
        if (!marketMap) return null;

        return Object.values(marketMap)
            .filter((item: any) => item.borrowinEnabled && stableCoins.indexOf(item.symbol) >= 0)
            .map(item => item.symbol);
    }, [marketMap]);
}

export function useOtherCoins() {
    const marketMap = useMarketMap();

    return useMemo(() => {
        if (!marketMap) return null;

        return Object.values(marketMap)
            .filter((item: any) => item.usageAsCollateralEnabled && stableCoins.indexOf(item.symbol) < 0)
            .map(item => item.symbol);
    }, [marketMap]);
}

export function useCoinAddress(token?: string | null): string {
    const marketMap = useMarketMap();

    return useMemo(() => {
        if (!marketMap || !token) return;

        if (token === "ETH") {
            return "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
        }

        return marketMap[token].underlyingTokenAddress;
    }, [token, marketMap]);
}

export function useCoinAddressArray(tokens?: string[]): string[] | undefined {
    const marketMap = useMarketMap();

    return useMemo(() => {
        if (!marketMap || !tokens || !tokens?.length) return;

        return tokens.map(item => {
            if (item === "ETH") {
                return "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
            }

            return item ? marketMap[item].underlyingTokenAddress : null
        });
    }, [tokens, marketMap]);
}

export function useTokenInfo(token?: TokenMapKey | string): any {
    const marketMap = useMarketMap();

    return useMemo(() => token && marketMap ? marketMap[token] : null, [token, marketMap]);
}

// loanType: 1 质押 2 固定汇率贷款 3 动态汇率贷款
export function useSupply(): any[] {
    return useAppSelector((state: AppState) => state.market.loanData.filter((item: any) => item.loanType === 1));
}

export function useBorrow(): any[] | null {
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
    const loan = useBorrow();

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

export function useSupplyTokenInfo(token: TokenMapKey | string | null): any {
    const supplyMap = useSupplyMap();

    return token && supplyMap ? supplyMap[token] : {};
}

export function useBoorowTokenInfo(token: TokenMapKey | string | null): any {
    const borrowMap = useBorrowMap();

    return token && borrowMap ? borrowMap[token] : {};
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
        .addCase(updateMarketStatus, (state, action) => {
            state.marketStatus = action.payload;
        })
        .addCase(updateLoanStatus, (state, action) => {
            state.loanStatus = action.payload;
        })
        .addCase(updateMaeketData, (state, action) => {
            state.marketData = [...action.payload];
        })
        .addCase(updateLoanData, (state, action) => {
            console.log(action.payload);
            state.loanData = [...action.payload];
        })
)
