import { db, storage } from './firebase-config.js';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, doc, getDoc, updateDoc, limit, startAfter } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const categories = ['cats', 'mental health', 'general', 'help', 'loneliness', 'art', 'music'];
let currentUser = null;
let lastVisiblePost = null;
let isLoading = false;

async function renderPosts(category = null, searchTerm = null, container) {
    if (isLoading) return;
    isLoading = true;

    const postsContainer = container.querySelector('#posts-container');
    if (!lastVisiblePost) {
        postsContainer.innerHTML = ''; // Clear for new query

        // Render pinned posts first, but only in the general view
        if (!category && !searchTerm) {
            const pinnedQuery = query(collection(db, "posts"), where("pinned", "==", true));
            const pinnedSnapshot = await getDocs(pinnedQuery);
            for (const postDoc of pinnedSnapshot.docs) {
                const post = postDoc.data();
                const postEl = document.createElement('div');
                postEl.className = 'post pinned';
                postEl.innerHTML = `
                    <div class="post-header">
                        <b>PINNED POST</b><br>
                        <span class="post-number">#${post.postNumber}</span> | 
                        <span>category: ${post.category}</span> | 
                        <span>by: ${post.authorName}</span>
                    </div>
                    <div class="post-body"><p>${post.text}</p></div>
                    <div class="post-footer"><a href="#" class="comment-link" data-id="${postDoc.id}">view comments</a></div>
                    <div class="comments-container" id="comments-${postDoc.id}" style="display: none;"></div>
                `;
                postsContainer.appendChild(postEl);
            }
        }
    }

    let postQuery;
    const postsRef = collection(db, "posts");

    if (searchTerm) {
        const searchNumber = parseInt(searchTerm, 10);
        if (!isNaN(searchNumber)) {
            postQuery = query(postsRef, where("postNumber", "==", searchNumber));
        } else {
            postQuery = query(postsRef, where("text", ">=", searchTerm), where("text", "<=", searchTerm + '\uf8ff'));
        }
    } else if (category) {
        postQuery = query(postsRef, where("category", "==", category), orderBy("lastActivity", "desc"), limit(10));
    } else {
        postQuery = query(postsRef, orderBy("lastActivity", "desc"), limit(10));
    }

    if (lastVisiblePost && !searchTerm) {
        postQuery = query(postQuery, startAfter(lastVisiblePost));
    }

    const querySnapshot = await getDocs(postQuery);
    lastVisiblePost = querySnapshot.docs[querySnapshot.docs.length - 1];

    for (const postDoc of querySnapshot.docs) {
        const post = postDoc.data();
        const postEl = document.createElement('div');
        postEl.className = 'post';
        postEl.innerHTML = `
            <div class="post-header">
                <span class="post-number">#${post.postNumber}</span> | 
                <span>category: ${post.category}</span> | 
                <span>by: ${post.authorName}</span> | 
                <span>${new Date(post.createdAt.seconds * 1000).toLocaleString()}</span>
                ${currentUser && currentUser.isAdmin ? `<button class="pin-post" data-id="${postDoc.id}">pin</button>` : ''}
            </div>
            <div class="post-body">
                <p>${post.text}</p>
                ${post.imageUrl ? `<img src="${post.imageUrl}">` : ''}
            </div>
            <div class="post-footer">
                <a href="#" class="comment-link" data-id="${postDoc.id}">view comments (${post.commentCount || 0})</a>
            </div>
            <div class="comments-container" id="comments-${postDoc.id}" style="display: none;"></div>
        `;
        postsContainer.appendChild(postEl);
    }
    isLoading = false;
}

function renderNewPostForm(container) {
    const newPostContainer = container.querySelector('#new-post-container');
    if (!currentUser) {
        newPostContainer.innerHTML = '';
        return;
    }
    newPostContainer.innerHTML = `
        <h4>create a new post</h4>
        <select id="post-category">
            ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>
        <textarea id="post-text" placeholder="your post..."></textarea>
        <input type="file" id="post-image" accept="image/*">
        <button id="submit-post">submit</button>
    `;

    newPostContainer.querySelector('#submit-post').addEventListener('click', async () => {
        const text = newPostContainer.querySelector('#post-text').value;
        const category = newPostContainer.querySelector('#post-category').value;
        const imageFile = newPostContainer.querySelector('#post-image').files[0];

        if (!text) {
            alert('post text cannot be empty.');
            return;
        }

        let imageUrl = null; // Image uploads are temporarily disabled
        // if (imageFile) {
        //     const storageRef = ref(storage, `images/${Date.now()}_${imageFile.name}`);
        //     await uploadBytes(storageRef, imageFile);
        //     imageUrl = await getDownloadURL(storageRef);
        // }

        const postCounterRef = doc(db, "internal", "postCounter");
        const postCounterSnap = await getDoc(postCounterRef);
        const newPostNumber = (postCounterSnap.exists() ? postCounterSnap.data().count : 0) + 1;
        await updateDoc(postCounterRef, { count: newPostNumber });

        await addDoc(collection(db, "posts"), {
            postNumber: newPostNumber,
            authorName: currentUser.displayName,
            authorId: currentUser.uid,
            text,
            category,
            imageUrl,
            createdAt: serverTimestamp(),
            lastActivity: serverTimestamp(),
            commentCount: 0
        });

        newPostContainer.querySelector('#post-text').value = '';
        newPostContainer.querySelector('#post-image').value = '';
        lastVisiblePost = null; // Reset for refresh
        renderPosts(null, null, container);
    });
}

