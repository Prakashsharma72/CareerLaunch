import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  jobs: [],
  selectedJob: null,
  loading: false,
  error: null,
};

const jobSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    fetchJobsStart: (state) => {
      state.loading = true;
    },

    fetchJobsSuccess: (state, action) => {
      state.loading = false;
      state.jobs = action.payload;
    },

    fetchJobsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    setSelectedJob: (state, action) => {
      state.selectedJob = action.payload;
    },

    addJob: (state, action) => {
      state.jobs.push(action.payload);
    },
  },
});

export const {
  fetchJobsStart,
  fetchJobsSuccess,
  fetchJobsFailure,
  setSelectedJob,
  addJob,
} = jobSlice.actions;

export default jobSlice.reducer;