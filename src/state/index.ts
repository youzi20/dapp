import { configureStore } from '@reduxjs/toolkit';
import { save, load } from 'redux-localstorage-simple';

import { walletReducer as wallet } from './wallet';
import { userReducer as user } from './user';
import { marketReducer as market } from './market';
import { langReducer as lang } from './lang';

const PERSISTED_KEYS: string[] = ['lang'];

const store = configureStore({
    reducer: {
        wallet,
        user,
        market,
        lang
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ thunk: true })
            .concat(save({ states: PERSISTED_KEYS, debounce: 1000 })),
    preloadedState: load({ states: PERSISTED_KEYS, disableWarnings: process.env.NODE_ENV === 'test' }),
});

export default store

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;