async function toggleComments(postId, container) {
    const commentsContainer = container.querySelector(`#comments-${postId}`);
    if (commentsContainer.style.display === 'none') {
        commentsContainer.style.display = 'block';
        commentsContainer.innerHTML = 'loading comments...';

        const commentsQuery = query(collection(db, `posts/${postId}/comments`), orderBy("createdAt", "asc"));
        const querySnapshot = await getDocs(commentsQuery);
        
        commentsContainer.innerHTML = ''; // Clear loading text

        querySnapshot.forEach(commentDoc => {
            const comment = commentDoc.data();
            const commentEl = document.createElement('div');
            commentEl.className = 'comment';
            commentEl.innerHTML = `
                <b>${comment.authorName}:</b>
                <p>${comment.text}</p>
            `;
            commentsContainer.appendChild(commentEl);
        });

        if (currentUser) {
            const newCommentForm = document.createElement('div');
            newCommentForm.innerHTML = `
                <textarea id="new-comment-${postId}" placeholder="add a comment..."></textarea>
                <button id="submit-comment-${postId}">submit</button>
            `;
            commentsContainer.appendChild(newCommentForm);

            commentsContainer.querySelector(`#submit-comment-${postId}`).addEventListener('click', async () => {
                const text = commentsContainer.querySelector(`#new-comment-${postId}`).value;
                if (!text) return;

                await addDoc(collection(db, `posts/${postId}/comments`), {
                    authorName: currentUser.displayName,
                    authorId: currentUser.uid,
                    text,
                    createdAt: serverTimestamp()
                });

                const postRef = doc(db, "posts", postId);
                const postSnap = await getDoc(postRef);
                const currentCount = postSnap.data().commentCount || 0;
                await updateDoc(postRef, { 
                    lastActivity: serverTimestamp(),
                    commentCount: currentCount + 1
                });

                toggleComments(postId, container); // Refresh comments
                toggleComments(postId, container);
            });
        }

    } else {
        commentsContainer.style.display = 'none';
    }
}

export function showForumView(user, container) {
    currentUser = user;
    let forumHtml = `
        <div id="forum-header">
            <div id="category-links">
                <a href="#" data-category="all">all</a>
                ${categories.map(c => `<a href="#" data-category="${c}">${c}</a>`).join('')}
            </div>
            <div id="search-container">
                <input type="text" id="search-input" placeholder="search by keyword or post #">
                <button id="search-button">search</button>
            </div>
        </div>
        <div id="posts-container"></div>
        <div id="new-post-container"></div>
    `;
    container.innerHTML = forumHtml;

    container.querySelector('#category-links').addEventListener('click', e => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const category = e.target.dataset.category === 'all' ? null : e.target.dataset.category;
            lastVisiblePost = null; // Reset pagination
            renderPosts(category, null, container);
        }
    });

    container.querySelector('#search-button').addEventListener('click', () => {
        const searchTerm = container.querySelector('#search-input').value;
        if (searchTerm) {
            lastVisiblePost = null; // Reset pagination
            renderPosts(null, searchTerm, container);
        }
    });

    container.querySelector('#posts-container').addEventListener('click', async e => {
        if (e.target.classList.contains('comment-link')) {
            e.preventDefault();
            toggleComments(e.target.dataset.id, container);
        }
        if (e.target.classList.contains('pin-post')) {
            e.preventDefault();
            const postId = e.target.dataset.id;
            const postRef = doc(db, "posts", postId);
            const postSnap = await getDoc(postRef);
            const isPinned = postSnap.data().pinned || false;
            await updateDoc(postRef, { pinned: !isPinned });
            lastVisiblePost = null; // Refresh
            renderPosts(null, null, container);
        }
    });

    window.onscroll = () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 2) {
            renderPosts(null, null, container); // Load more on scroll
        }
    };

    renderNewPostForm(container);
    renderPosts(null, null, container);
}   renderPosts(null, null, container);
}