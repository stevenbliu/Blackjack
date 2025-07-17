// errorSlice.ts
import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    message: null,
};
const errorSlice = createSlice({
    name: 'error',
    initialState,
    reducers: {
        setError(state, action) {
            state.message = action.payload;
        },
        clearError(state) {
            state.message = null;
        },
    },
});
export const { setError, clearError } = errorSlice.actions;
export default errorSlice.reducer;
