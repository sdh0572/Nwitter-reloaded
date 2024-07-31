import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCkj3PGaquo6Oy-D8OogbD_NeVBx-t97HE",
  authDomain: "nwitter-reloaded-14fbd.firebaseapp.com",
  projectId: "nwitter-reloaded-14fbd",
  storageBucket: "nwitter-reloaded-14fbd.appspot.com",
  messagingSenderId: "177569340058",
  appId: "1:177569340058:web:96b0be1059772370af9d23"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);