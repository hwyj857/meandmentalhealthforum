import { auth } from './firebase-config.js';

let authContainer;

export function initAuth() {
    authContainer = document.getElementById('auth-container');
    renderAuthButtons();
}

function renderAuthButtons() {
    authContainer.innerHTML = `
        <button id="google-login">Login with Google</button>
        <button id="anonymous-login">Login Anonymously</button>
        <button id="logout" style="display: none;">Logout</button>
    `;

    authContainer.querySelector('#google-login').addEventListener('click', async () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
    });

    authContainer.querySelector('#anonymous-login').addEventListener('click', async () => {
        await auth.signInAnonymously();
    });

    authContainer.querySelector('#logout').addEventListener('click', async () => {
        await auth.signOut();
    });
}

export function onAuthChange(callback) {
    auth.onAuthStateChanged(user => {
        if (user) {
            authContainer.querySelector('#google-login').style.display = 'none';
            authContainer.querySelector('#anonymous-login').style.display = 'none';
            authContainer.querySelector('#logout').style.display = 'inline-block';
        } else {
            authContainer.querySelector('#google-login').style.display = 'inline-block';
            authContainer.querySelector('#anonymous-login').style.display = 'inline-block';
            authContainer.querySelector('#logout').style.display = 'none';
        }
        callback(user);
    });
}