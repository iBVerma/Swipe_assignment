import { combineReducers } from "@reduxjs/toolkit";
import invoicesReducer from "./invoicesSlice"; 
import productReducer from "./ProductSlice";

const rootReducer = combineReducers({
  invoices: invoicesReducer,
  products: productReducer,
});

export default rootReducer;
