import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import store from "./redux/store";
import { bootstrapAuth } from "./redux/authSlice";

import "./index.css";

/**
 * On every page load:
 *  1. Check localStorage for a JWT
 *  2. If present, verify it with the backend and fetch the latest profile
 *  3. Store the fresh user object in Redux before the first render
 *
 * This prevents flash-redirects to /login on refresh AND ensures
 * the user object always reflects the database, not a stale cache.
 */
store.dispatch(bootstrapAuth());

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
