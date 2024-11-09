"use client";
import Nav from "@/components/Nav/Nav";
import React from "react";
import styles from "./statistics.module.css";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/helpers/firebase";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import { Select } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import { formatDate } from "@/helpers/utils";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function page() {
  const { users } = useSelector((state) => state.users);
  const { items } = useSelector((state) => state.items);
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState("");
  const [purchases, setPurchases] = React.useState([]);
  const [itemCounts, setItemCounts] = React.useState({});
  const [totalRevenue, setTotalRevenue] = React.useState(0);
  const [numberOfItemsSold, setNumberOfItemsSold] = React.useState(0);
  const [isCustomDate, setIsCustomDate] = React.useState(false);
  const [originalAllPurchases, setOriginalAllPurchases] = React.useState([]);

  const handleDateFilterChange = (event) => {
    setDateFilter(event.target.value);
    filterPurchasesByDate(event.target.value);
  };

  const resetToDefault = () => {
    setStartDate("");
    setEndDate("");
    setDateFilter("");
    setIsCustomDate(false);
    getClientPurchases();
  };

  const filterPurchasesByDate = (filter) => {
    const now = Date.now();
    let filteredPurchases = originalAllPurchases;

    switch (filter) {
      case "today":
        filteredPurchases = originalAllPurchases.filter(
          (purchase) => formatDate(purchase.dateOfPurchase) === formatDate(now)
        );
        setIsCustomDate(false);
        break;
      case "yesterday":
        filteredPurchases = originalAllPurchases.filter(
          (purchase) =>
            formatDate(purchase.dateOfPurchase) === formatDate(now - 86400000)
        );
        setIsCustomDate(false);
        break;
      case "last week":
        filteredPurchases = originalAllPurchases.filter(
          (purchase) => purchase.dateOfPurchase >= now - 604800000
        );
        setIsCustomDate(false);
        break;
      case "last month":
        filteredPurchases = originalAllPurchases.filter(
          (purchase) => purchase.dateOfPurchase >= now - 2629746000
        );
        setIsCustomDate(false);
        break;
      case "last year":
        filteredPurchases = originalAllPurchases.filter(
          (purchase) => purchase.dateOfPurchase >= now - 31556952000
        );
        setIsCustomDate(false);
        break;
      case "custom date":
        setIsCustomDate(true);
        break;
      default:
        filteredPurchases = originalAllPurchases;
        break;
    }

    setPurchases(filteredPurchases);
    updateItemCounts(filteredPurchases);
  };

  const updateItemCounts = (filteredPurchases) => {
    let itemCount = {};
    let totalRevenue = 0;
    let nbOfItemsSold = 0;

    filteredPurchases.forEach((purchase) => {
      purchase.itemSelectedId.forEach((item) => {
        itemCount[item.itemId] = (itemCount[item.itemId] || 0) + 1;
        totalRevenue += parseFloat(item.itemPrice);
        nbOfItemsSold++;
      });
    });

    setItemCounts(itemCount);
    setTotalRevenue(totalRevenue);
    setNumberOfItemsSold(nbOfItemsSold);
  };

  const searchSalesBetweenDates = (startDate, endDate) => {
    const filteredPurchases = originalAllPurchases.filter(
      (purchase) =>
        purchase.dateOfPurchase >= startDate.setHours(0, 0, 0, 0) &&
        purchase.dateOfPurchase <= endDate.setHours(23, 59, 59, 999)
    );

    setPurchases(filteredPurchases);
    updateItemCounts(filteredPurchases);
  };

  const getClientPurchases = async () => {
    let purchasedItems = [];

    const allPurchases = users.map(async (user) => {
      const ordersRef = collection(db, "orders", user.uid, "purchase");
      const q = query(ordersRef, orderBy("dateOfPurchase", "desc"));
      const ordersSnapshot = await getDocs(q);
      ordersSnapshot.docs.forEach((doc) => {
        const orderData = doc.data();
        purchasedItems.push(orderData);
      });
    });

    await Promise.all(allPurchases);
    purchasedItems.sort((a, b) => b.dateOfPurchase - a.dateOfPurchase);
    setPurchases(purchasedItems);
    setOriginalAllPurchases(purchasedItems);
    updateItemCounts(purchasedItems);
  };

  React.useEffect(() => {
    getClientPurchases();
  }, [users]);

  const getTopItems = () => {
    const itemsArray = Object.keys(itemCounts).map((key) => {
      const itemDetails = items.find((item) => item.itemId === key) || {};
      return {
        itemId: key,
        count: itemCounts[key],
        ...itemDetails,
      };
    });
    itemsArray.sort((a, b) => b.count - a.count);
    return itemsArray.slice(0, 3);
  };

  React.useEffect(() => {
    if (startDate && endDate) {
      searchSalesBetweenDates(startDate, endDate);
    }
  }, [startDate, endDate]);

  return (
    <div className={styles.statsContainer}>
      <Nav />
      <div className={styles.statsWrapper}>
        <Box
          sx={{
            minWidth: 200,
            height: 30,
            zIndex: 0,
            "&:hover": {
              borderColor: "black",
            },
          }}
          className={styles.dropdown}
        >
          <FormControl fullWidth>
            <InputLabel
              id="demo-simple-select-label"
              className="selectLabel"
              sx={{
                color: "#000",
                "&.Mui-focused": {
                  color: "white",
                },
                top: "-10px",
              }}
            >
              Day of Sale
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={dateFilter}
              label="Age"
              onChange={handleDateFilterChange}
              className="selected"
              sx={{
                height: "30px",
                border: "1px solid black",
                "&:hover": {
                  borderColor: "#black",
                },
                ".MuiOutlinedInput-notchedOutline": {
                  borderColor: "transparent",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "black",
                },
              }}
            >
              <MenuItem value={"all"} className="option">
                All
              </MenuItem>
              <MenuItem value={"today"} className="option">
                Today
              </MenuItem>
              <MenuItem value={"yesterday"} className="option">
                Yesterday
              </MenuItem>
              <MenuItem value={"last week"} className="option">
                Last Week
              </MenuItem>
              <MenuItem value={"last month"} className="option">
                Last Month
              </MenuItem>
              <MenuItem value={"last year"} className="option">
                Last Year
              </MenuItem>
              <MenuItem value={"custom date"} className="option">
                Custom Date
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
        {isCustomDate ? (
          <>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              placeholderText="Start Date"
              className={styles.datePicker}
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              placeholderText="End Date"
              className={styles.datePicker}
            />
            <button
              className={styles.resetButton}
              onClick={() => resetToDefault()}
            >
              Reset to Default
            </button>
          </>
        ) : null}
        <h1 className={styles.statsHeader}>Your Statistics:</h1>
        {purchases.length > 0 ? (
          <div className={styles.statsInfoWrapper}>
            <div className={styles.salesStats}>
              <div className={styles.salesSecondContainer}>
                <h1>Your Sales: </h1>
                {purchases.map((order, key) => (
                  <div className={styles.salesWrapper} key={key}>
                    <div className={styles.clientInfoWrapper}>
                      <h2 className={styles.clientName}>{order.name}</h2>
                    </div>
                    {order.itemSelectedId.map((item, index) => (
                      <div
                        className={styles.clientPurchaseContainer}
                        key={index}
                      >
                        <p>
                          - {item.itemName} (${item.itemPrice})
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.salesStats}>
              <div className={styles.mostSoldItemsWrapper}>
                <h1>Top 3 Sold Items: </h1>
                {getTopItems().map((item, index) => (
                  <div key={index} className={styles.mostSoldItems}>
                    <h3>
                      Item Name: {item.itemName} - Sold: {item.count}
                      {item.count === 1 ? " time" : " times"}
                    </h3>
                    <h3>Price: ${item.itemPrice}</h3>
                    <h3>Invoice: {item.invoice}</h3>
                    <h3>Cost: ${item.itemCost}</h3>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.salesStats}>
              <div className={styles.totalRevenue}>
                <h1>Total Revenue: </h1>
                <h2>${totalRevenue}</h2>
              </div>
              <div className={styles.numberOfItemsSold}>
                <h1>Total Items Sold: </h1>
                {numberOfItemsSold !== 1 ? (
                  <h2> {numberOfItemsSold} Items</h2>
                ) : (
                  <h2> {numberOfItemsSold} Item</h2>
                )}
              </div>
            </div>
          </div>
        ) : (
          <h1>No Sales Today</h1>
        )}
      </div>
    </div>
  );
}
