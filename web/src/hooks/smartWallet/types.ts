export interface SmartWalletInterface {
    status: boolean
    address: string | null
    build: () => void
}