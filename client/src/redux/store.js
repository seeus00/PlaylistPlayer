// import { configureStore } from '@reduxjs/toolkit';
// import authReducer from './authSlice';
// import audioReducer from './audioSlice';
// import { persistStore, persistReducer } from 'redux-persist'
// import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
// import thunk from 'redux-thunk';

// const persistConfig = {
//     key: 'root',
//     storage,
// }

// const authPersistedReducer = persistReducer(persistConfig, authReducer)
// const audioPersistedReducer = persistReducer(persistConfig, audioReducer)

// export const store = configureStore({
//     reducer: {
//         auth: authPersistedReducer,
//         audio: audioPersistedReducer
//     },
//     middleware: [thunk]
// });

// export const persistor = persistStore(store)

import { configureStore, createStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import audioReducer from './audioSlice';
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import thunk from 'redux-thunk';


export const store = configureStore({
    reducer: {
        auth: authReducer,
        audio: audioReducer
    },
    middleware: [thunk]
});
