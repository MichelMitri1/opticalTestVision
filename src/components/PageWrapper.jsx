"use client";
import React from "react";
import GetData from "@/components/GetData";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { PrimeReactProvider } from "primereact/api";

const PageWrapper = ({ children }) => {
  return (
    <Provider store={store}>
      <PrimeReactProvider>
        <>{children}</>
        <GetData />
      </PrimeReactProvider>
    </Provider>
  );
};

export default PageWrapper;
