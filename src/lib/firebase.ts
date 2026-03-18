import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBb2RAB-P2jM6dZO9kiRvsbDP1XqLxlBX8",
  authDomain: "healthflow-ai.firebaseapp.com",
  projectId: "healthflow-ai",
  storageBucket: "healthflow-ai.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);
