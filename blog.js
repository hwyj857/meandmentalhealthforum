import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const contentContainer = document.getElementById('content-container');
let currentUser = null;

async function renderBlogPosts() {
    const postsContainer = document.createElement('div');
    contentContainer.appendChild(postsContainer);

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

function renderNewBlogPostForm() {
    if (currentUser && currentUser.isAdmin) {
        const newPostContainer = document.createElement('div');
        newPostContainer.innerHTML = `
            <h4>write a new blog post</h4>
            <input type="text" id="blog-title" placeholder="post title">
            <textarea id="blog-content" rows="10" placeholder="blog content..."></textarea>
            <button id="submit-blog-post">submit post</button>
        `;
        contentContainer.appendChild(newPostContainer);

        document.getElementById('submit-blog-post').addEventListener('click', async () => {
            const title = document.getElementById('blog-title').value;
            const content = document.getElementById('blog-content').value;

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
            
            showBlogView(currentUser); // Refresh view
        });
    }
}

export function showBlogView(user, container) {
    currentUser = user;
    contentContainer.innerHTML = '<h2>blog</h2>';
    renderNewBlogPostForm();
    renderBlogPosts();
}
