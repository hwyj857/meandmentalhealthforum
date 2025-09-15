import { db } from './firebase-config.js';

let currentUser = null;

async function renderBlogPosts(postsContainer) {
    postsContainer.innerHTML = ''; // Clear previous posts
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

function renderNewBlogPostForm(formContainer, postsContainer) {
    if (currentUser && currentUser.isAdmin) {
        formContainer.innerHTML = `
            <h4>write a new blog post</h4>
            <input type="text" id="blog-title" placeholder="post title">
            <textarea id="blog-content" rows="10" placeholder="blog content..."></textarea>
            <button id="submit-blog-post">submit post</button>
        `;

        formContainer.querySelector('#submit-blog-post').addEventListener('click', async () => {
            const title = formContainer.querySelector('#blog-title').value;
            const content = formContainer.querySelector('#blog-content').value;

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
            
            formContainer.querySelector('#blog-title').value = '';
            formContainer.querySelector('#blog-content').value = '';
            renderBlogPosts(postsContainer); // Refresh posts list
        });
    } else {
        formContainer.innerHTML = '';
    }
}

export function showBlogView(user, container) {
    currentUser = user;
    container.innerHTML = `
        <h2>blog</h2>
        <div id="new-blog-post-container"></div>
        <div id="blog-posts-container"></div>
    `;

    const formContainer = container.querySelector('#new-blog-post-container');
    const postsContainer = container.querySelector('#blog-posts-container');

    renderNewBlogPostForm(formContainer, postsContainer);
    renderBlogPosts(postsContainer);
}