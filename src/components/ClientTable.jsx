import React, { useRef, useState, useEffect } from "react";
import styles from "../app/addCustomer/addCustomer.module.css";
import { clientTableContent as initialClientTableContent } from "@/clientTableContent";
import { clientTableContentRight as initialClientTableContentRight } from "@/clientTableContentRight";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import {
  collection,
  addDoc,
  doc,
  query,
  where,
  getDocs,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "@/helpers/firebase";
import { randomString } from "@/helpers/utils";
import PaymentMethod from "./PaymentMethod/PaymentMethod";

export default function ClientTable({
  clickedUser,
  setOpen,
  customerInput,
  setCustomerInput,
  startDate,
  gender,
  setGender,
  handleTableEditorClose,
  forAddCustomer,
  editingMode,
  tableContent,
  setStartDate,
}) {
  const [clientTableContent, setClientTableContent] = useState(
    initialClientTableContent
  );
  const [clientTableContentRight, setClientTableContentRight] = useState(
    initialClientTableContentRight
  );
  const { items } = useSelector((state) => state.items);
  const { categories } = useSelector((state) => state.categories);
  const [allItems, setAllItems] = useState([]);
  const [allFrames, setAllFrames] = useState([]);
  const [amountPaid, setAmountPaid] = useState(0);
  const [isFilled, setIsFilled] = useState(false);
  const [payment, setPayment] = useState("");
  const [loading, setLoading] = useState(false);

  const [autoFilled, setAutoFilled] = useState({
    left: false,
    right: false,
  });

  const [frameInput, setFrameInput] = useState({
    frameName: "",
    frameNameNear: "",
    framePrice: 0,
    framePriceNear: 0,
    categoryId: "",
    categoryIdNear: "",
    itemCode: "",
    itemCodeNear: "",
  });

  const [lenseInput, setLenseInput] = useState({
    lenseRightName: "",
    lenseRightPrice: 0,
    lenseLeftName: "",
    lenseLeftPrice: 0,
    lenseLeftNameNear: "",
    lenseLeftPriceNear: 0,
    lenseRightNameNear: "",
    lenseRightPriceNear: 0,
    categoryIdRight: "",
    itemCodeRight: "",
    itemCodeLeft: "",
    itemCodeRightNear: "",
    itemCodeLeftNear: "",
    categoryIdLeft: "",
    categoryIdRightNear: "",
    categoryIdLeftNear: "",
  });

  const inputRefRight = useRef(null);
  const dropdownRefRight = useRef(null);
  const inputRefLeft = useRef(null);
  const dropdownRefLeft = useRef(null);
  const inputRefFrame = useRef(null);
  const dropdownRefFrame = useRef(null);
  const inputRefRightNear = useRef(null);
  const dropdownRefRightNear = useRef(null);
  const inputRefLeftNear = useRef(null);
  const dropdownRefLeftNear = useRef(null);
  const inputRefFrameNear = useRef(null);
  const dropdownRefFrameNear = useRef(null);

  const [dropdownState, setDropdownState] = useState({
    frameDropdown: false,
    frameDropdownNear: false,
    lensesRightDropdown: false,
    lensesRightDropdownNear: false,
    lensesLeftDropdown: false,
    lensesLeftDropdownNear: false,
    frameDropdownContent: items || [],
    frameDropdownContentNear: items || [],
    lensesRightDropdownContent: items || [],
    lensesRightDropdownContentNear: items || [],
    lensesLeftDropdownContent: items || [],
    lensesLeftDropdownContentNear: items || [],
  });

  function convertToUnixTime(dateString) {
    const date = new Date(dateString);
    return Math.floor(date.getTime() / 1000);
  }

  const handleInputChange = (event, row, column) => {
    const newContent = [...clientTableContent];
    newContent[row - 1][`tableRow${column}`] = event.target.value;
    setClientTableContent(newContent);
  };

  const handleBlurLeft = (row, column) => {
    const updatedContentLeft = [...clientTableContent];
    const updatedContentRight = [...clientTableContentRight];
    const cellValue = parseFloat(updatedContentLeft[row][`tableRow${column}`]);

    if (!isNaN(cellValue)) {
      if (row === 3 || row === 5 || row === 6 || row === 7) {
        updatedContentLeft[row][`tableRow${column}`] = cellValue;
      } else if (row === 9) {
        updatedContentLeft[row][`tableRow${column}`] =
          updatedContentLeft[row][`tableRow${column}`];
      } else if (cellValue > 0) {
        updatedContentLeft[row][`tableRow${column}`] = `+${cellValue.toFixed(
          2
        )}`;
      } else {
        updatedContentLeft[row][`tableRow${column}`] = cellValue.toFixed(2);
      }
    }

    setIsFilled(true);
    if (updatedContentLeft[4].tableRow2) {
      const sum =
        parseFloat(updatedContentLeft[1].tableRow2) +
        parseFloat(updatedContentLeft[4].tableRow2);

      if (!isNaN(sum)) {
        const formattedSum = sum > 0 ? `+${sum.toFixed(2)}` : sum.toFixed(2);
        const intermVal = sum - 0.75;
        updatedContentLeft[1].tableRow3 =
          intermVal > 0 ? `+${intermVal.toFixed(2)}` : intermVal.toFixed(2);
        updatedContentLeft[1].tableRow4 = formattedSum;
      } else {
        updatedContentLeft[1].tableRow3 = "";
        updatedContentLeft[1].tableRow4 = "";
      }

      updatedContentLeft[2].tableRow4 = updatedContentLeft[2].tableRow3 =
        updatedContentLeft[2].tableRow2;
      updatedContentLeft[3].tableRow4 = updatedContentLeft[3].tableRow3 =
        updatedContentLeft[3].tableRow2;

      setAutoFilled((prev) => ({ ...prev, left: true }));
    }
    if (!isFilled) {
      if (row === 4 || row === 5 || row === 6) {
        updatedContentLeft[row][`tableRow${column}`] =
          updatedContentRight[row][`tableRow${column}`];
      }
    }

    setClientTableContent(updatedContentLeft);
  };

  const handleInputChangeForTableRight = (event, row, column) => {
    const newContentRight = [...clientTableContentRight];
    newContentRight[row - 1][`tableRow${column}`] = event.target.value;
    setClientTableContentRight(newContentRight);
  };

  const handleBlurRight = (row, column) => {
    const updatedContentRight = [...clientTableContentRight];
    const cellValue = parseFloat(updatedContentRight[row][`tableRow${column}`]);

    if (!isNaN(cellValue)) {
      if (row === 3 || row === 5 || row === 6 || row === 7) {
        updatedContentRight[row][`tableRow${column}`] = cellValue;
      } else if (row === 9) {
        updatedContentRight[row][`tableRow${column}`] =
          updatedContentRight[row][`tableRow${column}`];
      } else if (cellValue > 0) {
        updatedContentRight[row][`tableRow${column}`] = `+${cellValue.toFixed(
          2
        )}`;
      } else {
        updatedContentRight[row][`tableRow${column}`] = cellValue.toFixed(2);
      }
    }

    if (updatedContentRight[4].tableRow2 && !autoFilled.right) {
      const sum =
        parseFloat(updatedContentRight[1].tableRow2) +
        parseFloat(updatedContentRight[4].tableRow2);

      if (!isNaN(sum)) {
        const formattedSum = sum > 0 ? `+${sum.toFixed(2)}` : sum.toFixed(2);
        const intermVal = sum - 0.75;
        updatedContentRight[1].tableRow3 =
          intermVal > 0 ? `+${intermVal.toFixed(2)}` : intermVal.toFixed(2);
        updatedContentRight[1].tableRow4 = formattedSum;
      } else {
        updatedContentRight[1].tableRow3 = "";
        updatedContentRight[1].tableRow4 = "";
      }

      updatedContentRight[2].tableRow4 = updatedContentRight[2].tableRow3 =
        updatedContentRight[2].tableRow2;
      updatedContentRight[3].tableRow4 = updatedContentRight[3].tableRow3 =
        updatedContentRight[3].tableRow2;

      setAutoFilled((prev) => ({ ...prev, right: true }));
    }

    if (row === 4 || row === 5 || row === 6) {
      clientTableContent[row][`tableRow${column}`] =
        clientTableContentRight[row][`tableRow${column}`];
    }

    setClientTableContentRight(updatedContentRight);
  };

  const updateItemQuantity = async (itemName, categoryId, itemCode) => {
    const itemCollection = collection(db, "items");
    const q = query(
      itemCollection,
      where("itemName", "==", itemName),
      where("categoryId", "==", categoryId),
      where("itemCode", "==", itemCode)
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

  function findFrameNear(frame) {
    setFrameInput({
      ...frameInput,
      frameNameNear: frame,
    });

    const frameCategory = categories?.find((category) =>
      category.name.toLowerCase().includes("frame")
    );

    const sunCategory = categories?.find((category) =>
      category.name.toLowerCase().includes("sun")
    );

    if (!frameCategory) {
      return;
    }
    const updatedItems =
      items?.filter((item) => item.categoryId === frameCategory?.id) || [];

    const sunglasses =
      items?.filter((item) => item.categoryId === sunCategory?.id) || [];

    const allItems = [...updatedItems, ...sunglasses];
    if (!frame) {
      setDropdownState({
        ...dropdownState,
        frameDropdownNear: false,
        frameDropdownContentNear: allItems,
      });
      return;
    }

    const foundItems = allItems.filter((item) =>
      item.itemName.toLowerCase().includes(frame.toLowerCase().trim())
    );

    setDropdownState({
      ...dropdownState,
      frameDropdownNear: true,
      frameDropdownContentNear: foundItems,
    });
  }

  function findFrame(frame) {
    setFrameInput({
      ...frameInput,
      frameName: frame,
    });

    const frameCategory = categories?.find((category) =>
      category.name.toLowerCase().includes("frame")
    );

    const sunCategory = categories?.find((category) =>
      category.name.toLowerCase().includes("sun")
    );

    if (!frameCategory) {
      return;
    }
    const updatedItems =
      items?.filter((item) => item.categoryId === frameCategory?.id) || [];

    const sunglasses =
      items?.filter((item) => item.categoryId === sunCategory?.id) || [];

    const allItems = [...updatedItems, ...sunglasses];

    if (!frame) {
      setDropdownState({
        ...dropdownState,
        frameDropdown: false,
        frameDropdownContent: allItems,
      });
      return;
    }

    const foundItems = allItems.filter((item) =>
      item.itemName.toLowerCase().includes(frame.toLowerCase().trim())
    );

    setDropdownState({
      ...dropdownState,
      frameDropdown: true,
      frameDropdownContent: foundItems,
    });
  }

  function pickFrame(frame) {
    setFrameInput({
      ...frameInput,
      frameName: frame.itemName,
      framePrice: frame.itemPrice,
      categoryId: frame.categoryId,
      itemCode: frame.itemCode,
    });

    setDropdownState({
      frameDropdown: false,
      frameDropdownContent: items,
    });
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && dropdownState.frameDropdownContent.length > 0) {
      pickFrame(dropdownState.frameDropdownContent[0]);
    }
  };

  function handleKeyDownLeftLenses(e) {
    if (
      e.key === "Enter" &&
      dropdownState.lensesLeftDropdownContent.length > 0
    ) {
      pickLeftLense(dropdownState.lensesLeftDropdownContent[0]);
    }
  }

  function handleKeyDownLeftLensesNear(e) {
    if (
      e.key === "Enter" &&
      dropdownState.lensesLeftDropdownContentNear.length > 0
    ) {
      pickLeftLenseNear(dropdownState.lensesLeftDropdownContentNear[0]);
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

  function handleKeyDownRightLensesNear(e) {
    if (
      e.key === "Enter" &&
      dropdownState.lensesRightDropdownContentNear.length > 0
    ) {
      pickLenseNear(dropdownState.lensesRightDropdownContentNear[0]);
    }
  }

  function pickFrameNear(frame) {
    setFrameInput({
      ...frameInput,
      frameNameNear: frame.itemName,
      framePriceNear: frame.itemPrice,
      categoryIdNear: frame.categoryId,
      itemCodeNear: frame.itemCode,
    });

    setDropdownState({
      frameDropdownNear: false,
      frameDropdownContentNear: items,
    });
  }

  const handleKeyDownNear = (e) => {
    if (
      e.key === "Enter" &&
      dropdownState.frameDropdownContentNear.length > 0
    ) {
      pickFrameNear(dropdownState.frameDropdownContentNear[0]);
    }
  };

  function findLeftLenses(lense) {
    setLenseInput({
      ...lenseInput,
      lenseLeftName: lense,
    });

    const lenseCategory = categories?.find((category) =>
      category.name.toLowerCase().includes("glass")
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

  function findLeftLensesNear(lense) {
    setLenseInput({
      ...lenseInput,
      lenseLeftNameNear: lense,
    });

    const lenseCategory = categories?.find((category) =>
      category.name.toLowerCase().includes("glass")
    );

    if (!lenseCategory) {
      return;
    }

    const updatedItems =
      items?.filter((item) => item.categoryId === lenseCategory?.id) || [];

    if (!lense) {
      setDropdownState({
        ...dropdownState,
        lensesLeftDropdownNear: false,
        lensesLeftDropdownContentNear: updatedItems,
      });
      return;
    }

    const foundItems = updatedItems.filter((item) =>
      item.itemName.toLowerCase().includes(lense.toLowerCase().trim())
    );

    setDropdownState({
      ...dropdownState,
      lensesLeftDropdownNear: true,
      lensesLeftDropdownContentNear: foundItems,
    });
  }

  function pickLeftLense(item) {
    setLenseInput({
      ...lenseInput,
      lenseLeftName: item.itemName,
      lenseLeftPrice: item.itemPrice,
      categoryIdLeft: item.categoryId,
      itemCodeLeft: item.itemCode,
    });

    setDropdownState({
      lensesLeftDropdown: false,
      lensesLeftDropdownContent: items,
    });
  }

  function pickLeftLenseNear(item) {
    setLenseInput({
      ...lenseInput,
      lenseLeftNameNear: item.itemName,
      lenseLeftPriceNear: item.itemPrice,
      categoryIdLeftNear: item.categoryId,
      itemCodeLeftNear: item.itemCode,
    });

    setDropdownState({
      lensesLeftDropdownNear: false,
      lensesLeftDropdownContentNear: items,
    });
  }

  function findRightLenses(lense) {
    setLenseInput({
      ...lenseInput,
      lenseRightName: lense,
    });

    const lenseCategory = categories?.find((category) =>
      category.name.toLowerCase().includes("glass")
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

  function findRightLensesNear(lense) {
    setLenseInput({
      ...lenseInput,
      lenseRightNameNear: lense,
    });

    const lenseCategory = categories?.find((category) =>
      category.name.toLowerCase().includes("glass")
    );

    if (!lenseCategory) {
      return;
    }
    const updatedItems =
      items?.filter((item) => item.categoryId === lenseCategory?.id) || [];

    if (!lense) {
      setDropdownState({
        ...dropdownState,
        lensesRightDropdownNear: false,
        lensesRightDropdownContentNear: updatedItems,
      });
      return;
    }

    const foundItems = updatedItems.filter((item) =>
      item.itemName.toLowerCase().includes(lense.toLowerCase().trim())
    );

    setDropdownState({
      ...dropdownState,
      lensesRightDropdownNear: true,
      lensesRightDropdownContentNear: foundItems,
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
      itemCodeRight: item.itemCode,
      itemCodeLeft: item.itemCode,
    });

    setDropdownState({
      lensesRightDropdown: false,
      lensesRightDropdownContent: items,
    });
  }

  function pickLenseNear(item) {
    setLenseInput({
      ...lenseInput,
      lenseRightNameNear: item.itemName,
      lenseLeftNameNear: item.itemName,
      lenseRightPriceNear: item.itemPrice,
      lenseLeftPriceNear: item.itemPrice,
      categoryIdRightNear: item.categoryId,
      categoryIdLeftNear: item.categoryId,
      itemCodeRightNear: item.itemCode,
      itemCodeLeftNear: item.itemCode,
    });

    setDropdownState({
      lensesRightDropdownNear: false,
      lensesRightDropdownContentNear: items,
    });
  }

  async function submitGlasses() {
    setLoading(true);
    try {
      const orderNumber = await fetchOrderNumber();
      const userUid = forAddCustomer ? randomString(20) : clickedUser.uid;

      if (checkIfTablesAreClear() && areItemsPresent()) {
        await saveClientInfo(userUid, orderNumber);
        await updateItemsQuantity();
        setFrameInput({
          ...frameInput,
          frameName: "",
          frameNameNear: "",
        });
        setPayment("");
        setAmountPaid(0);
        return;
      }

      if (!checkIfTablesAreClear() && areItemsPresent()) {
        await saveClientInfo(userUid, orderNumber);
        await updateItemsQuantity();

        const clientTable = collection(
          db,
          "clientEyeTableInfo",
          userUid,
          "prescriptionInfo"
        );

        await addDoc(clientTable, generateTablePayload(userUid, orderNumber));

        await updateOrderNumber(orderNumber);
      }

      resetInputs();
      clearTableInputs();

      if (!forAddCustomer) {
        setOpen(false);
      }

      toast.success("Glasses table added");
    } catch (error) {
      toast.error("Error adding document: " + error.message);
    }
    setLoading(false);
  }

  async function handleCityAndUserCreation(userUid) {
    const cities = collection(db, "cities");
    const qCities = query(cities, where("city", "==", customerInput.city));
    const city = await getDocs(qCities);

    if (city.empty) {
      await addDoc(cities, { city: customerInput.city });
    }

    const date = convertToUnixTime(startDate.toString().slice(0, 33));

    if (!customerInput.name) {
      toast.error("The name is empty.");
      return;
    }

    const api = "/api/users/addUsers";
    await fetch(
      `${api}?name=${customerInput.name}&email=${customerInput.email}&number=${customerInput.number}&uid=${userUid}&dateOfBirth=${date}&address=${customerInput.address}&city=${customerInput.city}&gender=${gender}`
    );

    setCustomerInput({ name: "", email: "", number: "", city: "" });
    setGender("");
  }

  async function updateItemsQuantity() {
    const items = [
      {
        name: frameInput.frameName,
        category: frameInput.categoryId,
        code: frameInput.itemCode,
      },
      {
        name: frameInput.frameNameNear,
        category: frameInput.categoryIdNear,
        code: frameInput.itemCodeNear,
      },
      {
        name: lenseInput.lenseLeftName,
        category: lenseInput.categoryIdLeft,
        code: lenseInput.itemCodeLeft,
      },
      {
        name: lenseInput.lenseLeftNameNear,
        category: lenseInput.categoryIdLeftNear,
        code: lenseInput.itemCodeLeftNear,
      },
      {
        name: lenseInput.lenseRightName,
        category: lenseInput.categoryIdRight,
        code: lenseInput.itemCodeRight,
      },
      {
        name: lenseInput.lenseRightNameNear,
        category: lenseInput.categoryIdRightNear,
        code: lenseInput.itemCodeRightNear,
      },
    ];

    for (const item of items) {
      if (item.name) {
        await updateItemQuantity(item.name, item.category, item.code);
      }
    }
  }

  async function fetchOrderNumber() {
    const orderNumRef = collection(db, "orderNum");
    const orderNumSnapshot = await getDocs(orderNumRef);
    const orderNumDoc = orderNumSnapshot.docs[0];
    return orderNumDoc.data().orderNumber;
  }

  function generateTablePayload(userUid, orderNumber) {
    return {
      clientTableContentLeft: clientTableContent,
      clientTableContentRight: clientTableContentRight,
      dateOfPrescription: Date.now(),
      leftLense: lenseInput.lenseLeftName,
      rightLense: lenseInput.lenseRightName,
      leftLensePrice: lenseInput.lenseLeftPrice,
      rightLensePrice: lenseInput.lenseRightPrice,
      leftLenseNear: lenseInput.lenseLeftNameNear,
      rightLenseNear: lenseInput.lenseRightNameNear,
      leftLensePriceNear: lenseInput.lenseLeftPriceNear,
      rightLensePriceNear: lenseInput.lenseRightPriceNear,
      frame: frameInput.frameName,
      framePrice: frameInput.framePrice,
      frameNear: frameInput.frameNameNear,
      framePriceNear: frameInput.framePriceNear,
      categoryId: frameInput.categoryId,
      categoryIdNear: frameInput.categoryIdNear,
      categoryIdRight: lenseInput.categoryIdRight,
      categoryIdLeft: lenseInput.categoryIdLeft,
      categoryIdRightNear: lenseInput.categoryIdRightNear,
      categoryIdLeftNear: lenseInput.categoryIdLeftNear,
      itemCode: frameInput.itemCode,
      itemCodeNear: frameInput.itemCodeNear,
      itemCodeRight: lenseInput.itemCodeRight,
      itemCodeLeft: lenseInput.itemCodeLeft,
      itemCodeRightNear: lenseInput.itemCodeRightNear,
      itemCodeLeftNear: lenseInput.itemCodeLeftNear,
      orderNumber: orderNumber,
      amountPaid: amountPaid === 0 ? "paid" : amountPaid,
      paymentMethod: payment,
      tablesId: randomString(20),
      userId: userUid,
    };
  }

  async function updateOrderNumber(orderNumber) {
    const orderNumRef = collection(db, "orderNum");
    const orderNumSnapshot = await getDocs(orderNumRef);
    const orderNumDoc = orderNumSnapshot.docs[0];

    await updateDoc(orderNumDoc.ref, {
      orderNumber: parseFloat(orderNumber) + 1,
    });
  }

  function resetInputs() {
    setLenseInput({
      lenseRightName: "",
      lenseRightPrice: 0,
      lenseLeftName: "",
      lenseLeftPrice: 0,
      lenseLeftNameNear: "",
      lenseLeftPriceNear: 0,
      lenseRightNameNear: "",
      lenseRightPriceNear: 0,
    });

    setFrameInput({
      frameName: "",
      framePrice: 0,
      frameNameNear: "",
      framePriceNear: 0,
    });
  }

  function clearTableInputs() {
    for (let i = 1; i < clientTableContentRight.length; i++) {
      for (let j = 2; j <= 4; j++) {
        const key = `tableRow${j}`;
        initialClientTableContent[i][key] = "";
        initialClientTableContentRight[i][key] = "";
      }
    }
    setAutoFilled((prev) => ({ ...prev, right: false, left: false }));

    setFrameInput({
      frameName: "",
      frameNameNear: "",
      framePrice: 0,
      framePriceNear: 0,
      categoryId: "",
      categoryIdNear: "",
      itemCode: "",
      itemCodeNear: "",
    });

    setLenseInput({
      lenseRightName: "",
      lenseRightPrice: 0,
      lenseLeftName: "",
      lenseLeftPrice: 0,
      lenseLeftNameNear: "",
      lenseLeftPriceNear: 0,
      lenseRightNameNear: "",
      lenseRightPriceNear: 0,
      itemCodeRight: "",
      itemCodeLeft: "",
      itemCodeRightNear: "",
      itemCodeLeftNear: "",
      categoryIdRight: "",
      categoryIdLeft: "",
      categoryIdRightNear: "",
      categoryIdLeftNear: "",
    });
    if (forAddCustomer) {
      setCustomerInput({ name: "", email: "", number: "", city: "" });
      setStartDate("");
    }
  }

  function checkIfTablesAreClear() {
    let isClear = true;
    for (let i = 1; i < clientTableContentRight.length; i++) {
      for (let j = 2; j <= 4; j++) {
        const key = `tableRow${j}`;
        if (
          clientTableContent[i][key] !== "" ||
          clientTableContentRight[i][key] !== ""
        ) {
          isClear = false;
        }
      }
    }
    return isClear;
  }

  function areItemsPresent() {
    return (
      frameInput.frameName ||
      frameInput.frameNameNear ||
      lenseInput.lenseLeftName ||
      lenseInput.lenseRightName ||
      lenseInput.lenseLeftNameNear ||
      lenseInput.lenseRightNameNear
    );
  }

  async function saveClientInfo(userUid, orderNumber) {
    const itemsAdded = [
      findItemByName(frameInput.frameName),
      findItemByName(frameInput.frameNameNear),
      findItemByName(lenseInput.lenseRightName),
      findItemByName(lenseInput.lenseRightNameNear),
      findItemByName(lenseInput.lenseLeftName),
      findItemByName(lenseInput.lenseLeftNameNear),
    ].filter(Boolean);

    const itemsId = itemsAdded.map((item) => item);
    if (forAddCustomer) {
      handleCityAndUserCreation(userUid);
      await addOrder(userUid, itemsId, orderNumber);
      toast.success("Your order has been placed!");
    }
  }

  function findItemByName(itemName) {
    if (!itemName || itemName.trim() === "") {
      return null;
    }
    return items.find((item) => item.itemName === itemName);
  }

  async function addOrder(userId, itemsId, orderNumber) {
    const orderApi = "/api/orders/addOrders";
    if (forAddCustomer) {
      const cities = collection(db, "cities");

      const citySnapshot = await getDocs(cities);
      let isCityFound = false;

      citySnapshot.forEach((doc) => {
        if (
          customerInput.city.toLowerCase() === doc.data().city.toLowerCase() ||
          customerInput.city.toLowerCase() === ""
        ) {
          isCityFound = true;
        }
      });

      if (!isCityFound) {
        await addDoc(cities, { city: customerInput.city });
      }
    }

    if (amountPaid === 0) {
      setAmountPaid("paid");
    }

    if (amountPaid === "") {
      setAmountPaid("paid");
    }

    if (forAddCustomer) {
      await fetch(
        `${orderApi}?name=${customerInput.name}
      &city=${customerInput.city}&number=${customerInput.number}&email=${
          customerInput.email
        }&itemSelectedId=${encodeURIComponent(
          JSON.stringify(itemsId)
        )}&clientOrderId=${randomString(
          20
        )}&userId=${userId}&amountPaid=${amountPaid}&payment=${payment}&orderNumber=${orderNumber}`
      );
    } else {
      await fetch(
        `${orderApi}?name=${clickedUser.name}
      &city=${clickedUser.city}&number=${clickedUser.number}&email=${
          clickedUser.email
        }&itemSelectedId=${encodeURIComponent(
          JSON.stringify(itemsId)
        )}&clientOrderId=${randomString(
          20
        )}&userId=${userId}&amountPaid=${amountPaid}&payment=${payment}&orderNumber=${orderNumber}`
      );
    }
  }

  function fillTableToEditInputs() {
    let tableGlassesRight;
    let tableGlassesLeft;
    if (tableContent) {
      setFrameInput({
        ...frameInput,
        frameName: tableContent.frame,
        framePrice: tableContent.framePrice,
        frameNameNear: tableContent.frameNear,
        framePriceNear: tableContent.framePriceNear,
        categoryId: tableContent.categoryId,
        categoryIdNear: tableContent.categoryIdNear,
        itemCode: tableContent.itemCode,
        itemCodeNear: tableContent.itemCodeNear,
      });

      setLenseInput({
        ...lenseInput,
        lenseRightName: tableContent.rightLense,
        lenseRightPrice: tableContent.rightLensePrice,
        lenseLeftName: tableContent.leftLense,
        lenseLeftPrice: tableContent.leftLensePrice,
        lenseLeftNameNear: tableContent.leftLenseNear,
        lenseLeftPriceNear: tableContent.leftLensePriceNear,
        lenseRightNameNear: tableContent.rightLenseNear,
        lenseRightPriceNear: tableContent.rightLensePriceNear,
        categoryIdLeft: tableContent.categoryIdLeft,
        categoryIdRight: tableContent.categoryIdRight,
        categoryIdLeftNear: tableContent.categoryIdLeftNear,
        categoryIdRightNear: tableContent.categoryIdRightNear,
        itemCodeLeft: tableContent.itemCodeLeft,
        itemCodeRight: tableContent.itemCodeRight,
        itemCodeLeftNear: tableContent.itemCodeLeftNear,
        itemCodeRightNear: tableContent.itemCodeRightNear,
      });

      tableGlassesLeft = tableContent.clientTableContentLeft;
      tableGlassesRight = tableContent.clientTableContentRight;

      autoFillUserTables(tableGlassesLeft, tableGlassesRight);
    } else {
      clearTableInputs();
    }
  }

  async function fillTableInputs() {
    if (!clickedUser) {
      return;
    }
    let tableGlassesRight;
    let tableGlassesLeft;

    const table = collection(
      db,
      "clientEyeTableInfo",
      clickedUser.uid,
      "prescriptionInfo"
    );

    const q = query(table, orderBy("dateOfPrescription", "desc"));
    const data = await getDocs(q);

    if (!data.empty) {
      setFrameInput({
        frameName: data.docs[0].data().frame,
        framePrice: data.docs[0].data().framePrice,
        frameNameNear: data.docs[0].data().frameNear,
        framePriceNear: data.docs[0].data().framePriceNear,
        categoryId: data.docs[0].data().categoryId,
        categoryIdNear: data.docs[0].data().categoryIdNear,
        itemCode: data.docs[0].data().itemCode,
        itemCodeNear: data.docs[0].data().itemCodeNear,
      });

      setLenseInput({
        lenseRightName: data.docs[0].data().rightLense,
        lenseRightPrice: data.docs[0].data().rightLensePrice,
        lenseLeftName: data.docs[0].data().leftLense,
        lenseLeftPrice: data.docs[0].data().leftLensePrice,
        lenseLeftNameNear: data.docs[0].data().leftLenseNear,
        lenseLeftPriceNear: data.docs[0].data().leftLensePriceNear,
        lenseRightNameNear: data.docs[0].data().rightLenseNear,
        lenseRightPriceNear: data.docs[0].data().rightLensePriceNear,
        categoryIdLeft: data.docs[0].data().categoryIdLeft,
        categoryIdRight: data.docs[0].data().categoryIdRight,
        categoryIdLeftNear: data.docs[0].data().categoryIdLeftNear,
        categoryIdRightNear: data.docs[0].data().categoryIdRightNear,
        itemCodeLeft: data.docs[0].data().itemCodeLeft,
        itemCodeRight: data.docs[0].data().itemCodeRight,
        itemCodeLeftNear: data.docs[0].data().itemCodeLeftNear,
        itemCodeRightNear: data.docs[0].data().itemCodeRightNear,
      });

      data.docs.forEach((doc) => {
        tableGlassesLeft = doc.data().clientTableContentLeft;
        tableGlassesRight = doc.data().clientTableContentRight;
        autoFillUserTables(tableGlassesLeft, tableGlassesRight);
      });
    } else {
      clearTableInputs();
    }
  }

  async function confirmTableEdit() {
    setLoading(true);
    const tableRef = collection(
      db,
      "clientEyeTableInfo",
      clickedUser.uid,
      "prescriptionInfo"
    );

    const q = query(tableRef, where("tablesId", "==", tableContent.tablesId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;

      await updateDoc(docRef, {
        amountPaid: amountPaid,
        categoryId: frameInput.categoryId,
        categoryIdLeft: lenseInput.categoryIdLeft,
        categoryIdLeftNear: lenseInput.categoryIdLeftNear,
        categoryIdNear: frameInput.categoryIdNear,
        categoryIdRight: lenseInput.categoryIdRight,
        categoryIdRightNear: lenseInput.categoryIdRightNear,
        clientTableContentLeft: clientTableContent,
        clientTableContentRight: clientTableContentRight,
        dateOfPrescription: tableContent.dateOfPrescription,
        frame: frameInput.frameName,
        frameNear: frameInput.frameNameNear,
        framePrice: frameInput.framePrice,
        framePriceNear: frameInput.framePriceNear,
        itemCode: frameInput.itemCode,
        itemCodeLeft: lenseInput.itemCodeLeft,
        itemCodeLeftNear: lenseInput.itemCodeLeftNear,
        itemCodeNear: frameInput.itemCodeNear,
        itemCodeRight: lenseInput.itemCodeRight,
        itemCodeRightNear: lenseInput.itemCodeRightNear,
        leftLense: lenseInput.lenseLeftName,
        leftLenseNear: lenseInput.lenseLeftNameNear,
        leftLensePrice: lenseInput.lenseLeftPrice,
        leftLensePriceNear: lenseInput.lenseLeftPriceNear,
        paymentMethod: payment || "unknown",
        rightLense: lenseInput.lenseRightName,
        rightLenseNear: lenseInput.lenseRightNameNear,
        rightLensePrice: lenseInput.lenseRightPrice,
        rightLensePriceNear: lenseInput.lenseRightPriceNear,
        tablesId: tableContent.tablesId,
      });

      toast.success("Table updated successfully");
      handleTableEditorClose();
      setOpen(false);
    } else {
      toast.error("No matching table found to update.");
    }
    setLoading(false);
  }

  const autoFillUserTables = (tableGlassesLeft, tableGlassesRight) => {
    setClientTableContent(tableGlassesLeft);

    setClientTableContentRight(tableGlassesRight);

    if (tableContent) {
      setPayment(tableContent.paymentMethod);

      setAmountPaid(tableContent.amountPaid);
    }

    setAutoFilled((prev) => ({ ...prev, right: false, left: false }));
  };

  async function completeAmountPaid() {
    setLoading(true);
    try {
      const tableRef = doc(
        db,
        "clientEyeTableInfo",
        clickedUser.uid,
        "prescriptionInfo",
        tableContent.id
      );
      await updateDoc(tableRef, { amountPaid: "paid" });
      toast.success("Completed Payment!");
      handleTableEditorClose();
      setOpen(false);
    } catch (error) {
      toast.error("Error updating AmountPaid:", error);
    }
    setLoading(false);
  }

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

  const handleClickOutsideFrame = (event) => {
    if (
      inputRefFrame.current &&
      !inputRefFrame.current.contains(event.target) &&
      dropdownRefFrame.current &&
      !dropdownRefFrame.current.contains(event.target)
    ) {
      setDropdownState({
        ...dropdownState,
        frameDropdown: false,
      });
    }
  };

  const handleClickOutsideRightNear = (event) => {
    if (
      inputRefRightNear.current &&
      !inputRefRightNear.current.contains(event.target) &&
      dropdownRefRightNear.current &&
      !dropdownRefRightNear.current.contains(event.target)
    ) {
      setDropdownState({
        ...dropdownState,
        lensesRightDropdownNear: false,
      });
    }
  };

  const handleClickOutsideLeftNear = (event) => {
    if (
      inputRefLeftNear.current &&
      !inputRefLeftNear.current.contains(event.target) &&
      dropdownRefLeftNear.current &&
      !dropdownRefLeftNear.current.contains(event.target)
    ) {
      setDropdownState({
        ...dropdownState,
        lensesLeftDropdownNear: false,
      });
    }
  };

  const handleClickOutsideFrameNear = (event) => {
    if (
      inputRefFrameNear.current &&
      !inputRefFrameNear.current.contains(event.target) &&
      dropdownRefFrameNear.current &&
      !dropdownRefFrameNear.current.contains(event.target)
    ) {
      setDropdownState({
        ...dropdownState,
        frameDropdownNear: false,
      });
    }
  };

  useEffect(() => {
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

    if (dropdownState.frameDropdown) {
      document.addEventListener("click", handleClickOutsideFrame);
    } else {
      document.removeEventListener("click", handleClickOutsideFrame);
    }

    if (dropdownState.lensesRightDropdownNear) {
      document.addEventListener("click", handleClickOutsideRightNear);
    } else {
      document.removeEventListener("click", handleClickOutsideRightNear);
    }

    if (dropdownState.lensesLeftDropdownNear) {
      document.addEventListener("click", handleClickOutsideLeftNear);
    } else {
      document.removeEventListener("click", handleClickOutsideLeftNear);
    }

    if (dropdownState.frameDropdownNear) {
      document.addEventListener("click", handleClickOutsideFrameNear);
    } else {
      document.removeEventListener("click", handleClickOutsideFrameNear);
    }

    return () => {
      document.removeEventListener("click", handleClickOutsideRight);
      document.removeEventListener("click", handleClickOutsideLeft);
      document.removeEventListener("click", handleClickOutsideFrame);
      document.removeEventListener("click", handleClickOutsideRightNear);
      document.removeEventListener("click", handleClickOutsideLeftNear);
      document.removeEventListener("click", handleClickOutsideFrameNear);
    };
  }, [
    dropdownState.lensesRightDropdown,
    dropdownState.lensesRightDropdownNear,
    dropdownState.lensesLeftDropdownNear,
    dropdownState.lensesLeftDropdown,
    dropdownState.frameDropdownNear,
    dropdownState.frameDropdown,
  ]);

  async function getAllItems() {
    const lenseCategory = categories.find((category) =>
      category.name.toLowerCase().includes("glass")
    );

    const sunCategory = categories.find((category) =>
      category.name.toLowerCase().includes("sun")
    );

    const frameCategory = categories.find((category) =>
      category.name.toLowerCase().includes("frame")
    );

    const updatedItems = items.filter(
      (item) => item.categoryId === lenseCategory?.id
    );

    const sunItems = items.filter(
      (item) => item.categoryId === sunCategory?.id
    );

    const updatedFrames = items.filter(
      (item) => item.categoryId === frameCategory?.id
    );

    setAllItems(updatedItems);
    setAllFrames([...updatedFrames, ...sunItems]);
    setDropdownState((prevState) => ({
      ...prevState,
      lensesLeftDropdownContent: updatedItems,
      lensesLeftDropdownContentNear: updatedItems,
      lensesRightDropdownContent: updatedItems,
      lensesRightDropdownContentNear: updatedItems,
      frameDropdownContent: updatedFrames,
      frameDropdownContentNear: updatedFrames,
    }));
  }

  React.useEffect(() => {
    getAllItems();
  }, [items]);

  React.useEffect(() => {
    if (!tableContent) {
      fillTableInputs();
    }
  }, [tableContent, clickedUser]);

  React.useEffect(() => {
    fillTableToEditInputs();
  }, [tableContent, clickedUser]);

  React.useEffect(() => {
    if (!tableContent) {
      clearTableInputs();
    }
  }, []);

  return (
    <div className={styles.tableComponentContainer}>
      <Toaster />
      <button
        className={styles.clearTableButton}
        onClick={() => clearTableInputs()}
      >
        Clear Table
      </button>
      <div className={styles.tableContainer}>
        <div className={styles.tableInputWrapper}>
          {clientTableContentRight.map((content, rowIndex) => (
            <div className={styles.tableRow} key={rowIndex}>
              <p className={styles.tableRowContent}>{content.tableRow1}</p>
              {content.tableRow2 === "Far" ? (
                <p className={styles.tableRowContent}>{content.tableRow2}</p>
              ) : (
                <input
                  className={styles.tableRowInputContent}
                  value={content.tableRow2}
                  onChange={(e) => {
                    handleInputChangeForTableRight(e, rowIndex + 1, 2);
                  }}
                  onBlur={() => handleBlurRight(rowIndex, 2)}
                />
              )}
              {content.tableRow3 === "Interm" ? (
                <p className={styles.tableRowContent}>{content.tableRow3}</p>
              ) : (
                <input
                  className={styles.tableRowInputContent}
                  value={content.tableRow3}
                  onChange={(e) => {
                    handleInputChangeForTableRight(e, rowIndex + 1, 3);
                  }}
                  onBlur={() => handleBlurRight(rowIndex, 3)}
                />
              )}
              {content.tableRow4 === "Near" ? (
                <p className={styles.tableRowContent}>{content.tableRow4}</p>
              ) : (
                <input
                  className={styles.tableRowInputContent}
                  value={content.tableRow4}
                  onChange={(e) => {
                    handleInputChangeForTableRight(e, rowIndex + 1, 4);
                  }}
                  onBlur={() => handleBlurRight(rowIndex, 4)}
                />
              )}
            </div>
          ))}
        </div>
        <div className={styles.tableInputWrapper}>
          {clientTableContent.map((content, rowIndex) => (
            <div className={styles.tableRow} key={rowIndex}>
              <p className={styles.tableRowContent}>{content.tableRow1}</p>
              {content.tableRow2 === "Far" ? (
                <p className={styles.tableRowContent}>{content.tableRow2}</p>
              ) : (
                <input
                  className={styles.tableRowInputContent}
                  value={content.tableRow2}
                  onChange={(e) => {
                    handleInputChange(e, rowIndex + 1, 2);
                  }}
                  onBlur={() => handleBlurLeft(rowIndex, 2)}
                />
              )}
              {content.tableRow3 === "Interm" ? (
                <p className={styles.tableRowContent}>{content.tableRow3}</p>
              ) : (
                <input
                  className={styles.tableRowInputContent}
                  value={content.tableRow3}
                  onChange={(e) => {
                    handleInputChange(e, rowIndex + 1, 3);
                  }}
                  onBlur={() => handleBlurLeft(rowIndex, 3)}
                />
              )}
              {content.tableRow4 === "Near" ? (
                <p className={styles.tableRowContent}>{content.tableRow4}</p>
              ) : (
                <input
                  className={styles.tableRowInputContent}
                  value={content.tableRow4}
                  onChange={(e) => {
                    handleInputChange(e, rowIndex + 1, 4);
                  }}
                  onBlur={() => handleBlurLeft(rowIndex, 4)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.searchLenseContainer}>
        <h2 className={styles.far}>Far: </h2>
        <div className={styles.searchFrameWrapper}>
          <input
            ref={inputRefFrame}
            value={frameInput.frameName}
            type="text"
            className={styles.customerInputFrame}
            onChange={(e) => findFrame(e.target.value)}
            onFocus={() =>
              setDropdownState({
                ...dropdownState,
                frameDropdown: true,
                frameDropdownContent: allFrames,
              })
            }
            onKeyDown={handleKeyDown}
            placeholder="frame name far"
          />
          {dropdownState.frameDropdown && (
            <div
              className={styles.dropdownContainerFrame}
              ref={dropdownRefFrame}
            >
              {dropdownState.frameDropdownContent.map((item, i) => (
                <div className={styles.dropdownWrapper} key={i}>
                  <p
                    className={styles.dropdownContent}
                    onClick={() => pickFrame(item)}
                  >
                    {item.itemName +
                      " " +
                      item.itemCode +
                      " - $" +
                      item.itemPrice +
                      ", " +
                      item.itemQuantity}
                  </p>
                </div>
              ))}
            </div>
          )}
          <input
            type="text"
            value={frameInput.framePrice}
            placeholder="frame price far"
            className={styles.customerInputFramePrice}
            onChange={(e) =>
              setFrameInput({
                ...frameInput,
                framePrice: e.target.value,
              })
            }
          />
          <p style={{ width: "7%" }}>Price: ${frameInput.framePrice}</p>
        </div>
        <div className={styles.searchLenseWrapper}>
          <div className={styles.searchLense}>
            <input
              ref={inputRefRight}
              type="text"
              placeholder="right lens far"
              value={lenseInput.lenseRightName}
              className={styles.customerInputLense}
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
              <div className={styles.dropdownContainer} ref={dropdownRefRight}>
                {dropdownState.lensesRightDropdownContent.map((item, i) => (
                  <div className={styles.dropdownWrapper} key={i}>
                    <p
                      className={styles.dropdownContent}
                      onClick={() => pickLense(item)}
                    >
                      {item.itemName +
                        " " +
                        item.itemCode +
                        " - $" +
                        item.itemPrice +
                        ", " +
                        item.itemQuantity}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <input
              type="text"
              value={lenseInput.lenseRightPrice}
              placeholder="right lens far price"
              className={styles.customerInputLensePrice}
              onChange={(e) =>
                setLenseInput({
                  ...lenseInput,
                  lenseRightPrice: e.target.value,
                })
              }
            />
          </div>
          <div className={styles.searchLense}>
            <input
              ref={inputRefLeft}
              type="text"
              placeholder="left lens far"
              value={lenseInput.lenseLeftName}
              className={styles.customerInputLense}
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
              <div className={styles.dropdownContainer} ref={dropdownRefLeft}>
                {dropdownState.lensesLeftDropdownContent.map((item, i) => (
                  <div className={styles.dropdownWrapper} key={i}>
                    <p
                      className={styles.dropdownContent}
                      onClick={() => pickLeftLense(item)}
                    >
                      {item.itemName +
                        " " +
                        item.itemCode +
                        " - $" +
                        item.itemPrice +
                        ", " +
                        item.itemQuantity}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <input
              type="text"
              value={lenseInput.lenseLeftPrice}
              placeholder="left lens price far"
              className={styles.customerInputLensePrice}
              onChange={(e) =>
                setLenseInput({
                  ...lenseInput,
                  lenseLeftPrice: e.target.value,
                })
              }
            />
          </div>
          <p style={{ width: "7%" }}>
            Price:{" $"}
            {parseFloat(lenseInput.lenseLeftPrice) +
              parseFloat(lenseInput.lenseRightPrice)}
          </p>
        </div>
      </div>
      <div className={styles.searchLenseContainer}>
        <h2 className={styles.near}>Near: </h2>
        <div className={styles.searchFrameWrapper}>
          <input
            ref={inputRefFrameNear}
            value={frameInput.frameNameNear}
            type="text"
            className={styles.customerInputFrame}
            onChange={(e) => findFrameNear(e.target.value)}
            onFocus={() =>
              setDropdownState({
                ...dropdownState,
                frameDropdownNear: true,
                frameDropdownContentNear: allFrames,
              })
            }
            onKeyDown={handleKeyDownNear}
            placeholder="frame name near"
          />
          {dropdownState.frameDropdownNear && (
            <div
              className={styles.dropdownContainerFrameNear}
              ref={dropdownRefFrameNear}
            >
              {dropdownState.frameDropdownContentNear.map((item, i) => (
                <div className={styles.dropdownWrapper} key={i}>
                  <p
                    className={styles.dropdownContent}
                    onClick={() => pickFrameNear(item)}
                  >
                    {item.itemName +
                      " " +
                      item.itemCode +
                      "$" +
                      item.itemPrice +
                      ", " +
                      item.itemQuantity}
                  </p>
                </div>
              ))}
            </div>
          )}
          <input
            type="text"
            value={frameInput.framePriceNear}
            placeholder="frame price near"
            className={styles.customerInputFramePrice}
            onChange={(e) =>
              setFrameInput({
                ...frameInput,
                framePriceNear: e.target.value,
              })
            }
          />
          <p style={{ width: "7%" }}>Price: ${frameInput.framePriceNear}</p>
        </div>
        <div className={styles.searchLenseWrapper}>
          <div className={styles.searchLense}>
            <input
              ref={inputRefRightNear}
              type="text"
              placeholder="right lens near"
              value={lenseInput.lenseRightNameNear}
              className={styles.customerInputLense}
              onChange={(e) => findRightLensesNear(e.target.value)}
              onFocus={() =>
                setDropdownState({
                  ...dropdownState,
                  lensesRightDropdownNear: true,
                  lensesRightDropdownContentNear: allItems,
                })
              }
              onKeyDown={handleKeyDownRightLensesNear}
            />
            {dropdownState.lensesRightDropdownNear && (
              <div
                className={styles.dropdownContainerNear}
                ref={dropdownRefRightNear}
              >
                {dropdownState.lensesRightDropdownContentNear.map((item, i) => (
                  <div className={styles.dropdownWrapper} key={i}>
                    <p
                      className={styles.dropdownContent}
                      onClick={() => pickLenseNear(item)}
                    >
                      {item.itemName +
                        " " +
                        item.itemCode +
                        " - $" +
                        item.itemPrice +
                        ", " +
                        item.itemQuantity}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <input
              type="text"
              value={lenseInput.lenseRightPriceNear}
              placeholder="right lens price near"
              className={styles.customerInputLensePrice}
              onChange={(e) =>
                setLenseInput({
                  ...lenseInput,
                  lenseRightPriceNear: e.target.value,
                })
              }
            />
          </div>
          <div className={styles.searchLense}>
            <input
              ref={inputRefLeftNear}
              type="text"
              placeholder="left lens near"
              value={lenseInput.lenseLeftNameNear}
              className={styles.customerInputLense}
              onChange={(e) => findLeftLensesNear(e.target.value)}
              onFocus={() =>
                setDropdownState({
                  ...dropdownState,
                  lensesLeftDropdownNear: true,
                  lensesLeftDropdownContentNear: allItems,
                })
              }
              onKeyDown={handleKeyDownLeftLensesNear}
            />
            {dropdownState.lensesLeftDropdownNear && (
              <div
                className={styles.dropdownContainerNear}
                ref={dropdownRefLeftNear}
              >
                {dropdownState.lensesLeftDropdownContentNear.map((item, i) => (
                  <div className={styles.dropdownWrapper} key={i}>
                    <p
                      className={styles.dropdownContent}
                      onClick={() => pickLeftLenseNear(item)}
                    >
                      {item.itemName +
                        " " +
                        item.itemCode +
                        " - $" +
                        item.itemPrice +
                        ", " +
                        item.itemQuantity}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <input
              type="text"
              value={lenseInput.lenseLeftPriceNear}
              placeholder="left lens price near"
              className={styles.customerInputLensePrice}
              onChange={(e) =>
                setLenseInput({
                  ...lenseInput,
                  lenseLeftPriceNear: e.target.value,
                })
              }
            />
          </div>
          <p style={{ width: "7%" }}>
            Price:{" $"}
            {parseFloat(lenseInput.lenseLeftPriceNear) +
              parseFloat(lenseInput.lenseRightPriceNear)}
          </p>
        </div>
        <h3 style={{ textAlign: "end", marginRight: "12px" }}>
          Total:{" $"}
          {parseFloat(frameInput.framePrice) +
            parseFloat(frameInput.framePriceNear) +
            parseFloat(lenseInput.lenseLeftPrice) +
            parseFloat(lenseInput.lenseRightPrice) +
            parseFloat(lenseInput.lenseLeftPriceNear) +
            parseFloat(lenseInput.lenseRightPriceNear)}
        </h3>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
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
                  className={styles.submitGlassesButton}
                  onClick={() => confirmTableEdit()}
                >
                  Confirm Edit
                </button>
                <button
                  className={styles.completeButton}
                  onClick={() => completeAmountPaid()}
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
                className={styles.submitGlassesButton}
                onClick={() => submitGlasses()}
              >
                Submit to Glasses
              </button>
            ) : (
              <div className={styles.spinner}></div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
