import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { StorageRequestData, FormData } from "../types";

const COLLECTION_NAME = "storageRequests";

export const submitStorageRequest = async (formData: FormData, duration: string): Promise<string> => {
  try {
    const payload: StorageRequestData = {
      ...formData,
      duration,
      status: 'pending',
      timestamp: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};