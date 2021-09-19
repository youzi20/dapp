import { getAddress } from '@ethersproject/address';
import { AddressZero } from '@ethersproject/constants';
import { Contract } from '@ethersproject/contracts';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { AbiCoder } from '@ethersproject/abi';
import { formatUnits, parseUnits } from '@ethersproject/units';

import { Unit, HandleTheme } from '../types';

export function stringAndNumber(value: number | string): [string, number] {
    return typeof value === "number" ? [String(value), value] : [value, Number(value)];
}

export function getRatio(value: number): string {
    return (number2fixed(value, 2) ?? "0") + "%";
}

export function getFormatNumber(value: number | string, unit?: Unit | number) {
    return formatUnits(value, unit ?? "ether");
}

export function getWei(value: any, unit?: Unit) {
    return parseUnits(value, unit ?? "ether");
}

export function toFixed(value?: number) {
    if (value) return value.toFixed(2);
    return 0;
}

export function accountSplit(account?: string | null): string {
    if (!account) return "";
    if (account.length < 15) return account;

    const start = account.substring(0, 8);
    const end = account.substring(account.length - 4);

    return start + "..." + end;
}

export function numberUnit(num: number): [number, string | null] {
    if (num > 1e12) {
        return [num / 1e12, "T"];
    } else if (num > 1e9) {
        return [num / 1e9, "B"];
    } else if (num > 1e6) {
        return [num / 1e6, "M"];
    } else if (num > 1e3) {
        return [num / 1e3, "K"];
    } else {
        return [num, null]
    }
}

export function numberDelimiter(value?: string) {
    if (!value) return null;

    if (Number(value) > 1e3) {
        const [integer, decimal] = value.split(".");

        const integerSplit = [];

        let i, j;
        for (j = integer.length, i = j - 3; i > 0; i -= 3) {

            integerSplit.unshift(integer.substring(i, j));
            j = i;
        }

        integerSplit.unshift(integer.substring(i, j));

        return integerSplit.join(",") + (decimal ? "." + decimal : "");
    } else {
        return fullNumber(value);
    }
}

export function numberRuler(num: string | number) {
    if (typeof num === "string") num = Number(num);

    const [amount, unit] = numberUnit(num);

    return number2fixed(fullNumber(amount)) + (unit ?? "");
}

export function number2fixed(value: string | number, len?: number) {
    if (!value) return null;

    if (typeof value === "number") value = String(value);

    var [integer, decimal] = value.split(/\./);

    if (!decimal) return value;

    if (len) {
        decimal = decimal.substring(0, len);
    } else if (Math.abs(Number(value)) >= 1) {
        decimal = decimal.substring(0, 2);
    } else {
        decimal = decimal.substring(0, 4);
    }

    if (/^0+$/.test(decimal)) return integer;

    return `${integer}.${decimal}`;
}

export function fullNumber(value: string | number, exact?: boolean) {
    const [valueStr, valueNum] = stringAndNumber(value);

    //处理非数字
    if (isNaN(valueNum)) return "NaN";

    //处理不需要转换的数字
    if (!/e/i.test(valueStr)) return valueStr;

    const strArr = valueStr.split(/[.\e]/);

    if (strArr.length === 3) {
        var [integer, decimal, power] = strArr;
    } else {
        var [integer, power] = strArr;
    }

    const powerNum = Number(power);

    if (powerNum > 0) {
        return `${integer}${decimal ?? ""}${"0".repeat(Math.abs(powerNum) - decimal?.length ?? 0)}`;
    } else {
        return `0.${"0".repeat(Math.abs(powerNum) - integer?.length ?? 0)}${integer}${decimal ?? ""}`;
    }
}


export function ethToPrice(count: number, price: number): string[] {
    if (!count) return ["0", "$"];
    if (!price) return [String(count), "ETH"];

    return [fullNumber(count * price), "$"];
}

export function ethToPriceTips(count: string | number, price: number | null): string[] {
    if (!count) return ["0", "0", "$"];

    const [countStr, countNum] = stringAndNumber(count);

    if (!price) return [numberRuler(count), numberDelimiter(countStr) ?? "", "ETH"];

    const [num, unit] = ethToPrice(countNum, price);

    return [numberRuler(num), numberDelimiter(num) ?? "", unit];
}

export function isAddress(value: any): string | false {
    try {
        return getAddress(value)
    } catch {
        return false
    }
}

export function isInvalidAddress(value: string): boolean {
    const invalid = ["0x0000000000000000000000000000000000000000"];

    if (isAddress(value) && invalid.indexOf(value) < 0) return false;

    return true;
}

export function getContainer(container: any) {
    return typeof container === 'function' ? container() : container;
}

// account is not optional
export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
    return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
    return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
    if (!isAddress(address) || address === AddressZero) {
        throw Error(`Invalid 'address' parameter '${address}'.`)
    }

    return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}

export function abiEncode(type: any, value: any) {
    const Abi = new AbiCoder();

    return Abi.encode(type, value);
}

export function getBoostMax(value: number, ratio: number, isFirst?: boolean): number {
    if (!value || !ratio) return value;

    if (isFirst) {
        return value + getBoostMax(value, ratio);
    } else {
        const val = value * ratio;
        if (val <= 1e-5) return 0;

        return val + getBoostMax(val, ratio);
    }
}

export function getRepayMax(from: any, to: any): number {
    if (!from || !to) return 0;

    const { priceETH: fromEthPrice, amount: fromAmount, price } = from;
    const { priceETH: toEthPrice } = to;

    if (fromEthPrice <= toEthPrice) return fromAmount;

    var max = 0;

    return (max = toEthPrice / price * 1.02) > fromAmount ? fromAmount : max;
}

export function getWithdrawMax() {

}

export function getHandleTheme(type: HandleTheme) {
    switch (type) {
        case "Boost":
            return "#318D70";
        case "Repay":
            return "#C26E5C";
        case "Supply":
            return "#318D70";
        case "Withdraw":
            return "#C26E5C";
        case "Borrow":
            return "#318D70";
        case "Payback":
            return "#C26E5C";
    }
}