import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';
import pkg from 'firebase-admin';
const {credential} = pkg;
import serviceAccount from '$lib/server/webrtc-7a9af-firebase-adminsdk-2fyvs-099cb59e18.json';



const firebaseConfig = {
  credential: credential.cert(serviceAccount)
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
