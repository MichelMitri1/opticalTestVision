"use client";
import React from "react";
import styles from "./page.module.css";
import MainPage from "../components/MainPage";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <MainPage />
      </div>
    </main>
  );
}
