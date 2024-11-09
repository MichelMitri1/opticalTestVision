import React from "react";
import styles from "../Tables/clientTable.module.css";
import { clientTableContent } from "../../clientTableContent.js";

function ClientTable() {
  return (
    <>
      <div style={{ display: "flex", gap: "500px" }}>
        <div className={styles.tableContainer}>
          {clientTableContent.map((content, id) => (
            <div className={styles.tableRow} key={id}>
              <p className={styles.tableRowContent}>{content.tableRow1}</p>
              {content.tableRow2 === "Old RX" ? (
                <>
                  <p className={styles.tableRowContent}>{content.tableRow2}</p>
                </>
              ) : (
                <>
                  <input
                    className={styles.tableRowContent}
                    onChange={(e) => writingFirstClientTableInfo(e)}
                  />
                </>
              )}
              {content.tableRow3 === "New RX" ? (
                <>
                  <p className={styles.tableRowContent}>{content.tableRow3}</p>
                </>
              ) : (
                <>
                  <input
                    className={styles.tableRowContent}
                    onChange={(e) => writingFirstClientTableInfo(e)}
                  />
                </>
              )}
              {content.tableRow4 === "Contact" ? (
                <>
                  <p className={styles.tableRowContent}>{content.tableRow4}</p>
                </>
              ) : (
                <>
                  <input
                    className={styles.tableRowContent}
                    onChange={(e) => writingFirstClientTableInfo(e)}
                  />
                </>
              )}
            </div>
          ))}
        </div>
        <div className={styles.tableContainer}>
          {clientTableContent.map((content, id) => (
            <div className={styles.tableRow} key={id}>
              <p className={styles.tableRowContent}>{content.tableRow1}</p>
              {content.tableRow2 === "Old RX" ? (
                <p className={styles.tableRowContent}>{content.tableRow2}</p>
              ) : (
                <input
                  className={styles.tableRowContent}
                  onChange={(e) => writingSecondClientTableInfo(e)}
                />
              )}
              {content.tableRow3 === "New RX" ? (
                <p className={styles.tableRowContent}>{content.tableRow3}</p>
              ) : (
                <input
                  className={styles.tableRowContent}
                  onChange={(e) => writingSecondClientTableInfo(e)}
                />
              )}
              {content.tableRow4 === "Contact" ? (
                <p className={styles.tableRowContent}>{content.tableRow4}</p>
              ) : (
                <input
                  className={styles.tableRowContent}
                  onChange={(e) => writingSecondClientTableInfo(e)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className={styles.inputsContainer}>
          <div className={styles.inputsWrapper}>
            <p>Movt.</p>
            <input type="text" className={styles.movtInput} />
          </div>
          <div className={styles.inputsWrapper}>
            <p>Centring.</p>
            <input type="text" className={styles.CentringInput} />
          </div>
        </div>
      </div>
      <h2>Keratometry</h2>
      <div className={styles.keratometryContainer}>
        <div className={styles.keratometryWrapper}>
          <div className={styles.inputsWrapper}>
            <p>H</p>
            <input
              type="text"
              name=""
              id=""
              className={styles.keratometryInput}
            />
          </div>
          <div className={styles.inputsWrapper}>
            <p>L</p>
            <input
              type="text"
              name=""
              id=""
              className={styles.keratometryInput}
            />
          </div>
          <div className={styles.inputsWrapper}>
            <p>Axis</p>
            <input
              type="text"
              name=""
              id=""
              className={styles.keratometryInput}
            />
          </div>
          <div className={styles.inputsWrapper}>
            <p>K Avg.</p>
            <input
              type="text"
              name=""
              id=""
              className={styles.keratometryInput}
            />
          </div>
        </div>
        <div className={styles.keratometryWrapper}>
          <div className={styles.inputsWrapper}>
            <p>H</p>
            <input
              type="text"
              name=""
              id=""
              className={styles.keratometryInput}
            />
          </div>
          <div className={styles.inputsWrapper}>
            <p>L</p>
            <input
              type="text"
              name=""
              id=""
              className={styles.keratometryInput}
            />
          </div>
          <div className={styles.inputsWrapper}>
            <p>Axis</p>
            <input type="text" className={styles.keratometryInput} />
          </div>
          <div className={styles.inputsWrapper}>
            <p>K Avg.</p>
            <input type="text" className={styles.keratometryInput} />
          </div>
        </div>
      </div>
      <button className={styles.submitClientTable}>Submit</button>
    </>
  );
}

export default ClientTable;
