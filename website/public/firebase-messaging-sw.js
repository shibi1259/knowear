// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// Initialize Firebase app
firebase.initializeApp({
  apiKey: "AIzaSyDk65x7PVOYn25PY8kQlgW649x3Ic_d5d4",
  authDomain: "knowear-ba71e.firebaseapp.com",
  projectId: "knowear-ba71e",
  messagingSenderId: "880587846010",
  appId: "1:880587846010:web:547b476d2739c26d2726c3"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    // You can add an icon here
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});