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
  doc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/helpers/firebase";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function page() {
  const categoriesRef = collection(db, "categories");
  const [toEditCategory, setToEditCategory] = useState(false);
  const [isPageInEditMode, setIsPageInEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [categoriesInput, setCategoriesInput] = React.useState({
    name: "",
  });

  const [categoryToEdit, setCategoryToEdit] = useState({
    id: "",
    newName: "",
  });

  const { categories } = useSelector((state) => state.categories);

  const updateCategory = async () => {
    if (!categoryToEdit.newName) {
      toast.error("Enter a category name, please");
      return;
    }

    setLoading(true);
    try {
      const q = query(categoriesRef, where("id", "==", categoryToEdit.id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("Category not found");
        setLoading(false);
        return;
      }

      const categoryDocRef = querySnapshot.docs[0].ref;

      await updateDoc(categoryDocRef, { name: categoryToEdit.newName });
      toast.success("Category updated!");

      setCategoryToEdit({
        id: "",
        newName: "",
      });
      setToEditCategory(false);
    } catch (error) {
      toast.error("Couldn't update category");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async () => {
    setLoading(true);
    try {
      const q = query(categoriesRef, where("id", "==", categoryToEdit.id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("Category not found");
        setLoading(false);
        return;
      }

      const categoryDocRef = querySnapshot.docs[0].ref;

      await deleteDoc(categoryDocRef);
      setToEditCategory(false);
      toast.success("Category deleted!");
    } catch (error) {
      toast.error("Cannot delete Category");
    } finally {
      setLoading(false);
    }
  };

  const saveCategory = async () => {
    setLoading(true);
    if (!categoriesInput.name) {
      toast.error("enter a category please");
      return;
    }
    const api = "/api/categories/addCategories";
    const response = await fetch(
      `${api}?name=${categoriesInput.name}&id=${randomString(20)}`
    );
    if (response) {
      toast.success("Category added successfully!");
      setCategoriesInput({
        name: "",
      });
    } else {
      toast.error("invalid");
    }

    setLoading(false);
  };

  const handleEditMode = (category) => {
    if (isPageInEditMode) {
      setToEditCategory(true);
      setCategoryToEdit({
        id: category.id,
        newName: category.name,
      });
    }

    console.log(category);
  };

  return (
    <div>
      <Nav />
      <Toaster />
      <div className={styles.container}>
        <div className={styles.categoryContainer}>
          <h1 style={{ color: "white" }}>Add a Category</h1>
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
            placeholder="Category Name"
            className={styles.categoryInput}
            value={categoriesInput.name}
            onChange={(e) =>
              setCategoriesInput({
                ...categoriesInput,
                name: e.target.value,
              })
            }
          />
          {!loading ? (
            <button
              onClick={(e) => saveCategory(e)}
              className={styles.addCategoryButton}
            >
              Submit Category
            </button>
          ) : (
            <div className={styles.spinner}></div>
          )}
          <h1 style={{ color: "white" }}>Categories:</h1>
          <div className={styles.displayInfoWrapper}>
            {categories.map((category) => (
              <div key={category.id} className={styles.infoContainer}>
                <Modal
                  open={toEditCategory}
                  onClose={() => setToEditCategory(false)}
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
                      Edit Category
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
                          value={categoryToEdit.newName}
                          onChange={(e) =>
                            setCategoryToEdit({
                              ...categoryToEdit,
                              newName: e.target.value,
                            })
                          }
                          placeholder="New Category Name"
                        />
                        {!loading ? (
                          <div>
                            <button
                              onClick={() => updateCategory()}
                              className={styles.saveEditChangesButton}
                            >
                              Save
                            </button>
                            <button
                              className={styles.deleteItemButton}
                              onClick={() => deleteCategory()}
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
                  onClick={() => handleEditMode(category)}
                >
                  <h2 className={styles.category}>{category.name}</h2>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
