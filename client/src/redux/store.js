import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./authSlice";
import jobReducer from "./jobSlice";
import resourceReducer from "./resourceSlice";
import aiReducer from "./aiSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobReducer,
    resources: resourceReducer,
    ai: aiReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),

  devTools: process.env.NODE_ENV !== "production",
});

export default store;