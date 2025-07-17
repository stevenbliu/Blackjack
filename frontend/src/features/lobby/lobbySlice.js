// src/features/lobby/lobbySlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { SEND_WS_MESSAGE } from '../websocket/actionTypes';
const initialState = {
    gameRooms: [],
    loading: false,
    creating: false,
    socketError: null,
    currentPage: 1,
    totalPages: 1,
};
// Thunks dispatch WS messages; the middleware sends and handles WS responses
export const initLobby = createAsyncThunk('lobby/initLobby', async (_, { dispatch }) => {
    // Subscribe to lobby updates
    // dispatch({ type: SEND_WS_MESSAGE, payload: { action: 'subscribe', room: 'lobby' } });
    // Fetch current rooms list
    dispatch(fetchRooms({ page: 1, limit: 10 }));
});
export const fetchRooms = createAsyncThunk('lobby/fetchRooms', async ({ page, limit }, { dispatch }) => {
    dispatch({
        type: SEND_WS_MESSAGE,
        payload: {
            action: 'lobby',
            page,
            limit,
        },
    });
});
export const createGame = createAsyncThunk('lobby/createGame', async (playerId, { dispatch }) => {
    dispatch({ type: SEND_WS_MESSAGE, payload: { action: 'create_game', playerId } });
});
const lobbySlice = createSlice({
    name: 'lobby',
    initialState,
    reducers: {
        setGameRooms(state, action) {
            state.gameRooms = action.payload.games;
            state.currentPage = action.payload.currentPage;
            state.totalPages = action.payload.totalPages;
        },
        setSocketError(state, action) {
            state.socketError = action.payload;
        },
        startLoading(state) {
            state.loading = true;
            state.socketError = null;
        },
        stopLoading(state) {
            state.loading = false;
        },
        startCreating(state) {
            state.creating = true;
            state.socketError = null;
        },
        stopCreating(state) {
            state.creating = false;
        },
        setCurrentPage(state, action) {
            state.currentPage = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRooms.pending, (state) => {
            state.loading = true;
        })
            .addCase(fetchRooms.fulfilled, (state) => {
            state.loading = false;
        })
            .addCase(createGame.pending, (state) => {
            state.creating = true;
        })
            .addCase(createGame.fulfilled, (state) => {
            state.creating = false;
        });
    },
});
export const { setGameRooms, setSocketError, startLoading, stopLoading, startCreating, stopCreating, setCurrentPage } = lobbySlice.actions;
export default lobbySlice.reducer;
