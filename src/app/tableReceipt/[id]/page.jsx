"use client";
import React, { useState } from "react";
import styles from "../receipt.module.css";
import { usePathname } from "next/navigation";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/helpers/firebase";
import Nav from "@/components/Nav/Nav";
import { useSelector } from "react-redux";
import { formatDate } from "@/helpers/utils";
import opticalLogo from "../../../../src/optical vision.png";

export default function page() {
  const { users } = useSelector((state) => state.users);
  const pathName = usePathname();
  const userSelected = pathName.slice(14);
  const [remainingGlasses, setRemainingGlasses] = React.useState(0);
  const [remainingLenses, setRemainingLenses] = React.useState(0);
  const [sum, setSum] = useState(0);
  const [sumLenses, setSumLenses] = useState(0);
  const [clientTables, setClientTables] = React.useState([]);
  const [pdht, setPdht] = React.useState();
  const [clientTableLenses, setClientTableLenses] = React.useState([]);

  const receiptRef = React.useRef(null);

  const getSelectedUserTable = async () => {
    let totalSum = 0;

    // References to Firestore collections
    const clientTableRef = collection(
      db,
      "clientEyeTableInfo",
      userSelected,
      "prescriptionInfo"
    );
    const clientTableLensesRef = collection(
      db,
      "clientEyeTableLensesInfo",
      userSelected,
      "prescriptionInfo"
    );

    // Queries ordered by date
    const q = query(clientTableRef, orderBy("dateOfPrescription", "desc"));
    const qLenses = query(
      clientTableLensesRef,
      orderBy("dateOfPrescription", "desc")
    );

    // Fetch documents from Firestore
    const [clientTableSnapshot, clientTableLensesSnapshot] = await Promise.all([
      getDocs(q),
      getDocs(qLenses),
    ]);

    // Map documents to arrays
    const tempArr = clientTableSnapshot.docs.map((doc) => doc.data());
    const tempArrLenses = clientTableLensesSnapshot.docs.map((doc) =>
      doc.data()
    );

    // Function to filter and combine Prism and Base values
    const updatePrismRows = (rows) =>
      rows
        .filter(
          (row) =>
            row.tableRow1 !== "PD" &&
            row.tableRow1 !== "HT" &&
            row.tableRow1 !== "Visc. Ac."
        )
        .map((row) => {
          if (row.tableRow1 === "Prism") {
            const baseRow = rows.find((item) => item.tableRow1 === "Base");
            return {
              ...row,
              tableRow2: `${row.tableRow2} ${baseRow?.tableRow2 || ""}`.trim(),
              tableRow3: `${row.tableRow3} ${baseRow?.tableRow3 || ""}`.trim(),
              tableRow4: `${row.tableRow4} ${baseRow?.tableRow4 || ""}`.trim(),
            };
          }
          return row;
        })
        .filter((row) => row.tableRow1 !== "Base");

    if (tempArr.length > 0) {
      const clientData = tempArr[0];

      const finalRight = updatePrismRows(clientData.clientTableContentRight);
      const finalLeft = updatePrismRows(clientData.clientTableContentLeft);

      const pdAndHtValues = {
        pdRight: clientData.clientTableContentRight.find(
          (row) => row.tableRow1 === "PD"
        ),
        pdLeft: clientData.clientTableContentLeft.find(
          (row) => row.tableRow1 === "PD"
        ),
        htRight: clientData.clientTableContentRight.find(
          (row) => row.tableRow1 === "HT"
        ),
        htLeft: clientData.clientTableContentLeft.find(
          (row) => row.tableRow1 === "HT"
        ),
      };

      setPdht(pdAndHtValues);
      setClientTables({
        ...clientData,
        clientTableContentRight: finalRight,
        clientTableContentLeft: finalLeft,
      });

      totalSum =
        parseFloat(clientData.framePrice || 0) +
        parseFloat(clientData.framePriceNear || 0) +
        parseFloat(clientData.rightLensePrice || 0) +
        parseFloat(clientData.leftLensePrice || 0) +
        parseFloat(clientData.rightLensePriceNear || 0) +
        parseFloat(clientData.leftLensePriceNear || 0);

      setSum(totalSum);

      if (clientData.amountPaid !== "paid") {
        const remainingGlasses =
          totalSum - parseFloat(clientData.amountPaid || 0);
        setRemainingGlasses(remainingGlasses);
      }
    }

    if (tempArrLenses.length > 0) {
      const lensesData = tempArrLenses[0];

      setClientTableLenses(lensesData);
      setSumLenses(lensesData.total);

      if (lensesData.amountPaid !== "paid") {
        const remainingLenses =
          lensesData.total - parseFloat(lensesData.amountPaid || 0);
        setRemainingLenses(remainingLenses);
      }
    }
  };

  React.useEffect(() => {
    getSelectedUserTable();
  }, [users]);

  return (
    <div className={styles.receiptContainer}>
      <div className={styles.navbarContainer}>
        <Nav />
      </div>
      <div className={styles.receiptWrapper} ref={receiptRef}>
        <div className={styles.infoWrapper}>
          <div className={styles.storeInfoWrapper}>
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
            <h3 className={styles.receiptEmail}>
              Email ID: smartlens2@gmail.com
            </h3>
          </div>
          <div className={styles.clientInfoWrapper}>
            {users
              .filter((user) => user.uid === userSelected)
              .map((user) => (
                <div className={styles.receiptInfoWrapper}>
                  {clientTables.clientTableContentRight &&
                  clientTables.clientTableContentLeft ? (
                    <p className={styles.customerName}>
                      Date of Order:{" "}
                      {formatDate(clientTables.dateOfPrescription)}
                    </p>
                  ) : null}
                  {clientTables.orderNumber ? (
                    <p className={styles.customerName}>
                      Order Number:{" "}
                      {clientTables.orderNumber > clientTableLenses.orderNumber
                        ? clientTables.orderNumber
                        : clientTableLenses.orderNumber}
                    </p>
                  ) : null}
                  <p className={styles.customerName}>
                    CUSTOMER NAME: {user.name}
                  </p>
                  {user.number ? (
                    <p className={styles.customerNum}>
                      MOBILE NUMBER: {user.number}
                    </p>
                  ) : null}
                </div>
              ))}
          </div>
          <>
            <div className={styles.productDetailsWrapper}>
              <p className={styles.productDetailsHeader}>Product Details</p>
              {clientTables.clientTableContentRight &&
              clientTables.clientTableContentLeft ? (
                <div className={styles.boughtGlassesInfo}>
                  <>
                    {clientTables.frame ? (
                      <div className={styles.boughtItemsInfo}>
                        <p> {clientTables.frame}</p>
                        <p>USD {clientTables.framePrice}</p>
                      </div>
                    ) : null}
                    {clientTables.rightLense ? (
                      <>
                        <div className={styles.boughtItemsInfo}>
                          <p> {clientTables.rightLense}</p>
                          <p>USD {clientTables.rightLensePrice}</p>
                        </div>
                        <div className={styles.boughtItemsInfo}>
                          <p> {clientTables.leftLense}</p>
                          <p>USD {clientTables.leftLensePrice}</p>
                        </div>
                      </>
                    ) : null}
                  </>
                  <>
                    {" "}
                    {clientTables.frameNear ? (
                      <div className={styles.boughtItemsInfo}>
                        <p> {clientTables.frameNear}</p>
                        <p>USD {clientTables.framePriceNear}</p>
                      </div>
                    ) : null}
                    {clientTables.rightLenseNear ? (
                      <>
                        <div className={styles.boughtItemsInfo}>
                          <p> {clientTables.rightLenseNear}</p>
                          <p>USD {clientTables.rightLensePriceNear}</p>
                        </div>
                        <div className={styles.boughtItemsInfo}>
                          <p> {clientTables.leftLenseNear}</p>
                          <p>USD {clientTables.leftLensePriceNear}</p>
                        </div>
                      </>
                    ) : null}
                  </>
                </div>
              ) : null}
              {clientTableLenses.clientTableContentRight &&
              clientTableLenses.clientTableContentLeft ? (
                <div className={styles.boughtLensesInfo}>
                  <div className={styles.boughtItemsInfo}>
                    <p>
                      {" "}
                      {clientTableLenses.rightLense} x
                      {parseFloat(clientTableLenses.total) /
                        parseFloat(clientTableLenses.rightLensePrice)}
                    </p>
                    <p>USD {clientTableLenses.rightLensePrice}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </>
        </div>
        {clientTables.clientTableContentRight &&
        clientTables.clientTableContentLeft ? (
          <div className={styles.tableDisplayContainer}>
            <div className={styles.pdhtWrapper}>
              <div className={styles.pdRight}>
                <p className={styles.pdValue}>PD</p>
                <p className={styles.pdValue}>
                  {pdht.pdLeft.tableRow2 || "none"}
                </p>
                <p className={styles.pdValue}>
                  {pdht.pdLeft.tableRow3 || "none"}
                </p>
                <p className={styles.pdValue}>
                  {pdht.pdLeft.tableRow4 || "none"}
                </p>
              </div>
              <div className={styles.htRight}>
                <p className={styles.htValue}>HT</p>

                <p className={styles.htValue}>
                  {pdht.htLeft.tableRow2 || "none"}
                </p>
                <p className={styles.htValue}>
                  {pdht.htLeft.tableRow3 || "none"}
                </p>
                <p className={styles.htValue}>
                  {pdht.htLeft.tableRow4 || "none"}
                </p>
              </div>
            </div>
            <div className={styles.clientEyeTableInfo}>
              {clientTables.clientTableContentLeft.map((tableContent, key) => (
                <div style={{ margin: "12px 0px 0px 0px" }} key={key}>
                  <div className={styles.tableRow}>
                    <p className={styles.tableRowContent}>
                      {tableContent.tableRow1}
                    </p>
                    <p className={styles.tableRowContent}>
                      {tableContent.tableRow2}
                    </p>
                    <p className={styles.tableRowContent}>
                      {tableContent.tableRow3}
                    </p>
                    <p className={styles.tableRowContent}>
                      {tableContent.tableRow4}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.pdhtWrapper}>
              <div className={styles.pdLeft}>
                <p className={styles.pdValue}>PD</p>
                <p className={styles.pdValue}>
                  {pdht.pdRight.tableRow2 || "none"}
                </p>
                <p className={styles.pdValue}>
                  {" "}
                  {pdht.pdRight.tableRow3 || "none"}
                </p>
                <p className={styles.pdValue}>
                  {pdht.pdRight.tableRow4 || "none"}
                </p>
              </div>
              <div className={styles.htLeft}>
                <p className={styles.htValue}>HT</p>
                <p className={styles.htValue}>
                  {pdht.htRight.tableRow2 || "none"}
                </p>
                <p className={styles.htValue}>
                  {pdht.htRight.tableRow3 || "none"}
                </p>
                <p className={styles.htValue}>
                  {pdht.htRight.tableRow4 || "none"}
                </p>
              </div>
            </div>
            <div className={styles.clientEyeTableInfo}>
              {clientTables.clientTableContentRight.map((tableContent, key) => (
                <div style={{ marginTop: "12px " }} key={key}>
                  <div className={styles.tableRow}>
                    <p className={styles.tableRowContent}>
                      {tableContent.tableRow1}
                    </p>
                    <p className={styles.tableRowContent}>
                      {tableContent.tableRow2}
                    </p>
                    <p className={styles.tableRowContent}>
                      {tableContent.tableRow3}
                    </p>
                    <p className={styles.tableRowContent}>
                      {tableContent.tableRow4}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <div className={styles.tableDisplayContainerLenses}>
          {clientTableLenses.clientTableContentRight &&
          clientTableLenses.clientTableContentLeft ? (
            <div className={styles.clientEyeTableInfoContainer}>
              <div className={styles.clientEyeTableInfoLenses}>
                {clientTableLenses.clientTableContentLeft.map(
                  (content, rowIndex) => (
                    <div style={{ margin: "12px 0px" }}>
                      <div className={styles.tableRow} key={rowIndex}>
                        <p className={styles.tableRowContent}>
                          {content.tableRow1}
                        </p>
                        <p className={styles.tableRowContent}>
                          {content.tableRow2}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
              <div className={styles.clientEyeTableInfoLenses}>
                {clientTableLenses.clientTableContentRight.map(
                  (content, rowIndex) => (
                    <div style={{ margin: "12px 0px" }}>
                      <div className={styles.tableRow} key={rowIndex}>
                        <p className={styles.tableRowContent}>
                          {content.tableRow1}
                        </p>
                        <p className={styles.tableRowContent}>
                          {content.tableRow2}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : null}
        </div>
        <div className={styles.totalWrapper}>
          <div className={styles.total}>
            <p>Total: </p>
            <p>USD {sum + sumLenses}</p>
          </div>
          {remainingGlasses !== "paid" || remainingLenses !== "paid" ? (
            <>
              <div className={styles.productDetailsRemaining}>
                <p className={styles.productName}>Paid: </p>
                <p className={styles.productPrice}>
                  USD{" "}
                  {sum +
                    sumLenses -
                    (parseFloat(remainingGlasses) +
                      parseFloat(remainingLenses))}
                </p>
              </div>
              <div className={styles.productDetailsRemaining}>
                <p className={styles.productName}>Remaining: </p>
                <p className={styles.productPrice}>
                  USD{" "}
                  {parseFloat(remainingGlasses) + parseFloat(remainingLenses)}
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
