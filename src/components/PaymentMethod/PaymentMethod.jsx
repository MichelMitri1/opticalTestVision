import React, { useEffect } from "react";
import styles from "./payment.module.css";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/helpers/firebase";

function PaymentMethod({ setAmountPaid, payment, setPayment, amountPaid }) {
  const [allPaymentMethods, setAllPaymentMethods] = React.useState([]);
  async function getAllPaymentMethods() {
    const querySnapshot = await getDocs(collection(db, "paymentMethods"));
    const payments = [];
    querySnapshot.docs.map((doc) => payments.push(doc.data()));
    setAllPaymentMethods(payments);
  }

  const handlePayment = (event) => {
    setPayment(event.target.value);
  };

  useEffect(() => {
    getAllPaymentMethods();
  }, []);

  return (
    <div className={styles.container}>
      <Box
        sx={{
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
            Method of Payment
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={payment}
            label="Method of Payment"
            onChange={handlePayment}
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
            {allPaymentMethods.map((paymentMethod) => (
              <MenuItem
                value={paymentMethod.method}
                key={paymentMethod.method}
                className="option"
              >
                {paymentMethod.method}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <input
        type="text"
        value={amountPaid}
        placeholder="Amount Paid"
        className={styles.paymentInput}
        onChange={(e) => setAmountPaid(e.target.value)}
      />
    </div>
  );
}

export default PaymentMethod;
