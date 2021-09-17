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

import { getNumber, getRatio } from "../../utils";

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
                totalSupply: getNumber(totalSupply),
                totalBorrow: getNumber(totalBorrow),
                supplyRate: getNumber(supplyRate, 27),
                liquidationRatio: getNumber(liquidationRatio, 4),
                collateralFactor: getNumber(collateralFactor, 4),
                borrowRateVariable: getNumber(borrowRateVariable, 27),
                borrowRateStable: getNumber(borrowRateStable, 27),
                availableLiquidity: getNumber(availableLiquidity, "wei"),
                price: getNumber(price),
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
                amount: getNumber(amount),
                priceETH: getNumber(priceETH),
                rate: getNumber(rate, 27),
            }));

            console.log("use", data);

            const { totalCollateralETH, totalDebtETH, availableBorrowsETH, currentLiquidationThreshold, ltv, healthFactor } = account;

            dispatch(updateDataInfo({
                totalCollateralETH: getNumber(totalCollateralETH),
                availableBorrowsETH: getNumber(availableBorrowsETH),
                totalDebtETH: getNumber(totalDebtETH),
                currentLiquidationThreshold: getNumber(currentLiquidationThreshold, "wei"),
                ltv: getRatio(ltv),
                healthFactor: getNumber(healthFactor),
                ratio: getNumber(ratio),
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

            setPrices(prices.map((item: number) => getNumber(item)));
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
            .then(res => {
                dispatch(updateEthPrice(res[0]));
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