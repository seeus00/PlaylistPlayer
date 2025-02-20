import { createSlice } from '@reduxjs/toolkit';

export const AuthSlice = createSlice({
    name: "Authentication",
    initialState: {
        isAuthenticated: false,
        userInfo: null
    },
    
    reducers: {
        setIsAuthenticated: (state, action) => {
            state.isAuthenticated = action.payload;
        },

        setUserInfo: (state, action) => {
            state.userInfo = action.payload;
        }
    }
})

export const { setIsAuthenticated, setUserInfo } = AuthSlice.actions;
export default AuthSlice.reducer;