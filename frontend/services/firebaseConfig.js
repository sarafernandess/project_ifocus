// services/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAWgREkR9PUOciHCnpGg4Ag0NAVwLjvqiw",
  authDomain: "my-app-ifocus.firebaseapp.com",
  projectId: "my-app-ifocus",
  storageBucket: "my-app-ifocus.appspot.com",
  messagingSenderId: "982876115962",
  appId: "1:982876115962:web:c327175f06708886454a43",
  measurementId: "G-LQDLGJSGWG"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
// Web: guarda a sessão no localStorage (evita 401 logo após login/refresh)
if (typeof document !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(() => {});
}

export const db = getFirestore(app);
export const storage = getStorage(app);
