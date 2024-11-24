import { getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '$lib/firebase/credential.js';

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
