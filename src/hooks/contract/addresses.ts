import { SupportedChainId } from '../../connectors';

export interface AddressMap { [chainId: number]: string };

export type Address = string | AddressMap | undefined;

function constructSameAddressMap<T extends string>(address: T, other?: { [chainId: number]: T }): { [chainId: number]: T } {
    return {
        [SupportedChainId.MAINNET]: address,
        [SupportedChainId.ROPSTEN]: address,
        [SupportedChainId.RINKEBY]: address,
        [SupportedChainId.GOERLI]: address,
        [SupportedChainId.KOVAN]: address,
        ...other
    }
}

export const AAVE_MARKET = constructSameAddressMap(
    "0x88757f2f99175387aB4C6a4b3067c77A695b0349",
    {
        [SupportedChainId.KOVAN]: "0x88757f2f99175387aB4C6a4b3067c77A695b0349",
    }
);

export const UNISWAP_WRAPPER = constructSameAddressMap(
    "0x7994f28499c0f7226E21D4827D5DD4158F816230",
    {
        [SupportedChainId.KOVAN]: "0x7994f28499c0f7226E21D4827D5DD4158F816230",
    }
);
export const MARKET_ADDRESS = constructSameAddressMap(
    "0xe46c50F1Abb4bc821ee80A79AeBC34d9092b1c6B",
    {
        [SupportedChainId.KOVAN]: "0xe46c50F1Abb4bc821ee80A79AeBC34d9092b1c6B",
    }
);
export const USER_INFO_ADDRESS = constructSameAddressMap(
    "0x64A436ae831C1672AE81F674CAb8B6775df3475C",
    {
        [SupportedChainId.KOVAN]: "0x64A436ae831C1672AE81F674CAb8B6775df3475C",
    }
);
export const USER_HANDLE_ADDRESS = constructSameAddressMap(
    "0x1389E35b1830c7B258B18875D8c4B5C03c391f51",
    {
        [SupportedChainId.KOVAN]: "0x1389E35b1830c7B258B18875D8c4B5C03c391f51",
    }
);
export const USER_HANDLE_OTHER_ADDRESS = constructSameAddressMap(
    "0x7C9fb8EE50B1eE761c669018B4BA57185B35Da0f",
    {
        [SupportedChainId.KOVAN]: "0x7C9fb8EE50B1eE761c669018B4BA57185B35Da0f",
    }
);
export const SAVER_ADDRESS = constructSameAddressMap(
    "0x470B133cE641659644924746Bdf9C13FBaf2C726",
    {
        [SupportedChainId.KOVAN]: "0x470B133cE641659644924746Bdf9C13FBaf2C726",
    }
);
export const SAVER_INFO_ADDRESS = constructSameAddressMap(
    "0xE786F3AB8b5Cb9c15EF87948bab4056Bb67EB252",
    {
        [SupportedChainId.KOVAN]: "0xE786F3AB8b5Cb9c15EF87948bab4056Bb67EB252",
    }
);