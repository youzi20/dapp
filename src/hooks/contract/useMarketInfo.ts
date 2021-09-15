import { useEffect } from "react";

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
            const markets = await marketInfoContract.getAaveMarketInfo(marketAddress);

            const data = markets.map((
                { totalSupply, totalBorrow, supplyRate, liquidationRatio, collateralFactor, borrowRateVariable, borrowRateStable, availableLiquidity, price,
                    symbol, aTokenAddress, underlyingTokenAddress, usageAsCollateralEnabled, stableBorrowRateEnabled, borrowinEnabled }: any
            ) => ({
                totalSupply: getNumber(totalSupply),
                totalBorrow: getNumber(totalBorrow),
                supplyRate: getNumber(supplyRate, 25),
                liquidationRatio: getNumber(liquidationRatio, 2),
                collateralFactor: getNumber(collateralFactor, 2),
                borrowRateVariable: getNumber(borrowRateVariable, 25),
                borrowRateStable: getNumber(borrowRateStable, 25),
                availableLiquidity: getNumber(availableLiquidity, "wei"),
                price: getNumber(price),
                symbol: symbol.toLocaleUpperCase(),
                aTokenAddress,
                underlyingTokenAddress,
                usageAsCollateralEnabled,
                stableBorrowRateEnabled,
                borrowinEnabled
            }))

            // console.log(data);

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
                { amount, ltv, priceETH, rate, loanType, symbol, tokenAddr, user }: any
            ) => ({
                amount: getNumber(amount),
                ltv: getNumber(ltv, 2),
                priceETH: getNumber(priceETH),
                rate: getNumber(rate, 25),
                loanType, symbol, tokenAddr, user
            }))

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