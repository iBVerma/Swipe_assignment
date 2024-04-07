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
      console.log("inside slice ",action.payload);
      if(index !== -1){
        state[index]= action.payload.newproduct;
      }
    }
  }
})

export const {
  AddProduct,
  UpdateProduct
} = productSlice.actions;


export const selectProducts = (state) => state.products;

export default productSlice.reducer;
