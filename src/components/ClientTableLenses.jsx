"use client";
import { useSelector } from "react-redux";
import React, { useState } from "react";
import styles from "../app/addCustomer/addCustomer.module.css";
import { clientTableLenses as initialClientTableLenses } from "@/clientTableLenses";
import { clientTableLensesRight as initialClientTableLensesRight } from "@/clientTableLensesRight";
import toast, { Toaster } from "react-hot-toast";
import { randomString } from "@/helpers/utils";
import {
  collection,
  addDoc,
  query,
  doc,
  where,
  getDocs,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "@/helpers/firebase";
import PaymentMethod from "./PaymentMethod/PaymentMethod";

function ClientTableLenses({
  clickedUser,
  setOpen,
  customerInput,
  setCustomerInput,
  startDate,
  handleTableEditorLensesClose,
  gender,
  setGender,
  forAddCustomer,
  editingMode,
  tableContent,
  setStartDate,
}) {
  const [clientTableLenses, setClientTableLenses] = React.useState(
    initialClientTableLenses
  );
  const [clientTableLensesRight, setClientTableLensesRight] = React.useState(
    initialClientTableLensesRight
  );

  const [loading, setLoading] = useState(false);

  const [quantityInput, setQuantityInput] = React.useState({
    quantityLeft: 1,
    quantityRight: 1,
  });

  const { items } = useSelector((state) => state.items);
  const { categories } = useSelector((state) => state.categories);
  const [allItems, setAllItems] = React.useState([]);
  const [amountPaid, setAmountPaid] = React.useState(0);
  const [payment, setPayment] = React.useState("");

  const [lenseInput, setLenseInput] = React.useState({
    lenseRightName: "",
    lenseRightPrice: 0,
    lenseLeftName: "",
    lenseLeftPrice: 0,
    categoryIdRight: "",
    categoryIdLeft: "",
  });

  const inputRefRight = React.useRef(null);
  const dropdownRefRight = React.useRef(null);
  const inputRefLeft = React.useRef(null);
  const dropdownRefLeft = React.useRef(null);

  const [dropdownState, setDropdownState] = React.useState({
    lensesRightDropdown: false,
    lensesLeftDropdown: false,
    lensesRightDropdownContent: items || [],
    lensesLeftDropdownContent: items || [],
  });

  const [total, setTotal] = React.useState(0);

  const citiesRef = collection(db, "cities");

  const handleInputChange = (event, row, column) => {
    const newContent = [...clientTableLenses];
    newContent[row - 1][`tableRow${column}`] = event.target.value;
    setClientTableLenses(newContent);
  };

  const handleInputChangeForTableRight = (event, row, column) => {
    const newContent = [...clientTableLensesRight];
    newContent[row - 1][`tableRow${column}`] = event.target.value;
    setClientTableLensesRight(newContent);
  };

  const handleBlurRight = (row, column) => {
    const newContent = [...clientTableLensesRight];

    const cellValue = parseFloat(newContent[row][`tableRow${column}`]);

    if (!isNaN(cellValue)) {
      if (row === 3 || row === 5) {
        newContent[row][`tableRow${column}`] = cellValue;
      } else if (cellValue > 0) {
        newContent[row][`tableRow${column}`] = `+${cellValue.toFixed(2)}`;
      } else {
        newContent[row][`tableRow${column}`] = cellValue.toFixed(2);
      }
      clientTableLenses[4][`tableRow${column}`] =
        clientTableLensesRight[4][`tableRow${column}`];
    }

    setClientTableLensesRight(newContent);
  };

  const handleBlurLeft = (row, column) => {
    const newContent = [...clientTableLenses];

    const cellValue = parseFloat(newContent[row][`tableRow${column}`]);

    if (!isNaN(cellValue)) {
      if (row === 3 || row === 5) {
        newContent[row][`tableRow${column}`] = cellValue;
      } else if (cellValue > 0) {
        newContent[row][`tableRow${column}`] = `+${cellValue.toFixed(2)}`;
      } else {
        newContent[row][`tableRow${column}`] = cellValue.toFixed(2);
      }
    }

    setClientTableLenses(newContent);
  };

  function convertToUnixTime(dateString) {
    const date = new Date(dateString);
    return Math.floor(date.getTime() / 1000);
  }

  function handleKeyDownLeftLenses(e) {
    if (
      e.key === "Enter" &&
      dropdownState.lensesLeftDropdownContent.length > 0
    ) {
      pickLeftLense(dropdownState.lensesLeftDropdownContent[0]);
    }
  }

  function handleKeyDownRightLenses(e) {
    if (
      e.key === "Enter" &&
      dropdownState.lensesRightDropdownContent.length > 0
    ) {
      pickLense(dropdownState.lensesRightDropdownContent[0]);
    }
  }

  function findLeftLenses(lense) {
    setLenseInput({
      ...lenseInput,
      lenseLeftName: lense,
    });

    const lenseCategory = categories?.find((category) =>
      category.name.toLowerCase().includes("lens")
    );

    if (!lenseCategory) {
      return;
    }

    const updatedItems =
      items?.filter((item) => item.categoryId === lenseCategory?.id) || [];

    if (!lense) {
      setDropdownState({
        ...dropdownState,
        lensesLeftDropdown: false,
        lensesLeftDropdownContent: updatedItems,
      });
      return;
    }

    const foundItems = updatedItems.filter((item) =>
      item.itemName.toLowerCase().includes(lense.toLowerCase().trim())
    );

    setDropdownState({
      ...dropdownState,
      lensesLeftDropdown: true,
      lensesLeftDropdownContent: foundItems,
    });
  }

  function pickLeftLense(item) {
    setLenseInput({
      ...lenseInput,
      lenseLeftName: item.itemName,
      lenseLeftPrice: item.itemPrice,
      categoryIdLeft: item.categoryId,
    });

    setDropdownState({
      lensesLeftDropdown: false,
      lensesLeftDropdownContent: items,
    });
  }

  function findRightLenses(lense) {
    setLenseInput({
      ...lenseInput,
      lenseRightName: lense,
    });

    const lenseCategory = categories?.find((category) =>
      category.name.toLowerCase().includes("lens")
    );

    if (!lenseCategory) {
      return;
    }
    const updatedItems =
      items?.filter((item) => item.categoryId === lenseCategory?.id) || [];

    if (!lense) {
      setDropdownState({
        ...dropdownState,
        lensesRightDropdown: false,
        lensesRightDropdownContent: updatedItems,
      });
      return;
    }

    const foundItems = updatedItems.filter((item) =>
      item.itemName.toLowerCase().includes(lense.toLowerCase().trim())
    );

    setDropdownState({
      ...dropdownState,
      lensesRightDropdown: true,
      lensesRightDropdownContent: foundItems,
    });
  }

  function pickLense(item) {
    setLenseInput({
      ...lenseInput,
      lenseRightName: item.itemName,
      lenseLeftName: item.itemName,
      lenseRightPrice: item.itemPrice,
      lenseLeftPrice: item.itemPrice,
      categoryIdRight: item.categoryId,
      categoryIdLeft: item.categoryId,
    });

    setDropdownState({
      lensesRightDropdown: false,
      lensesRightDropdownContent: items,
    });
  }

  async function submitLenses() {
    setLoading(true);
    try {
      const userUid = randomString(20);

      if (forAddCustomer) {
        const date = convertToUnixTime(startDate.toString().slice(0, 33));
        if (!customerInput.name) {
          toast.error("The name is empty.");
          return;
        }

        const api = "/api/users/addUsers";
        const response = await fetch(
          `${api}?name=${customerInput.name}&email=${customerInput.email}&number=${customerInput.number}&uid=${userUid}&dateOfBirth=${date}&address=${customerInput.address}&city=${customerInput.city}&gender=${gender}`
        );

        if (!response.ok) {
          toast.error("Error adding user.");
          return;
        }

        const citySnapshot = await getDocs(citiesRef);
        citySnapshot.docs.forEach((doc) => {
          if (customerInput.city !== doc.data().city) {
            addDoc(citiesRef, {
              city: customerInput.city,
            });
          }
        });

        const q = query(
          collection(db, "users"),
          where("number", "==", customerInput.number)
        );

        const isUserFound = await getDocs(q);

        setCustomerInput({
          name: "",
          email: "",
          number: "",
          city: "",
        });
        setGender("");
      }

      const clientTable = collection(
        db,
        "clientEyeTableLensesInfo",
        forAddCustomer ? userUid : clickedUser.uid,
        "prescriptionInfo"
      );

      if (lenseInput.lenseLeftName) {
        for (let i = 0; i < parseFloat(quantityInput.quantityLeft); i++) {
          await updateItemQuantity(
            lenseInput.lenseLeftName,
            lenseInput.categoryIdRight
          );
        }
      }

      if (lenseInput.lenseRightName) {
        for (let i = 0; i < parseFloat(quantityInput.quantityRight); i++) {
          await updateItemQuantity(
            lenseInput.lenseRightName,
            lenseInput.categoryIdRight
          );
        }
      }

      const orderNumRef = collection(db, "orderNum");
      const orderNumSnapshot = await getDocs(orderNumRef);
      const orderNumDoc = orderNumSnapshot.docs[0];
      const orderNumber = orderNumDoc.data().orderNumber;

      await addDoc(clientTable, {
        clientTableContentLeft: clientTableLenses || [],
        clientTableContentRight: clientTableLensesRight || [],
        dateOfPrescription: new Date(Date.now()),
        leftLense: lenseInput.lenseLeftName || "",
        rightLense: lenseInput.lenseRightName || "",
        leftLensePrice: parseFloat(lenseInput.lenseLeftPrice) || 0,
        rightLensePrice: parseFloat(lenseInput.lenseRightPrice) || 0,
        categoryIdLeft: lenseInput.categoryIdLeft || "",
        categoryIdRight: lenseInput.categoryIdRight || "",
        amountPaid: parseFloat(amountPaid) === 0 ? "paid" : amountPaid || 0,
        orderNumber: orderNumber,
        total: total,
        paymentMethod: payment || "unknown",
        tablesId: randomString(20),
        userId: forAddCustomer ? userUid : clickedUser.uid,
      });

      await updateDoc(orderNumDoc.ref, {
        orderNumber: parseFloat(orderNumber) + 1,
      });

      toast.success("Lenses table added!");

      setLenseInput({
        lenseRightName: "",
        lenseRightPrice: 0,
        lenseLeftName: "",
        lenseLeftPrice: 0,
      });

      clearClientTableLenses();

      if (!forAddCustomer) {
        setOpen(false);
      }
    } catch (error) {
      toast.error("Error adding document: " + error.message);
    }
    setLoading(false);
  }

  function clearClientTableLenses() {
    const updatedClientTableLenses = clientTableLenses.map((item, index) => {
      return index === 0 ? item : { ...item, tableRow2: "" };
    });

    const updatedClientTableLensesRight = clientTableLensesRight.map(
      (item, index) => {
        return index === 0 ? item : { ...item, tableRow2: "" };
      }
    );

    setClientTableLenses(updatedClientTableLenses);
    setClientTableLensesRight(updatedClientTableLensesRight);
    setLenseInput({
      lenseRightName: "",
      lenseRightPrice: 0,
      lenseLeftName: "",
      lenseLeftPrice: 0,
    });
    if (forAddCustomer) {
      setCustomerInput({ name: "", email: "", number: "", city: "" });
      setStartDate("");
    }
  }

  function convertToUnixTime(dateString) {
    const date = new Date(dateString);
    return Math.floor(date.getTime() / 1000);
  }

  const updateItemQuantity = async (itemName, categoryId) => {
    const itemCollection = collection(db, "items");
    const q = query(
      itemCollection,
      where("itemName", "==", itemName),
      where("categoryId", "==", categoryId)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const itemDoc = querySnapshot.docs[0];
      const itemData = itemDoc.data();

      if (parseInt(itemData.itemQuantity) > 0) {
        await updateDoc(itemDoc.ref, {
          itemQuantity: parseInt(itemData.itemQuantity) - 1,
        });
        return true;
      } else {
        toast.error(`No remaining quantity for ${itemName}`);
        return false;
      }
    } else {
      toast.error(`Item ${itemName} not found`);
      return false;
    }
  };

  const handleClickOutsideRight = (event) => {
    if (
      inputRefRight.current &&
      !inputRefRight.current.contains(event.target) &&
      dropdownRefRight.current &&
      !dropdownRefRight.current.contains(event.target)
    ) {
      setDropdownState({
        ...dropdownState,
        lensesRightDropdown: false,
      });
    }
  };

  const handleClickOutsideLeft = (event) => {
    if (
      inputRefLeft.current &&
      !inputRefLeft.current.contains(event.target) &&
      dropdownRefLeft.current &&
      !dropdownRefLeft.current.contains(event.target)
    ) {
      setDropdownState({
        ...dropdownState,
        lensesLeftDropdown: false,
      });
    }
  };

  React.useEffect(() => {
    if (dropdownState.lensesRightDropdown) {
      document.addEventListener("click", handleClickOutsideRight);
    } else {
      document.removeEventListener("click", handleClickOutsideRight);
    }

    if (dropdownState.lensesLeftDropdown) {
      document.addEventListener("click", handleClickOutsideLeft);
    } else {
      document.removeEventListener("click", handleClickOutsideLeft);
    }

    return () => {
      document.removeEventListener("click", handleClickOutsideRight);
      document.removeEventListener("click", handleClickOutsideLeft);
    };
  }, [dropdownState.lensesRightDropdown, dropdownState.lensesLeftDropdown]);

  async function getAllItems() {
    const lenseCategory = categories.find((category) =>
      category.name.toLowerCase().includes("lens")
    );

    const updatedItems = items.filter(
      (item) => item.categoryId === lenseCategory?.id
    );

    setAllItems(updatedItems);
    setDropdownState((prevState) => ({
      ...prevState,
      lensesLeftDropdownContent: updatedItems,
      lensesRightDropdownContent: updatedItems,
    }));
  }

  function fillTableToEditInputs() {
    let tableGlassesRight;
    let tableGlassesLeft;
    if (tableContent) {
      setLenseInput({
        ...lenseInput,
        lenseRightName: tableContent.rightLense,
        lenseRightPrice: tableContent.rightLensePrice,
        lenseLeftName: tableContent.leftLense,
        lenseLeftPrice: tableContent.leftLensePrice,
        categoryIdLeft: tableContent.categoryIdLeft,
        categoryIdRight: tableContent.categoryIdRight,
      });

      tableGlassesLeft = tableContent.clientTableContentLeft;
      tableGlassesRight = tableContent.clientTableContentRight;

      autoFillUserTables(tableGlassesLeft, tableGlassesRight);
    } else {
      clearClientTableLenses();
    }
  }

  async function confirmTableEdit() {
    setLoading(true);
    const tableRef = collection(
      db,
      "clientEyeTableLensesInfo",
      clickedUser.uid,
      "prescriptionInfo"
    );

    const q = query(tableRef, where("tablesId", "==", tableContent.tablesId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;

      await updateDoc(docRef, {
        amountPaid: amountPaid,
        categoryIdLeft: lenseInput.categoryIdLeft,
        categoryIdRight: lenseInput.categoryIdRight,
        clientTableContentLeft: clientTableLenses,
        clientTableContentRight: clientTableLensesRight,
        dateOfPrescription: tableContent.dateOfPrescription,
        leftLense: lenseInput.lenseLeftName,
        leftLensePrice: lenseInput.lenseLeftPrice,
        paymentMethod: payment,
        rightLense: lenseInput.lenseRightName,
        rightLensePrice: lenseInput.lenseRightPrice,
        tablesId: tableContent.tablesId,
      });

      toast.success("Table updated successfully");
      handleTableEditorLensesClose();
      setOpen(false);
    } else {
      toast.error("No matching table found to update.");
    }
    setLoading(false);
  }

  async function completeAmountPaidLenses() {
    setLoading(true);
    try {
      const tableRef = doc(
        db,
        "clientEyeTableLensesInfo",
        clickedUser.uid,
        "prescriptionInfo",
        tableContent.id
      );
      await updateDoc(tableRef, { amountPaid: "paid" });
      toast.success("Completed Payment!");
      handleTableEditorLensesClose();
      setOpen(false);
    } catch (error) {
      toast.error("Error updating AmountPaid:", error);
    }
    setLoading(false);
  }

  async function fillTableInputs() {
    if (!clickedUser) {
      return;
    }
    let tableLensesRight;
    let tableLensesLeft;

    const table = collection(
      db,
      "clientEyeTableLensesInfo",
      clickedUser.uid,
      "prescriptionInfo"
    );

    const q = query(table, orderBy("dateOfPrescription", "desc"));
    const data = await getDocs(q);

    if (!data.empty) {
      tableLensesLeft = data.docs[0].data().clientTableContentLeft;
      tableLensesRight = data.docs[0].data().clientTableContentRight;

      setLenseInput({
        lenseRightName: data.docs[0].data().rightLense,
        lenseRightPrice: data.docs[0].data().rightLensePrice,
        lenseLeftName: data.docs[0].data().leftLense,
        lenseLeftPrice: data.docs[0].data().leftLensePrice,
        categoryIdLeft: data.docs[0].data().categoryIdLeft,
        categoryIdRight: data.docs[0].data().categoryIdRight,
      });

      autoFillUserTables(tableLensesLeft, tableLensesRight);
    } else {
      clearClientTableLenses();
    }
  }

  const autoFillUserTables = (tableGlassesLeft, tableGlassesRight) => {
    const newContent = [...clientTableLenses];
    const newContentRight = [...clientTableLensesRight];

    for (let i = 0; i < tableGlassesLeft.length; i++) {
      for (let j = 1; j <= 2; j++) {
        const key = `tableRow${j}`;
        newContent[i][key] = tableGlassesLeft[i][key];
        newContentRight[i][key] = tableGlassesRight[i][key];
      }
    }

    setAmountPaid(tableContent.amountPaid);

    setPayment(tableContent.paymentMethod);

    setClientTableLenses(newContent);

    setClientTableLensesRight(newContentRight);
  };

  React.useEffect(() => {
    if (!tableContent) {
      fillTableInputs();
    }
  }, [tableContent, clickedUser]);

  React.useEffect(() => {
    fillTableToEditInputs();
  }, [tableContent, clickedUser]);

  React.useEffect(() => {
    getAllItems();
  }, [items]);

  React.useEffect(() => {
    const newTotal =
      parseFloat(lenseInput.lenseRightPrice) * quantityInput.quantityRight +
      parseFloat(lenseInput.lenseLeftPrice) * quantityInput.quantityLeft;
    setTotal(newTotal);
  }, [quantityInput, lenseInput]);

  return (
    <div className={styles.tableComponentContainer}>
      <Toaster />
      <button
        className={styles.clearTableButton}
        onClick={() => clearClientTableLenses()}
      >
        Clear Table
      </button>
      <div className={styles.tableContainer}>
        <div className={styles.tableInputWrapperLenses}>
          {clientTableLensesRight.map((content, rowIndex) => (
            <div className={styles.tableRow} key={rowIndex}>
              <p className={styles.tableRowContent}>{content.tableRow1}</p>
              {content.tableRow2 === "Contact" ? (
                <p className={styles.tableRowContent}>{content.tableRow2}</p>
              ) : (
                <input
                  className={styles.tableRowInputContent}
                  value={content.tableRow2}
                  onBlur={() => handleBlurRight(rowIndex, 2)}
                  onChange={(e) => {
                    handleInputChangeForTableRight(e, rowIndex + 1, 2);
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <div className={styles.tableInputWrapperLenses}>
          {clientTableLenses.map((content, rowIndex) => (
            <div className={styles.tableRow} key={rowIndex}>
              <p className={styles.tableRowContent}>{content.tableRow1}</p>
              {content.tableRow2 === "Contact" ? (
                <p className={styles.tableRowContent}>{content.tableRow2}</p>
              ) : (
                <input
                  className={styles.tableRowInputContent}
                  value={content.tableRow2}
                  onBlur={() => handleBlurLeft(rowIndex, 2)}
                  onChange={(e) => {
                    handleInputChange(e, rowIndex + 1, 2);
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.searchLenseContainerLenses}>
        <div className={styles.searchLenseWrapper}>
          <div className={styles.searchLenseRight}>
            <div>
              <p>Right Lens</p>
              <input
                ref={inputRefRight}
                type="text"
                placeholder="right lens"
                value={lenseInput.lenseRightName}
                className={styles.customerInputRightLense}
                onChange={(e) => findRightLenses(e.target.value)}
                onFocus={() =>
                  setDropdownState({
                    ...dropdownState,
                    lensesRightDropdown: true,
                    lensesRightDropdownContent: allItems,
                  })
                }
                onKeyDown={handleKeyDownRightLenses}
              />
              {dropdownState.lensesRightDropdown && (
                <div
                  className={styles.dropdownContainerRightLens}
                  ref={dropdownRefRight}
                >
                  {dropdownState.lensesRightDropdownContent.map((item, i) => (
                    <div className={styles.dropdownWrapper} key={i}>
                      <p
                        className={styles.dropdownContent}
                        onClick={() => pickLense(item)}
                      >
                        {item.itemName +
                          " " +
                          item.itemCode +
                          ", " +
                          item.itemQuantity}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p>QTY</p>
              <input
                type="text"
                value={quantityInput.quantityRight}
                placeholder="Qty"
                className={styles.customerInputLensePrice}
                onChange={(e) => {
                  setQuantityInput({
                    ...quantityInput,
                    quantityRight: e.target.value,
                  });
                }}
              />
            </div>
            <div>
              <p>Price</p>
              <input
                type="text"
                value={lenseInput.lenseRightPrice}
                placeholder="right lens price"
                className={styles.customerInputLensePrice}
                onChange={(e) =>
                  setLenseInput({
                    ...lenseInput,
                    lenseRightPrice: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className={styles.searchLenseLeft}>
            <div>
              <p>Lens Name</p>
              <input
                ref={inputRefLeft}
                type="text"
                placeholder="left lens"
                value={lenseInput.lenseLeftName}
                className={styles.customerInputLeftLense}
                onChange={(e) => findLeftLenses(e.target.value)}
                onFocus={() =>
                  setDropdownState({
                    ...dropdownState,
                    lensesLeftDropdown: true,
                    lensesLeftDropdownContent: allItems,
                  })
                }
                onKeyDown={handleKeyDownLeftLenses}
              />
              {dropdownState.lensesLeftDropdown && (
                <div
                  className={styles.dropdownContainerLeftLens}
                  ref={dropdownRefLeft}
                >
                  {dropdownState.lensesLeftDropdownContent.map((item, i) => (
                    <div className={styles.dropdownWrapper} key={i}>
                      <p
                        className={styles.dropdownContent}
                        onClick={() => pickLeftLense(item)}
                      >
                        {item.itemName +
                          " " +
                          item.itemCode +
                          ", " +
                          item.itemQuantity}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p>QTY</p>
              <input
                type="text"
                value={quantityInput.quantityLeft}
                placeholder="Qty"
                className={styles.customerInputLensePrice}
                onChange={(e) => {
                  setQuantityInput({
                    ...quantityInput,
                    quantityLeft: e.target.value,
                  });
                }}
              />
            </div>
            <div>
              <p>Price</p>
              <input
                type="text"
                value={lenseInput.lenseLeftPrice}
                placeholder="left lens price"
                className={styles.customerInputLensePrice}
                onChange={(e) =>
                  setLenseInput({
                    ...lenseInput,
                    lenseLeftPrice: e.target.value,
                  })
                }
              />
            </div>
          </div>
          {/* <p style={{ width: "7%" }}>
            Total:{" $"}
            {parseFloat(lenseInput.lenseLeftPrice) +
              parseFloat(lenseInput.lenseRightPrice)}
          </p> */}
        </div>
      </div>
      <h3
        style={{ textAlign: "end", marginRight: "12px", marginBottom: "24px" }}
      >
        Total:{" $"}
        {total}
      </h3>
      <PaymentMethod
        setAmountPaid={setAmountPaid}
        amountPaid={amountPaid}
        setPayment={setPayment}
        payment={payment}
      />
      {editingMode ? (
        <>
          {!loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <button
                onClick={() => confirmTableEdit()}
                className={styles.confirmEditButton}
              >
                Confirm Edit
              </button>
              <button
                onClick={() => completeAmountPaidLenses()}
                className={styles.confirmEditButton}
              >
                Complete
              </button>
            </div>
          ) : (
            <div className={styles.spinner}></div>
          )}
        </>
      ) : (
        <>
          {!loading ? (
            <button
              onClick={() => submitLenses()}
              className={styles.submitLensesButton}
            >
              Submit to Lenses
            </button>
          ) : (
            <div className={styles.spinner}></div>
          )}
        </>
      )}
    </div>
  );
}

export default ClientTableLenses;
