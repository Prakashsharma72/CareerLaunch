import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  resources: [],
  loading: false,
  error: null,
};

const resourceSlice = createSlice({
  name: "resources",
  initialState,
  reducers: {
    fetchResourcesStart: (state) => {
      state.loading = true;
    },

    fetchResourcesSuccess: (state, action) => {
      state.loading = false;
      state.resources = action.payload;
    },

    fetchResourcesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    addResource: (state, action) => {
      state.resources.push(action.payload);
    },
  },
});

export const {
  fetchResourcesStart,
  fetchResourcesSuccess,
  fetchResourcesFailure,
  addResource,
} = resourceSlice.actions;

export default resourceSlice.reducer;