import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"
import { AuthProvider } from "./context/AuthContext";
import { StoreProvider } from "./context/StoreContext";
import { ProductProvider } from "./context/ProductContext";


ReactDOM.createRoot(document.getElementById("root")).render(

  <React.StrictMode>
    <AuthProvider>
      <StoreProvider>
        <ProductProvider>
          <App />
        </ProductProvider>
      </StoreProvider>
    </AuthProvider>
  </React.StrictMode>
);
