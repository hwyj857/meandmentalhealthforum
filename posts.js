import { 
  db, storage, 
  collection, addDoc, query, where, getDocs, orderBy, limit, serverTimestamp, deleteDoc, doc, updateDoc,
  ref, uploadBytes, getDownloadURL 
} from './firebase-config.js';
import { auth } from './firebase-config.js';

// DOM elements
const postForm = document.getElementById('post-form');
const postsContainer = document.getElementById('posts-container');
const categoryLinks = document.querySelectorAll('nav ul li a');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const loadMoreBtn = document.getElementById('load-more-btn');

// Global variables
let currentCategory = 'all';
let lastVisible = null;
let isSearching = false;
let searchQuery = '';

// Admin emails
const ADMIN_EMAILS = [
  'hwyj857@gmail.com',
  'krisz10@gmail.com',
  'nagydavidmarcel@gmail.com'
];

// Initialize
loadPosts();

// Post form submission
postForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const user = auth.currentUser;
  if (!user) return;

  const category = document.getElementById('post-category').value;
  const title = document.getElementById('post-title').value;
  const content = document.getElementById('post-content').value;
  const imageFile = document.getElementById('post-image').files[0];

  let imageUrl = '';
  if (imageFile) {
    const storageRef = ref(storage, `posts/${Date.now()}_${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    imageUrl = await getDownloadURL(storageRef);
  }

  const postData = {
    category,
    title,
    content,
    imageUrl,
    author: user.email || 'anon',
    authorId: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isPinned: false,
    commentCount: 0,
    lastActivity: serverTimestamp()
  };

  try {
    await addDoc(collection(db, 'posts'), postData);
    postForm.reset();
    postsContainer.innerHTML = '';
    lastVisible = null;
    loadPosts();
  } catch (error) {
    console.error('Error adding post: ', error);
  }
});

// Category navigation
categoryLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    currentCategory = link.dataset.category;
    
    // Update active state
    categoryLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    // Reset and load posts
    postsContainer.innerHTML = '';
    lastVisible = null;
    isSearching = false;
    searchQuery = '';
    searchInput.value = '';
    loadPosts();
  });
});

// Search functionality
searchBtn.addEventListener('click', () => {
  searchQuery = searchInput.value.trim();
  if (searchQuery) {
    isSearching = true;
    postsContainer.innerHTML = '';
    lastVisible = null;
    loadPosts();
  } else {
    isSearching = false;
    postsContainer.innerHTML = '';
    lastVisible = null;
    loadPosts();
  }
});

// Load more posts
loadMoreBtn.addEventListener('click', () => {
  loadPosts();
});

// Load posts from Firestore
async function loadPosts() {
  let postsQuery;
  
  if (isSearching) {
    // Search by post number or keyword
    if (/^#\d+$/.test(searchQuery)) {
      const postNumber = parseInt(searchQuery.substring(1));
      const postRef = doc(db, 'posts', postNumber.toString());
      // Note: This is a simplified approach. In a real app, you'd need a different way to search by post number.
      postsQuery = query(collection(db, 'posts'), where('__name__', '==', postNumber.toString()));
    } else {
      postsQuery = query(
        collection(db, 'posts'),
        where('keywords', 'array-contains', searchQuery.toLowerCase()),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
    }
  } else if (currentCategory !== 'all') {
    // Filter by category
    postsQuery = query(
      collection(db, 'posts'),
      where('category', '==', currentCategory),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
  } else {
    // All posts
    postsQuery = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
  }

  try {
    const querySnapshot = await getDocs(postsQuery);
    
    if (querySnapshot.empty) {
      loadMoreBtn.style.display = 'none';
      if (postsContainer.innerHTML === '') {
        postsContainer.innerHTML = '<p>no posts found</p>';
      }
      return;
    }

    querySnapshot.forEach(doc => {
      const post = doc.data();
      displayPost(doc.id, post);
    });

    lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    loadMoreBtn.style.display = 'block';
  } catch (error) {
    console.error('Error loading posts: ', error);
  }
}

// Display a post in the UI
function displayPost(postId, post) {
  const user = auth.currentUser;
  const isAdmin = user && ADMIN_EMAILS.includes(user.email);
  
  // Generate random anon name if user is not logged in
  const authorName = post.author === 'anon' ? 
    `anon-${Math.floor(100000 + Math.random() * 900000)}` : 
    post.author.split('@')[0];
  
  const postElement = document.createElement('div');
  postElement.className = `post ${post.isPinned ? 'pinned' : ''}`;
  postElement.dataset.id = postId;
  
  const adminBadge = isAdmin ? '<span class="admin-badge">admin</span>' : '';
  const moderatorBadge = (user && user.email === post.author && !isAdmin) ? '<span class="moderator-badge">mod</span>' : '';
  
  postElement.innerHTML = `
    <div class="post-header">
      <span class="post-number">#${postId}</span>
      <span class="post-category">${post.category}</span>
    </div>
    <div class="post-title">${post.title}</div>
    <div class="post-content">${post.content}</div>
    ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image" alt="post image">` : ''}
    <div class="post-footer">
      <span>posted by ${authorName}${adminBadge}${moderatorBadge} • ${formatDate(post.createdAt?.toDate())}</span>
      <div class="post-actions">
        ${user ? '<button class="comment-btn">comment</button>' : ''}
        ${(user && (user.uid === post.authorId || isAdmin)) ? '<button class="delete-btn">delete</button>' : ''}
        ${isAdmin ? `<button class="pin-btn">${post.isPinned ? 'unpin' : 'pin'}</button>` : ''}
      </div>
    </div>
    <div class="comments-container" style="display:none;"></div>
  `;
  
  postsContainer.appendChild(postElement);
  
  // Add event listeners for buttons
  if (user) {
    const commentBtn = postElement.querySelector('.comment-btn');
    if (commentBtn) {
      commentBtn.addEventListener('click', () => toggleComments(postElement, postId));
    }
    
    const deleteBtn = postElement.querySelector('.delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => deletePost(postId));
    }
    
    const pinBtn = postElement.querySelector('.pin-btn');
    if (pinBtn) {
      pinBtn.addEventListener('click', () => togglePinPost(postId, post.isPinned));
    }
  }
}

// Toggle comments section
async function toggleComments(postElement, postId) {
  const commentsContainer = postElement.querySelector('.comments-container');
  const isVisible = commentsContainer.style.display !== 'none';
  
  if (isVisible) {
    commentsContainer.style.display = 'none';
    return;
  }
  
  // Load comments
  commentsContainer.innerHTML = '<p>loading comments...</p>';
  commentsContainer.style.display = 'block';
  
  const commentsQuery = query(
    collection(db, 'posts', postId, 'comments'),
    orderBy('createdAt', 'asc')
  );
  
  try {
    const querySnapshot = await getDocs(commentsQuery);
    commentsContainer.innerHTML = '';
    
    if (querySnapshot.empty) {
      commentsContainer.innerHTML = '<p>no comments yet</p>';
    } else {
      querySnapshot.forEach(doc => {
        const comment = doc.data();
        displayComment(commentsContainer, doc.id, comment);
      });
    }
    
    // Add comment form
    const commentForm = document.createElement('form');
    commentForm.className = 'comment-form';
    commentForm.innerHTML = `
      <input type="text" placeholder="add a comment..." required>
      <button type="submit">post</button>
    `;
    
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const content = commentForm.querySelector('input').value.trim();
      if (!content) return;
      
      const user = auth.currentUser;
      if (!user) return;
      
      const commentData = {
        content,
        author: user.email || 'anon',
        authorId: user.uid,
        createdAt: serverTimestamp()
      };
      
      try {
        // Add comment
        await addDoc(collection(db, 'posts', postId, 'comments'), commentData);
        
        // Update last activity
        await updateDoc(doc(db, 'posts', postId), {
          lastActivity: serverTimestamp(),
          commentCount: (post.commentCount || 0) + 1
        });
        
        // Reload comments
        toggleComments(postElement, postId);
        toggleComments(postElement, postId);
      } catch (error) {
        console.error('Error adding comment: ', error);
      }
    });
    
    commentsContainer.appendChild(commentForm);
  } catch (error) {
    console.error('Error loading comments: ', error);
    commentsContainer.innerHTML = '<p>error loading comments</p>';
  }
}

// Display a comment
function displayComment(container, commentId, comment) {
  const user = auth.currentUser;
  const isAdmin = user && ADMIN_EMAILS.includes(user.email);
  
  const authorName = comment.author === 'anon' ? 
    `anon-${Math.floor(100000 + Math.random() * 900000)}` : 
    comment.author.split('@')[0];
  
  const commentElement = document.createElement('div');
  commentElement.className = 'comment';
  commentElement.innerHTML = `
    <div class="comment-header">
      <span>${authorName}</span>
      <span>${formatDate(comment.createdAt?.toDate())}</span>
    </div>
    <div class="comment-content">${comment.content}</div>
  `;
  
  container.appendChild(commentElement);
}

// Delete a post
async function deletePost(postId) {
  if (!confirm('delete this post?')) return;
  
  try {
    // Delete post document
    await deleteDoc(doc(db, 'posts', postId));
    
    // Delete all comments (in a real app, you might want to handle this in a Cloud Function)
    const commentsQuery = query(collection(db, 'posts', postId, 'comments'));
    const querySnapshot = await getDocs(commentsQuery);
    
    const deletePromises = [];
    querySnapshot.forEach(doc => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(deletePromises);
    
    // Remove from UI
    document.querySelector(`.post[data-id="${postId}"]`)?.remove();
  } catch (error) {
    console.error('Error deleting post: ', error);
    alert('error deleting post');
  }
}

// Toggle pin status of a post
async function togglePinPost(postId, isPinned) {
  try {
    await updateDoc(doc(db, 'posts', postId), {
      isPinned: !isPinned
    });
    
    // Reload the post
    const postElement = document.querySelector(`.post[data-id="${postId}"]`);
    if (postElement) {
      postElement.classList.toggle('pinned');
      const pinBtn = postElement.querySelector('.pin-btn');
      if (pinBtn) {
        pinBtn.textContent = isPinned ? 'pin' : 'unpin';
      }
    }
  } catch (error) {
    console.error('Error toggling pin: ', error);
  }
}

// Format date
function formatDate(date) {
  if (!date) return '';
  
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Auto-delete old posts (this would ideally be a Firebase Cloud Function)
async function checkOldPosts() {
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
  const oldPostsQuery = query(
    collection(db, 'posts'),
    where('lastActivity', '<', fourHoursAgo),
    where('isPinned', '==', false)
  );
  
  try {
    const querySnapshot = await getDocs(oldPostsQuery);
    querySnapshot.forEach(async doc => {
      await deleteDoc(doc.ref);
    });
  } catch (error) {
    console.error('Error deleting old posts: ', error);
  }
}

// Run auto-delete every hour
setInterval(checkOldPosts, 60 * 60 * 1000);
checkOldPosts();