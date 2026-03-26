import { getApp, getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBau6L44q6k5gp_ghJ98wvOpHgrsHYMBec",
  authDomain: "solar-esportes-ai.firebaseapp.com",
  projectId: "solar-esportes-ai",
  storageBucket: "solar-esportes-ai.firebasestorage.app",
  messagingSenderId: "660482815927",
  appId: "1:660482815927:web:4cbb4e8f5e5f5fbe46da32",
};

export const firebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
