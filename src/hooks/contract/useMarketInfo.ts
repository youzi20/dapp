import { useState, useEffect, useMemo } from 'react';

import { useMarketContract, useERC20Contract } from './index';
import { useTokenAddress } from './hooks';

import { useAppDispatch } from '../../state/hooks';
import { useConfigReload } from '../../state/config';
import { useState as useUserState, updateDataInfo } from '../../state/user';
import {
    MarketStatusEnums,
    updateMaeketData,
    updateMarketStatus,
    updateLoanData,
    updateLoanStatus,
    updatePrice,
    updateTokenDecimals,
} from '../../state/market';

import { getFormatNumber } from '../../utils';

export const useMarketData = () => {
    const dispatch = useAppDispatch();

    const [market, setMarket] = useState<any[]>();
    const [decimals, setDecimals] = useState<{ [key: string]: number }>();

    const tokenAddress = useMemo(() => market?.map(item => item.underlyingTokenAddress), [market]);

    const erc20 = useERC20Contract(tokenAddress);

    const marketAddress = useTokenAddress("AAVE_MARKET");
    const marketInfoContract = useMarketContract();

    const { address } = useUserState();

    const getMarketData = async () => {
        if (!marketInfoContract) return;

        try {
            dispatch(updateMarketStatus(MarketStatusEnums.LOADING));

            const market = await marketInfoContract.getAaveMarketInfo(marketAddress);

            const data = market
                .map((item: any) => {
                    const { totalSupply, totalBorrow, supplyRate, liquidationRatio, collateralFactor, borrowRateVariable, borrowRateStable, availableLiquidity, price,
                        symbol, aTokenAddress, underlyingTokenAddress, usageAsCollateralEnabled, stableBorrowRateEnabled, borrowinEnabled } = item;

                    return {
                        symbol: symbol.toLocaleUpperCase(),
                        totalSupply: getFormatNumber(totalSupply),
                        totalBorrow: getFormatNumber(totalBorrow),
                        supplyRate: getFormatNumber(supplyRate, 27),
                        liquidationRatio: getFormatNumber(liquidationRatio, 4),
                        collateralFactor: getFormatNumber(collateralFactor, 4),
                        borrowRateVariable: getFormatNumber(borrowRateVariable, 27),
                        borrowRateStable: getFormatNumber(borrowRateStable, 27),
                        availableLiquidity: getFormatNumber(availableLiquidity, 0),
                        price: getFormatNumber(price),
                        aTokenAddress,
                        underlyingTokenAddress,
                        usageAsCollateralEnabled,
                        stableBorrowRateEnabled,
                        borrowinEnabled
                    }
                })
                .sort((a: any, b: any) => Number(b.totalSupply) * Number(b.price) - Number(a.totalSupply) * Number(a.price));

            // console.log(data);

            setMarket(data);

            dispatch(updateMaeketData(data));
            dispatch(updateMarketStatus(MarketStatusEnums.SUCCESS));
        } catch (error) {
            console.error(error);
            setMarket(undefined);
            dispatch(updateMarketStatus(MarketStatusEnums.ERROR));
        }
    }

    const getErc20TokenDecimals = async () => {
        if (!market || !erc20) return;

        try {
            const decimalsArray = await Promise.all(
                erc20.map(
                    (contract: any, index: number) => new Promise((resolve, reject) => {
                        contract.decimals()
                            .then(
                                (res: number) =>
                                    resolve({ [market[index].symbol]: Number(getFormatNumber(res, 0)) })
                            )
                            .catch(reject);
                    })
                )
            );

            const decimals = decimalsArray.reduce<{ [key: string]: number }>(
                (prev: any, current: any) => ({ ...prev, ...current }), {}
            )

            setDecimals(decimals);

            dispatch(updateTokenDecimals(decimals));
        } catch (error) {
            console.error(error);
        }
    }

    const getUserData = async () => {
        if (!marketInfoContract || !decimals || !address) return;

        try {
            dispatch(updateLoanStatus(MarketStatusEnums.LOADING));

            const loanData = await marketInfoContract.getUserLoanData(marketAddress, address);
            const accountData = await marketInfoContract.getUserAccountData(marketAddress, address);
            const ratio = await marketInfoContract.getRatio(marketAddress, address);

            const data = loanData
                .filter((item: any) => item.symbol)
                .map((item: any) => {
                    const { amount, symbol, priceETH, rate, loanType, usageAsCollateralEnableds } = item;

                    return {
                        loanType,
                        usageAsCollateralEnableds,
                        symbol: symbol.toLocaleUpperCase(),
                        amount: getFormatNumber(amount, decimals[symbol]),
                        priceETH: getFormatNumber(priceETH),
                        rate: getFormatNumber(rate, 27),
                    }
                });

            const { totalCollateralETH, totalDebtETH, availableBorrowsETH, currentLiquidationThreshold, healthFactor } = accountData;

            dispatch(updateLoanData(data));
            dispatch(updateDataInfo({
                totalCollateralETH: getFormatNumber(totalCollateralETH),
                availableBorrowsETH: getFormatNumber(availableBorrowsETH),
                totalDebtETH: getFormatNumber(totalDebtETH),
                currentLiquidationThreshold: getFormatNumber(currentLiquidationThreshold, 0),
                healthFactor: getFormatNumber(healthFactor),
                ratio: getFormatNumber(ratio),
            }));
            dispatch(updateLoanStatus(MarketStatusEnums.SUCCESS));

            // console.log("use", data, {
            //     totalCollateralETH: getFormatNumber(totalCollateralETH),
            //     availableBorrowsETH: getFormatNumber(availableBorrowsETH),
            //     totalDebtETH: getFormatNumber(totalDebtETH),
            //     currentLiquidationThreshold: getFormatNumber(currentLiquidationThreshold, 0),
            //     healthFactor: getFormatNumber(healthFactor),
            //     ratio: getFormatNumber(ratio),
            // });
        } catch (error) {
            dispatch(updateLoanData());
            dispatch(updateDataInfo());
            dispatch(updateLoanStatus(MarketStatusEnums.ERROR));
            console.error(error);
        }
    }

    useEffect(() => {
        getErc20TokenDecimals();
    }, [market, erc20]);

    useEffect(() => {
        if (address) dispatch(updateLoanStatus(MarketStatusEnums.LOADING));

        getUserData();
    }, [decimals, address]);

    return { marketInfoContract, getMarketData };
}

