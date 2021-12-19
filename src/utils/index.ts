import { formatUnits, parseUnits } from '@ethersproject/units';
import { BigNumberish } from '@ethersproject/bignumber';
import { AbiCoder } from '@ethersproject/abi';

export type Unit = "wei" | "kwei" | "mwei" | "gwei" | "szabo" | "finney" | "ether";

export type HandleType = "Boost" | "Repay" | "Supply" | "Withdraw" | "Borrow" | "Payback";
export type HandleClass = "buy" | "sell";

export function getRatio(value?: number, int?: boolean): string {
    if (!value && value !== 0) return "0";

    return (fullNumber(numberToFixed(value, int ? 0 : 2)) ?? "0") + "%";
}

export function getParseWei(value: any, unit?: Unit | number) {
    if (!value && value !== 0) return;

    return parseUnits(value, unit ?? "ether");
}

export function getFormatNumber(value: number | string | BigNumberish, unit?: Unit | number) {
    return fullNumber(formatUnits(value, unit ?? "ether"));
}

export function getStringAndNumber(value: number | string): [string, number] {
    return [fullNumber(value), Number(value)];
}

export function getAccountSecrecy(account?: string | null): string {
    if (!account) return "";
    if (account.length < 15) return account;

    const start = account.substring(0, 8);
    const end = account.substring(account.length - 4);

    return start + "..." + end;
}

export function numberToFixed(value?: string | number, len?: number) {
    if (!value || Number(value) === 0) return "0";

    if (typeof value === "number") value = fullNumber(value);

    var [integer, decimal] = value.split(/\./);

    if (!decimal) return Number(value).toFixed(len);

    if (len) {
        decimal = decimal.substring(0, len);
    } else if (Math.abs(Number(value)) >= 1e-2) {
        decimal = decimal.substring(0, 2);
    } else if (Math.abs(Number(value)) >= 1e-4) {
        decimal = decimal.substring(0, 4);
    } else {
        decimal = "0";
    }

    // if (/^0+$/.test(decimal)) return integer;

    return `${integer}.${decimal}`;
}

export function numberUnit(num: number): [string, string | undefined] {
    let unit;

    if (num > 1e18) {
        num = num / 1e18;
        unit = "E";
    } else if (num > 1e15) {
        num = num / 1e15;
        unit = "P";
    } else if (num > 1e12) {
        num = num / 1e12;
        unit = "T";
    } else if (num > 1e9) {
        num = num / 1e9;
        unit = "B";
    } else if (num > 1e6) {
        num = num / 1e6;
        unit = "M";
    }

    return [numberToFixed(num), unit];
}

export function numberRuler(value?: number) {
    if (!value || value === 0) return "0";

    const [num, unit] = numberUnit(value);

    return `${numberDelimiter(num) ?? ""}${unit ?? ""}`;
}

export function numberDelimiter(value?: number | string) {
    if (!value) return;

    const [strValue, numValue] = getStringAndNumber(value);

    if (numValue < 1e3) return strValue;

    const [integer, decimal] = strValue.split(".");

    const integerSplit = [];

    let i, j;
    for (j = integer.length, i = j - 3; i > 0; i -= 3) {

        integerSplit.unshift(integer.substring(i, j));
        j = i;
    }

    integerSplit.unshift(integer.substring(i, j));

    return integerSplit.join(",") + (decimal ? "." + decimal : "");
}
export function fullNumber(value?: string | number | BigNumberish, exact?: boolean) {
    const valueStr = String(value);

    // const regex = /^0\.0+$/;
    // regex.test(valueStr) ||

    if (value === 0) {
        return "0"
    } else if (typeof value === "number" && isNaN(value)) {
        return "NaN"
    } else if (!value) {
        return "null";
    }


    // const [valueStr, valueNum] = getStringAndNumber(value);

    // if (valueNum === 0) return "0";

    // if (isNaN(valueNum)) return "NaN";

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

export function ethToPrice(count?: number, price?: number) {
    if (!count) return { value: "0", currency: "$" };

    if (!price) return { value: count, currency: "ETH" };

    return { value: count * price, currency: "$" };
}

export function getNumberTips(price?: string | number) {
    if (!price && price !== 0) return {};

    const [strValue, numValue] = getStringAndNumber(price);

    return {
        numUnit: numberRuler(numValue),
        numTips: numberDelimiter(strValue)
    }
}

export function abiEncode(type: any, value: any) {
    const Abi = new AbiCoder();

    return Abi.encode(type, value);
}

export function getContainer(container: any) {
    return typeof container === 'function' ? container() : container;
}

export function getHandleTheme(type: HandleType) {
    if (!type) return;

    if (["Boost", "Supply", "Borrow"].indexOf(type) >= 0) return "#14bd88";
    if (["Repay", "Withdraw", "Payback"].indexOf(type) >= 0) return "#cc5e47";
}

export function getHandleType(type: HandleType): HandleClass | undefined {
    if (!type) return;

    if (["Boost", "Supply", "Borrow"].indexOf(type) >= 0) return "buy";
    if (["Repay", "Withdraw", "Payback"].indexOf(type) >= 0) return "sell";
}