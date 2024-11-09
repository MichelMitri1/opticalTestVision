"use client";
import React, { useEffect, useState } from "react";
import styles from "../addCity/addCity.module.css";
import toast, { Toaster } from "react-hot-toast";
import Nav from "@/components/Nav/Nav";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/helpers/firebase";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function page() {
  const citiesRef = collection(db, "cities");
  const [loading, setLoading] = useState(false);

  const [toEditCity, setToEditCity] = useState(false);

  const [cityInput, setCityInput] = useState({
    name: "",
  });

  const [cityToEditInput, setCityToEditInput] = useState({
    id: "",
    newName: "",
  });

  const [allCities, setAllCities] = useState([]);
  const [isPageInEditMode, setIsPageInEditMode] = useState(false);

  const saveCity = async () => {
    if (!cityInput.name) {
      toast.error("enter a city name, please");
      return;
    }

    setLoading(true);
    try {
      await addDoc(citiesRef, {
        city: cityInput.name,
      });
      toast.success("City Added!");
      setCityInput({
        name: "",
      });
    } catch (error) {
      toast.error("couldnt add city");
    }
    setLoading(false);
  };

  const handleEditMode = (city) => {
    if (isPageInEditMode) {
      setToEditCity(true);
      setCityToEditInput({
        id: city.id,
        newName: city.city,
      });
    }
  };

  const updateCity = async () => {
    if (!cityToEditInput.newName) {
      toast.error("Enter a city name, please");
      return;
    }

    setLoading(true);
    try {
      const cityDocRef = doc(citiesRef, cityToEditInput.id);
      await updateDoc(cityDocRef, {
        city: cityToEditInput.newName,
      });
      toast.success("City updated!");
      setCityToEditInput({
        newName: "",
      });
      setToEditCity(false);
    } catch (error) {
      toast.error("Couldn't update city");
    }
    setLoading(false);
  };

  const deleteCityFromCities = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "cities", cityToEditInput.id);
      await deleteDoc(docRef);
      setToEditCity(false);
      toast.success("City deleted!");
    } catch (error) {
      toast.error("Cannot delete city");
    }
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(citiesRef, (snapshot) => {
      const cityData = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setAllCities(cityData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <Nav />
      <Toaster />
      <div className={styles.container}>
        <div className={styles.cityContainer}>
          <h1 style={{ color: "white" }}>Add a City</h1>
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
            placeholder="City Name"
            className={styles.cityInput}
            value={cityInput.name}
            onChange={(e) =>
              setCityInput({
                ...cityInput,
                name: e.target.value,
              })
            }
          />

          {!loading ? (
            <button
              onClick={(e) => saveCity(e)}
              className={styles.addCityButton}
            >
              Submit city
            </button>
          ) : (
            <div className={styles.spinner}></div>
          )}
          <h1 style={{ color: "white" }}>Cities:</h1>
          <div className={styles.displayInfoWrapper}>
            {allCities?.map((city) => (
              <div key={city.id} className={styles.infoContainer}>
                <Modal
                  open={toEditCity}
                  onClose={() => setToEditCity(false)}
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
                      Edit City
                    </Typography>
                    <div>
                      <Typography
                        id="modal-modal-description"
                        sx={{ mt: 2 }}
                        className={styles.editCity}
                      >
                        <input
                          type="text"
                          className={styles.cityInput}
                          value={cityToEditInput.newName}
                          onChange={(e) =>
                            setCityToEditInput({
                              ...cityToEditInput,
                              newName: e.target.value,
                            })
                          }
                          placeholder="New City Name"
                        />
                        {!loading ? (
                          <div>
                            <button
                              onClick={() => updateCity(city)}
                              className={styles.saveEditChangesButton}
                            >
                              Save
                            </button>
                            <button
                              className={styles.deleteItemButton}
                              onClick={() => deleteCityFromCities(city)}
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
                  onClick={() => handleEditMode(city)}
                >
                  <h2 className={styles.city}>{city.city}</h2>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