export const useTokenPrice = (tokenAddress?: string[] | string) => {
    const [tokenPrice, setTokenPrice] = useState<string[]>();
    const [loading, setLoading] = useState(false);

    const marketAddress = useTokenAddress("AAVE_MARKET");
    const marketInfoContract = useMarketContract();

    useEffect(() => {
        getTokenPrice();
    }, [tokenAddress, marketInfoContract]);

    const getTokenPrice = async () => {
        if (!marketInfoContract || !tokenAddress || (tokenAddress instanceof Array && !tokenAddress.every(item => item))) return;

        setLoading(true);

        try {
            const prices = await marketInfoContract.getPrices(marketAddress, tokenAddress instanceof Array ? tokenAddress : [tokenAddress]);

            setTokenPrice(prices.map((item: number) => getFormatNumber(item)));
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error(error);
        }
    }

    return {
        loading,
        tokenPrice,
    }
}

export const useMarketInit = (status: boolean) => {
    const dispatch = useAppDispatch();

    const reload = useConfigReload();
    const { marketInfoContract, getMarketData } = useMarketData();

    const getPrices = async () => {
        fetch("https://defiexplore.com/api/market/prices?addresses=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2")
            .then((body) => {
                return body.json()
            })
            .then(([res]) => {
                dispatch(updatePrice(res));
            });
    }

    useEffect(() => {
        getMarketData();
    }, [marketInfoContract, reload]);

    useEffect(() => {
        getPrices();
    }, [status]);
}