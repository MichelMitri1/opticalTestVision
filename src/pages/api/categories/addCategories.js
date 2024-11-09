import { db } from "@/helpers/firebase";
import { addDoc, doc, setDoc, collection } from "firebase/firestore";

export default async function handler(req, res) {
  const { name, id } = req.query;

  try {
    await addDoc(collection(db, "categories"), {
      name,
      id,
    });

    return res.status(200).json({ message: "Document successfully written!" });
  } catch (error) {
    return res.status(500).json({ error });
  }
}
