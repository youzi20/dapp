import { createReducer, createAction } from '@reduxjs/toolkit';
import { AppState } from './index';
import { useAppDispatch, useAppSelector } from './hooks';


export enum UserStatusEnums {
    CREATE,
    LOADING,
    SUCCESS,
    ERROR,
}

interface UserState {
    readonly address?: string
    readonly status: UserStatusEnums
    readonly dataInfo?: { [key: string]: any }
}

const initialState: UserState = {
    status: UserStatusEnums.LOADING
}

export const updateState = createAction<UserState | undefined>('user/updateState');
export const updateAddress = createAction<string>('user/updateAddress');
export const updateStatus = createAction<UserStatusEnums>('user/updateStatus');
export const updateDataInfo = createAction<{ [key: string]: any } | undefined>('user/updateDataInfo');

export function useAddress(): string | undefined {
    return useAppSelector((state: AppState) => state.user.address);
}

export function useUserInfo() {
    return useAppSelector((state: AppState) => state.user.dataInfo);
}

export function useState(): UserState {
    return useAppSelector((state: AppState) => state.user);
}

export const userReducer = createReducer(initialState, (builder) =>
    builder
        .addCase(updateState, (state, action) => {
            Object.entries(action.payload ?? initialState).forEach(([key, value]) => {
                // @ts-ignore
                state[key] = value;
            });
        })
        .addCase(updateAddress, (state, action) => {
            state.address = action.payload;
        })
        .addCase(updateStatus, (state, action) => {
            state.status = action.payload;
        })
        .addCase(updateDataInfo, (state, action) => {
            state.dataInfo = action.payload;
        })
);