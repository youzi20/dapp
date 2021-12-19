import { useMemo } from 'react';
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
    readonly marketData?: any[]
    readonly marketStatus: MarketStatusEnums
    readonly loanData?: any[]
    readonly loanStatus: MarketStatusEnums
    readonly price?: number,
    readonly tokenDecimals?: { [key: string]: number }
}

const initialState: MarketState = {
    marketStatus: MarketStatusEnums.INIT,
    loanStatus: MarketStatusEnums.INIT
}

export const updateState = createAction<MarketState | undefined>('market/updateState');
export const updatePrice = createAction<number | undefined>('market/updateEthPrice');
export const updateMaeketData = createAction<any[] | undefined>('market/updateMaeketData');
export const updateMarketStatus = createAction<MarketStatusEnums>('market/updateMarketStatus');
export const updateLoanData = createAction<any[] | undefined>('market/updateLoanData');
export const updateLoanStatus = createAction<MarketStatusEnums>('market/updateLoanStatus');
export const updateTokenDecimals = createAction<{ [key: string]: number } | undefined>('market/updateTokenDecimals');

// loanType: 1 质押 2 固定汇率贷款 3 动态汇率贷款
export function useEthPrice(): number | undefined {
    return useAppSelector((state: AppState) => state.market.price);
}

export function useMarketMap(): { [k: string]: any } | null {
    const market = useAppSelector((state: AppState) => state.market.marketData);

    return useMemo(() => {
        if (!market?.length) return null;

        const data: { [k: string]: any } = {};

        [...market].forEach((item: any) => {
            const { symbol, ...other } = item;

            if (symbol === "WETH") {
                data["ETH"] = { symbol: "ETH", ...other }
            } else {
                data[symbol] = item;
            }
        });

        return data;
    }, [market]);
}

export function useSupplyMap(): { [k: string]: any } | null {
    const marketMap = useMarketMap();
    const supply = useAppSelector((state: AppState) => state.market.loanData?.filter((item: any) => item.loanType === 1));

    return useMemo(() => {
        if (!marketMap || !supply?.length) return null;

        const data: { [k: string]: any } = {};

        [...supply].forEach((item: any) => {
            let { symbol, ...other } = item;

            if (symbol === "WETH") {
                symbol = "ETH";
            }

            const { price, collateralFactor, liquidationRatio } = marketMap[symbol];

            data[symbol] = {
                ...other,
                symbol,
                price,
                collateralFactor,
                liquidationRatio,
            };
        });

        return data;
    }, [marketMap, supply]);
}

export function useBorrowMap(): { [k: string]: any } | null {
    const { dataInfo } = useUserState();
    const marketMap = useMarketMap();
    const borrow = useAppSelector((state: AppState) => state.market.loanData?.filter((item: any) => [2, 3].indexOf(item.loanType) >= 0));

    return useMemo(() => {
        if (!dataInfo || !marketMap || !borrow?.length) return null;

        const data: { [k: string]: any } = {};

        const { totalDebtETH, availableBorrowsETH } = dataInfo

        const totalLoan = Number(totalDebtETH) + Number(availableBorrowsETH);

        [...borrow].forEach((item: any) => {
            let { symbol, priceETH, loanType } = item;

            if (symbol === "WETH") {
                symbol = "ETH";
            }

            const { price, collateralFactor, liquidationRatio } = marketMap[symbol];

            data[`${symbol}_${loanType}`] = {
                ...item,
                symbol,
                ratio: priceETH / totalLoan,
                price,
                collateralFactor,
                liquidationRatio,
            };
        });
        return data;
    }, [marketMap, borrow, dataInfo]);
}

export function useSupplyRatio(): any[] | undefined {
    const { dataInfo } = useUserState();
    const supplyMap = useSupplyMap();

    return useMemo(() => {
        if (!dataInfo || !supplyMap) return;

        const { totalCollateralETH } = dataInfo

        return Object.values(supplyMap).map((item: any) => ({
            ratio: item.priceETH / totalCollateralETH,
            symbol: item.symbol,
            amount: item.amount,
        })).sort((a, b) => b.ratio - a.ratio)
    }, [dataInfo, supplyMap]);
}

export function useBorrowRatio(): any[] | undefined {
    const borrowMap = useBorrowMap();

    return useMemo(() => {
        if (!borrowMap) return;

        return Object.values(borrowMap).map((item: any) => ({
            ratio: item.ratio,
            symbol: item.symbol,
            amount: item.amount,
        })).sort((a, b) => b.ratio - a.ratio)
    }, [borrowMap]);
}

