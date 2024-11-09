"use client";
import React, { useEffect, useState } from "react";
import styles from "./boughtInvoices.module.css";
import Nav from "@/components/Nav/Nav";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from "react-redux";
import { formatDate } from "@/helpers/utils";

export default function page() {
  const { items } = useSelector((state) => state.items);
  const [allItems, setAllItems] = useState(items);
  const [searchInfo, setSearchInfo] = useState({
    invoice: "",
    supplier: "",
    startDate: "",
    endDate: "",
  });

  function formatUnixDate(milliseconds) {
    const date = new Date(milliseconds);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  function searchSalesBetweenDates(start, end) {
    console.log("Start Timestamp:", start.getTime());
    console.log("End Timestamp:", end.getTime());

    const filteredItems = items.filter((item) => {
      const itemDateTimestamp = parseInt(item.date * 1000);
      console.log("Item Timestamp:", itemDateTimestamp);

      return (
        itemDateTimestamp >= start.getTime() &&
        itemDateTimestamp <= end.getTime()
      );
    });

    setAllItems(filteredItems);
  }

  const handleSearchInfo = (e) => {
    const { name, value } = e.target;

    setSearchInfo((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "invoice" && value === "" && searchInfo.supplier === "") {
      setAllItems(items);
      return;
    }
    if (name === "supplier" && value === "" && searchInfo.invoice === "") {
      setAllItems(items);
      return;
    }

    const filteredItems = items.filter((item) => {
      const matchesInvoice = item.invoice
        .toLowerCase()
        .includes(searchInfo.invoice.toLowerCase());
      const matchesSupplier = item.itemSupplier
        .toLowerCase()
        .includes(searchInfo.supplier.toLowerCase());

      return matchesInvoice && matchesSupplier;
    });

    setAllItems(filteredItems);
  };

  useEffect(() => {
    const sortedItems = [...items].sort((a, b) => {
      return parseInt(b.date * 1000) - parseInt(a.date * 1000);
    });
    setAllItems(sortedItems);
  }, [items]);

  React.useEffect(() => {
    if (searchInfo.startDate && searchInfo.endDate) {
      searchSalesBetweenDates(searchInfo.startDate, searchInfo.endDate);
    }
  }, [searchInfo.startDate, searchInfo.endDate]);

  return (
    <div className={styles.container}>
      <Nav />
      <div className={styles.row}>
        <h1 className={styles.invoiceHeader}>Search For Invoices</h1>
        <input
          type="text"
          name="invoice"
          value={searchInfo.invoice}
          className={styles.invoiceInput}
          placeholder="Search By Invoice"
          onChange={(e) => handleSearchInfo(e)}
        />
        <input
          type="text"
          name="supplier"
          value={searchInfo.supplier}
          className={styles.invoiceInput}
          placeholder="Search By Supplier"
          onChange={(e) => handleSearchInfo(e)}
        />
        <DatePicker
          selected={searchInfo.startDate}
          onChange={(date) =>
            setSearchInfo({
              ...searchInfo,
              startDate: date,
            })
          }
          placeholderText="Start Date"
          className={styles.invoiceInput}
          popperClassName="react-datepicker-popper"
        />
        <DatePicker
          selected={searchInfo.endDate}
          onChange={(date) =>
            setSearchInfo({
              ...searchInfo,
              endDate: date,
            })
          }
          placeholderText="End Date"
          className={styles.invoiceInput}
          popperClassName="react-datepicker-popper"
        />
        <div className={styles.itemsWrapper}>
          {allItems.map((item) => (
            <div className={styles.itemInfo}>
              <h1 className={styles.itemSupplier}>{item.itemSupplier} </h1>
              <h1 className={styles.itemInvoice}>{item.invoice}</h1>
              <h1 className={styles.itemDate}>
                {formatDate(parseInt(item.date * 1000))}
              </h1>
              <h2 className={styles.itemName}>{item.itemName}</h2>
              <h2 className={styles.itemCode}>{item.itemCode}</h2>
              <h3 className={styles.itemPrice}>USD {item.itemPrice}</h3>
              <h3 className={styles.itemQuantity}>QTY: {item.itemQuantity} </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
