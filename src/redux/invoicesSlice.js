import { createSlice } from "@reduxjs/toolkit";

const invoicesSlice = createSlice({
  name: "invoices",
  initialState: [ ],
  reducers: {
    addInvoice: (state, action) => {
      state.push(action.payload);
    },
    deleteInvoice: (state, action) => {
      return state.filter((invoice) => invoice.id !== action.payload);
    },
    updateInvoice: (state, action) => {
      const index = state.findIndex(
        (invoice) => invoice.id === action.payload.updatedInvoice.id
      );
      if (index !== -1) {
        state[index] = action.payload.updatedInvoice;
      }

    },
    updateInvoiceProduct: (state, action) => {
      const { productId, newproduct } = action.payload;
      console.log("pro ",newproduct);
    
      state.forEach((invoice) => {
        invoice.items.forEach((item) => {   
          if (item.itemId === productId) {
            invoice.subTotal -= parseFloat(item.itemPrice); 
            item.itemName = newproduct.ItemName;
            item.itemDescription = newproduct.ItemDescription;
            item.itemCategory= newproduct.ItemCategory;
            item.itemPrice = parseFloat(newproduct.ItemPrice);
            invoice.subTotal += parseFloat(item.itemPrice); 
          }
        });
      });
    
    
      state.forEach((invoice) => {
        let subTotal = 0;
        invoice.items.forEach((item) => {
          subTotal += parseFloat(item.itemPrice) * parseInt(item.itemQuantity);
        });
    
        const taxAmount = parseFloat(subTotal * (invoice.taxRate / 100)).toFixed(2);
        const discountAmount = parseFloat(subTotal * (invoice.discountRate / 100)).toFixed(2);
        const total = (subTotal - parseFloat(discountAmount) + parseFloat(taxAmount)).toFixed(2);
    
        invoice.subTotal = parseFloat(subTotal).toFixed(2);
        invoice.taxAmount = taxAmount;
        invoice.discountAmount = discountAmount;
        invoice.total = total;
      });
    },
  },
});

export const {
  addInvoice,
  deleteInvoice,
  updateInvoice,
  updateInvoiceProduct
} = invoicesSlice.actions;

export const selectInvoiceList = (state) => state.invoices;

export default invoicesSlice.reducer;
