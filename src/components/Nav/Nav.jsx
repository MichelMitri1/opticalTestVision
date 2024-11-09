"use client";
import React from "react";
import styles from "./Nav.module.css";
import Link from "next/link";

const Nav = () => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isCustomerHovered, setIsCustomerHovered] = React.useState(false);
  const [isUtilitiesHovered, setIsUtilitiesHovered] = React.useState(false);
  const [isPersonalHovered, setIsPersonalHovered] = React.useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleMouseCustomerEnter = () => {
    setIsCustomerHovered(true);
  };

  const handleMouseCustomerLeave = () => {
    setIsCustomerHovered(false);
  };

  const handleMouseUtilitiesEnter = () => {
    setIsUtilitiesHovered(true);
  };

  const handleMouseUtilitiesLeave = () => {
    setIsUtilitiesHovered(false);
  };

  const handleMousePersonalEnter = () => {
    setIsPersonalHovered(true);
  };

  const handleMousePersonalLeave = () => {
    setIsPersonalHovered(false);
  };

  return (
    <div className={styles.navbarContainer}>
      <nav className={styles.navbarWrapper}>
        <Link className={styles.companyName} href="/">
          OPTICAL VISION
        </Link>
        <div className={styles.navLinksWrapper}>
          <div>
            <div
              className={styles.navlink}
              onMouseLeave={handleMouseLeave}
              onMouseEnter={handleMouseEnter}
            >
              Items
            </div>
            {isHovered ? (
              <div
                className={styles.dropdownLinkWrapper}
                onMouseLeave={handleMouseLeave}
                onMouseEnter={handleMouseEnter}
              >
                <Link href="/items">View Items</Link>
                <Link href="/addPurchase">Add Purchase</Link>
              </div>
            ) : null}
          </div>
          <div>
            <div
              href="/"
              className={styles.navlink}
              onMouseLeave={handleMouseUtilitiesLeave}
              onMouseEnter={handleMouseUtilitiesEnter}
            >
              Utilities
            </div>
            {isUtilitiesHovered ? (
              <div
                className={styles.dropdownLinkWrapperLarge}
                onMouseLeave={handleMouseUtilitiesLeave}
                onMouseEnter={handleMouseUtilitiesEnter}
              >
                <Link href="/addCategory">Add Category</Link>
                <Link href="/addPaymentMethod">Add Payment Method</Link>
                <Link href="/addCity">Add City</Link>
              </div>
            ) : null}
          </div>
          <div>
            <div
              href="/addItem"
              className={styles.navlink}
              onMouseLeave={handleMouseCustomerLeave}
              onMouseEnter={handleMouseCustomerEnter}
            >
              Customers
            </div>
            {isCustomerHovered ? (
              <div
                className={styles.dropdownLinkWrapper}
                onMouseLeave={handleMouseCustomerLeave}
                onMouseEnter={handleMouseCustomerEnter}
              >
                <Link href="/customers">View Customers</Link>
                <Link href="/addCustomer">Add Customers</Link>
              </div>
            ) : null}
          </div>
          <div>
            <div
              href="/"
              className={styles.navlink}
              onMouseLeave={handleMousePersonalLeave}
              onMouseEnter={handleMousePersonalEnter}
            >
              Personal
            </div>
            {isPersonalHovered ? (
              <div
                className={styles.dropdownLinkWrapperSmall}
                onMouseLeave={handleMousePersonalLeave}
                onMouseEnter={handleMousePersonalEnter}
              >
                <Link href="/sales">View Sales</Link>
                <Link href="/statistics">View Statistics</Link>
                <Link href="/boughtInvoices">View Invoices</Link>
              </div>
            ) : null}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Nav;
