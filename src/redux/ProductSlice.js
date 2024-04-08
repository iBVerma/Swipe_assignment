import { createSlice } from "@reduxjs/toolkit";


const productSlice = createSlice({
  name:'products',
  initialState:[],
  reducers:{
    AddProduct: (state,action) => {
      state.push(action.payload);
    },

    UpdateProduct: (state,action) =>{
      const index = state.findIndex(
        (product) => product.ItemId === action.payload.productID
      );

      if(index !== -1){
        state[index]= action.payload.newproduct;
      }
    },

    DeleteProduct: (state,action) => {
      return state.filter((product) => product.ItemId !== action.payload.productID);
    }
  }
})

export const {
  AddProduct,
  UpdateProduct,
  DeleteProduct
} = productSlice.actions;


export const selectProducts = (state) => state.products;

export default productSlice.reducer;
