import { db } from "@/helpers/firebase";
import { addDoc, doc, setDoc, collection } from "firebase/firestore";

export default async function handler(req, res) {
  const {
    name,
    city,
    number,
    email,
    itemSelectedId,
    clientOrderId,
    userId,
    amountPaid,
    payment,
    orderNumber,
  } = req.query;

  let parsedItemSelectedId;

  try {
    parsedItemSelectedId = JSON.parse(itemSelectedId);
  } catch (e) {
    return res.status(400).json({ error: "Invalid itemSelectedId format" });
  }

  try {
    await addDoc(collection(db, "orders", userId, "purchase"), {
      name,
      city,
      number,
      email,
      itemSelectedId: parsedItemSelectedId,
      clientOrderId,
      dateOfPurchase: Date.now(),
      userId,
      amountPaid,
      payment,
      orderNumber
    });

    return res.status(200).json({ message: "Document successfully written!" });
  } catch (error) {
    return res.status(500).json(req.query);
  }
}
