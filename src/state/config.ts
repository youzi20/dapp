import { createReducer, createAction } from '@reduxjs/toolkit';
import { AppState } from './index';
import { useAppDispatch, useAppSelector } from './hooks';

interface ConfigState {
    readonly reloadCount: number
    readonly UA: string
}

const initialState: ConfigState = {
    reloadCount: 0,
    UA: navigator.userAgent
}

export const updateConfigReload = createAction('config/updateConfigReload');


export function useState(): ConfigState {
    return useAppSelector((state: AppState) => state.config);
}

export function useConfigReload() {
    return useAppSelector((state: AppState) => state.config.reloadCount);
}

export function useUA() {
    return useAppSelector((state: AppState) => state.config.UA);
}

export function useMobile() {
    return useAppSelector((state: AppState) => state.config.UA.match("Mobile"));
}

export const configReducer = createReducer(initialState, (builder) =>
    builder
        .addCase(updateConfigReload, (state) => {
            state.reloadCount += 1;
        })
);