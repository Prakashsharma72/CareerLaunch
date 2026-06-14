import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
  loading: false,
  error: null,
};

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    sendMessageStart: (state) => {
      state.loading = true;
    },

    sendMessageSuccess: (state, action) => {
      state.loading = false;
      state.messages.push(action.payload);
    },

    sendMessageFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    clearChat: (state) => {
      state.messages = [];
    },
  },
});

export const {
  sendMessageStart,
  sendMessageSuccess,
  sendMessageFailure,
  clearChat,
} = aiSlice.actions;

export default aiSlice.reducer;