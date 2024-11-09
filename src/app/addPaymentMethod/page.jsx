"use client";
import React, { useState } from "react";
import styles from "../addCategory/addCategory.module.css";
import { randomString } from "@/helpers/utils";
import toast, { Toaster } from "react-hot-toast";
import Nav from "@/components/Nav/Nav";
import { useSelector } from "react-redux";
import {
  collection,
  updateDoc,
  deleteDoc,
  addDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/helpers/firebase";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function page() {
  const [paymentInput, setPaymentInput] = React.useState({
    name: "",
  });

  const [paymentToEdit, setPaymentToEdit] = useState({
    id: "",
    newName: "",
  });

  const [loading, setLoading] = useState(false);
  const [toEdit, setToEdit] = useState(false);
  const [isPageInEditMode, setIsPageInEditMode] = useState(false);

  const [paymentMethods, setPaymentMethods] = React.useState([]);
  const paymentRef = collection(db, "paymentMethods");
  // const [originalPaymentMethods, setOriginalPaymentMethods] = React.useState(
  //   []
  // );

  async function getAllPaymentMethods() {
    const paymentRef = collection(db, "paymentMethods");

    onSnapshot(paymentRef, (querySnapshot) => {
      const payment = [];
      querySnapshot.docs.forEach((doc) => {
        payment.push({
          ...doc.data(),
          id: doc.id,
        });
      });

      // Set the state to update instantly when data changes
      setPaymentMethods(payment);
    });
  }
  const updatePayment = async () => {
    if (!paymentToEdit.newName) {
      toast.error("Enter a payment name, please");
      return;
    }

    setLoading(true);
    try {
      const paymentDocRef = doc(paymentRef, paymentToEdit.id);

      await updateDoc(paymentDocRef, { method: paymentToEdit.newName });
      toast.success("Payment updated!");

      setPaymentToEdit({
        id: "",
        newName: "",
      });
      setToEdit(false);
    } catch (error) {
      toast.error("Couldn't update payment");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const deletePayment = async () => {
    setLoading(true);
    try {
      const paymentDocRef = doc(paymentRef, paymentToEdit.id);

      await deleteDoc(paymentDocRef);
      setToEdit(false);
      toast.success("Payment deleted!");
    } catch (error) {
      toast.error("Cannot delete Payment");
    } finally {
      setLoading(false);
    }
  };

  const savePaymentInput = async () => {
    setLoading(true);
    if (!paymentInput.name) {
      toast.error("enter a payment method please");
      return;
    }
    await addDoc(collection(db, "paymentMethods"), {
      method: paymentInput.name,
    });
    toast.success("Payment method added successfully!");
    setPaymentInput({
      name: "",
    });
    setLoading(false);
  };

  const handleEditMode = (payment) => {
    if (isPageInEditMode) {
      setToEdit(true);
      setPaymentToEdit({
        id: payment.id,
        newName: payment.method,
      });
    }
  };

  React.useEffect(() => {
    getAllPaymentMethods();
  }, []);

  return (
    <div>
      <Nav />
      <Toaster />
      <div className={styles.container}>
        <div className={styles.categoryContainer}>
          <h1 style={{ color: "white" }}>Add a Payment Method</h1>
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
            placeholder="Payment Method"
            className={styles.categoryInput}
            value={paymentInput.name}
            onChange={(e) =>
              setPaymentInput({
                ...paymentInput,
                name: e.target.value,
              })
            }
          />
          {!loading ? (
            <button
              onClick={() => savePaymentInput()}
              className={styles.addCategoryButton}
            >
              Submit Payment Method
            </button>
          ) : (
            <div className={styles.spinner}></div>
          )}

          <h1 style={{ color: "white" }}>Payment Methods:</h1>
          <div className={styles.displayInfoWrapper}>
            {paymentMethods.map((paymentMethod) => (
              <div key={paymentMethod.id} className={styles.infoContainer}>
                <Modal
                  open={toEdit}
                  onClose={() => setToEdit(false)}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description"
                  sx={{
                    "& .MuiBackdrop-root": {
                      backgroundColor: "rgba(0, 0, 0, 0.4)",
                    },
                  }}
                >
                  <Box className={styles.modalWrapper}>
                    <Typography
                      id="modal-modal-title"
                      variant="h4"
                      component="h2"
                    >
                      Edit Payment
                    </Typography>
                    <div>
                      <Typography
                        id="modal-modal-description"
                        sx={{ mt: 2 }}
                        className={styles.editCity}
                      >
                        <input
                          type="text"
                          className={styles.categoryInput}
                          value={paymentToEdit.newName}
                          onChange={(e) =>
                            setPaymentToEdit({
                              ...paymentToEdit,
                              newName: e.target.value,
                            })
                          }
                          placeholder="New Payment Name"
                        />
                        {!loading ? (
                          <div>
                            <button
                              onClick={() => updatePayment(paymentMethod.id)}
                              className={styles.saveEditChangesButton}
                            >
                              Save
                            </button>
                            <button
                              className={styles.deleteItemButton}
                              onClick={() => deletePayment(paymentMethod.id)}
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <div className={styles.spinner}></div>
                        )}
                      </Typography>
                    </div>
                  </Box>
                </Modal>
                <div
                  className={styles.infoWrapper}
                  onClick={() => handleEditMode(paymentMethod)}
                >
                  <h2 className={styles.paymentMethod}>
                    {paymentMethod.method}
                  </h2>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
