"use client";
import React from "react";
import { useSelector } from "react-redux";
import styles from "../sales/sales.module.css";
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/helpers/firebase";
import Nav from "@/components/Nav/Nav";
import Link from "next/link";
import DatePicker from "react-datepicker";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import "react-datepicker/dist/react-datepicker.css";
import toast, { Toaster } from "react-hot-toast";
import { formatDate } from "@/helpers/utils";
import "../globals.css";

function Page() {
  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);
  const [purchases, setPurchases] = React.useState([]);
  const [pendingFilter, setPendingFilter] = React.useState("");
  const { users } = useSelector((state) => state.users);
  const [warehouse, setWarehouse] = React.useState("");
  const [allWarehouses, setAllWarehouses] = React.useState([]);
  const [amountToEdit, setAmountToEdit] = React.useState(null);
  const [amountPaid, setAmountPaid] = React.useState("");
  const [originalAllPurchases, setOriginalAllPurchases] = React.useState([]);

  function formatUnixDate(milliseconds) {
    const date = new Date(milliseconds);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  const getClientPurchases = async () => {
    let purchasedItems = [];
    const allPurchases = users.map(async (user) => {
      const ordersRef = collection(db, "orders", user.uid, "purchase");
      const q = query(ordersRef, orderBy("dateOfPurchase", "desc"));
      const ordersSnapshot = await getDocs(q);
      ordersSnapshot.docs.forEach((doc) => {
        purchasedItems.push({
          id: doc.id,
          ...doc.data(),
        });
      });
    });
    await Promise.all(allPurchases);
    purchasedItems.sort((a, b) => b.dateOfPurchase - a.dateOfPurchase);
    setPurchases(purchasedItems);
    setOriginalAllPurchases(purchasedItems);
  };

  function searchSalesBetweenDates(start, end) {
    const startDateFormatted = formatUnixDate(start);
    const endDateFormatted = formatUnixDate(end);

    const filteredPurchases = originalAllPurchases.filter((purchase) => {
      const purchaseDateFormatted = formatUnixDate(purchase.dateOfPurchase);
      return (
        purchaseDateFormatted >= startDateFormatted &&
        purchaseDateFormatted <= endDateFormatted
      );
    });

    setPurchases(filteredPurchases);
  }

  const handleWarehouseChange = (event) => {
    const selectedWarehouse = event.target.value;
    setWarehouse(selectedWarehouse);
    if (selectedWarehouse === "all") {
      setPurchases(originalAllPurchases);
      return;
    }

    const filteredPurchases = originalAllPurchases.filter(
      (purchase) =>
        purchase.itemSelectedId[0].itemWarehouse === selectedWarehouse
    );

    setPurchases(filteredPurchases);
  };

  function searchByName(e) {
    const userName = e.target.value.toLowerCase();

    if (!userName) {
      setPurchases(originalAllPurchases);
      return;
    }

    const filteredUsers = originalAllPurchases.filter((user) =>
      user.name.toLowerCase().includes(userName)
    );

    setPurchases(filteredUsers);
  }

  // function searchBySupplier(e) {
  //   const userSupplier = e.target.value.toLowerCase();

  //   if (!userSupplier) {
  //     setPurchases(originalAllPurchases);
  //     return;
  //   }

  //   const filteredUsers = originalAllPurchases.filter((user) =>
  //     user.itemSelectedId.map((item) =>
  //       item.itemSupplier.toLowerCase().includes(userSupplier)
  //     )
  //   );

  //   setPurchases(filteredUsers);
  // }

  function editAmountPaid(itemId) {
    if (amountToEdit === itemId) {
      // If the same item is clicked again, toggle it off
      setAmountToEdit(null);
    } else {
      // Set the currently edited item
      setAmountToEdit(itemId);
    }
  }

  async function confirmPaidAmount(order) {
    try {
      const orderRef = doc(db, "orders", order.userId, "purchase", order.id);
      await updateDoc(orderRef, { amountPaid });

      const updatedPurchases = purchases.map((purchase) =>
        purchase.id === order.id ? { ...purchase, amountPaid } : purchase
      );

      setPurchases(updatedPurchases);
      setOriginalAllPurchases(updatedPurchases);
      toast.success("Amount Paid updated successfully!");
      setAmountToEdit(false);
      setAmountPaid("");
    } catch (error) {
      toast.error("Error updating Amount Paid:", error.message);
    }
  }

  function resetToDefault() {
    setPurchases(originalAllPurchases);
    setStartDate(null);
    setEndDate(null);
  }

  async function completeAmountPaid(order) {
    try {
      const orderRef = doc(db, "orders", order.userId, "purchase", order.id);
      await updateDoc(orderRef, { amountPaid: "paid" });

      // Update the local state
      const updatedPurchases = purchases.map((purchase) =>
        purchase.id === order.id
          ? { ...purchase, amountPaid: "paid" }
          : purchase
      );

      setPurchases(updatedPurchases);
      setOriginalAllPurchases(updatedPurchases);
      toast.success("Amount Paid updated successfully!");
      setAmountToEdit(false);
      setAmountPaid("");
    } catch (error) {
      toast.error("Error updating Amount Paid:", error.message);
    }
  }

  const handlePendingFilterChange = (event) => {
    const filterValue = event.target.value;
    setPendingFilter(filterValue);
    if (filterValue === "all") {
      setPurchases(originalAllPurchases);
      return;
    }

    const filteredPurchases = originalAllPurchases.filter((purchase) => {
      const amountPaid = parseFloat(purchase.amountPaid);

      if (filterValue === "paid") {
        console.log("paid");
        return isNaN(amountPaid);
      } else {
        console.log("not paid");
        return !isNaN(amountPaid) && amountPaid >= 0;
      }
    });

    setPurchases(filteredPurchases);
  };

  async function getAllWarehouses() {
    try {
      const warehouses = collection(db, "warehouse");
      const warehouseSnapshot = await getDocs(warehouses);

      const warehouseData = warehouseSnapshot.docs.map((doc) => doc.data());

      setAllWarehouses(warehouseData);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    }
  }

  React.useEffect(() => {
    getClientPurchases();
    getAllWarehouses();
  }, [users]);

  React.useEffect(() => {
    if (startDate && endDate) {
      searchSalesBetweenDates(startDate, endDate);
    }
  }, [startDate, endDate]);

  return (
    <div className={styles.salesContainer}>
      <Nav />
      <Toaster />
      <h1 className={styles.salesHeader}>Your Sales:</h1>
      <DatePicker
        selected={startDate}
        onChange={(date) => setStartDate(date)}
        placeholderText="Start Date"
        className={styles.datePicker}
        popperClassName="react-datepicker-popper"
      />
      <DatePicker
        selected={endDate}
        onChange={(date) => setEndDate(date)}
        placeholderText="End Date"
        className={styles.datePicker}
        popperClassName="react-datepicker-popper"
      />
      <input
        className={styles.searchNameInput}
        placeholder="Search by Name"
        onChange={(e) => searchByName(e)}
      />
      {/* <input
        className={styles.searchNameInput}
        placeholder="Search by Supplier"
        onChange={(e) => searchBySupplier(e)}
      /> */}
      <button className={styles.resetButton} onClick={() => resetToDefault()}>
        Reset to Default
      </button>
      <div className={styles.salesFirstContainer}>
        <Box
          sx={{
            minWidth: 200,
            height: 30,
            zIndex: 0,
            "&:hover": {
              borderColor: "black",
            },
            zIndex: 0,
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
              Filter Warehouse
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={warehouse}
              label="Age"
              onChange={handleWarehouseChange}
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
              {allWarehouses.map((warehouse) => {
                return (
                  <MenuItem value={warehouse.warehouse} className="option">
                    {warehouse.warehouse}
                  </MenuItem>
                );
              })}
              <MenuItem value={"all"} className="option">
                All sales
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
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
              Filter Pending
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={pendingFilter}
              label="Pending"
              onChange={handlePendingFilterChange}
              className="selected"
              sx={{
                height: "30px",
                border: "1px solid black",
                "&:hover": {
                  borderColor: "black",
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
              <MenuItem value={"notPaid"} className="option">
                Not Paid
              </MenuItem>
              <MenuItem value={"paid"} className="option">
                Paid
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </div>
      <div className={styles.salesSecondContainer}>
        {purchases.map((order, key) => (
          <div className={styles.salesWrapper} key={key}>
            <h2 className={styles.clientDate}>
              {formatDate(order.dateOfPurchase)}
            </h2>
            <div className={styles.clientInfoWrapper}>
              <h1 className={styles.clientName}>{order.name}</h1>
              <h2 className={styles.clientEmail}>{order.email}</h2>
              <h3 className={styles.clientCity}>
                {order.city}, {order.address}
              </h3>
              <p className={styles.clientNumber}>{order.number}</p>
            </div>
            {order.itemSelectedId.map((item, key) => (
              <>
                <div className={styles.clientPurchaseContainer}>
                  <Link
                    className={styles.clientPurchaseWrapper}
                    key={key}
                    href={`/receipt/${order.userId}/${order.clientOrderId}?pending=${item.pendingOrder}`}
                  >
                    <h3>
                      -{item.itemName} (${item.itemPrice})
                    </h3>
                  </Link>
                </div>
              </>
            ))}
            <div className={styles.clientEditingContainer}>
              <h3 style={{ color: "white" }}>
                Total: $
                {order.itemSelectedId.reduce(
                  (acc, item) => acc + parseFloat(item.itemPrice),
                  0
                )}
              </h3>
              {order.amountPaid === "paid" ? (
                <h2 className={styles.paid}>
                  Amount paid in full with {order.payment}
                </h2>
              ) : (
                <div className={styles.editingInfo}>
                  <h2 className={styles.notPaid}>
                    {" "}
                    ${order.amountPaid} out of $
                    {order.itemSelectedId.reduce(
                      (acc, item) => acc + parseFloat(item.itemPrice),
                      0
                    )}{" "}
                    have been paid in {order.payment}
                  </h2>
                  <button
                    onClick={() => editAmountPaid(order.id)}
                    className={styles.editButton}
                  >
                    Edit Amount Paid
                  </button>
                  {amountToEdit === order.id && (
                    <div>
                      <input
                        type="text"
                        placeholder="Enter Amount Paid"
                        className={styles.amountInput}
                        onChange={(e) => setAmountPaid(e.target.value)}
                      />
                      <button
                        onClick={() => confirmPaidAmount(order)}
                        className={styles.confirmAmountButton}
                      >
                        Confirm
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => completeAmountPaid(order)}
                    className={styles.completeButton}
                  >
                    Complete Order
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Page;
