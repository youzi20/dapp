import { getAddress } from '@ethersproject/address';
import { AddressZero } from '@ethersproject/constants';
import { Contract } from '@ethersproject/contracts';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { AbiCoder } from '@ethersproject/abi';
import { formatUnits, parseUnits } from '@ethersproject/units';

type Unit = "wei" | "kwei" | "mwei" | "gwei" | "szabo" | "finney" | "ether";


export function getNumber(value: number | string, unit?: Unit | number): number {
    return parseFloat(formatUnits(value, unit ?? "ether"));
}

export function getRatio(value: number): string {
    return number2fixed(value, 3) + "%";
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
    } else {
        return [num, null]
    }
}

export function numberDelimiter(num: number) {
    if (num > 1) {
        const str = String(num);

        const [integer, decimal] = str.split(".");

        const integerSplit = [];

        let j = integer.length, i = j - 3;
        for (; i > 0; i -= 3) {
            integerSplit.unshift(integer.substring(i, j));
            j = i;
        }

        integerSplit.unshift(integer.substring(i, j));

        return integerSplit.join(",") + (decimal ? "." + decimal : "");
    } else {
        return fullNumber(num);
    }
}

export function numberRuler(num: number) {
    const [amount, unit] = numberUnit(num);

    let fixedAmount: number | string = number2fixed(amount);

    if (fixedAmount > 1e3) {
        fixedAmount = numberDelimiter(fixedAmount);
    } else {
        fixedAmount = fullNumber(fixedAmount);
    }

    return fixedAmount + (unit ?? "");
}

export function number2fixed(value: number, len?: number) {
    if (!value) return 0;

    const str = fullNumber(value);

    let fixedNumber: string = str,
        index = str.indexOf(".");

    if (index >= 0) {
        if (len) {
            fixedNumber = str.substring(0, index + len);
        } else if (Math.abs(value) >= 1) {
            fixedNumber = str.substring(0, index + 3);
        } else {
            fixedNumber = str.substring(0, index + 5);
        }
    }

    return parseFloat(fixedNumber);
}

export function fullNumber(num: number) {
    //处理非数字
    if (isNaN(num)) { return "NaN" };

    //处理不需要转换的数字
    const str = String(num);
    if (!/e/i.test(str)) { return str; };

    return num.toFixed(18).replace(/\.?0+$/, "");
}



export function ethToPrice(count: number, ethPrice: number): [number, string] {
    if (!count) return [0, "$"];
    if (!ethPrice) return [count, "ETH"];

    return [count * ethPrice, "$"];
}

export function ethToPriceTips(count: number, ethPrice: number | null): (number | string)[] {
    if (!count) return [0, 0, "$"];
    if (!ethPrice) return [numberRuler(count), numberDelimiter(count), "ETH"];

    const price = ethToPrice(count, ethPrice);

    const fixedPrice = numberRuler(price[0]);

    const textPrice = numberDelimiter(price[0]);

    return [fixedPrice, textPrice, "$"];
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
        if (val <= 0.001) return 0;

        return val + getBoostMax(val, ratio);
    }
}

export function getRepayMax(from: any, to: any, price: number): number {
    if (!from || !to || !price) return 0;

    const { priceETH: fromEthPrice, amount: fromAmount } = from;
    const { priceETH: toEthPrice } = to;

    if (fromEthPrice <= toEthPrice) return fromAmount;

    return toEthPrice / price * 1.02;
}

export function getWithdrawMax() {

}