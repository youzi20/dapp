import { createReducer, createAction } from '@reduxjs/toolkit';
import { AppState } from './index';
import { useAppSelector } from './hooks';

import { SupportedWallet } from '../hooks/wallet';

export enum WalletStatusEnums {
    OFFLINE,
    LOADING,
    SUCEESS,
}

export enum WalletBalancesEnums {
    FINISH,
    LOADING,
    ERROR,
}

interface WalletState {
    readonly status: WalletStatusEnums
    readonly balancesStatus: WalletBalancesEnums
    readonly wallet?: SupportedWallet
    readonly network?: string
    readonly balances?: string
    readonly error?: string | React.ReactNode
}

const initialState: WalletState = {
    status: WalletStatusEnums.OFFLINE,
    balancesStatus: WalletBalancesEnums.FINISH,
}

export const updateStatus = createAction<WalletStatusEnums>('wallet/updateStatus');
export const updateBalancesStatus = createAction<WalletBalancesEnums>('wallet/updateBalancesStatus');
export const updateWallet = createAction<SupportedWallet>('wallet/updateWallet');
export const updateNetwork = createAction<string>('wallet/updateNetwork');
export const updateBalances = createAction<string>('wallet/updateBalances');
export const updateError = createAction<string | React.ReactNode>('wallet/updateError');

export function useState(): WalletState {
    return useAppSelector((state: AppState) => state.wallet);
}

export function useETHBalances(): string | undefined {
    return useAppSelector((state: AppState) => state.wallet.balances)
}

export const walletReducer = createReducer(initialState, (builder) =>
    builder
        .addCase(updateStatus, (state, action) => {
            state.status = action.payload;
        })
        .addCase(updateBalancesStatus, (state, action) => {
            state.balancesStatus = action.payload;
        })
        .addCase(updateWallet, (state, action) => {
            state.wallet = action.payload;
        })
        .addCase(updateNetwork, (state, action) => {
            state.network = action.payload;
        })
        .addCase(updateBalances, (state, action) => {
            state.balances = action.payload;
        })
        .addCase(updateError, (state, action) => {
            state.error = action.payload;
        })
);