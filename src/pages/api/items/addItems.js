import { db } from "@/helpers/firebase";
import { addDoc, doc, setDoc, collection } from "firebase/firestore";

export default async function handler(req, res) {
  const {
    itemName,
    itemPrice,
    itemId,
    categoryId,
    invoice,
    itemCode,
    itemWarehouse,
    itemSupplier,
    date,
    itemCost,
    itemQuantity,
    itemTax,
    itemGeneratedCode,
  } = req.query;

  try {
    await addDoc(collection(db, "items"), {
      itemName,
      itemPrice,
      itemId,
      categoryId,
      invoice,
      itemCode,
      itemWarehouse,
      itemSupplier,
      date,
      itemCost,
      itemQuantity,
      itemTax,
      itemGeneratedCode,
    });

    return res.status(200).json({ message: "Document successfully written!" });
  } catch (error) {
    return res.status(500).json({ id });
  }
}
