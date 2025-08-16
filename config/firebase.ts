// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA40CM5AU4mPtQVcaqnVXM-CXryDukeyco",
  authDomain: "littlesteps-9a8e1.firebaseapp.com",
  projectId: "littlesteps-9a8e1",
  storageBucket: "littlesteps-9a8e1.firebasestorage.app",
  messagingSenderId: "820328018457",
  appId: "1:820328018457:web:626856fefb1fc5e406f088"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

