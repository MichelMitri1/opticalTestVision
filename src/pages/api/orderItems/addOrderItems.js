import { db } from "@/helpers/firebase";
import { addDoc, doc, setDoc, collection } from "firebase/firestore";

export default async function handler(req, res) {
  const {
    id,
    orderNum,
    orderDate,
    orderDeliveryDate,
    orderMobileNum,
    orderCustomerName,
    orderAge,
    orderGender,
    orderLocality,
    orderDateOfBirth,
    orderCustomerNotes,
    orderTaxRule,
    orderTaxLedger,
  } = req.query;

  try {
    await addDoc(collection(db, "orderItems"), {
      id,
      orderNum,
      orderDate,
      orderDeliveryDate,
      orderMobileNum,
      orderCustomerName,
      orderAge,
      orderGender,
      orderLocality,
      orderDateOfBirth,
      orderCustomerNotes,
      orderTaxRule,
      orderTaxLedger,
    });

    return res.status(200).json({ message: "Document successfully written!" });
  } catch (error) {
    return res.status(500).json({ id });
  }
}
