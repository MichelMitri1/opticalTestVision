"use client";
import React, { useState } from "react";
import styles from "../order/clientOrdering.module.css";
import { randomString } from "@/helpers/utils";
import { db } from "@/helpers/firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import Nav from "@/components/Nav/Nav";
import { formatDate } from "@/helpers/utils";
import PaymentMethod from "@/components/PaymentMethod/PaymentMethod";

function page() {
  let sum = 0;
  const [dropdown, setDropdown] = useState(false);
  const [dropdownContent, setDropdownContent] = useState([]);
  const [numberDropdown, setNumberDropdown] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [numberDropdownContent, setNumberDropdownContent] = useState([]);
  const [cityDropdown, setCityDropdown] = useState(false);
  const [amountPaid, setAmountPaid] = useState(0);
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState("");
  const [cityDropdownContent, setCityDropdownContent] = useState([]);
  const [itemsAdded, setItemsAdded] = useState([]);
  const [clientInput, setClientInput] = useState({
    name: "",
    city: "",
    cell: "",
    email: "",
  });

  const cities = collection(db, "cities");

  const usersCollection = collection(db, "users");

  const handleClientInputChange = (field, value) => {
    setClientInput((prev) => ({ ...prev, [field]: value }));
  };

  const handleClientInputName = async (e) => {
    const name = e.target.value;
    handleClientInputChange("name", name);
    toggleDropdown(name, setDropdown);

    if (name) {
      const userNamesArray = await getUserNames();
      const customerNameSuggestionArray = filterArray(
        userNamesArray,
        "name",
        name
      );
      setDropdownContent(customerNameSuggestionArray);
    }
  };

  const handleClientInputCity = (e) => {
    const city = e.target.value;
    handleClientInputChange("city", city);

    if (city === "") {
      setCityDropdown(false);
      getAllCities();
    } else {
      toggleDropdown(city, setCityDropdown);
      setCityDropdownContent(filterArray(cityDropdownContent, "city", city));
    }
  };

  const handleClientInputNumber = async (e) => {
    const number = e.target.value;
    handleClientInputChange("cell", number);
    toggleDropdown(number, setNumberDropdown);

    if (number) {
      const userNumbersArray = await getUserNumbers();
      const customerNumberSuggestionArray = filterArray(
        userNumbersArray,
        "number",
        number
      );
      setNumberDropdownContent(customerNumberSuggestionArray);
    }
  };

  const toggleDropdown = (value, setDropdown) => {
    setDropdown(!!value);
  };

  const filterArray = (array, key, value) => {
    return array.filter((item) =>
      item[key].toLowerCase().includes(value.toLowerCase())
    );
  };

  const getUserNames = async () => {
    const userNamesSnapshot = await getDocs(usersCollection);
    return userNamesSnapshot.docs.map((doc) => ({
      name: doc.data().name,
      uid: doc.data().uid,
    }));
  };

  const getUserNumbers = async () => {
    const userNumbersSnapshot = await getDocs(usersCollection);
    return userNumbersSnapshot.docs.map((doc) => ({
      number: doc.data().number,
      uid: doc.data().uid,
    }));
  };

  const findTheClickedName = async (name) => {
    const clickedUserInfo = await getUserByName(name.name);
    setClientInput({
      name: clickedUserInfo.name,
      cell: clickedUserInfo.number,
      email: clickedUserInfo.email,
      city: clickedUserInfo.city,
    });
    setStartDate(formatDate(parseInt(clickedUserInfo.dateOfBirth * 1000)));
    setDropdown(false);
  };

  const findTheClickedNumber = async (number) => {
    const userInfo = await getUserInfo("number", number.number);
    setClientInput({
      name: userInfo.name,
      cell: userInfo.number,
      email: userInfo.email,
      city: userInfo.city,
    });
    setStartDate(parseInt(userInfo.dateOfBirth * 1000));
    setNumberDropdown(false);
  };

  const findTheClickedCity = (city) => {
    setClientInput((prev) => ({ ...prev, city: city.city }));
    setCityDropdown(false);
  };

  const getUserInfo = async (field, value) => {
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, where(field, "==", value));
    const querySnapshot = await getDocs(q);
    let userInfo;
    querySnapshot.forEach((doc) => {
      userInfo = doc.data();
    });
    return userInfo;
  };

  const getUserByName = async (name) => {
    const nameQuery = query(usersCollection, where("name", "==", name));
    const userSnapshot = await getDocs(nameQuery);
    let userInfo;
    userSnapshot.forEach((doc) => {
      userInfo = doc.data();
    });
    return userInfo;
  };

  const saveClientInfo = async () => {
    setLoading(true);
    if (!payment) {
      toast.error("select method of payment");
      return;
    }
    const email = await findOrAddClient();
    const itemsId = itemsAdded.map((item) => item);
    await addOrder(email, itemsId);
    await clearBasket();
    resetClientInput();
    toast.success("Your order has been placed!");
    setLoading(false);
  };

  const findOrAddClient = async () => {
    let email;
    const userId = await getUserIdByEmail(clientInput.email, clientInput.name);
    if (!userId) {
      await addUser();
      email = await getUserIdByEmail(clientInput.email, clientInput.name);
    } else {
      email = userId;
    }
    return email;
  };

  const getUserIdByEmail = async (email, name) => {
    const userQuery = query(
      usersCollection,
      where("email", "==", email),
      where("name", "==", name)
    );

    const userSnapshot = await getDocs(userQuery);
    let userId;
    userSnapshot.forEach((doc) => {
      userId = doc.data();
    });
    if (userId) {
      return userId.uid;
    } else {
      return false;
    }
  };

  const addUser = async () => {
    const date = convertToUnixTime(startDate.toString().slice(0, 33));
    const userApi = "/api/users/addUsers";
    const userResponse = await fetch(
      `${userApi}?name=${clientInput.name}&email=${clientInput.email}&number=${
        clientInput.cell
      }&city=${clientInput.city}&dateOfBirth=${date}&uid=${randomString(20)}`
    );
    await userResponse.json();
  };

  const addOrder = async (email, itemsId) => {
    const orderApi = "/api/orders/addOrders";
    const citySnapshot = await getDocs(cities);
    let isCityFound;
    citySnapshot.forEach((doc) => {
      if (
        clientInput.city.toLowerCase() === doc.data().city.toLowerCase() ||
        clientInput.city.toLowerCase().includes(doc.data().city.toLowerCase())
      ) {
        isCityFound = true;
      }
    });
    if (!isCityFound) {
      addDoc(cities, { city: clientInput.city });
    }

    if (amountPaid === 0) {
      setAmountPaid("paid");
    }

    const orderNumRef = collection(db, "orderNum");
    const orderNumSnapshot = await getDocs(orderNumRef);
    const orderNumDoc = orderNumSnapshot.docs[0];
    const orderNumber = orderNumDoc.data().orderNumber;

    await fetch(
      `${orderApi}?name=${clientInput.name}
      &city=${clientInput.city}&number=${clientInput.cell}&email=${
        clientInput.email
      }&itemSelectedId=${encodeURIComponent(
        JSON.stringify(itemsId)
      )}&clientOrderId=${randomString(
        20
      )}&userId=${email}&amountPaid=${amountPaid}&payment=${payment}&orderNumber=${orderNumber}`
    );

    await updateDoc(orderNumDoc.ref, {
      orderNumber: parseFloat(orderNumber) + 1,
    });
  };

  const clearBasket = async () => {
    const basketDoc = doc(db, "basket", "BCASLSzg2XsLMSlkVAjY");
    await updateDoc(basketDoc, { basket: [] });
    setItemsAdded([]);
  };

  const resetClientInput = () => {
    setClientInput({
      name: "",
      email: "",
      cell: "",
      city: "",
    });
    setDropdown(false);
  };

  function convertToUnixTime(dateString) {
    const date = new Date(dateString);
    return Math.floor(date.getTime() / 1000);
  }

  const getAllItems = async () => {
    const basketItemsCollection = collection(db, "basket");
    const querySnapshot = await getDocs(basketItemsCollection);
    const newBasketData = querySnapshot.docs.map((doc) => doc.data());
    setItemsAdded(newBasketData[0].basket);
  };

  const getAllCities = async () => {
    const citySnapshot = await getDocs(cities);
    setCityDropdownContent(citySnapshot.docs.map((doc) => doc.data()));
  };

  React.useEffect(() => {
    getAllItems();
  }, []);

  return (
    <div className={styles.clientFormContainer}>
      <Toaster />
      <Nav />
      <div className={styles.itemsPickedContainer}>
        {itemsAdded.map((item) => (
          <div className={styles.pickedItemsWrapper}>
            <div style={{ display: "none" }}>
              {(sum += parseFloat(item.itemPrice))}
            </div>
            <p className={styles.invoiceNumber}>Invoice: {item.invoice}</p>
            <p className={styles.itemName}>Name: {item.itemName}</p>
            <p className={styles.itemCode}>Price: ${item.itemPrice}</p>
          </div>
        ))}
      </div>
      <div className={styles.clientFormRow}>
        <div className={styles.clientName}>
          <p className={styles.clientNameLabel}>Name: </p>
          <input
            value={clientInput.name}
            placeholder="Enter Name"
            type="text"
            className={styles.clientInput}
            onChange={(e) => handleClientInputName(e)}
          />
          {dropdown ? (
            <div className={styles.dropdownContainer}>
              {dropdownContent.map((names) => (
                <div className={styles.dropdownWrapper}>
                  <p
                    className={styles.dropdownContent}
                    onClick={() => findTheClickedName(names)}
                  >
                    {names.name}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            false
          )}
        </div>
        <div className={styles.clientCity}>
          <p className={styles.clientAddressLabel}>City: </p>
          <input
            value={clientInput.city}
            type="text"
            placeholder="Enter City"
            className={styles.clientInput}
            onChange={(e) => handleClientInputCity(e)}
          />
          {cityDropdown ? (
            <div className={styles.dropdownContainer}>
              {cityDropdownContent.map((cities) => (
                <div className={styles.dropdownWrapper}>
                  <p
                    className={styles.dropdownContent}
                    onClick={() => findTheClickedCity(cities)}
                  >
                    {cities.city}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            false
          )}
        </div>
        <div className={styles.clientDob}>
          <p className={styles.clientAddressLabel}>Date Of Birth</p>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            className={styles.clientInput}
          />
        </div>
        <div className={styles.clientCellphone}>
          <p className={styles.clientCellphoneLabel}>Cell: </p>
          <input
            type="text"
            className={styles.clientInput}
            placeholder="Enter Phone Number"
            value={clientInput.cell}
            onChange={(e) => handleClientInputNumber(e)}
          />
          {numberDropdown ? (
            <div className={styles.dropdownContainer}>
              {numberDropdownContent.map((numbers) => (
                <div className={styles.dropdownWrapper}>
                  <p
                    className={styles.dropdownContent}
                    onClick={() => findTheClickedNumber(numbers)}
                  >
                    {numbers.number}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            false
          )}
        </div>
        <div className={styles.clientEmail}>
          <p className={styles.clientEmailLabel}>Email: </p>
          <input
            type="text"
            value={clientInput.email}
            className={styles.clientInput}
            placeholder="Enter Email"
            onChange={(e) =>
              setClientInput({
                ...clientInput,
                email: e.target.value,
              })
            }
          />
        </div>
      </div>
      <h3 style={{ margin: "24px 0px" }}>total: ${sum}</h3>
      <PaymentMethod
        payment={payment}
        setAmountPaid={setAmountPaid}
        setPayment={setPayment}
      />
      {!loading ? (
        <button
          className={styles.saveClientInfo}
          onClick={() => saveClientInfo()}
        >
          Save Info
        </button>
      ) : (
        <div className={styles.spinner}></div>
      )}
    </div>
  );
}

export default page;
