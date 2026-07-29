import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import store from "./redux/store";
import { restoreAuth } from "./redux/authSlice";

import "./index.css";

// Rehydrate auth state BEFORE the first render.
// This ensures ProtectedRoute sees isAuthenticated = true on refresh
// instead of flashing a redirect to /login.
store.dispatch(restoreAuth());

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
