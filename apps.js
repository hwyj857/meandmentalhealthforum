import { updateAuthUI } from './auth.js';
import { loadPosts } from './posts.js';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
  loadPosts();
});