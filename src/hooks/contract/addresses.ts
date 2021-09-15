
export enum SupportedChainId {
    MAINNET = 1,
    ROPSTEN = 3,
    RINKEBY = 4,
    GOERLI = 5,
    KOVAN = 42,
    ARBITRUM_KOVAN = 144545313136048,
    ARBITRUM_ONE = 42161,
}

export interface Call {
    address: string
    callData: string
    gasRequired?: number
}

export interface AddressMap { [chainId: number]: string };

export type Address = string | AddressMap | undefined;

function constructSameAddressMap<T extends string>(address: T): { [chainId: number]: T } {
    return {
        [SupportedChainId.MAINNET]: address,
        [SupportedChainId.ROPSTEN]: address,
        [SupportedChainId.RINKEBY]: address,
        [SupportedChainId.GOERLI]: address,
        [SupportedChainId.KOVAN]: address,
    }
}

export const BAT = {
    [SupportedChainId.KOVAN]: "0x2d12186fbb9f9a8c28b3ffdd4c42920f8539d738",
}

export const UNI = {
    [SupportedChainId.MAINNET]: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    [SupportedChainId.KOVAN]: "0x075a36ba8846c6b6f53644fdd3bf17e5151789dc",
}

export const DAI = {
    [SupportedChainId.MAINNET]: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    [SupportedChainId.KOVAN]: "0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD",
}

export const USDT = {
    [SupportedChainId.MAINNET]: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    [SupportedChainId.KOVAN]: "0x13512979ADE267AB5100878E2e0f485B568328a4",
}

export const USDC = constructSameAddressMap('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48');
export const WBTC = constructSameAddressMap('0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599');
export const FEI = constructSameAddressMap('0x956F47F50A910163D8BF957Cf5846D573E7f87CA');
export const TRIBE = constructSameAddressMap('0xc7283b66Eb1EB5FB86327f08e1B5816b0720212B');
export const FRAX = constructSameAddressMap('0x853d955aCEf822Db058eb8505911ED77F175b99e');
export const FXS = constructSameAddressMap('0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0');
export const renBTC = constructSameAddressMap('0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D');
export const UMA = constructSameAddressMap('0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828');
export const UST = constructSameAddressMap('0xa47c8bf37f92abed4a126bda807a7b7498661acd');
export const MIR = constructSameAddressMap('0x09a3ecafa817268f77be1283176b946c4ff2e608');

export const AAVE_MARKET = {
    [SupportedChainId.KOVAN]: "0x88757f2f99175387aB4C6a4b3067c77A695b0349",
}

export const UNISWAP_WRAPPER = {
    [SupportedChainId.KOVAN]: "0x7994f28499c0f7226E21D4827D5DD4158F816230",
}

export const MARKET_ADDRESS = constructSameAddressMap('0x662328eEdA8A5Cb019587081e898E35D70512262');
export const USER_INFO_ADDRESS = constructSameAddressMap('0x64A436ae831C1672AE81F674CAb8B6775df3475C');
export const USER_HANDLE_ADDRESS = constructSameAddressMap('0x1389E35b1830c7B258B18875D8c4B5C03c391f51');
export const USER_HANDLE_OTHER_ADDRESS = constructSameAddressMap('0x62118F407c0914a41B5c54bC768108439b7B72fe');