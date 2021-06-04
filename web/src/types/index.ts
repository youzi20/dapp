
export enum WalletType {
    INJECTED = "injected",
    WALLETCCONNECT = "walletconnect",
    WALLETLINK = "walletlink",
    PORTIS = "portis",
}

export enum WalletStatus {
    INIT = "init",
    LOADING = "loading",
    SUCEESS = "success",
}

export interface WalletInterface {
    account?: string | null
    balance?: number | null
    network?: string | null
}


export interface useWalletInterface {
    status: WalletStatus,
    wallet: WalletInterface | null,
    connector: (type: WalletType) => void
}