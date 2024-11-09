"use client";
import React from "react";
import { db } from "@/helpers/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { setCategories } from "@/redux/categoriesSlice";
import { setItems } from "@/redux/itemsSlice";
import { setCustomers } from "@/redux/customersSlice";
import { setOrderItems } from "@/redux/orderItemsSlice";
import { setOrders } from "@/redux/ordersSlice";
import { setUsers } from "@/redux/usersSlice";

const GetData = () => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    const unsubscribeCategories = onSnapshot(
      collection(db, "categories"),
      (querySnapshot) => {
        const newCategories = [];
        querySnapshot.forEach((doc) => {
          newCategories.push(doc.data());
        });
        dispatch(setCategories(newCategories));
      }
    );
    return () => unsubscribeCategories();
  }, []);

  React.useEffect(() => {
    const unsubscribeItems = onSnapshot(
      collection(db, "items"),
      (querySnapshot) => {
        const newItems = [];
        querySnapshot.forEach((doc) => {
          newItems.push({ id: doc.id, ...doc.data() });
        });
        dispatch(setItems(newItems));
      }
    );

    return () => unsubscribeItems();
  }, []);

  React.useEffect(() => {
    const unsubscribeCustomers = onSnapshot(
      collection(db, "customers"),
      (querySnapshot) => {
        const newCustomers = [];
        querySnapshot.forEach((doc) => {
          newCustomers.push(doc.data());
        });
        dispatch(setCustomers(newCustomers));
      }
    );

    return () => unsubscribeCustomers();
  }, []);

  // React.useEffect(() => {
  //   const unsubscribeOrderItems = onSnapshot(
  //     collection(db, "orderItems"),
  //     (querySnapshot) => {
  //       const newOrderItems = [];
  //       querySnapshot.forEach((doc) => {
  //         newOrderItems.push(doc.data());
  //       });
  //       dispatch(setOrderItems(newOrderItems));
  //     }
  //   );

  //   return () => unsubscribeOrderItems();
  // }, []);

  React.useEffect(() => {
    const unsubscribeOrders = onSnapshot(
      collection(db, "orders"),
      (querySnapshot) => {
        const newOrders = [];
        querySnapshot.forEach((doc) => {
          newOrders.push(doc.data());
        });
        dispatch(setOrders(newOrders));
      }
    );
    return () => unsubscribeOrders();
  }, []);

  React.useEffect(() => {
    const unsubscribeUsers = onSnapshot(
      collection(db, "users"),
      (querySnapshot) => {
        const newUsers = [];
        querySnapshot.forEach((doc) => {
          newUsers.push(doc.data());
        });
        dispatch(setUsers(newUsers));
      }
    );
    return () => unsubscribeUsers();
  }, []);

  return <></>;
};

export default GetData;
