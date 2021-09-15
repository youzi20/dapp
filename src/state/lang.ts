import { createReducer, createAction } from '@reduxjs/toolkit';

import { SupportedLocale } from '../hooks/lang';

import { AppState } from './index';
import { useAppSelector } from './hooks';



interface LangState {
    readonly locale: SupportedLocale | null
}

const initialState: LangState = {
    locale: null,
}

export const updateUserLocale = createAction<SupportedLocale | null>('lang/updateUserLocale');

export function useUserLocale(): SupportedLocale | null {
    return useAppSelector((state: AppState) => state.lang.locale);
}

export const langReducer = createReducer(initialState, (builder) =>
    builder
        .addCase(updateUserLocale, (state, action) => {
            state.locale = action.payload;
        })
);