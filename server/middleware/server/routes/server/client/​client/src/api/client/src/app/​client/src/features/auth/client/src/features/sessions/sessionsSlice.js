import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export const fetchSessions = createAsyncThunk(
  'sessions/fetchSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/sessions');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch sessions');
    }
  }
);

export const addSession = createAsyncThunk(
  'sessions/addSession',
  async (sessionData, { rejectWithValue }) => {
    try {
      const response = await api.post('/sessions', sessionData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add session');
    }
  }
);

export const updateSession = createAsyncThunk(
  'sessions/updateSession',
  async ({ id, sessionData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/sessions/${id}`, sessionData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update session');
    }
  }
);

export const deleteSession = createAsyncThunk(
  'sessions/deleteSession',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/sessions/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete session');
    }
  }
);

const initialState = {
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Sessions
      .addCase(fetchSessions.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Add Session
      .addCase(addSession.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update Session
      .addCase(updateSession.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete Session
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      });
  },
});

export default sessionsSlice.reducer;
