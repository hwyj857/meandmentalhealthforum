import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let currentUser = null;

async function renderBlogPosts(container) {
    const postsContainer = document.createElement('div');
    container.appendChild(postsContainer);

    const blogQuery = query(collection(db, "blogPosts"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(blogQuery);

    querySnapshot.forEach(doc => {
        const post = doc.data();
        const postEl = document.createElement('div');
        postEl.className = 'post'; // reuse forum post styling
        postEl.innerHTML = `
            <h3>${post.title}</h3>
            <div class="post-header">by ${post.authorName} on ${new Date(post.createdAt.seconds * 1000).toLocaleDateString()}</div>
            <div class="post-body">${post.content}</div>
        `;
        postsContainer.appendChild(postEl);
    });
}

function renderNewBlogPostForm(container) {
    if (currentUser && currentUser.isAdmin) {
        const newPostContainer = document.createElement('div');
        newPostContainer.innerHTML = `
            <h4>write a new blog post</h4>
            <input type="text" id="blog-title" placeholder="post title">
            <textarea id="blog-content" rows="10" placeholder="blog content..."></textarea>
            <button id="submit-blog-post">submit post</button>
        `;
        container.appendChild(newPostContainer);

        newPostContainer.querySelector('#submit-blog-post').addEventListener('click', async () => {
            const title = newPostContainer.querySelector('#blog-title').value;
            const content = newPostContainer.querySelector('#blog-content').value;

            if (!title || !content) {
                alert('title and content cannot be empty.');
                return;
            }

            await addDoc(collection(db, "blogPosts"), {
                authorName: currentUser.displayName,
                authorId: currentUser.uid,
                title,
                content,
                createdAt: serverTimestamp()
            });
            
            showBlogView(currentUser, container); // Refresh view
        });
    }
}

export function showBlogView(user, container) {
    currentUser = user;
    container.innerHTML = '<h2>blog</h2>';
    renderNewBlogPostForm(container);
    renderBlogPosts(container);
}