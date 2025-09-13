import { db } from './firebase-config.js';
import { collection, query, orderBy, limitToLast, onSnapshot, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let currentUser = null;

function renderChat(container) {
    container.innerHTML = `
        <h2>real-time chat</h2>
        <div id="chat-messages"></div>
        <div id="chat-input-container"></div>
    `;
    // more to come
}

import { db } from './firebase-config.js';
import { collection, query, orderBy, limitToLast, onSnapshot, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let currentUser = null;
const dingSound = new Audio('ding.mp3'); // You will need to add a 'ding.mp3' file to your project folder

function renderChatInput(container) {
    if (!currentUser) {
        container.innerHTML = '<p>please log in to chat.</p>';
        return;
    }

    container.innerHTML = `
        <input type="text" id="custom-name" placeholder="your name (optional)">
        <input type="text" id="chat-message-input" placeholder="type a message...">
        <button id="send-chat-message">send</button>
    `;

    container.querySelector('#send-chat-message').addEventListener('click', () => {
        const messageInput = container.querySelector('#chat-message-input');
        const customNameInput = container.querySelector('#custom-name');
        const text = messageInput.value;
        let authorName = customNameInput.value || currentUser.displayName;

        if (!text) return;

        addDoc(collection(db, "chatroom"), {
            text,
            authorName,
            createdAt: serverTimestamp()
        });

        messageInput.value = '';
    });
}

function listenForMessages(container) {
    const chatQuery = query(collection(db, "chatroom"), orderBy("createdAt", "desc"), limitToLast(40));

    onSnapshot(chatQuery, (snapshot) => {
        const messagesContainer = container.querySelector('#chat-messages');
        messagesContainer.innerHTML = '';
        const messages = [];
        snapshot.forEach(doc => messages.push(doc.data()));
        
        // since the query is desc, we reverse it to show oldest first
        messages.reverse().forEach(msg => {
            const msgEl = document.createElement('div');
            msgEl.className = 'chat-message';
            msgEl.innerHTML = `<b>${msg.authorName}:</b> ${msg.text}`;
            messagesContainer.appendChild(msgEl);
        });

        // Play sound if the new message isn't from the current user
        if (messages.length > 0 && messages[messages.length - 1].authorName !== currentUser.displayName) {
            dingSound.play().catch(e => console.log("sound play failed. user interaction needed."));
        }

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
}

export function showChatroomView(user, container) {
    currentUser = user;
    container.innerHTML = `
        <h2>real-time chat</h2>
        <div id="chat-messages"></div>
        <div id="chat-input-container"></div>
    `;

    const messagesContainer = document.getElementById('chat-messages');
    const inputContainer = document.getElementById('chat-input-container');

    renderChatInput(inputContainer);
    listenForMessages(messagesContainer);
}

