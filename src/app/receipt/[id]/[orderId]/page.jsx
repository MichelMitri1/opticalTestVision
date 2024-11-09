"use client";
import React, { useState, useEffect, useRef } from "react";
import styles from "../../receipt.module.css";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "@/helpers/firebase";
import { formatDate } from "@/helpers/utils";
import Nav from "@/components/Nav/Nav";
import opticalLogo from "../../../../../src/optical vision.png";

export default function Page() {
  let sum = 0;

  const [userSelected, setUserSelected] = useState(null);
  const [orderSelected, setOrderSelected] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const receiptRef = useRef(null);

  useEffect(() => {
    const extractInfo = () => {
      const parsedUrl = new URL(window.location.href);
      const pathSegments = parsedUrl.pathname.split("/");
      const userId = pathSegments[pathSegments.length - 2];
      const clientOrderId = pathSegments[pathSegments.length - 1];

      return {
        userId,
        clientOrderId,
      };
    };

    const info = extractInfo();
    setUserSelected(info.userId);
    setOrderSelected(info.clientOrderId);
  }, []);

  useEffect(() => {
    const getSpecificPurchase = async () => {
      if (userSelected && orderSelected) {
        const ordersRef = collection(db, "orders", userSelected, "purchase");
        const q = query(ordersRef, where("clientOrderId", "==", orderSelected));
        const ordersSnapshot = await getDocs(q);
        ordersSnapshot.docs.map((doc) => {
          setPurchases(doc.data());
        });
      }
    };

    getSpecificPurchase();
  }, [userSelected, orderSelected]);

  return (
    <div className={styles.receiptContainer}>
      <div className={styles.navbarContainer}>
        <Nav />
      </div>
      <div className={styles.receiptWrapper} ref={receiptRef}>
        <figure>
          <img
            src={opticalLogo.src}
            alt="Optical Vision Logo"
            style={{ width: "300px" }}
          />
        </figure>
        <h1 className={styles.receiptHeader}>
          45A MAIN ST. NEAR OGERO BLDG AMIOUN
        </h1>
        <h3 className={styles.receiptSubheader}>M: 0374365 L: 06950218</h3>
        <h3 className={styles.receiptEmail}>Email ID: smartlens2@gmail.com</h3>
        <div className={styles.receiptInfoWrapper}>
          <div className={styles.orderNum}>
            Order Number: {purchases.orderNumber}
          </div>
          <p className={styles.orderDate}>
            Date of order: {formatDate(purchases.dateOfPurchase)}
          </p>
          <p className={styles.customerName}>CUSTOMER NAME: {purchases.name}</p>
          <p className={styles.customerNum}>
            MOBILE NUMBER: {purchases.number}
          </p>
          <p className={styles.productDetailsHeader}>PRODUCT DETAILS</p>
          {purchases?.itemSelectedId?.map((item, id) => (
            <div className={styles.productDetails} key={id}>
              <p className={styles.productName}>
                {item.itemName} {item.itemCode}
              </p>
              <p className={styles.productPrice}>USD {item.itemPrice}</p>
              <p style={{ display: "none" }}>
                {(sum += parseFloat(item.itemPrice))}
              </p>
            </div>
          ))}
          <div className={styles.productDetailsTotal}>
            <p className={styles.productName}>Total: </p>
            <p className={styles.productPrice}>USD {sum}</p>
          </div>
          {purchases.amountPaid !== "paid" ? (
            <>
              <div className={styles.productDetailsRemaining}>
                <p className={styles.productName}>Paid: </p>
                <p className={styles.productPrice}>
                  USD {parseFloat(purchases.amountPaid)}
                </p>
              </div>
              <div className={styles.productDetailsRemaining}>
                <p className={styles.productName}>Remaining: </p>
                <p className={styles.productPrice}>
                  USD {(sum - parseFloat(purchases.amountPaid)).toFixed(2)}
                </p>
              </div>
            </>
          ) : null}
        </div>
        <p className={styles.doctorName}>
          Doctor / Optometrist Name: TONY KHOUZAMI
        </p>
        <button className={styles.printButton} onClick={() => window.print()}>
          print
        </button>
      </div>
    </div>
  );
}