const STABLE_COINS = ["DAI", "USDT", "USDC", "BUSD", "TUSD", "SUSD"];

export function useStableCoins() {
    const marketMap = useMarketMap();

    return useMemo(() => {
        if (!marketMap) return null;

        return Object.values(marketMap)
            .filter((item: any) => item.borrowinEnabled && STABLE_COINS.indexOf(item.symbol) >= 0)
            .map(item => item.symbol);
    }, [marketMap]);
}

export function useOtherCoins() {
    const marketMap = useMarketMap();

    return useMemo(() => {
        if (!marketMap) return null;

        return Object.values(marketMap)
            .filter((item: any) => item.usageAsCollateralEnabled && STABLE_COINS.indexOf(item.symbol) < 0)
            .map(item => item.symbol);
    }, [marketMap]);
}

export function useTokenDecimals(token?: string | null) {
    const decimals = useAppSelector((state: AppState) => state.market.tokenDecimals);

    return useMemo(() => token && decimals ? decimals[token] : undefined, [token, decimals]);
}

export function useTokenAddress(token?: string | null, isAave?: boolean): string {
    const marketMap = useMarketMap();

    return useMemo(() => {
        if (!marketMap || !token) return;

        if (token === "ETH" && !isAave) {
            return "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
        }

        return marketMap[token].underlyingTokenAddress;
    }, [marketMap, token]);
}

export function useTokenAddressArray(tokens?: string[]): string[] | undefined {
    const marketMap = useMarketMap();

    return useMemo(() => {
        if (!marketMap || !tokens || !tokens?.length) return;

        return tokens.map(item => {
            if (item === "ETH") {
                return "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
            }

            return marketMap[item] ? marketMap[item].underlyingTokenAddress : null
        });
    }, [marketMap, tokens]);
}

export function useTokenInfo(token?: TokenMapKey | string): any {
    const marketMap = useMarketMap();

    return useMemo(() => token && marketMap ? marketMap[token] : null, [token, marketMap]);
}

export function useSupplyCoins(): string[] | undefined {
    const marketMap = useMarketMap();

    return useMemo(() => {
        if (!marketMap) return;

        return Object.values(marketMap).filter(item => item.usageAsCollateralEnabled).map(item => item.symbol);
    }, [marketMap]);
}

export function useBorrowCoins() {
    const marketMap = useMarketMap();

    return useMemo(() => {
        if (!marketMap) return null;

        return Object.values(marketMap).filter(item => item.borrowinEnabled).map(item => item.symbol);
    }, [marketMap]);
}

export function useCoinMaxLoanableAndLiquidation() {
    const supplyMap = useSupplyMap();

    return useMemo(() => {
        if (!supplyMap) return;

        return Object.values(supplyMap)
            .map(({ symbol, collateralFactor, liquidationRatio, usageAsCollateralEnableds, priceETH }) => {
                return { symbol, loanable: priceETH * collateralFactor, liquidation: priceETH * liquidationRatio, enabled: usageAsCollateralEnableds }
            });
    }, [supplyMap]);
}

export function useLiquidationInfo() {
    const marketMap = useMarketMap();
    const supplyMap = useSupplyMap();

    return useMemo(() => {
        if (!marketMap || !supplyMap) return null;

        return Object.values(supplyMap).reduce((prev, current) => {
            const [borrowETH, liquidationETH] = prev;
            const { symbol, priceETH, usageAsCollateralEnableds } = current;

            if (!usageAsCollateralEnableds) return prev;

            const { collateralFactor, liquidationRatio } = marketMap[symbol];

            return [borrowETH + priceETH * collateralFactor, liquidationETH + priceETH * liquidationRatio]
        }, [0, 0]);
    }, [marketMap, supplyMap]);
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
        .addCase(updateMarketStatus, (state, action) => {
            state.marketStatus = action.payload;
        })
        .addCase(updateLoanStatus, (state, action) => {
            state.loanStatus = action.payload;
        })
        .addCase(updateMaeketData, (state, action) => {
            state.marketData = action.payload ? [...action.payload] : undefined;
        })
        .addCase(updatePrice, (state, action) => {
            state.price = action.payload;
        })
        .addCase(updateTokenDecimals, (state, action) => {
            state.tokenDecimals = { ...action.payload };
        })
        .addCase(updateLoanData, (state, action) => {
            state.loanData = action.payload ? [...action.payload] : undefined;
        })
)
