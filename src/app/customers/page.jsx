"use client";
import React, { useEffect, useState, useRef } from "react";
import styles from "../customers/viewCustomers.module.css";
import { useSelector } from "react-redux";
import Nav from "@/components/Nav/Nav";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { db } from "@/helpers/firebase";
import { formatDate } from "@/helpers/utils";
import {
  collection,
  query,
  orderBy,
  where,
  updateDoc,
  deleteDoc,
  getDocs,
  addDoc,
  doc,
} from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CloseIcon from "@mui/icons-material/Close";
import ClientTable from "@/components/ClientTable";
import ClientTableLenses from "@/components/ClientTableLenses";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

function page() {
  const [startDate, setStartDate] = useState(new Date());
  const [editorOpen, setEditorOpen] = useState(false);
  const { users } = useSelector((state) => state.users);
  const [tableSum, setTableSum] = useState(0);
  const [selectedTable, setSelectedTable] = useState([]);
  const [pendingOrNot, setPendingOrNot] = useState("");
  const [originalGlasses, setOriginalGlasses] = useState([]);
  const [originalLenses, setOriginalLenses] = useState([]);
  const [prescriptionData, setPrescriptionData] = useState([]);
  const [selectedTableLenses, setSelectedTableLenses] = useState([]);
  const [prescriptionDataLenses, setPrescriptionDataLenses] = useState([]);
  const [editorTableOpen, setEditorTableOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editorTableLensesOpen, setEditorTableLensesOpen] = useState(false);
  const [amountPaid, setAmountPaid] = useState(0);
  const [amountToEdit, setAmountToEdit] = useState(false);
  const [storedOriginalArray, setStoredOriginalArray] = useState("");
  const [sortedUsers, setSortedUsers] = useState([]);
  const [glassesTable, setGlassesTable] = useState(true);
  const [open, setOpen] = useState(false);
  const [isPageInEditMode, setIsPageInEditMode] = useState(false);
  const [clickedUser, setClickedUser] = useState({
    name: "",
    email: "",
    number: "",
    city: "",
    dateOfBirth: "",
    uid: "",
  });

  const [selectedNumber, setSelectedNumber] = useState({
    number: "",
  });

  const [selectedName, setSelectedName] = useState({
    name: "",
  });

  const [orderNumber, setOrderNumber] = useState({
    orderNumber: "",
  });

  useEffect(() => {
    setSortedUsers([...users]);
    setStoredOriginalArray([...users]);
  }, [users]);

  sortedUsers.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  });

  function calculateAge(unixTime) {
    const date = new Date(unixTime * 1000);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
  }

  const findUser = (e) => {
    const userNumber = e.target.value;
    setSelectedNumber({ userNumber });
    if (!userNumber) {
      setSortedUsers(storedOriginalArray);
      return;
    }
    const filteredUser = users.filter((user) =>
      user.number.includes(userNumber.trim())
    );

    setSortedUsers(filteredUser);
  };

  const findUserByName = (e) => {
    const userName = e.target.value;
    setSelectedName({ userName });
    if (!userName) {
      setSortedUsers(storedOriginalArray);
      return;
    }
    const filteredUser = users.filter((user) =>
      user.name.toLowerCase().includes(userName.toLowerCase().trim())
    );

    setSortedUsers(filteredUser);
  };

  const handleClose = () => {
    setTableSum(0);
    setOpen(false);
  };

  const handleTableEditorClose = () => {
    setEditorTableOpen(false);
  };

  const handleTableEditorLensesClose = () => {
    setEditorTableLensesOpen(false);
  };

  const handleEditorClose = () => setEditorOpen(false);

  const handlePendingChange = (e) => {
    const filterValue = e.target.value;
    setPendingOrNot(filterValue);

    if (filterValue === "all") {
      setSortedUsers(storedOriginalArray);
      return;
    }

    const isPending = (amountPaid) => !isNaN(parseFloat(amountPaid));

    const filteredUsers = storedOriginalArray.filter((user) => {
      const userGlasses = originalGlasses.filter(
        (glass) => glass.userId === user.uid
      );

      const userLenses = originalLenses.filter(
        (lens) => lens.userId === user.uid
      );

      const hasPendingGlasses = userGlasses.some((glass) =>
        isPending(glass.amountPaid)
      );

      const hasPendingLenses = userLenses.some((lens) =>
        isPending(lens.amountPaid)
      );

      if (filterValue === "notPaid") {
        return hasPendingGlasses || hasPendingLenses;
      } else if (filterValue === "paid") {
        return !hasPendingGlasses && !hasPendingLenses;
      }
    });

    setSortedUsers(filteredUsers);
  };

  // const handleOrderNumberSearch = (e) => {
  //   const value = e.target.value;
  //   setOrderNumber({
  //     orderNumber: value,
  //   });

  //   if (!value) {
  //     setSortedUsers(storedOriginalArray);
  //     return;
  //   }

  //   const filteredUsers = storedOriginalArray.filter((user) => {
  //     const userGlasses = originalGlasses.map((glass) =>
  //       console.log(glass.orderNumber)
  //     );

  //     const userLenses = originalLenses.filter(
  //       (lens) => lens.orderNumber === value
  //     );

  //     console.log(userGlasses);
  //   });
  // };

  async function openCustomerInfo(customerUid) {
    setClickedUser(users.find((user) => user.uid === customerUid));

    const order = collection(db, "orders", customerUid, "purchase");

    const clientTable = collection(
      db,
      "clientEyeTableInfo",
      customerUid,
      "prescriptionInfo"
    );

    const clientTableLenses = collection(
      db,
      "clientEyeTableLensesInfo",
      customerUid,
      "prescriptionInfo"
    );
    const q = query(clientTable, orderBy("dateOfPrescription", "desc"));

    const qLenses = query(
      clientTableLenses,
      orderBy("dateOfPrescription", "desc")
    );

    const querySnapshot = await getDocs(q);
    const querySnapshotLenses = await getDocs(qLenses);
    const querySnapshotOrder = await getDocs(order);

    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const dataLenses = querySnapshotLenses.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const dataOrder = querySnapshotOrder.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (data) {
      setPrescriptionData(data);
      setOriginalGlasses(data);
      const totalSum = data.reduce((acc, prices) => {
        if (!isNaN(prices.amountPaid)) {
          return parseFloat(prices.amountPaid);
        } else {
          return (
            acc +
            parseFloat(prices.framePrice) +
            parseFloat(prices.framePriceNear) +
            parseFloat(prices.leftLensePrice) +
            parseFloat(prices.leftLensePriceNear) +
            parseFloat(prices.rightLensePrice) +
            parseFloat(prices.rightLensePriceNear)
          );
        }
      }, 0);

      setTableSum((prev) => prev + totalSum);
    }

    if (dataLenses) {
      setPrescriptionDataLenses(dataLenses);
      setOriginalLenses(dataLenses);
      const totalSum = dataLenses.reduce((acc, prices) => {
        if (!isNaN(prices.amountPaid)) {
          return acc + parseFloat(prices.amountPaid);
        } else {
          return (
            acc +
            parseFloat(prices.leftLensePrice) +
            parseFloat(prices.rightLensePrice)
          );
        }
      }, 0);
      setTableSum((prev) => prev + totalSum);
    }

    const totalSumOfOrder = dataOrder.map((order) => {
      if (!isNaN(parseFloat(order.amountPaid))) {
        return parseFloat(order.amountPaid);
      } else {
        const itemTotalSum = order.itemSelectedId.reduce((acc, prices) => {
          return acc + parseFloat(prices.itemPrice);
        }, 0);
        return itemTotalSum;
      }
    });

    const combinedTotalSumOfOrder = totalSumOfOrder.reduce(
      (acc, sum) => parseFloat(acc) + parseFloat(sum),
      0
    );

    setTableSum((prev) => prev + parseFloat(combinedTotalSumOfOrder));

    setOpen(true);
  }

  function convertToUnixTime(dateString) {
    const date = new Date(dateString);
    return Math.floor(date.getTime() / 1000);
  }

  function editCustomerInfo(customerUid) {
    const filteredUser = users.find((user) => user.uid === customerUid);
    setClickedUser(filteredUser);
    setStartDate(new Date(filteredUser.dateOfBirth * 1000));
    setEditorOpen(true);
  }

  async function saveClientInfo(customerUid) {
    setLoading(true);
    try {
      const customersRef = collection(db, "users");
      const q = query(customersRef, where("uid", "==", customerUid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
          name: clickedUser.name,
          email: clickedUser.email,
          dateOfBirth: convertToUnixTime(startDate.toString().slice(0, 33)),
          number: clickedUser.number,
        });

        toast.success("Customer info updated successfully!");
        setEditorOpen(false);
      } else {
        toast.error("Customer not found!");
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  }

  async function deleteCustomer(customerUid) {
    setLoading(true);
    try {
      const customersRef = collection(db, "users");
      const q = query(customersRef, where("uid", "==", customerUid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;

        await deleteDoc(docRef);

        toast.success("Customer deleted successfully!");
        setEditorOpen(false);
      } else {
        toast.error("Customer not found!");
      }
    } catch (error) {
      toast.error("Failed to delete customer. " + error);
    }
    setLoading(false);
  }

  function editTable(table) {
    setEditorTableOpen(true);
    setSelectedTable(table);
  }

  function editTableLenses(table) {
    setEditorTableLensesOpen(true);
    setSelectedTableLenses(table);
  }

  useEffect(() => {
    users.forEach(async (user) => {
      const clientTable = collection(
        db,
        "clientEyeTableInfo",
        user.uid,
        "prescriptionInfo"
      );

      const clientTableLenses = collection(
        db,
        "clientEyeTableLensesInfo",
        user.uid,
        "prescriptionInfo"
      );
      const q = query(clientTable, orderBy("dateOfPrescription", "desc"));

      const qLenses = query(
        clientTableLenses,
        orderBy("dateOfPrescription", "desc")
      );
      const querySnapshot = await getDocs(q);
      const querySnapshotLenses = await getDocs(qLenses);

      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const dataLenses = querySnapshotLenses.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOriginalGlasses((prevGlasses) => [...prevGlasses, ...data]);
      setOriginalLenses((prevLenses) => [...prevLenses, ...dataLenses]);
    });
  }, [users]);

  return (
    <div className={styles.customerContainer}>
      <Toaster />
      <Nav />
      <div className={styles.customerWrapper}>
        <h1 style={{ textAlign: "center", color: "white" }}>Users:</h1>
        <button
          className={styles.editorOpener}
          onClick={() => setIsPageInEditMode(!isPageInEditMode)}
        >
          Edit Mode{" "}
          {isPageInEditMode ? (
            <span className={styles.on}>ON</span>
          ) : (
            <span className={styles.off}>OFF</span>
          )}
        </button>
        <input
          type="text"
          value={selectedNumber.number}
          className={styles.searchCustomer}
          placeholder="search Number"
          onChange={(e) => findUser(e)}
        />
        <input
          type="text"
          value={selectedName.name}
          className={styles.searchCustomer}
          placeholder="search Name"
          onChange={(e) => findUserByName(e)}
        />
        {/* <input
          type="text"
          value={orderNumber.orderNumber}
          className={styles.searchCustomer}
          placeholder="search Order No."
          onChange={(e) => handleOrderNumberSearch(e)}
        /> */}
        <Box
          sx={{
            width: 250,
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
              value={pendingOrNot}
              label="Gender"
              onChange={handlePendingChange}
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
                all
              </MenuItem>
              <MenuItem value={"notPaid"} className="option">
                Pending
              </MenuItem>
              <MenuItem value={"paid"} className="option">
                Not Pending
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
        <div className={styles.customerInfoContainer}>
          {sortedUsers.map((customer, index) => (
            <div className={styles.customerInfoDivider} key={index}>
              <Modal
                open={editorOpen}
                onClose={handleEditorClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                sx={{
                  "& .MuiBackdrop-root": {
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                  },
                }}
              >
                <Box className={styles.modalWrapper}>
                  <Typography
                    id="modal-modal-title"
                    variant="h3"
                    component="h1"
                  >
                    Edit Customer
                  </Typography>
                  <div
                    id="modal-modal-description"
                    sx={{ mt: 2 }}
                    className={styles.customerModalEditInfoWrapper}
                  >
                    <input
                      className={styles.editInput}
                      type="text"
                      value={clickedUser.name}
                      onChange={(e) =>
                        setClickedUser({
                          ...clickedUser,
                          name: e.target.value,
                        })
                      }
                      placeholder="edit name"
                    />
                    <input
                      className={styles.editInput}
                      type="text"
                      value={clickedUser.email}
                      onChange={(e) =>
                        setClickedUser({
                          ...clickedUser,
                          email: e.target.value,
                        })
                      }
                      placeholder="edit email"
                    />
                    <input
                      className={styles.editInput}
                      type="text"
                      value={clickedUser.number}
                      onChange={(e) =>
                        setClickedUser({
                          ...clickedUser,
                          number: e.target.value,
                        })
                      }
                      placeholder="edit number"
                    />
                    <DatePicker
                      className={styles.editInput}
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                    />
                    {!loading ? (
                      <>
                        <button
                          className={styles.confirmCustomer}
                          onClick={() => saveClientInfo(clickedUser.uid)}
                        >
                          Save Info
                        </button>
                        <button
                          className={styles.deleteCustomer}
                          onClick={() => deleteCustomer(clickedUser.uid)}
                        >
                          Delete Customer
                        </button>
                      </>
                    ) : (
                      <div className={styles.spinner}></div>
                    )}
                  </div>
                </Box>
              </Modal>
              <div
                className={styles.customerInfoWrapper}
                onClick={
                  !isPageInEditMode
                    ? () => openCustomerInfo(customer.uid)
                    : () => editCustomerInfo(customer.uid)
                }
              >
                <h2 className={styles.customerName}>{customer.name}</h2>
                <p className={styles.customerEmail}>{customer.city}</p>
                <p className={styles.customerNumber}>
                  {customer.number} --- Date of Birth:{" "}
                  {calculateAge(customer.dateOfBirth)}
                </p>
              </div>
            </div>
          ))}
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            sx={{
              "& .MuiBackdrop-root": {
                backgroundColor: "rgba(0, 0, 0, 0.3)",
              },
            }}
          >
            <Box className={styles.modalWrapper}>
              <Typography
                id="modal-modal-title"
                variant="h3"
                component="h1"
                className={styles.customerInfoLabel}
              >
                <span>Customer Info</span>
                <CloseIcon
                  onClick={handleClose}
                  className={styles.closeIcon}
                  fontSize="md"
                />
              </Typography>
              <div
                id="modal-modal-description"
                sx={{ mt: 2 }}
                className={styles.customerModalInfoWrapper}
              >
                <h2 className={styles.customerName}>{clickedUser.name}</h2>
                <p className={styles.customerEmail}>{clickedUser.city}</p>
                <p className={styles.customerNumber}>{clickedUser.number}</p>
                <p className={styles.customerNumber}>
                  {calculateAge(clickedUser.dateOfBirth)}
                </p>
                <h2>Total Spendings: ${tableSum}</h2>
                <Link
                  href={`/tableReceipt/${clickedUser.uid}`}
                  className={styles.printTableLink}
                >
                  Print {clickedUser.name + "'s"} Tables
                </Link>
                <div className={styles.tablePicker}>
                  <button
                    onClick={() => setGlassesTable(true)}
                    className={styles.setGlassesButton}
                  >
                    Glasses
                  </button>
                  <button
                    onClick={() => setGlassesTable(false)}
                    className={styles.setLensesButton}
                  >
                    Lenses
                  </button>
                </div>
                {glassesTable ? (
                  <ClientTable
                    clickedUser={clickedUser}
                    glassesButton={true}
                    setOpen={setOpen}
                    forAddCustomer={false}
                  />
                ) : (
                  <ClientTableLenses
                    clickedUser={clickedUser}
                    glassesButton={false}
                    setOpen={setOpen}
                    forAddCustomer={false}
                  />
                )}

                <div className={styles.tableDisplayContainer}>
                  {prescriptionData.length ? (
                    <h1 className={styles.glasses}>Glasses:</h1>
                  ) : (
                    "no glasses recorded"
                  )}

                  <>
                    <div className={styles.clientEyeTableInfoContainer}>
                      <div className={styles.clientEyeTableInfoWrapper}>
                        {prescriptionData.map((content, rowIndex) => (
                          <>
                            <div className={styles.clientEyeTableInfo}>
                              {content.clientTableContentRight.map(
                                (tableContent, key) => (
                                  <div style={{ margin: "32px 0px" }} key={key}>
                                    <div
                                      className={styles.tableRow}
                                      key={rowIndex}
                                    >
                                      <p
                                        className={
                                          styles.tableRowDisplayContent
                                        }
                                      >
                                        {tableContent.tableRow1}
                                      </p>
                                      <p
                                        className={
                                          styles.tableRowDisplayContent
                                        }
                                      >
                                        {tableContent.tableRow2}
                                      </p>
                                      <p
                                        className={
                                          styles.tableRowDisplayContent
                                        }
                                      >
                                        {tableContent.tableRow3}
                                      </p>
                                      <p
                                        className={
                                          styles.tableRowDisplayContent
                                        }
                                      >
                                        {tableContent.tableRow4}
                                      </p>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                            {content.frame ? (
                              <div>
                                <h1 className={styles.far}>Far:</h1>
                                <div className={styles.frameInfo}>
                                  <h3 className={styles.frame}>
                                    {content.frame}
                                  </h3>
                                  <h3 className={styles.framePrice}>
                                    ${content.framePrice}
                                  </h3>
                                </div>
                              </div>
                            ) : null}
                            {content.rightLense ? (
                              <div className={styles.leftLenseInfo}>
                                <h3 className={styles.leftLense}>
                                  {content.leftLense}
                                </h3>
                                <h3 className={styles.leftLensePrice}>
                                  ${content.leftLensePrice}
                                </h3>
                              </div>
                            ) : null}
                            {content.frameNear ? (
                              <div>
                                <h1 className={styles.near}>Near: </h1>
                                <div className={styles.frameInfo}>
                                  <h3 className={styles.frame}>
                                    {content.frameNear}
                                  </h3>
                                  <h3 className={styles.framePrice}>
                                    ${content.framePriceNear}
                                  </h3>
                                </div>
                              </div>
                            ) : null}
                            {content.leftLenseNear ? (
                              <div className={styles.leftLenseInfo}>
                                <h3 className={styles.leftLense}>
                                  {content.leftLenseNear}
                                </h3>
                                <h3 className={styles.leftLensePrice}>
                                  ${content.leftLensePriceNear}
                                </h3>
                              </div>
                            ) : null}

                            {content.amountPaid === "paid" ? (
                              <h3 className={styles.paid}>
                                $
                                {parseFloat(content.framePrice) +
                                  parseFloat(content.framePriceNear) +
                                  parseFloat(content.leftLensePrice) +
                                  parseFloat(content.leftLensePriceNear) +
                                  parseFloat(content.rightLensePrice) +
                                  parseFloat(content.rightLensePriceNear)}{" "}
                                {content.amountPaid} in full with{" "}
                                {content.paymentMethod}
                              </h3>
                            ) : (
                              <div>
                                <h3 className={styles.notPaid}>
                                  {" "}
                                  ${content.amountPaid} out of $
                                  {parseFloat(content.framePrice) +
                                    parseFloat(content.framePriceNear) +
                                    parseFloat(content.leftLensePrice) +
                                    parseFloat(content.leftLensePriceNear) +
                                    parseFloat(content.rightLensePrice) +
                                    parseFloat(
                                      content.rightLensePriceNear
                                    )}{" "}
                                  have been paid with {content.paymentMethod}
                                </h3>
                              </div>
                            )}
                            <button
                              onClick={() => editTable(content)}
                              className={styles.editTableButton}
                            >
                              Edit Table
                            </button>
                            <Modal
                              open={editorTableOpen}
                              onClose={handleTableEditorClose}
                              aria-labelledby="modal-modal-title"
                              aria-describedby="modal-modal-description"
                              sx={{
                                "& .MuiBackdrop-root": {
                                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                                },
                              }}
                            >
                              <Box className={styles.modalTableWrapper}>
                                <div>
                                  <Typography
                                    id="modal-modal-title"
                                    variant="h3"
                                    component="h6"
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <p>Edit The Table</p>
                                    <CloseIcon
                                      onClick={handleTableEditorClose}
                                      className={styles.closeIcon}
                                      fontSize="md"
                                    />
                                  </Typography>
                                </div>
                                <div>
                                  <Typography>
                                    <ClientTable
                                      editingMode={true}
                                      setOpen={setOpen}
                                      tableContent={selectedTable}
                                      handleTableEditorClose={
                                        handleTableEditorClose
                                      }
                                      clickedUser={clickedUser}
                                    />
                                  </Typography>
                                </div>
                              </Box>
                            </Modal>
                          </>
                        ))}
                      </div>
                      <div className={styles.clientEyeTableInfoWrapper}>
                        {prescriptionData.map((content, rowIndex) => (
                          <>
                            <div className={styles.clientEyeTableInfo}>
                              {content.clientTableContentLeft.map(
                                (tableContent, key) => (
                                  <div style={{ margin: "32px 0px" }} key={key}>
                                    <div
                                      className={styles.tableRow}
                                      key={rowIndex}
                                    >
                                      <p
                                        className={
                                          styles.tableRowDisplayContent
                                        }
                                      >
                                        {tableContent.tableRow1}
                                      </p>
                                      <p
                                        className={
                                          styles.tableRowDisplayContent
                                        }
                                      >
                                        {tableContent.tableRow2}
                                      </p>
                                      <p
                                        className={
                                          styles.tableRowDisplayContent
                                        }
                                      >
                                        {tableContent.tableRow3}
                                      </p>
                                      <p
                                        className={
                                          styles.tableRowDisplayContent
                                        }
                                      >
                                        {tableContent.tableRow4}
                                      </p>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                            <div
                              className={styles.rightLenseInfoWrapper}
                              style={{
                                marginBottom:
                                  content.frame &&
                                  content.rightLense &&
                                  content.leftLense &&
                                  content.frameNear &&
                                  content.rightLenseNear &&
                                  content.leftLenseNear
                                    ? "77px"
                                    : (content.frame &&
                                        content.rightLense &&
                                        content.leftLense) ||
                                      (content.frameNear &&
                                        content.rightLenseNear &&
                                        content.leftLenseNear)
                                    ? "101px"
                                    : "-12px",
                              }}
                            >
                              {content.rightLense ? (
                                <div className={styles.rightLenseInfo}>
                                  <h3 className={styles.rightLense}>
                                    {content.rightLense}
                                  </h3>
                                  <h3 className={styles.rightLensePrice}>
                                    ${content.rightLensePrice}
                                  </h3>
                                </div>
                              ) : null}
                              {content.rightLenseNear ? (
                                <div className={styles.rightLenseInfo}>
                                  <h3 className={styles.rightLense}>
                                    {content.rightLenseNear}
                                  </h3>
                                  <h3 className={styles.rightLensePrice}>
                                    ${content.rightLensePriceNear}
                                  </h3>
                                </div>
                              ) : null}
                            </div>
                          </>
                        ))}
                      </div>
                    </div>
                  </>
                  {prescriptionDataLenses.length ? (
                    <h1 className={styles.lenses}>Lenses:</h1>
                  ) : (
                    "no lenses recorded"
                  )}
                  <>
                    <div className={styles.clientEyeTableInfoContainer}>
                      <div className={styles.clientEyeTableInfoWrapper}>
                        {prescriptionDataLenses.map((content, rowIndex) => (
                          <>
                            <div className={styles.clientEyeTableInfoLenses}>
                              {content.clientTableContentRight.map(
                                (tableContent, key) => (
                                  <div style={{ margin: "32px 0px" }} key={key}>
                                    <div
                                      className={styles.tableRow}
                                      key={rowIndex}
                                    >
                                      {tableContent.tableRow1 === "" ? (
                                        <p
                                          className={
                                            styles.tableRowDisplayContent
                                          }
                                        >
                                          {formatDate(
                                            content.dateOfPrescription
                                          )}
                                        </p>
                                      ) : (
                                        <p
                                          className={
                                            styles.tableRowDisplayContent
                                          }
                                        >
                                          {tableContent.tableRow1}
                                        </p>
                                      )}
                                      <p
                                        className={
                                          styles.tableRowDisplayContent
                                        }
                                      >
                                        {tableContent.tableRow2}
                                      </p>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                            <div className={styles.eyeglassesWrapper}>
                              <div className={styles.leftLenseInfo}>
                                <h3 className={styles.leftLense}>
                                  {content.leftLense}
                                </h3>
                                <h3 className={styles.leftLensePrice}>
                                  ${content.leftLensePrice}
                                </h3>
                              </div>
                            </div>
                            {content.amountPaid === "paid" ? (
                              <h3 className={styles.paid}>
                                ${total} paid in full with{" "}
                                {content.paymentMethod}
                              </h3>
                            ) : (
                              <div>
                                <h3 className={styles.notPaid}>
                                  {" "}
                                  ${content.amountPaid} out of ${content.total}{" "}
                                  have been paid with {content.paymentMethod}.
                                </h3>
                                <div className={styles.editingButtons}>
                                  <button
                                    className={styles.editAmountPaid}
                                    onClick={() => editTableLenses(content)}
                                  >
                                    Edit Table
                                  </button>
                                  <Modal
                                    open={editorTableLensesOpen}
                                    onClose={handleTableEditorLensesClose}
                                    aria-labelledby="modal-modal-title"
                                    aria-describedby="modal-modal-description"
                                    sx={{
                                      "& .MuiBackdrop-root": {
                                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                                      },
                                    }}
                                  >
                                    <Box className={styles.modalTableWrapper}>
                                      <Typography
                                        id="modal-modal-title"
                                        variant="h3"
                                        component="h2"
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                        }}
                                      >
                                        <p>Edit The Table</p>
                                        <CloseIcon
                                          onClick={handleTableEditorLensesClose}
                                          className={styles.closeIcon}
                                          fontSize="lg"
                                        />
                                      </Typography>
                                      <div>
                                        <Typography>
                                          <ClientTableLenses
                                            editingMode={true}
                                            tableContent={selectedTableLenses}
                                            setOpen={setOpen}
                                            handleTableEditorLensesClose={
                                              handleTableEditorLensesClose
                                            }
                                            clickedUser={clickedUser}
                                          />
                                        </Typography>
                                      </div>
                                    </Box>
                                  </Modal>
                                </div>
                              </div>
                            )}
                          </>
                        ))}
                      </div>
                      <div className={styles.clientEyeTableInfoWrapper}>
                        {prescriptionDataLenses.map((content, rowIndex) => (
                          <>
                            <div className={styles.clientEyeTableInfoLenses}>
                              {content.clientTableContentLeft.map(
                                (tableContent, key) => (
                                  <div style={{ margin: "32px 0px" }} key={key}>
                                    <div
                                      className={styles.tableRow}
                                      key={rowIndex}
                                    >
                                      {tableContent.tableRow1 === "" ? (
                                        <p
                                          className={
                                            styles.tableRowDisplayContent
                                          }
                                        >
                                          {formatDate(
                                            content.dateOfPrescription
                                          )}
                                        </p>
                                      ) : (
                                        <p
                                          className={
                                            styles.tableRowDisplayContent
                                          }
                                        >
                                          {tableContent.tableRow1}
                                        </p>
                                      )}
                                      <p
                                        className={
                                          styles.tableRowDisplayContent
                                        }
                                      >
                                        {tableContent.tableRow2}
                                      </p>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                            <div
                              className={styles.rightLenseInfoWrapperLenses}
                              style={{
                                marginBottom:
                                  content.amountPaid === "paid"
                                    ? "56px"
                                    : "128px",
                              }}
                            >
                              <div className={styles.rightLenseInfo}>
                                <h3 className={styles.rightLense}>
                                  {content.rightLense}
                                </h3>
                                <h3 className={styles.rightLensePrice}>
                                  ${content.rightLensePrice}
                                </h3>
                              </div>
                            </div>
                          </>
                        ))}
                      </div>
                    </div>
                  </>
                </div>
              </div>
            </Box>
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default page;
