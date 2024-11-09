"use client";
import { useEffect } from "react";
import * as React from "react";
import styles from "../app/page.module.css";
import Nav from "@/components/Nav/Nav";
import { useRouter } from "next/navigation";

const MainPage = () => {
  const router = useRouter();
  const [openOrderForm, setOpenOrderForm] = React.useState(false);
  const handleOrderFormOpen = () => setOpenOrderForm(true);
  const handleCategoryFormOpen = () => setOpenCategoryForm(true);
  const handleItemsFormOpen = () => setOpenItemsForm(true);

  useEffect(() => {
    router.push("/addPurchase");
  }, []);


  return (
    <div className={styles.mainPageContainer}>
      <Nav
        handleOrderFormOpen={handleOrderFormOpen}
        handleCategoryFormOpen={handleCategoryFormOpen}
        handleItemsFormOpen={handleItemsFormOpen}
      />
      <div className={styles.headerContainer}>
        <div className={styles.headerInfoWrapper}>
          <h1 className={styles.headerTitle}>Welcome to Optical Vision!</h1>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
