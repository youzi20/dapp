import { createReducer, createAction } from '@reduxjs/toolkit';
import { AppState } from './index';
import { useAppDispatch, useAppSelector } from './hooks';


export enum SaverStatusEnums {
    LOADING,
    OPEN,
    CLOSE,
    ERROR,
}

interface SaverState {
    readonly status: SaverStatusEnums
    readonly highRatio: string
    readonly minRatio: string
    readonly maxRatio: string
    readonly optimalBoost: string
    readonly optimalRepay: string
    readonly enabled: boolean
}

const initialState: SaverState = {
    status: SaverStatusEnums.CLOSE,
    enabled: true,
    highRatio: "150",
    minRatio: "135",
    maxRatio: "165",
    optimalBoost: "150",
    optimalRepay: "150"
}

export const updateState = createAction<Partial<SaverState> | undefined>('saver/updateState');
export const updateStatus = createAction<SaverStatusEnums>('saver/updateStatus');
export const updateEnabled = createAction<boolean>('saver/updateEnabled');
export const updateHighRatio = createAction<number>('saver/updateHighRatio');
export const updateOtherRatio = createAction<["minRatio" | "maxRatio" | "optimalBoost" | "optimalRepay", string]>('saver/updateOtherRatio');


export function useState(): SaverState {
    return useAppSelector((state: AppState) => state.saver);
}

export const saverReducer = createReducer(initialState, (builder) =>
    builder
        .addCase(updateState, (state, action) => {
            Object.entries(action.payload ?? initialState).forEach(([key, value]) => {
                // @ts-ignore
                state[key] = value;
            });
        })
        .addCase(updateStatus, (state, action) => {
            state.status = action.payload;
        })
        .addCase(updateEnabled, (state, action) => {
            state.enabled = action.payload;
        })
        .addCase(updateHighRatio, (state, action) => {
            state.highRatio = String(action.payload);
            state.minRatio = String(action.payload - 15 < 0 ? 0 : action.payload - 15);
            state.maxRatio = String(action.payload + 15);
            state.optimalBoost = String(action.payload);
            state.optimalRepay = String(action.payload);
        })
        .addCase(updateOtherRatio, (state, action) => {
            const [key, value] = action.payload;
            state[key] = value;
        })
);