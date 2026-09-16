/* Firebase project settings for the planner's sync.

   These values are identifiers, not secrets — Firebase expects them to ship in
   the page. What actually protects your pages is the security rule in Firestore
   saying a signed-in account may only touch documents under its own uid, plus
   the list of domains allowed to sign in. Both are set in the Firebase console.

   Until real values land here, the planner runs exactly as before, with sync
   switched off and no error.
*/
window.PLANNER_FIREBASE = {
  apiKey: "PASTE_API_KEY",
  authDomain: "PASTE_PROJECT.firebaseapp.com",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_PROJECT.firebasestorage.app",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID"
};
