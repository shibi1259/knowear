import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Firebase Cloud Messaging
export const firebaseCloudMessaging = {
  init: async () => {
    try {
      // Check if browser supports service workers
      if ('serviceWorker' in navigator) {
        const messaging = getMessaging(app);
        
        // Request notification permission
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Get registration token
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
          });
          
          return token;
        }
      }
      return null;
    } catch (error) {
      console.error('Firebase Cloud Messaging initialization error:', error);
      return null;
    }
  },
  
  getMessage: () => {
    const messaging = getMessaging(app);
    
    // Handle incoming messages
    onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      // You can add custom handling for foreground notifications here
      new Notification(payload.notification?.title || 'New Notification', {
        body: payload.notification?.body,
        // You can add icon, etc. as needed
      });
    });
  }
};

// Social Login Provider
export const googleProvider = new GoogleAuthProvider();