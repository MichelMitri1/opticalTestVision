import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orderItems: [],
};

export const orderItemsSlice = createSlice({
  name: "orderItems",
  initialState,
  reducers: {
    setOrders: (state, action) => {
      const orderItems = action.payload;
      state.orderItems = orderItems;
    },
  },
});

export const { setOrderItems } = orderItemsSlice.actions;

export default orderItemsSlice.reducer;
