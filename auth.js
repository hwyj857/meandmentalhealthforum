import { auth } from './firebase-config.js';
import { GoogleAuthProvider, signInWithPopup, signInAnonymously, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const authContainer = document.getElementById('auth-container');
const adminEmails = ['hwyj857@gmail.com', 'krisz10@gmail.com', 'nagydavidmarcel@gmail.com'];

let authChangeCallback = null;

function renderAuthUI(user) {
    authContainer.innerHTML = '';
    if (user) {
        const displayName = user.isAnonymous ? `anon-${user.uid.substring(0, 6)}` : user.displayName;
        const welcome = document.createElement('span');
        welcome.textContent = `welcome, ${displayName}`;
        
        const logoutButton = document.createElement('button');
        logoutButton.textContent = 'logout';
        logoutButton.onclick = () => signOut(auth);

        authContainer.append(welcome, logoutButton);
    } else {
        const googleButton = document.createElement('button');
        googleButton.textContent = 'login with google';
        googleButton.onclick = () => signInWithPopup(auth, new GoogleAuthProvider());

        const anonButton = document.createElement('button');
        anonButton.textContent = 'login as anonymous';
        anonButton.onclick = () => signInAnonymously(auth);

        authContainer.append(googleButton, anonButton);
    }
}

export function initAuth() {
    onAuthStateChanged(auth, user => {
        let userProfile = null;
        if (user) {
            userProfile = {
                uid: user.uid,
                displayName: user.isAnonymous ? `anon-${user.uid.substring(0, 6)}` : user.displayName,
                email: user.email,
                isAnonymous: user.isAnonymous,
                isAdmin: adminEmails.includes(user.email)
            };
        }
        renderAuthUI(user);
        if (authChangeCallback) {
            authChangeCallback(userProfile);
        }
    });
}

export function onAuthChange(callback) {
    authChangeCallback = callback;
}
