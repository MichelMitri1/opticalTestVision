import { configureStore } from "@reduxjs/toolkit";
import categoriesSlice from "./categoriesSlice";
import itemsSlice from "./itemsSlice";
import customersSlice from "./customersSlice";
import orderItemsSlice from "./orderItemsSlice";
import ordersSlice from "./ordersSlice";
import usersSlice from "./usersSlice";
import clientEyeTableInfoSlice from "./clientEyeTableInfoSlice";

export const store = configureStore({
  reducer: {
    categories: categoriesSlice,
    items: itemsSlice,
    customers: customersSlice,
    orderItems: orderItemsSlice,
    orders: ordersSlice,
    users: usersSlice,
    clientEyeTableInfo: clientEyeTableInfoSlice,
  },
});
