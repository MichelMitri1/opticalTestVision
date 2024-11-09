import { db } from "@/helpers/firebase";
import { addDoc, collection } from "firebase/firestore";

export default async function handler(req, res) {
  const { name, email, number, uid, dateOfBirth, city } = req.query;

  try {
    await addDoc(collection(db, "users"), {
      name,
      email,
      number,
      dateOfBirth,
      city,
      uid,
    });

    return res.status(200).json({ message: "Document successfully written!" });
  } catch (error) {
    return res.status(500).json({ error });
  }
}
