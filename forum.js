import { db } from './firebase-config.js';

let currentUser = null;

export function showForumView(user, container) {
    currentUser = user;
    container.innerHTML = `
        <div id="new-post-container"></div>
        <div id="posts-container"></div>
    `;

    renderNewPostForm(container.querySelector('#new-post-container'));
    renderPosts(container.querySelector('#posts-container'));
}

function renderNewPostForm(container) {
    if (!currentUser) {
        container.innerHTML = '<p>Please log in to create a post.</p>';
        return;
    }

    container.innerHTML = `
        <h4>Create a New Post</h4>
        <textarea id="post-text" placeholder="Your post..."></textarea>
        <button id="submit-post">Submit Post</button>
    `;

    container.querySelector('#submit-post').addEventListener('click', async () => {
        const postText = container.querySelector('#post-text').value;
        if (!postText) {
            alert('Post text cannot be empty.');
            return;
        }

        await firebase.firestore().collection('posts').add({
            authorId: currentUser.uid,
            authorName: currentUser.isAnonymous ? 'Anonymous' : currentUser.displayName || currentUser.email,
            text: postText,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        container.querySelector('#post-text').value = '';
        renderPosts(document.querySelector('#posts-container')); // Refresh posts
    });
}

async function renderPosts(container) {
    container.innerHTML = 'Loading posts...';
    const postsSnapshot = await firebase.firestore().collection('posts').orderBy('createdAt', 'desc').get();
    
    container.innerHTML = ''; // Clear loading message
    postsSnapshot.forEach(doc => {
        const post = doc.data();
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <div class="post-header">
                <span>by: ${post.authorName}</span> | 
                <span>${post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleString() : '...'}</span>
            </div>
            <div class="post-body"><p>${post.text}</p></div>
        `;
        container.appendChild(postElement);
    });
}