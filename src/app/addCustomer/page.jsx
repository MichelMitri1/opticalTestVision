"use client";
import React from "react";
import styles from "../addCustomer/addCustomer.module.css";
import Nav from "@/components/Nav/Nav";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import ClientTable from "@/components/ClientTable";
import ClientTableLenses from "@/components/ClientTableLenses";
import toast, { Toaster } from "react-hot-toast";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/helpers/firebase";
import { useSelector } from "react-redux";

export default function Page() {
  const { users } = useSelector((state) => state.users);
  const [startDate, setStartDate] = React.useState();
  const [arrivalDate, setArrivalDate] = React.useState(new Date());
  const [dropdownState, setDropdownState] = React.useState({
    nameDropDown: false,
    numberDropDown: false,
    cityDropDown: false,
    cityDropDownContent: [],
    nameDropDownContent: users,
    numberDropDownContent: users,
  });

  const [allCities, setAllCities] = React.useState([]);
  const [originalCities, setOriginalCities] = React.useState([]);
  const [gender, setGender] = React.useState("");
  const [customerInput, setCustomerInput] = React.useState({
    name: "",
    email: "",
    number: "",
    city: "",
  });

  const [isGlasses, setIsGlasses] = React.useState(true);

  const cityNameRef = React.useRef(null);
  const dropdownCityRef = React.useRef(null);

  const cityRef = collection(db, "cities");

  function handleGenderChange(event) {
    setGender(event.target.value);
  }

  const handleCityChange = (event) => {
    const cityName = event.target.value;
    setCustomerInput({
      ...customerInput,
      city: cityName,
    });

    if (!cityName) {
      setDropdownState({
        cityDropDown: false,
        cityDropDownContent: allCities,
      });
      return;
    }

    const filteredCities = originalCities.filter((city) =>
      city.city.toLowerCase().includes(cityName.toLowerCase().trim())
    );
    setDropdownState({
      cityDropDownContent: filteredCities,
      cityDropDown: true,
    });
  };

  const handleNameChange = (e) => {
    const userName = e.target.value;
    setCustomerInput({
      ...customerInput,
      name: userName,
    });

    if (!userName) {
      setDropdownState({
        nameDropDown: false,
        nameDropDownContent: users,
      });
      return;
    }

    const filteredUsers = users.filter((user) =>
      user.name.toLowerCase().includes(userName.toLowerCase().trim())
    );
    setDropdownState({
      nameDropDownContent: filteredUsers,
      nameDropDown: true,
    });
  };

  const handleNumberChange = (e) => {
    const userNumber = e.target.value;
    setCustomerInput({
      ...customerInput,
      number: userNumber,
    });

    if (!userNumber) {
      setDropdownState({
        numberDropDown: false,
        numberDropDownContent: users,
      });
      return;
    }

    const filteredUsers = users.filter((user) =>
      user.number.includes(userNumber.trim())
    );
    setDropdownState({
      numberDropDown: true,
      numberDropDownContent: filteredUsers,
    });
  };

  const findTheClickedNumber = (user) => {
    setCustomerInput({
      ...customerInput,
      name: user.name,
      number: user.number,
    });

    setDropdownState({
      numberDropDown: false,
      numberDropDownContent: users,
    });
  };

  const findTheClickedName = (user) => {
    setCustomerInput({
      ...customerInput,
      name: user.name,
    });

    setDropdownState({
      nameDropDownContent: users,
      nameDropDown: false,
    });
  };

  const findTheClickedCity = (city) => {
    setCustomerInput({
      ...customerInput,
      city: city.city,
    });

    setDropdownState({
      cityDropDown: false,
      cityDropDownContent: originalCities,
    });
  };

  async function getAllCities() {
    const citySnapshot = await getDocs(cityRef);
    const cities = citySnapshot.docs.map((doc) => doc.data());
    setAllCities(cities);
    setOriginalCities(cities);

    setDropdownState({
      ...dropdownState,
      cityDropDownContent: cities,
    });
  }

  const handleClickOutsideCity = (event) => {
    if (
      cityNameRef.current &&
      !cityNameRef.current.contains(event.target) &&
      dropdownCityRef.current &&
      !dropdownCityRef.current.contains(event.target)
    ) {
      setDropdownState({
        ...dropdownState,
        cityDropDown: false,
      });
    }
  };

  React.useEffect(() => {
    if (dropdownState.cityDropDown) {
      document.addEventListener("click", handleClickOutsideCity);
    } else {
      document.removeEventListener("click", handleClickOutsideCity);
    }

    return () => {
      document.removeEventListener("click", handleClickOutsideCity);
    };
  }, [dropdownState.cityDropDown]);

  React.useEffect(() => {
    getAllCities();
    setDropdownState({
      ...dropdownState,
      cityDropDownContent: allCities,
      userDropDownContent: users,
    });
  }, []);

  return (
    <div className={styles.addCustomerWrapper}>
      <Nav />
      <Toaster />
      <h1 style={{ color: "white" }}>Add a Customer</h1>
      <div className={styles.inputsWrapper}>
        <div>
          <p className={styles.label}>Gender</p>
          <Box
            sx={{
              width: 90,
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
                Gender
              </InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={gender}
                label="Gender"
                onChange={handleGenderChange}
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
                <MenuItem value={"male"} className="option">
                  male
                </MenuItem>
                <MenuItem value={"female"} className="option">
                  female
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </div>
        <div>
          <p className={styles.label}>Name</p>
          <input
            type="text"
            value={customerInput.name}
            placeholder="Full Name"
            className={styles.customerInputLarge}
            onChange={(e) => handleNameChange(e)}
          />
          {dropdownState.nameDropDown && (
            <div className={styles.dropdownContainerCity} ref={dropdownCityRef}>
              {dropdownState?.nameDropDownContent?.map((user, i) => (
                <div className={styles.dropdownWrapper} key={i}>
                  <p
                    className={styles.dropdownContent}
                    onClick={() => findTheClickedName(user)}
                  >
                    {user.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className={styles.label}>City</p>
          <input
            type="text"
            placeholder="City"
            className={styles.customerInputLarge}
            ref={cityNameRef}
            value={customerInput.city}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                dropdownState.cityDropDownContent.length > 0
              ) {
                setDropdownState({
                  ...dropdownState,
                  cityDropDown: false,
                });
                setCustomerInput({
                  ...customerInput,
                  city: dropdownState.cityDropDownContent[0].city,
                });
              }
            }}
            onFocus={() => {
              if (allCities.length > 0) {
                setDropdownState({
                  cityDropDown: true,
                  cityDropDownContent: allCities,
                });
              }
            }}
            onChange={(e) => handleCityChange(e)}
          />
          {dropdownState.cityDropDown && (
            <div className={styles.dropdownContainerCity} ref={dropdownCityRef}>
              {dropdownState?.cityDropDownContent?.map((city, i) => (
                <div className={styles.dropdownWrapper} key={i}>
                  <p
                    className={styles.dropdownContent}
                    onClick={() => findTheClickedCity(city)}
                  >
                    {city.city}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className={styles.label}>Phone Number</p>
          <input
            type="text"
            placeholder="Phone Number"
            className={styles.customerInput}
            value={customerInput.number}
            onChange={(e) => handleNumberChange(e)}
          />
          {dropdownState.numberDropDown && (
            <div className={styles.dropdownContainerNumber} ref={dropdownCityRef}>
              {dropdownState?.numberDropDownContent?.map((user, i) => (
                <div className={styles.dropdownWrapper} key={i}>
                  <p
                    className={styles.dropdownContent}
                    onClick={() => findTheClickedNumber(user)}
                  >
                    {user.number}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className={styles.label}>Date of Birth</p>
          <DatePicker
            className={styles.customerInputDate}
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            placeholderText="Date of Birth"
          />
        </div>
        <div>
          <p className={styles.label}>Email</p>
          <input
            type="email"
            placeholder="Email"
            value={customerInput.email}
            className={styles.customerInputLarge}
            onChange={(e) =>
              setCustomerInput({
                ...customerInput,
                email: e.target.value,
              })
            }
          />
        </div>
        <div>
          <p className={styles.label}>Date</p>
          <DatePicker
            className={styles.customerInputDate}
            selected={arrivalDate}
            onChange={(date) => setArrivalDate(date)}
          />
        </div>
      </div>
      <div className={styles.pickerButtons}>
        <button
          className={styles.glassesButton}
          onClick={() => setIsGlasses(true)}
        >
          Glasses
        </button>
        <button
          className={styles.lensesButton}
          onClick={() => setIsGlasses(false)}
        >
          Lenses
        </button>
      </div>
      <div>
        {isGlasses ? (
          <ClientTable
            glassesButton={true}
            customerInput={customerInput}
            setCustomerInput={setCustomerInput}
            startDate={startDate}
            setStartDate={setStartDate}
            gender={gender}
            setGender={setGender}
            forAddCustomer={true}
          />
        ) : (
          <ClientTableLenses
            forAddCustomer={true}
            customerInput={customerInput}
            setCustomerInput={setCustomerInput}
            setStartDate={setStartDate}
            startDate={startDate}
            gender={gender}
            setGender={setGender}
          />
        )}
      </div>
    </div>
  );
}
