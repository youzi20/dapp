import { useState, useEffect } from "react";

import { useMarketContract } from "./index";
import { useTokenAddress } from "./hooks";


import { useAppDispatch } from '../../state/hooks';
import { useState as useUserState, updateDataInfo } from '../../state/user';
import {
    MarketStatusEnums,
    updateEthPrice,
    updateMaeketData,
    updateMarketStatus,
    updateLoanData,
    updateLoanStatus
} from '../../state/market';

import { getFormatNumber, getRatio } from "../../utils";

export const useMarketData = () => {
    const dispatch = useAppDispatch();

    const marketAddress = useTokenAddress("AAVE_MARKET");

    const marketInfoContract = useMarketContract();

    return async () => {
        if (!marketInfoContract) return;

        dispatch(updateMarketStatus(MarketStatusEnums.LOADING));

        try {
            const market = await marketInfoContract.getAaveMarketInfo(marketAddress);

            const data = market.map((
                { totalSupply, totalBorrow, supplyRate, liquidationRatio, collateralFactor, borrowRateVariable, borrowRateStable, availableLiquidity, price,
                    symbol, aTokenAddress, underlyingTokenAddress, usageAsCollateralEnabled, stableBorrowRateEnabled, borrowinEnabled }: any
            ) => ({
                symbol: symbol.toLocaleUpperCase(),
                totalSupply: getFormatNumber(totalSupply),
                totalBorrow: getFormatNumber(totalBorrow),
                supplyRate: getFormatNumber(supplyRate, 27),
                liquidationRatio: getFormatNumber(liquidationRatio, 4),
                collateralFactor: getFormatNumber(collateralFactor, 4),
                borrowRateVariable: getFormatNumber(borrowRateVariable, 27),
                borrowRateStable: getFormatNumber(borrowRateStable, 27),
                availableLiquidity: getFormatNumber(availableLiquidity, "wei"),
                price: getFormatNumber(price),
                aTokenAddress,
                underlyingTokenAddress,
                usageAsCollateralEnabled,
                stableBorrowRateEnabled,
                borrowinEnabled
            }));

            console.log("use", market, data);

            dispatch(updateMaeketData(data));
            dispatch(updateMarketStatus(MarketStatusEnums.SUCCESS));
        } catch (error) {
            dispatch(updateMarketStatus(MarketStatusEnums.ERROR));
            console.error(error);
        }
    }
}

export const useUserData = () => {
    const dispatch = useAppDispatch();
    const { address } = useUserState();

    const marketAddress = useTokenAddress("AAVE_MARKET");

    const marketInfoContract = useMarketContract();

    return async () => {
        if (!marketInfoContract || !address) return;

        dispatch(updateLoanStatus(MarketStatusEnums.LOADING));

        try {
            const loan = await marketInfoContract.getUserLoanData(marketAddress, address);
            const account = await marketInfoContract.getUserAccountData(marketAddress, address);
            const ratio = await marketInfoContract.getRatio(marketAddress, address);

            const data = loan.filter((item: any) => item.symbol).map((
                { amount, priceETH, rate, loanType, symbol }: any
            ) => ({
                loanType,
                symbol: symbol.toLocaleUpperCase(),
                amount: getFormatNumber(amount),
                priceETH: getFormatNumber(priceETH),
                rate: getFormatNumber(rate, 27),
            }));

            console.log("use", data);

            const { totalCollateralETH, totalDebtETH, availableBorrowsETH, currentLiquidationThreshold, healthFactor } = account;

            dispatch(updateDataInfo({
                totalCollateralETH: getFormatNumber(totalCollateralETH),
                availableBorrowsETH: getFormatNumber(availableBorrowsETH),
                totalDebtETH: getFormatNumber(totalDebtETH),
                currentLiquidationThreshold: getFormatNumber(currentLiquidationThreshold, "wei"),
                healthFactor: getFormatNumber(healthFactor),
                ratio: getFormatNumber(ratio),
            }));
            dispatch(updateLoanData(data));
            dispatch(updateLoanStatus(MarketStatusEnums.SUCCESS));
        } catch (error) {
            dispatch(updateLoanStatus(MarketStatusEnums.ERROR));
            console.error(error);
        }
    }
}

export const useTokenPrice = (tokens: string[] | null) => {
    const [loading, setLoading] = useState(false);
    const [prices, setPrices] = useState();

    const marketAddress = useTokenAddress("AAVE_MARKET");

    const marketInfoContract = useMarketContract();

    const getTokenPrice = async () => {
        if (!marketInfoContract || !tokens?.length) return;
        setLoading(true);

        try {
            const prices = await marketInfoContract.getPrices(marketAddress, tokens);

            setPrices(prices.map((item: number) => getFormatNumber(item)));
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error(error);
        }
    }

    useEffect(() => {
        getTokenPrice();
    }, [tokens, marketInfoContract]);

    return {
        loading,
        prices
    }
}

export const useMarketInit = (status: boolean) => {
    const dispatch = useAppDispatch();

    const { address } = useUserState();

    const marketInfoContract = useMarketContract();

    const marketData = useMarketData();
    const userData = useUserData();

    const getPrices = async () => {
        fetch("https://dapp.wuliff.com/prices")
            .then((body) => {
                return body.json()
            })
            .then(([res]) => {
                dispatch(updateEthPrice(res));
            });
    }

    useEffect(() => {
        if (status) {
            marketData();
        }
    }, [marketInfoContract, status])

    useEffect(() => {
        if (status) {
            userData();
        }
    }, [marketInfoContract, address, status]);

    useEffect(() => {
        getPrices();
    }, [status]);
}