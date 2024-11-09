"use client";
import React, { useEffect, useState } from "react";
import styles from "../items/viewItems.module.css";
import { useSelector } from "react-redux";
import Nav from "@/components/Nav/Nav";
import {
  collection,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { db } from "@/helpers/firebase";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { randomString } from "@/helpers/utils";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { Select } from "@mui/material";

function page() {
  const router = useRouter();
  const [basket, setBasket] = React.useState([]);
  const [isOutOfStock, setIsOutOfStock] = React.useState("");
  const [filteredCategories, setFilteredCategories] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [allItems, setAllItems] = React.useState([]);
  const { items } = useSelector((state) => state.items);
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [isPageInEditMode, setIsPageInEditMode] = React.useState(false);
  const [categoryToEdit, setCategoryToEdit] = React.useState({
    categoryNewName: "",
    categoryUid: "",
  });
  const [categoryEditor, setCategoryEditor] = React.useState(false);
  const [itemToEdit, setItemToEdit] = React.useState({
    itemNewName: "",
    itemNewPrice: "",
    itemNewCode: "",
    itemUniqueId: "",
    itemId: "",
  });
  const { categories } = useSelector((state) => state.categories);
  const handleClose = () => setOpen(false);
  const handleEditorClose = () => setEditorOpen(false);
  const handleCategoryEditorClose = () => setCategoryEditor(false);

  const basketItems = doc(db, "basket", "BCASLSzg2XsLMSlkVAjY");

  function addItemToBasket(item) {
    let currentItem = item;
    const pickedItem = allItems.filter(
      (itemPicked) => itemPicked.itemId === item.itemId
    );

    if (pickedItem) {
      const decreaseQuantity = pickedItem[0].itemQuantity - 1;
      if (decreaseQuantity < 0) {
        toast.error("Item out of stock!");
        return;
      }
      setAllItems((prevItems) =>
        prevItems.map((itemPicked) =>
          itemPicked.itemId === item.itemId
            ? (currentItem = { ...itemPicked, itemQuantity: decreaseQuantity })
            : itemPicked
        )
      );
    }
    const currentItemPendingOrder = {
      ...currentItem,
      pendingOrder: false,
      itemUniqueId: randomString(20),
    };
    setBasket((prev) => [...prev, currentItemPendingOrder]);

    toast.success("Item added to basket!");
  }

  function searchByItemName(e) {
    if (!e.target.value) {
      setAllItems(items);
      setFilteredCategories(categories);
      return;
    }
    const filteredItems = items.filter((item) =>
      item.itemName.toLowerCase().includes(e.target.value.toLowerCase())
    );

    setAllItems(filteredItems);

    const filteredCategoryIds = filteredItems.map((item) => item.categoryId);
    const filteredCategories = categories.filter((category) =>
      filteredCategoryIds.includes(category.id)
    );

    setFilteredCategories(filteredCategories);
  }

  function searchByItemCategory(e) {
    const getCategoryId = categories.filter((category) =>
      category.name.toLowerCase().includes(e.target.value)
    );
    setFilteredCategories(getCategoryId);
    // const filteredItems = items.filter((item) =>
    //   item.category.includes(e.target.value)
    // );
    // setAllItems(filteredItems);
  }

  function searchByItemCode(e) {
    if (!e.target.value) {
      setFilteredCategories(categories);
      return;
    }
    const filteredItems = items.filter((item) =>
      item.itemCode.includes(e.target.value)
    );
    setAllItems(filteredItems);

    const filteredCategoryIds = filteredItems.map((item) => item.categoryId);
    const filteredCategories = categories.filter((category) =>
      filteredCategoryIds.includes(category.id)
    );

    setFilteredCategories(filteredCategories);
  }

  function deletePickedItem(itemUniqueId, item) {
    let currentItem;
    const pickedItem = allItems.filter(
      (itemPicked) => itemPicked.itemId === item.itemId
    );

    const increaseQuantity = parseFloat(pickedItem[0].itemQuantity) + 1;

    const updatedItems = basket.filter(
      (itemDeleted) => itemDeleted.itemUniqueId !== itemUniqueId
    );

    setBasket(updatedItems);

    setAllItems((prevItems) =>
      prevItems.map((itemPicked) =>
        itemPicked.itemId === item.itemId
          ? (currentItem = { ...itemPicked, itemQuantity: increaseQuantity })
          : itemPicked
      )
    );

    toast.success("Item Deleted!");
  }

  async function deleteItemFromItems(itemClicked) {
    setLoading(true);
    try {
      const q = query(
        collection(db, "items"),
        where("itemId", "==", itemClicked.itemId)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("No document found");
        return;
      }
      const docRef = querySnapshot.docs[0].ref;
      await deleteDoc(docRef);
      toast.success("Item deleted!");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to delete item.");
    }
    setLoading(false);
  }

  function editItemPicked(item) {
    setOpen(true);
    setItemToEdit({
      itemNewName: item.itemName,
      itemNewCode: item.itemCode,
      itemUniqueId: item.itemUniqueId,
    });
  }

  function handleOutOfStockChange(event) {
    const isItemOutOfStock = event.target.value;
    setIsOutOfStock(event.target.value);
    if (isItemOutOfStock === "all") {
      setAllItems(items);
      setFilteredCategories(categories);
    } else if (isItemOutOfStock === "in stock") {
      setAllItems(items.filter((item) => item.itemQuantity > 0));
      const filteredCategoryIds = allItems.map((item) => item.categoryId);
      const filteredCategories = categories.filter((category) =>
        filteredCategoryIds.includes(category.id)
      );

      setFilteredCategories(filteredCategories);
    } else {
      setAllItems(items.filter((item) => item.itemQuantity <= 0));
      const filteredCategoryIds = allItems.map((item) => item.categoryId);
      const filteredCategories = categories.filter((category) =>
        filteredCategoryIds.includes(category.id)
      );

      setFilteredCategories(filteredCategories);
    }
  }

  function setNewPriceToItem() {
    const updatedBasket = basket.map((item) =>
      item.itemUniqueId === itemToEdit.itemUniqueId
        ? { ...item, itemPrice: itemToEdit.itemNewPrice }
        : item
    );

    setBasket(updatedBasket);
    toast.success("item price updated!");
    setOpen(false);
  }

  function editClickedItem(item) {
    setEditorOpen(true);
    setItemToEdit({
      itemNewName: item.itemName,
      itemNewPrice: item.itemPrice,
      itemNewCode: item.itemCode,
      itemId: item.itemId,
    });
  }

  async function saveNewInfo() {
    setLoading(true);
    const updatedBasket = basket.map((item) =>
      item.itemId === itemToEdit.itemId
        ? {
            ...item,
            itemName: itemToEdit.itemNewName,
            itemPrice: itemToEdit.itemNewPrice,
            itemCode: itemToEdit.itemNewCode,
          }
        : item
    );

    try {
      const q = query(
        collection(db, "items"),
        where("itemId", "==", itemToEdit.itemId)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("No matching document found!");
        return;
      }

      const docRef = querySnapshot.docs[0].ref;
      const updateData = {};

      if (itemToEdit.itemNewName) updateData.itemName = itemToEdit.itemNewName;
      if (itemToEdit.itemNewPrice)
        updateData.itemPrice = itemToEdit.itemNewPrice;
      if (itemToEdit.itemNewCode) updateData.itemCode = itemToEdit.itemNewCode;

      await updateDoc(docRef, updateData);

      setBasket(updatedBasket);
      toast.success("Item updated!");
      setEditorOpen(false);
    } catch (error) {
      toast.error("Failed to update item.");
    }
    setLoading(false);
  }

  async function saveNewCategoryInfo() {
    setLoading(true);
    const updatedCategories = categories.map((category) =>
      category.id === categoryToEdit.categoryUid
        ? { ...category, name: categoryToEdit.categoryNewName }
        : category
    );

    try {
      const q = query(
        collection(db, "categories"),
        where("id", "==", categoryToEdit.categoryUid)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("No matching document found!");
        return;
      }

      const docRef = querySnapshot.docs[0].ref;

      await updateDoc(docRef, {
        name: categoryToEdit.categoryNewName,
      });

      setFilteredCategories(updatedCategories);
      toast.success("Category updated!");
      setCategoryEditor(false);
    } catch (error) {
      toast.error("Failed to update category.");
    }
    setLoading(false);
  }

  async function deleteCategoryFromCategories() {
    setLoading(true);
    try {
      const q = query(
        collection(db, "categories"),
        where("id", "==", categoryToEdit.categoryUid)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("No matching document found!");
        return;
      }

      const updatedCategories = categories.filter(
        (category) => category.id !== categoryToEdit.categoryUid
      );

      const docRef = querySnapshot.docs[0].ref;
      await deleteDoc(docRef);

      setFilteredCategories(updatedCategories);
      toast.success("Category deleted!");
      setCategoryEditor(false);
    } catch (error) {
      toast.error("Failed to delete category. " + error);
    }
    setLoading(false);
  }

  async function proceedToCheckout() {
    setLoading(true);
    try {
      basket.map(async (item) => {
        const itemRef = doc(db, "items", item.id);
        if (itemRef) {
          await updateDoc(itemRef, {
            itemQuantity: item.itemQuantity,
          });
        }
      });
      await updateDoc(basketItems, {
        basket: basket,
      });
      router.push("/order");
      setLoading(false);
    } catch (error) {
      toast.error("Something went wrong.");
      setLoading(false);
    }
  }

  function editCategoryName(category) {
    setCategoryToEdit({
      categoryNewName: category.name,
      categoryUid: category.id,
    });
    setCategoryEditor(true);
  }

  useEffect(() => {
    setAllItems(items);
    allItems.forEach((item) => {
      const svg = document.getElementById(
        `barcode-${item.itemGeneratedCode.toString()}`
      );
      const displayValue = `${item.itemName} - $${item.itemPrice}`;
      if (svg) {
        JsBarcode(svg, displayValue, {
          format: "CODE128",
          displayValue: true,
          text: item.itemGeneratedCode.toString(),
          width: 1,
          fontSize: 18,
          zIndex: 1000,
        });
      }
    });
    setFilteredCategories(categories);
  }, [items]);

  return (
    <div className={styles.itemsContainer}>
      <Toaster />
      <Nav />
      <div className={styles.itemsWrapper}>
        <h1 style={{ textAlign: "center", color: "white" }}>
          Items Under Categories:
        </h1>
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
        <Box
          sx={{
            minWidth: 200,
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
              Filter Items
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={isOutOfStock}
              label="Age"
              onChange={handleOutOfStockChange}
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
              <MenuItem value={"all"} className="option">
                all
              </MenuItem>
              <MenuItem value={"in stock"} className="option">
                in stock
              </MenuItem>
              <MenuItem value={"out of stock"} className="option">
                out of stock
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
        <div className={styles.searchInputsWrapper}>
          <input
            type="text"
            placeholder="search by name"
            className={styles.searchInput}
            onChange={(e) => searchByItemName(e)}
          />
          <input
            type="text"
            placeholder="search by category"
            className={styles.searchInput}
            onChange={(e) => searchByItemCategory(e)}
          />
          <input
            type="text"
            placeholder="search by code"
            className={styles.searchInput}
            onChange={(e) => searchByItemCode(e)}
          />
        </div>
        <div className={styles.displayInfoWrapper}>
          {filteredCategories.map((category) => (
            <div key={category.id} className={styles.infoContainer}>
              <div className={styles.infoWrapper}>
                <h2
                  className={styles.category}
                  onClick={
                    isPageInEditMode ? () => editCategoryName(category) : null
                  }
                >
                  {category.name}
                </h2>
                <Modal
                  open={categoryEditor}
                  onClose={handleCategoryEditorClose}
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
                        className={styles.editPriceWrapper}
                      >
                        <input
                          type="text"
                          className={styles.priceInput}
                          value={categoryToEdit.categoryNewName}
                          onChange={(e) =>
                            setCategoryToEdit({
                              ...categoryToEdit,
                              categoryNewName: e.target.value,
                            })
                          }
                          placeholder="New Category Name"
                        />
                        {!loading ? (
                          <>
                            <button
                              onClick={() => saveNewCategoryInfo()}
                              className={styles.saveEditChangesButton}
                            >
                              Save
                            </button>
                            <button
                              className={styles.deleteItemButton}
                              onClick={() =>
                                deleteCategoryFromCategories(category)
                              }
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <div className={styles.spinner}></div>
                        )}
                      </Typography>
                    </div>
                  </Box>
                </Modal>
                <ul className={styles.itemListWrapper}>
                  {allItems
                    .filter((item) => item.categoryId === category.id)
                    .map((item, index) => (
                      <>
                        <a
                          className={styles.item}
                          key={index}
                          onClick={
                            isPageInEditMode
                              ? () => editClickedItem(item)
                              : () => addItemToBasket(item)
                          }
                        >
                          - {item.itemName} {item.itemCode} ${item.itemPrice},
                          quantity: {item.itemQuantity}
                        </a>
                        {/* <svg
                          id={`barcode-${item.itemGeneratedCode}`}
                          className={styles.barcode}
                        ></svg> */}
                        <Modal
                          open={editorOpen}
                          onClose={handleEditorClose}
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
                              Edit The Item
                            </Typography>
                            <div>
                              <Typography
                                id="modal-modal-description"
                                sx={{ mt: 2 }}
                                className={styles.editPriceWrapper}
                              >
                                <div>
                                  <p>New Name</p>
                                  <input
                                    type="text"
                                    className={styles.priceInput}
                                    value={itemToEdit.itemNewName}
                                    onChange={(e) =>
                                      setItemToEdit({
                                        ...itemToEdit,
                                        itemNewName: e.target.value,
                                      })
                                    }
                                    placeholder="New Name"
                                  />
                                </div>
                                <div>
                                  <p>New Code</p>
                                  <input
                                    type="text"
                                    className={styles.priceInput}
                                    value={itemToEdit.itemNewCode}
                                    onChange={(e) =>
                                      setItemToEdit({
                                        ...itemToEdit,
                                        itemNewCode: e.target.value,
                                      })
                                    }
                                    placeholder="New Code"
                                  />
                                </div>
                                <div>
                                  <p>New Price</p>
                                  <input
                                    type="text"
                                    className={styles.priceInput}
                                    value={itemToEdit.itemNewPrice}
                                    onChange={(e) =>
                                      setItemToEdit({
                                        ...itemToEdit,
                                        itemNewPrice: e.target.value,
                                      })
                                    }
                                    placeholder="New Price"
                                  />
                                </div>
                                {!loading ? (
                                  <>
                                    <button
                                      onClick={() => saveNewInfo()}
                                      className={styles.saveEditChangesButton}
                                    >
                                      Save
                                    </button>
                                    <button
                                      className={styles.deleteItemButton}
                                      onClick={() => deleteItemFromItems(item)}
                                    >
                                      {" "}
                                      Delete
                                    </button>
                                  </>
                                ) : (
                                  <div className={styles.spinner}></div>
                                )}
                              </Typography>
                            </div>
                          </Box>
                        </Modal>
                      </>
                    ))}
                </ul>
                <Modal
                  open={open}
                  onClose={handleClose}
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
                      Edit The Item Price
                    </Typography>
                    <div>
                      <Typography
                        id="modal-modal-description"
                        sx={{ mt: 2 }}
                        className={styles.editPriceWrapper}
                      >
                        <input
                          type="text"
                          className={styles.priceInput}
                          onChange={(e) =>
                            setItemToEdit({
                              ...itemToEdit,
                              itemNewPrice: e.target.value,
                            })
                          }
                          placeholder="New Price"
                        />
                        <button
                          onClick={() => setNewPriceToItem()}
                          className={styles.saveEditChangesButton}
                        >
                          Save
                        </button>
                      </Typography>
                    </div>
                  </Box>
                </Modal>
                <h3 className={styles.totalOfItems}>
                  {(() => {
                    const totalPrice = allItems
                      .filter((item) => item.categoryId === category.id)
                      .reduce(
                        (sum, item) =>
                          sum + Math.floor(item.itemPrice * item.itemQuantity),
                        0
                      );
                    return totalPrice > 0 ? "Total: $" + totalPrice : null;
                  })()}
                </h3>
              </div>
            </div>
          ))}
        </div>
        {basket.map((item) => (
          <div className={styles.itemsPickedWrapper}>
            <h2 className={styles.itemsPicked}>
              -{item.itemName} ${item.itemPrice}
            </h2>
            <div className={styles.buttonsWrapper}>
              <button
                className={styles.deletePickedItem}
                onClick={() => deletePickedItem(item.itemUniqueId, item)}
              >
                Delete
              </button>
              <button
                className={styles.editItemPicked}
                onClick={() => editItemPicked(item)}
              >
                Edit
              </button>
            </div>
          </div>
        ))}

        {!loading ? (
          <button
            onClick={() => proceedToCheckout()}
            className={styles.checkoutButton}
          >
            PROCEED TO CHECKOUT
          </button>
        ) : (
          <div className={styles.spinner}></div>
        )}

        {/* <button
          className={styles.clearBasketButton}
          onClick={() => clearBasket()}
        >
          CLEAR BASKET
        </button> */}
      </div>
    </div>
  );
}

export default page;
