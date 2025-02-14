// Import the functions you need from the SDKs you need
import {
  FIREBASE_API_KEY,
  FIREBASE_APP_ID,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET
} from "@/utils/constants/globalConstants";
import { initializeApp } from "firebase/app";
import { getAuth, ParsedToken, signInWithCustomToken} from "firebase/auth";
import "firebase/auth";
import "firebase/functions";
import "firebase/firestore";
import { IUserPermissions } from "@/types/userPermissions/IUserPermissions";

// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export async function customGetAuth(asd: string) {
  const customToken = await signInWithCustomToken(auth, asd);
  customToken.user.getIdTokenResult();
  return customToken;
}

interface Claims extends ParsedToken {
  permissions: IUserPermissions["data"];
}

export const decodedClaims = async (token: string) => {
  //const decoded = await signInWithCustomToken(auth, token);
  const session: any = document.cookie.split(";").find((c) => c.startsWith(`${process.env.NEXT_PUBLIC_COOKIE_SESSION_NAME}=`));
  const responseAPI = await fetch(`/api/auth`, {
    headers: {
      Cookie: `${process.env.NEXT_PUBLIC_COOKIE_SESSION_NAME}=${session?.value}`
    }
  });
  const claims = await responseAPI.json();
  console.log("responseAPI", claims);

  return claims.data as Claims;
};

export default app;
