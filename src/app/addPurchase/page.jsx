"use client";
import styles from "./addItem.module.css";
import { useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import Nav from "@/components/Nav/Nav";
import { randomString } from "@/helpers/utils";
import toast, { Toaster } from "react-hot-toast";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import {
  doc,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import { Select } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { db } from "@/helpers/firebase";
import { formatDate } from "@/helpers/utils";
import JsBarcode from "jsbarcode";

export default function page() {
  const [gross, setGross] = useState(0);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [totalTTC, setTotalTTC] = useState(0);
  const [totalVAT, setTotalVAT] = useState(0);
  const { items } = useSelector((state) => state.items);
  const [open, setOpen] = useState(false);
  const [tax, setTax] = React.useState(0);
  const [itemToEdit, setItemToEdit] = useState({});
  const [listedItemsArr, setListedItemsArr] = useState([]);
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState("");
  const suppliersRef = collection(db, "suppliers");
  const warehouseRef = collection(db, "warehouse");

  const [itemSupplierInput, setItemSupplierInput] = useState({
    supplierName: "",
  });

  const [allSuppliers, setAllSuppliers] = useState([]);
  const [allWarehouses, setAllWarehouses] = useState([]);
  const [originalSuppliers, setOriginalSuppliers] = useState([]);
  const [originalWarehouses, setOriginalWarehouses] = useState([]);

  const [counter, setCounter] = useState(0);
  const [startDate, setStartDate] = useState(new Date());
  const { categories } = useSelector((state) => state.categories);

  const [categoryId, setCategoryId] = useState("");
  const [dropdownState, setDropdownState] = useState({
    itemNameDropdown: false,
    itemNameDropdownContent: [],
    itemCodeDropdown: false,
    itemCodeDropdownContent: [],
    itemSupplierDropdown: false,
    itemSupplierDropdownContent: [],
    warehouseDropdown: false,
    warehouseDropdownContent: [],
    categoryDropdown: false,
    categoryDropdownContent: [],
    categoryModalDropdown: false,
    categoryModalDropdownContent: [],
  });

  const [editedItem, setEditedItem] = useState({
    newInvoiceNum: "",
    newItemName: "",
    newItemCode: "",
    newItemWarehouse: "",
    newItemDiscountPercentage: "0",
    newItemSupplier: "",
    newItemDate: "",
    newItemCost: "",
    originalItemCost: "",
    newItemQuantity: "",
    newItemTax: "",
    newItemPrice: "",
    newItemCategory: "",
  });

  const [itemsInput, setItemsInput] = useState({
    invoiceNum: invoice,
    itemName: "",
    itemCode: "",
    itemWarehouse: "",
    originalItemCost: "",
    itemSupplier: itemSupplierInput.supplierName,
    itemCost: "",
    itemPrice: "",
    itemDiscountPrice: "0",
    itemGeneratedCode: "",
    itemQuantity: "",
    itemTax: tax,
    category: "",
    itemDate: convertToUnixTime(startDate),
  });

  const handleClose = () => setOpen(false);

  const calculatePrice = (price, quantity, tax) => {
    const basePrice = parseFloat(price) * quantity;
    return tax !== 0
      ? (parseFloat(basePrice) * (tax / 10)).toFixed(2) + 0.01
      : basePrice;
  };

  const filterCategories = (categories, value) =>
    categories.filter((category) =>
      category.name.toLowerCase().includes(value.toLowerCase())
    );

  const handleTaxChange = (event) => {
    setItemsInput({
      ...itemsInput,
      itemTax: event.target.value,
    });
    setTax(event.target.value);
  };

  const setInvoiceNum = (e) => {
    setInvoice(e.target.value);
    setItemsInput({
      ...itemsInput,
      invoiceNum: e.target.value,
    });
  };

  const handleWarehouseChange = (event) => {
    const warehouseName = event.target.value;
    setItemsInput({
      ...itemsInput,
      itemWarehouse: warehouseName,
    });

    if (!warehouseName) {
      setDropdownState({
        warehouseDropdown: false,
        warehouseDropdownContent: allWarehouses,
      });
      return;
    }

    const filteredWarehouse = originalWarehouses.filter((warehouse) =>
      warehouse.warehouse
        .toLowerCase()
        .includes(warehouseName.toLowerCase().trim())
    );
    setDropdownState({
      warehouseDropdownContent: filteredWarehouse,
      warehouseDropdown: true,
    });
  };

  const findTheClickedWarehouse = (warehouse) => {
    setItemsInput({
      ...itemsInput,
      itemWarehouse: warehouse.warehouse,
    });

    setDropdownState({
      warehouseDropdown: false,
      warehouseDropdownContent: originalWarehouses,
    });
  };

  const handleSupplierChange = (event) => {
    const supplierName = event.target.value;
    setItemSupplierInput({ supplierName });
    setItemsInput({
      ...itemsInput,
      itemSupplier: supplierName,
    });

    if (!supplierName) {
      setDropdownState({
        itemSupplierDropdown: false,
        itemSupplierDropdownContent: allSuppliers,
      });
      return;
    }

    const filteredUser = originalSuppliers.filter((item) =>
      item.supplier.toLowerCase().includes(supplierName.toLowerCase().trim())
    );

    setDropdownState({
      itemSupplierDropdownContent: filteredUser,
      itemSupplierDropdown: true,
    });
  };

  function findTheClickedSupplierName(itemSupplier) {
    setItemSupplierInput({ itemSupplier: itemSupplier.supplier });
    const filteredItem = allSuppliers.filter(
      (item) => item.supplier === itemSupplier.supplier
    );
    setItemsInput({
      ...itemsInput,
      itemSupplier: filteredItem[0].supplier,
    });

    setItemSupplierInput({
      supplierName: filteredItem[0].supplier,
    });

    setDropdownState({
      itemSupplierDropdown: false,
    });
  }

  const handleCategoryInput = (e, setStateFunc, isModal = false) => {
    const value = e.target.value;
    setStateFunc(value);
    setDropdownState((prevState) => ({
      ...prevState,
      [isModal ? "categoryModalDropdown" : "categoryDropdown"]: value !== "",
      [isModal ? "categoryModalDropdownContent" : "categoryDropdownContent"]:
        filterCategories(categories, value),
    }));
  };

  const handleClientInputCategory = (e) => {
    handleCategoryInput(e, (value) =>
      setItemsInput((prev) => ({ ...prev, category: value }))
    );
  };

  const handleClientModalInputCategory = (e) => {
    handleCategoryInput(
      e,
      (value) => setEditedItem((prev) => ({ ...prev, newItemCategory: value })),
      true
    );
  };

  function convertToUnixTime(dateString) {
    const date = new Date(dateString);
    return Math.floor(date.getTime() / 1000);
  }

  const addItemToList = () => {
    const {
      itemName,
      category,
      itemPrice,
      itemCode,
      itemCost,
      itemQuantity,
      itemSupplier,
      itemWarehouse,
      itemDiscountPrice,
    } = itemsInput;

    if (
      !itemName ||
      !itemPrice ||
      !category ||
      !itemCode ||
      !itemCost ||
      !itemQuantity ||
      !itemSupplier ||
      !itemDiscountPrice ||
      !itemWarehouse
    ) {
      toast.error("Please enter all fields");
      return;
    }

    const foundInvoice = items.find(
      (item) =>
        item.invoice === itemsInput.invoiceNum &&
        item.itemSupplier.includes(itemsInput.itemSupplier)
    );

    if (foundInvoice) {
      toast.error("Invoice already exists for this supplier!");
      return;
    }

    const generatedCode = Math.floor(Math.random() * 999999);

    const finalItemDiscountCost = itemCost * (1 - itemDiscountPrice / 100);

    const newItem = {
      ...itemsInput,
      itemGeneratedCode: generatedCode,
      itemDiscountPrice: itemPrice,
      categoryId,
      counter,
      invoiceNum: invoice,
      itemPrice,
      itemCost,
      originalItemCost: itemCost,
      itemQuantity,
      itemSupplier: itemSupplierInput.supplierName,
      itemTax: tax,
      itemWarehouse,
      itemDate: convertToUnixTime(startDate),
      discountPercentage: itemDiscountPrice,
    };

    console.log(newItem);

    setCounter((prevCounter) => prevCounter + 1);

    const grossAmount = calculatePrice(finalItemDiscountCost, itemQuantity, 0);

    const taxVAT =
      (tax / 100) * calculatePrice(finalItemDiscountCost, itemQuantity, 0);

    setGross((prevGross) => prevGross + grossAmount);

    setTotalDiscount(
      (prevTotalDiscount) =>
        prevTotalDiscount +
        parseFloat(itemCost * itemQuantity) -
        parseFloat(grossAmount)
    );

    setTotalTTC(
      (prevTotalTTC) => prevTotalTTC + parseFloat(grossAmount + taxVAT)
    );

    if (tax) {
      setTotalVAT((prevTotalVAT) => prevTotalVAT + taxVAT);
    }

    setListedItemsArr((prevItems) => [...prevItems, newItem]);
    resetItemsInput();
  };

  const resetItemsInput = () => {
    setItemsInput({
      itemName: "",
      itemCode: "",
      itemGeneratedCode: "",
      itemDate: convertToUnixTime(startDate),
      itemQuantity: "",
      invoiceNum: invoice,
      itemPrice: "",
      itemCost: "",
      itemDiscountPrice: "0",
      itemTax: 0,
      itemWarehouse: itemsInput.itemWarehouse,
      itemSupplier: itemSupplierInput.supplierName,
    });
    setDropdownState({
      itemCodeDropdownContent: items,
      itemNameDropdownContent: items,
      itemSupplierDropdownContent: allSuppliers,
      warehouseDropdownContent: allWarehouses,
    });

    // const basketItems = doc(db, "basket", "BCASLSzg2XsLMSlkVAjY");
    // await updateDoc(basketItems, {
    //   basket: [],
    // });
  };

  const findCategory = (category, setStateFunc, isModal = false) => {
    setStateFunc(category.name);
    setCategoryId(category.id);
    setDropdownState((prevState) => ({
      ...prevState,
      [isModal ? "categoryModalDropdown" : "categoryDropdown"]: false,
    }));
  };

  const findTheClickedCategory = (category) => {
    findCategory(category, (name) =>
      setItemsInput((prev) => ({ ...prev, category: name }))
    );
  };

  const findTheClickedModalCategory = (category) => {
    findCategory(
      category,
      (name) => setEditedItem((prev) => ({ ...prev, newItemCategory: name })),
      true
    );
  };

  const editItem = (listedItemId) => {
    const item = listedItemsArr.find((item) => item.counter === listedItemId);
    setItemToEdit(item);
    setEditedItem({
      newItemName: item.itemName,
      newItemPrice: item.itemPrice,
      newItemDiscountPercentage: item.discountPercentage,
      newItemCategory: item.category,
      newInvoiceNum: item.invoiceNum,
      newItemCode: item.itemCode,
      newItemCost: item.itemCost,
      originalItemCost: item.itemCost,
      newItemDate: item.itemDate,
      newItemQuantity: item.itemQuantity,
      newItemSupplier: item.itemSupplier,
      newItemTax: item.itemTax,
      newItemWarehouse: item.itemWarehouse,
    });
    setTax(item.itemTax);
    setOpen(true);
  };

  const findItemCode = (e) => {
    const userCode = e.target.value;
    setItemsInput({
      ...itemsInput,
      itemCode: userCode,
    });

    if (!userCode) {
      setDropdownState({
        itemCodeDropdown: false,
        itemCodeDropdownContent: items,
      });
      return;
    }

    const filteredUser = items.filter(
      (item) =>
        item.itemCode.includes(userCode) ||
        item.itemName.toLowerCase().includes(userCode.toLowerCase())
    );

    setDropdownState({
      itemCodeDropdownContent: filteredUser,
      itemCodeDropdown: true,
    });
  };

  const findItemName = (e) => {
    const itemName = e.target.value;
    setItemsInput({
      ...itemsInput,
      itemName: e.target.value,
    });

    if (!itemName) {
      setDropdownState({
        itemNameDropdown: false,
        itemNameDropdownContent: items,
      });
      return;
    }

    const filteredUser = items.filter((item) =>
      item.itemName.toLowerCase().includes(itemName.toLowerCase().trim())
    );

    setDropdownState({
      itemNameDropdownContent: filteredUser,
      itemNameDropdown: true,
    });
  };

  function findTheClickedItemCode(itemCode) {
    const filteredItem = items.filter(
      (item) =>
        item.itemId === itemCode.itemId && item.itemCode === itemCode.itemCode
    );

    setItemsInput({
      categoryId: filteredItem[0].categoryId,
      date: filteredItem[0].date,
      id: filteredItem[0].id,
      invoiceNum: filteredItem[0].invoice,
      itemCode: filteredItem[0].itemCode,
      itemCost: filteredItem[0].itemCost,
      itemGeneratedCode: filteredItem[0].itemGeneratedCode,
      itemId: filteredItem[0].itemId,
      itemName: filteredItem[0].itemName,
      itemPrice: filteredItem[0].itemPrice,
      itemQuantity: "0",
      itemSupplier: filteredItem[0].itemSupplier,
      itemTax: filteredItem[0].itemTax,
      itemWarehouse: filteredItem[0].itemWarehouse,
      itemDiscountPrice: "0",
    });
    setItemSupplierInput({
      supplierName: filteredItem[0].itemSupplier,
    });
    setTax(parseFloat(filteredItem[0].itemTax));
    setDropdownState({
      itemCodeDropdown: false,
    });
  }
  function findTheClickedName(itemName) {
    const filteredItem = items.filter(
      (item) => item.itemName === itemName.itemName
    );
    setItemsInput({
      ...itemsInput,
      itemName: filteredItem[0].itemName,
    });
    setDropdownState({
      itemNameDropdown: false,
    });
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && dropdownState.itemNameDropdownContent.length > 0) {
      findTheClickedName(dropdownState.itemNameDropdownContent[0]);
    }
  };

  const handleSupplierKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      dropdownState.itemSupplierDropdownContent.length > 0
    ) {
      findTheClickedSupplierName(dropdownState.itemSupplierDropdownContent[0]);
    }
  };

  const handleWarehouseKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      dropdownState.warehouseDropdownContent.length > 0
    ) {
      findTheClickedWarehouse(dropdownState.warehouseDropdownContent[0]);
    }
  };

  const handleKeyCategoryDown = (e) => {
    if (e.key === "Enter" && dropdownState.categoryDropdownContent.length > 0) {
      findTheClickedCategory(dropdownState.categoryDropdownContent[0]);
    }
  };

  const setNewValuesToItem = () => {
    const updatedItemsArr = listedItemsArr.map((item) =>
      item.counter === itemToEdit.counter
        ? {
            ...item,
            itemName: editedItem.newItemName,
            itemPrice: editedItem.newItemPrice,
            itemDiscountPrice: editedItem.newItemPrice,
            originalItemCost: editedItem.originalItemCost,
            itemCost: editedItem.newItemCost,
            category: editedItem.newItemCategory,
            itemSupplier: editedItem.newItemSupplier,
            itemTax: tax,
            itemQuantity: editedItem.newItemQuantity,
            itemWarehouse: editedItem.newItemWarehouse,
            itemDate: convertToUnixTime(startDate),
            invoiceNum: editedItem.newInvoiceNum,
            itemCode: editedItem.newItemCode,
            discountPercentage: editedItem.newItemDiscountPercentage,
          }
        : item
    );

    setListedItemsArr(updatedItemsArr);
    let grossAmount = 0;
    let totalDiscount = 0;
    let totalVAT = 0;
    let totalTTC = 0;

    updatedItemsArr.forEach((item) => {
      grossAmount += calculatePrice(item.itemCost, item.itemQuantity, 0);

      totalDiscount += parseFloat(item.itemCost * item.itemQuantity);

      setTotalDiscount(
        (prevTotalDiscount) =>
          prevTotalDiscount +
          parseFloat(item.itemCost * item.itemQuantity) -
          parseFloat(grossAmount)
      );

      if (item.itemTax) {
        totalVAT +=
          (item.itemTax / 100) *
          calculatePrice(item.itemCost, item.itemQuantity, 0);
      }

      totalTTC += parseFloat(
        calculatePrice(item.itemCost, item.itemQuantity, item.itemTax)
      );
    });

    totalDiscount = totalDiscount - parseFloat(grossAmount);
    console.log(totalDiscount);

    setGross(grossAmount);
    setTotalDiscount(totalDiscount);
    setTotalVAT(totalVAT);
    setTotalTTC(totalTTC);

    resetEditedItem();
    toast.success("Edited Successfully!");
  };

  const resetEditedItem = () => {
    setOpen(false);
    setEditedItem({
      newItemName: "",
      newItemPrice: "",
      newItemCategory: "",
      newInvoiceNum: "",
      newItemCode: "",
      newItemCost: "",
      newItemQuantity: "",
      newItemDate: "",
      newItemSupplier: "",
      newItemTax: "",
      newItemWarehouse: "",
      newItemDiscountPercentage: "",
    });
  };

  const saveItem = async () => {
    setLoading(true);
    const api = "/api/items/addItems";

    const saveRequests = listedItemsArr.map(async (item) => {
      const itemQuery = query(
        collection(db, "items"),
        where("itemName", "==", item.itemName),
        where("itemCode", "==", item.itemCode)
      );

      const querySnapshot = await getDocs(itemQuery);

      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (doc) => {
          const existingItem = doc.data();
          const newQuantity =
            parseFloat(existingItem.itemQuantity) +
            parseFloat(item.itemQuantity);

          await updateDoc(doc.ref, { itemQuantity: newQuantity });
        });
      } else {
        await fetch(
          `${api}?itemName=${item.itemName.trim()}&itemPrice=${
            item.itemDiscountPrice
          }&itemId=${randomString(20)}&categoryId=${
            item.categoryId
          }&invoice=${invoice}&itemCode=${item.itemCode}&itemWarehouse=${
            item.itemWarehouse
          }&itemSupplier=${item.itemSupplier}&itemCost=${
            item.itemCost
          }&itemTax=${tax}&itemQuantity=${item.itemQuantity}&date=${
            item.itemDate
          }&itemGeneratedCode=${item.itemGeneratedCode}`
        );
      }
    });

    const foundSupplier = allSuppliers.find(
      (supplier) =>
        supplier.supplier.toLowerCase() ===
        itemSupplierInput.supplierName.toLowerCase()
    );

    const foundWarehouse = allWarehouses.find(
      (warehouse) =>
        warehouse.warehouse.toLowerCase() ===
        itemsInput.itemWarehouse.toLowerCase()
    );

    if (foundSupplier) {
      await addDoc(suppliersRef, {
        supplier: itemSupplierInput.supplierName,
      });
    }

    if (foundWarehouse) {
      await addDoc(warehouseRef, {
        warehouse: itemsInput.itemWarehouse,
      });
    }

    await Promise.all(saveRequests);

    toast.success("Item Successfully Added!");

    resetItemsInput();
    setItemSupplierInput({
      supplierName: "",
    });
    setInvoice("");
    setTax(0);
    setItemsInput({
      ...itemsInput,
      itemWarehouse: "",
    });
    setGross(0);
    setTotalDiscount(0);
    setTotalVAT(0);
    setTotalTTC(0);
    setListedItemsArr([]);
    setLoading(false);
  };

  async function getAllSuppliers() {
    const suppliersSnapshot = await getDocs(suppliersRef);
    setAllSuppliers(suppliersSnapshot.docs.map((doc) => doc.data()));
    setOriginalSuppliers(suppliersSnapshot.docs.map((doc) => doc.data()));
  }

  async function getAllWarehouses() {
    const warehouseSnapshot = await getDocs(warehouseRef);
    setAllWarehouses(warehouseSnapshot.docs.map((doc) => doc.data()));
    setOriginalWarehouses(warehouseSnapshot.docs.map((doc) => doc.data()));
  }

  useEffect(() => {
    getAllSuppliers();
    setDropdownState({
      itemCodeDropdownContent: items,
      itemNameDropdownContent: items,
      itemSupplierDropdownContent: allSuppliers,
      warehouseDropdownContent: allWarehouses,
    });
  }, [listedItemsArr]);

  useEffect(() => {
    getAllWarehouses();
    setDropdownState({
      warehouseDropdownContent: allWarehouses,
    });
  }, [listedItemsArr]);

  return (
    <div className={styles.itemsContainer}>
      <Toaster />
      <Nav />
      <div className={styles.addItemsWrapper}>
        <div className={styles.addItems}>
          <h1 style={{ color: "white" }}>Add an Item</h1>
          <div className={styles.addItemInputsWrapper}>
            <div className={styles.inputWrapper}>
              <p className={styles.inputLabel}>Invoice</p>
              <input
                type="text"
                placeholder="Invoice Number"
                className={styles.itemInput}
                value={invoice || ""}
                onChange={(e) => setInvoiceNum(e)}
              />
            </div>
            <div className={styles.inputWrapper}>
              <p className={styles.inputLabel}>Date</p>
              <DatePicker
                className={styles.datePicker}
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                placeholderText="Date"
              />
            </div>
            <div className={styles.inputWrapper}>
              <p className={styles.inputLabel}>Supplier Name</p>
              <input
                type="text"
                placeholder="Supplier name"
                className={styles.itemInput}
                value={itemSupplierInput.supplierName || ""}
                onFocus={() =>
                  setDropdownState({
                    itemSupplierDropdown: true,
                    itemSupplierDropdownContent: allSuppliers,
                  })
                }
                onKeyDown={handleSupplierKeyDown}
                onChange={(e) => handleSupplierChange(e)}
              />
              {dropdownState.itemSupplierDropdown ? (
                <div className={styles.dropdownContainer}>
                  {dropdownState.itemSupplierDropdownContent.map(
                    (itemSupplier, i) => (
                      <div className={styles.dropdownWrapper} key={i}>
                        <p
                          className={styles.dropdownContent}
                          onClick={() =>
                            findTheClickedSupplierName(itemSupplier)
                          }
                        >
                          {itemSupplier.supplier}
                        </p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                false
              )}
            </div>
            <div className={styles.inputWrapper}>
              <p className={styles.inputLabel}>Tax</p>
              <Box
                sx={{
                  minWidth: 200,
                  height: 30,
                  zIndex: 0,
                  "&:hover": {
                    borderColor: "black",
                  },
                }}
                className="dropdown"
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
                    Tax
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={tax}
                    label="Age"
                    onChange={handleTaxChange}
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
                    <MenuItem value={11} className="option">
                      11
                    </MenuItem>
                    <MenuItem value={0} className="option">
                      0
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </div>
            <div className={styles.inputWrapper}>
              <p className={styles.inputLabel}>Warehouse</p>
              <input
                type="text"
                placeholder="Warehouse"
                className={styles.itemInput}
                onFocus={() =>
                  setDropdownState({
                    warehouseDropdown: true,
                    warehouseDropdownContent: allWarehouses,
                  })
                }
                value={itemsInput.itemWarehouse || ""}
                onChange={(e) => handleWarehouseChange(e)}
                onKeyDown={handleWarehouseKeyDown}
              />
              {dropdownState.warehouseDropdown ? (
                <div className={styles.dropdownContainer}>
                  {dropdownState.warehouseDropdownContent.map(
                    (warehouse, i) => (
                      <div className={styles.dropdownWrapper} key={i}>
                        <p
                          className={styles.dropdownContent}
                          onClick={() => findTheClickedWarehouse(warehouse)}
                        >
                          {warehouse.warehouse}
                        </p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                false
              )}
            </div>
            <div>
              <p className={styles.inputLabel}>Item Name</p>
              <input
                type="text"
                placeholder="Item Name"
                className={styles.itemInputLarge}
                value={itemsInput.itemName || ""}
                onChange={(e) => findItemName(e)}
                onKeyDown={handleKeyDown}
              />
              {dropdownState.itemNameDropdownContent ? (
                <div
                  className={
                    dropdownState.itemNameDropdown
                      ? styles.dropdownContainer
                      : styles.noDisplay
                  }
                >
                  {dropdownState.itemNameDropdownContent.map((itemName, i) => (
                    <div className={styles.dropdownWrapper} key={i}>
                      <p
                        className={styles.dropdownContent}
                        onClick={() => findTheClickedName(itemName)}
                      >
                        {itemName.itemName}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                false
              )}
            </div>
            <div>
              <p className={styles.inputLabel}>Item Description</p>
              <input
                type="text"
                placeholder="Item Description"
                className={styles.itemInputLarge}
                value={itemsInput.itemCode || ""}
                onChange={(e) => findItemCode(e)}
              />
              {dropdownState.itemCodeDropdown ? (
                <div className={styles.dropdownContainer}>
                  {dropdownState.itemCodeDropdownContent.map((itemCode, i) => (
                    <div className={styles.dropdownWrapper} key={i}>
                      <p
                        className={styles.dropdownContent}
                        onClick={() => findTheClickedItemCode(itemCode)}
                      >
                        {itemCode.itemName} {itemCode.itemCode}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                false
              )}
            </div>
            <div>
              <p className={styles.inputLabel}>Item Cost</p>
              <input
                type="text"
                className={styles.itemInputSmall}
                value={itemsInput.itemCost || ""}
                onChange={(e) =>
                  setItemsInput({
                    ...itemsInput,
                    itemCost: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <p className={styles.inputLabel}>Item Price</p>
              <input
                type="text"
                className={styles.itemInputSmall}
                value={itemsInput.itemPrice || ""}
                onChange={(e) =>
                  setItemsInput({
                    ...itemsInput,
                    itemPrice: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <p className={styles.inputLabel}>Item Quantity</p>
              <input
                type="text"
                className={styles.itemInputLast}
                value={itemsInput.itemQuantity || ""}
                onChange={(e) =>
                  setItemsInput({
                    ...itemsInput,
                    itemQuantity: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <p className={styles.inputLabel}>Discount Percentage</p>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                placeholder="Discount Percentage"
                className={styles.itemInputLast}
                value={itemsInput.itemDiscountPrice || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value) && value <= 100 && value >= 0) {
                    setItemsInput({
                      ...itemsInput,
                      itemDiscountPrice: value,
                    });
                  }
                }}
              />
            </div>
            <div>
              <p className={styles.inputLabel}>Item Category</p>
              <input
                type="text"
                value={itemsInput.category || ""}
                placeholder="Item Category"
                className={styles.itemInput}
                onChange={(e) => handleClientInputCategory(e)}
                onKeyDown={handleKeyCategoryDown}
              />
              {dropdownState.categoryDropdown ? (
                <div className={styles.dropdownContainer}>
                  {dropdownState.categoryDropdownContent.map(
                    (categories, i) => (
                      <div className={styles.dropdownWrapper} key={i}>
                        <p
                          className={styles.dropdownContent}
                          onClick={() => findTheClickedCategory(categories)}
                        >
                          {categories.name}
                        </p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                false
              )}
            </div>
          </div>
          <button
            className={styles.addItemButton}
            onClick={() => addItemToList()}
          >
            Add Item
          </button>
          <div className={styles.itemsListedContainer}>
            {listedItemsArr.length === 0 ? null : (
              <>
                <div className={styles.itemInfo}>
                  <h3 className={styles.purchaseLoc}>
                    Purchased from: {itemSupplierInput.supplierName}
                  </h3>
                  <h3 className={styles.warehouse}>
                    Warehouse: {itemsInput.itemWarehouse}
                  </h3>
                  <h3 className={styles.invoice}>Invoice: {invoice}</h3>
                  <h3 className={styles.currency}>Currency: USD</h3>
                  <h3 className={styles.date}>
                    Date: {formatDate(Date.now())}
                  </h3>
                </div>
                <div className={styles.itemsListedCol}>
                  <h3
                    className={`${styles.invoiceNumberCol} ${styles.itemAddedInfoCol}`}
                  >
                    Code
                  </h3>
                  <h3
                    className={`${styles.itemNameCol} ${styles.itemAddedInfoCol}`}
                  >
                    Name
                  </h3>
                  <h3
                    className={`${styles.itemCodeCol} ${styles.itemAddedInfoCol}`}
                  >
                    Description
                  </h3>
                  <h3
                    className={`${styles.itemQtyCol} ${styles.itemAddedInfoCol}`}
                  >
                    Quantity
                  </h3>
                  <h3
                    className={`${styles.itemPriceCol} ${styles.itemAddedInfoCol}`}
                  >
                    Price
                  </h3>
                  <h3
                    className={`${styles.itemDiscCol} ${styles.itemAddedInfoCol}`}
                  >
                    Discount
                  </h3>
                  <h3
                    className={`${styles.itemTotalCol} ${styles.itemAddedInfoCol}`}
                  >
                    Total
                  </h3>
                </div>
              </>
            )}
            {listedItemsArr.map((listedItem, i) => (
              <div key={i} className={styles.itemsListed}>
                {/* <div> */}
                <p
                  className={`${styles.itemGeneratedCode} ${styles.itemAddedInfo}`}
                >
                  {listedItem.itemGeneratedCode}
                </p>
                {/* <svg
                    id={`barcode-${listedItem.itemGeneratedCode.toString()}`}
                    className={styles.barcode}
                  ></svg> */}
                {/* </div> */}
                <p className={`${styles.itemName} ${styles.itemAddedInfo}`}>
                  {listedItem.itemName}
                </p>
                <p className={`${styles.itemCode} ${styles.itemAddedInfo}`}>
                  {listedItem.itemCode}
                </p>
                <p className={`${styles.itemQuantity} ${styles.itemAddedInfo}`}>
                  {listedItem.itemQuantity}
                </p>
                <p className={`${styles.itemPrice} ${styles.itemAddedInfo}`}>
                  ${listedItem.itemCost}
                </p>
                <p className={`${styles.itemDiscount} ${styles.itemAddedInfo}`}>
                  {listedItem.discountPercentage}%
                </p>
                <p className={`${styles.itemCategory} ${styles.itemAddedInfo}`}>
                  $
                  {(
                    listedItem.itemCost *
                    (1 - listedItem.discountPercentage / 100) *
                    listedItem.itemQuantity
                  ).toFixed(2)}
                </p>
                <button
                  onClick={() => editItem(listedItem.counter)}
                  className={styles.editItemButton}
                >
                  Edit
                </button>
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
                      variant="h6"
                      component="h2"
                    >
                      Edit The Item
                    </Typography>
                    <div>
                      <Typography
                        id="modal-modal-description"
                        sx={{ mt: 2 }}
                        className={styles.editItemsContainer}
                      >
                        <div className={styles.editItemsWrapper}>
                          <div>
                            <p>Invoice</p>
                            <input
                              type="text"
                              value={editedItem.newInvoiceNum}
                              className={styles.itemInput}
                              onChange={(e) =>
                                setEditedItem({
                                  ...editedItem,
                                  newInvoiceNum: e.target.value,
                                })
                              }
                              placeholder="New Invoice"
                            />
                          </div>
                          <div>
                            <p>Name</p>
                            <input
                              type="text"
                              value={editedItem.newItemName}
                              className={styles.itemInput}
                              onChange={(e) =>
                                setEditedItem({
                                  ...editedItem,
                                  newItemName: e.target.value,
                                })
                              }
                              placeholder="New Name"
                            />
                          </div>
                          <div>
                            <p>Code</p>
                            <input
                              type="text"
                              value={editedItem.newItemCode}
                              className={styles.itemInput}
                              onChange={(e) =>
                                setEditedItem({
                                  ...editedItem,
                                  newItemCode: e.target.value,
                                })
                              }
                              placeholder="New Code"
                            />
                          </div>
                          <div>
                            <p>Supplier</p>
                            <input
                              type="text"
                              value={editedItem.newItemSupplier}
                              className={styles.itemInput}
                              onChange={(e) =>
                                setEditedItem({
                                  ...editedItem,
                                  newItemSupplier: e.target.value,
                                })
                              }
                              placeholder="New Supplier Name"
                            />
                          </div>
                          <div>
                            <p>Warehouse</p>
                            <input
                              type="text"
                              value={editedItem.newItemWarehouse}
                              className={styles.itemInput}
                              onChange={(e) =>
                                setEditedItem({
                                  ...editedItem,
                                  newItemWarehouse: e.target.value,
                                })
                              }
                              placeholder="New Warehouse"
                            />
                          </div>
                          <div>
                            <p>Date</p>
                            <DatePicker
                              className={styles.datePicker}
                              selected={startDate}
                              onChange={(date) => setStartDate(date)}
                              placeholderText="Date"
                            />
                          </div>
                          <div>
                            <p>Cost</p>
                            <input
                              type="text"
                              className={styles.itemInput}
                              value={editedItem.newItemCost}
                              onChange={(e) =>
                                setEditedItem({
                                  ...editedItem,
                                  newItemCost: e.target.value,
                                })
                              }
                              placeholder="New Cost"
                            />
                          </div>
                          <div>
                            <p>Price</p>
                            <input
                              type="text"
                              className={styles.itemInput}
                              value={editedItem.newItemPrice}
                              onChange={(e) =>
                                setEditedItem({
                                  ...editedItem,
                                  newItemPrice: e.target.value,
                                })
                              }
                              placeholder="New Price"
                            />
                          </div>
                          <div>
                            <p>Quantity</p>
                            <input
                              type="text"
                              className={styles.itemInput}
                              value={editedItem.newItemQuantity}
                              onChange={(e) =>
                                setEditedItem({
                                  ...editedItem,
                                  newItemQuantity: e.target.value,
                                })
                              }
                              placeholder="New Quantity"
                            />
                          </div>
                          <div>
                            <p>Discount Percentage</p>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="\d*"
                              placeholder="Discount Percentage"
                              className={styles.itemInputLast}
                              value={editedItem.newItemDiscountPercentage}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*$/.test(value)) {
                                  setEditedItem({
                                    ...editedItem,
                                    newItemDiscountPercentage: value,
                                  });
                                }
                              }}
                            />
                          </div>
                          <div>
                            <p>Tax</p>
                            <Box
                              sx={{
                                minWidth: 200,
                                height: 30,
                                zIndex: 0,
                                "&:hover": {
                                  borderColor: "black",
                                },
                              }}
                              className="dropdown"
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
                                  Tax
                                </InputLabel>
                                <Select
                                  labelId="demo-simple-select-label"
                                  id="demo-simple-select"
                                  value={tax}
                                  label="Age"
                                  onChange={handleTaxChange}
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
                                    "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                      {
                                        borderColor: "black",
                                      },
                                  }}
                                >
                                  <MenuItem value={11} className="option">
                                    11
                                  </MenuItem>
                                  <MenuItem value={0} className="option">
                                    0
                                  </MenuItem>
                                </Select>
                              </FormControl>
                            </Box>
                          </div>
                          <div>
                            <p>Category</p>
                            <input
                              type="text"
                              value={editedItem.newItemCategory}
                              placeholder="Category"
                              className={styles.itemInput}
                              onChange={(e) =>
                                handleClientModalInputCategory(e)
                              }
                            />
                          </div>
                          {dropdownState.categoryModalDropdown ? (
                            <div className={styles.dropdownContainer}>
                              {dropdownState.categoryModalDropdownContent.map(
                                (categories, i) => (
                                  <div
                                    className={styles.dropdownWrapper}
                                    key={i}
                                  >
                                    <p
                                      className={styles.dropdownContent}
                                      onClick={() =>
                                        findTheClickedModalCategory(categories)
                                      }
                                    >
                                      {categories.name}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            false
                          )}
                        </div>
                        <button
                          onClick={() => setNewValuesToItem()}
                          className={styles.saveEditChangesButton}
                        >
                          Save
                        </button>
                      </Typography>
                    </div>
                  </Box>
                </Modal>
              </div>
            ))}
            {listedItemsArr.length === 0 ? null : (
              <>
                <h3 className={styles.totalBeforeTax}>
                  Gross (HT): ${gross.toFixed(2)}
                </h3>
                <h3 className={styles.totalDiscount}>
                  Discount amount: ${totalDiscount.toFixed(2)}
                </h3>
                <h3 className={styles.totalVAT}>VAT: ${totalVAT.toFixed(2)}</h3>
                <h3 className={styles.totalTTC}>
                  Total after tax (TTC): ${parseFloat(totalTTC).toFixed(2)}
                </h3>
              </>
            )}
          </div>
          {!loading ? (
            <button
              onClick={(e) => saveItem(e)}
              className={styles.addItemButton}
            >
              Finalize Items
            </button>
          ) : (
            <div className={styles.spinner}></div>
          )}
        </div>
      </div>
    </div>
  );
}
