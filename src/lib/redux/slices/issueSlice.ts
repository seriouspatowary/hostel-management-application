// lib/redux/slices/issueSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Issue {
  _id: string;
  issue: string;
  departmentId: string;
}

interface IssueState {
  data: Issue[];
  loading: boolean;
  error: string | null;
}

const initialState: IssueState = {
  data: [],
  loading: false,
  error: null,
};

// Thunk to fetch issues
export const fetchIssues = createAsyncThunk<Issue[], void, { rejectValue: string }>(
  'issues/fetchIssues',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<{ success: boolean; data: Issue[] }>('/api/issue');
      return response.data.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Unexpected error');

    }
    
  }
);

const issueSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIssues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIssues.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
  },
});

export default issueSlice.reducer;
