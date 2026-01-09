import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyB6AVeb1J_K2uBlV_wSv6VmjAdEy_655Xo",
    authDomain: "cognia-715cd.firebaseapp.com",
    projectId: "cognia-715cd",
    storageBucket: "cognia-715cd.firebasestorage.app",
    messagingSenderId: "113123889216",
    appId: "1:113123889216:web:3b9997fd16c42511634fa5",
    measurementId: "G-4KJVFB1NPY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
export const auth = getAuth(app);

if (analytics) {
    console.log('Firebase Analytics initialized.');
}

export interface UserPreferences {
    theme: 'light' | 'dark';
    notifications: boolean;
    lastSync: number;
}

class FirebaseService {
    async saveUserProfile(profile: any) {
        if (!profile.email) return;
        try {
            await setDoc(doc(db, 'users', profile.email), {
                ...profile,
                updatedAt: Date.now()
            }, { merge: true });
            console.log('Profile synced to Firestore.');
        } catch (err) {
            console.error('Error syncing profile:', err);
        }
    }

    async getUserPreferences(email: string): Promise<UserPreferences | null> {
        try {
            const docRef = doc(db, 'userPreferences', email);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data() as UserPreferences;
            }
            return null;
        } catch (err) {
            console.error('Error fetching preferences:', err);
            return null;
        }
    }

    async saveUserPreferences(email: string, prefs: UserPreferences) {
        try {
            await setDoc(doc(db, 'userPreferences', email), {
                ...prefs,
                updatedAt: Date.now()
            }, { merge: true });
        } catch (err) {
            console.error('Error saving preferences:', err);
        }
    }
}

export const firebaseService = new FirebaseService();
