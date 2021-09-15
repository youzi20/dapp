import { AbstractConnector } from '@web3-react/abstract-connector';

export enum WalletStatus {
    OFFLINE = "offline",
    LOADING = "loading",
    SUCEESS = "success",
}

export interface WalletInterface {
    account: string | null
    balance: string | null
    network: string | null
}

export interface useWalletInterface {
    status: WalletStatus,
    account?: string | null
    network?: string | null
    tryActivation: (connector: AbstractConnector | undefined) => void
}