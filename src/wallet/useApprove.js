
import { MaxUint256 } from '@ethersproject/constants'
import { parseUnits } from '@ethersproject/units';

import { useERC20Contract } from "./useContract";

export function getParseWei(value, unit) {
    if (!value && value !== 0) return;

    return parseUnits(value, unit ?? "ether");
}

export const useApprove = (tokenAddress) => {
    const erc20Contract = useERC20Contract(tokenAddress);

    return async (address, amount) => {
        if (!erc20Contract || !address) return;

        try {
            return erc20Contract["approve(address,uint256)"](address, getParseWei(amount));
        } catch (error) {
            console.error(error);
        }
    }
}