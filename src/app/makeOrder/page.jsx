"use client";
import styles from "../makeOrder/makeOrder.module.css";
import React from "react";
import { randomString } from "@/helpers/utils.js";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import toast, { Toaster } from "react-hot-toast";
import Nav from "@/components/Nav/Nav";

export default function page() {
  const [orderSelected, setOrderSelected] = React.useState("");
  const [salesPersonSelected, setSalesPersonSelected] = React.useState("");
  const [taxRules, setTaxRules] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [orderInput, setOrderInput] = React.useState({
    orderNum: "",
    orderDate: "",
    orderDeliveryDate: "",
    orderMobileNum: "",
    orderCustomerName: "",
    orderSalesPerson: "",
    orderAge: "",
    orderGender: "",
    orderLocality: "",
    orderDateOfBirth: "",
    orderCustomerNotes: "",
    orderTaxRule: "",
    orderTaxLedger: "",
  });

  function logOrderSelected(e) {
    setOrderSelected(e.target.value);
  }

  function logOrderSalesPersonSelected(e) {
    setSalesPersonSelected(e.target.value);
  }

  function logTaxRule(e) {
    setTaxRules(e.target.value);
  }

  function logGender(e) {
    setGender(e.target.value);
  }

  const saveOrders = async () => {
    if (!orderInput.orderNum) {
      toast.error("please enter the order number");
      return;
    }
    const api = "/api/orderItems/addOrderItems";
    const response = await fetch(
      `${api}?id=${randomString(20)}&orderNum=${
        orderInput.orderNum
      }&orderDate=${orderInput.orderDate}&orderDeliveryDate=${
        orderInput.orderDeliveryDate
      }&orderMobileNum=${orderInput.orderMobileNum}&orderCustomerName=${
        orderInput.orderCustomerName
      }&orderSalesPerson=${salesPersonSelected}&orderAge=${
        orderInput.orderAge
      }&orderGender=${gender}&orderLocality=${
        orderInput.orderLocality
      }&orderDateOfBirth=${orderInput.orderDateOfBirth}&orderCustomerNotes=${
        orderInput.orderCustomerNotes
      }&orderTaxRule=${taxRules}&orderTaxLedger=${orderSelected}`
    );
    const data = await response.json();
    if (data) {
      setOrderInput({
        orderNum: "",
        orderDate: "",
        orderDeliveryDate: "",
        orderMobileNum: "",
        orderCustomerName: "",
        orderSalesPerson: "",
        orderAge: "",
        orderGender: "",
        orderLocality: "",
        orderDateOfBirth: "",
        orderCustomerNotes: "",
        orderTaxRule: "",
        orderTaxLedger: "",
      });
      toast.success("Thank you for placing your order!");
    } else {
      toast.error("invalid");
    }
  };
  return (
    <div className={styles.orderFormContainer}>
      <Nav />
      <div className={styles.orderFormWrapper}>
        <Toaster />
        <div className={styles.orderFormRow}>
          <div className={styles.orderInfo}>
            <p className={styles.orderLabel}>Order No: </p>
            <input
              type="text"
              placeholder="Order Number"
              onChange={(e) =>
                setOrderInput({
                  ...orderInput,
                  orderNum: e.target.value,
                })
              }
              className={styles.orderInput}
            />
          </div>
          <div className={styles.orderInfo}>
            <p className={styles.orderLabel}>Date: </p>
            <input
              type="text"
              placeholder="Order Date"
              onChange={(e) =>
                setOrderInput({
                  ...orderInput,
                  orderDate: e.target.value,
                })
              }
              className={styles.orderInput}
            />
          </div>
          <div className={styles.orderInfo}>
            <p className={styles.orderLabel}>Delivery Date: </p>
            <input
              type="text"
              placeholder="Order Delivery Date"
              onChange={(e) =>
                setOrderInput({
                  ...orderInput,
                  orderDeliveryDate: e.target.value,
                })
              }
              className={styles.orderInput}
            />
          </div>
        </div>
        <div className={styles.orderFormRow}>
          <div className={styles.orderInfo}>
            <p className={styles.mobileNumLabel}>Mobile No.: </p>
            <input
              type="text"
              placeholder="Mobile Number"
              onChange={(e) =>
                setOrderInput({
                  ...orderInput,
                  orderMobileNum: e.target.value,
                })
              }
              className={styles.orderInput}
            />
          </div>
          <div className={styles.orderInfo}>
            <p className={styles.customerNameLabel}>Customer Name: </p>
            <input
              type="text"
              placeholder="Customer Name"
              onChange={(e) =>
                setOrderInput({
                  ...orderInput,
                  orderCustomerName: e.target.value,
                })
              }
              className={styles.orderInput}
            />
          </div>
        </div>
        <div className={styles.orderFormRow}>
          <div className={styles.orderInfo}>
            <p className={styles.salesNameLabel}>Sales Person: </p>
            <Box
              sx={{
                minWidth: 200,
                height: 30,
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
                  SP
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={salesPersonSelected}
                  label="Order"
                  name="sales people"
                  onChange={(e) => logOrderSalesPersonSelected(e)}
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
                  <MenuItem className="option" value="Michel Mitri">
                    Michel Mitri
                  </MenuItem>
                  <MenuItem className="option" value="Hanna Mitri">
                    Hanna Mitri
                  </MenuItem>
                  <MenuItem className="option" value="Elie Mitri">
                    Elie Mitri
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          </div>
        </div>
        <div className={styles.orderFormRow}>
          <div className={styles.orderInfo}>
            <p className={styles.dateofBirthLabel}>Date of Birth: </p>
            <input
              type="text"
              placeholder="Date of Birth"
              onChange={(e) =>
                setOrderInput({
                  ...orderInput,
                  orderDateOfBirth: e.target.value,
                })
              }
              className={styles.orderInput}
            />
          </div>
          <div className={styles.orderInfo}>
            <p className={styles.ageLabel}>Age: </p>
            <input
              type="text"
              placeholder="Age"
              onChange={(e) =>
                setOrderInput({
                  ...orderInput,
                  orderAge: e.target.value,
                })
              }
              className={styles.orderInput}
            />
          </div>
        </div>
        <div className={styles.orderFormRow}>
          <div className={styles.orderInfo}>
            <p className={styles.genderLabel}>Gender: </p>
            <div className={styles.genderOptions}>
              <input
                type="radio"
                value="male"
                name="gender"
                className={styles.genderOption}
                onChange={(e) => logGender(e)}
              />
              <p className={styles.maleOption}>Male</p>
            </div>
            <div className={styles.genderOptions}>
              <input
                type="radio"
                value="female"
                name="gender"
                className={styles.orderInput}
                onChange={(e) => logGender(e)}
              />
              <p className={styles.femaleOption}>Female</p>
            </div>
            <div className={styles.genderOptions}>
              <input
                type="radio"
                value="other"
                name="gender"
                className={styles.genderOption}
                onChange={(e) => logGender(e)}
              />
              <p className={styles.otherOption}>Other</p>
            </div>
          </div>
        </div>
        <div className={styles.orderFormRow}>
          <div className={styles.orderInfo}>
            <p className={styles.dateofBirthLabel}>Locality: </p>
            <input
              type="text"
              placeholder="Order Locality"
              onChange={(e) =>
                setOrderInput({
                  ...orderInput,
                  orderLocality: e.target.value,
                })
              }
              className={styles.orderInput}
            />
          </div>
        </div>
        <div className={styles.orderFormRow}>
          <div className={styles.orderInfo}>
            <p className={styles.customerNotesLabel}>Customer Notes: </p>
            <input
              placeholder="Order Customer Notes"
              onChange={(e) =>
                setOrderInput({
                  ...orderInput,
                  orderCustomerNotes: e.target.value,
                })
              }
              className={styles.orderInput}
            />
          </div>
        </div>
        <div className={styles.orderInfo}>
          <p className={styles.taxRuleLabel}>Tax Rule: </p>
          <div className={styles.taxRuleOptionsWrapper}>
            <div className={styles.taxRuleOptions}>
              <input
                type="radio"
                value="Not Applicable"
                name="taxRule"
                className={styles.taxRuleOption}
                onChange={(e) => logTaxRule(e)}
              />
              <p className={styles.notAppOption}>Not Applicable</p>
            </div>
            <div className={styles.taxRuleOptions}>
              <input
                type="radio"
                value="Include"
                name="taxRule"
                className={styles.taxRuleOption}
                onChange={(e) => logTaxRule(e)}
              />
              <p className={styles.includeOption}>Include</p>
            </div>
            <div className={styles.taxRuleOptions}>
              <input
                type="radio"
                value="Exclude"
                name="taxRule"
                className={styles.taxRuleOption}
                onChange={(e) => logTaxRule(e)}
              />
              <p className={styles.excludeOption}>exclude</p>
            </div>
          </div>
          <div className={styles.taxLedgerOptionsWrapper}>
            <div className={styles.taxLedgerOptions}>
              <p className={styles.taxLedgerLabel}>Tax Ledger: </p>
              <Box
                sx={{
                  minWidth: 200,
                  height: 30,
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
                    TL
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={orderSelected}
                    label="Order"
                    name="taxes"
                    onChange={(e) => logOrderSelected(e)}
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
                    <MenuItem className="option" value="11%">
                      11%
                    </MenuItem>
                    <MenuItem className="option" value="22%">
                      22%
                    </MenuItem>
                    <MenuItem className="option" value="33%">
                      33%
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <p className={styles.taxLedgerPercentage}>@11%</p>
            </div>
          </div>
        </div>
      </div>
      <button className={styles.submitOrder} onClick={() => saveOrders()}>
        Submit
      </button>
    </div>
  );
}
