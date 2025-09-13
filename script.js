import { initAuth, onAuthChange } from './auth.js';
import { showForumView } from './forum.js';
import { showBlogView } from './blog.js';

const homeTab = document.getElementById('home-tab');
const forumTab = document.getElementById('forum-tab');
const blogTab = document.getElementById('blog-tab');

const homeContent = document.getElementById('home-content');
const forumContent = document.createElement('div');
forumContent.id = 'forum-content';
const blogContent = document.createElement('div');
blogContent.id = 'blog-content';

document.getElementById('content-container').append(forumContent, blogContent);

let currentUser = null;

// handle tab switching
function switchTab(activeTab) {
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active-tab'));
    activeTab.classList.add('active-tab');

    homeContent.style.display = 'none';
    forumContent.style.display = 'none';
    blogContent.style.display = 'none';

    if (activeTab === homeTab) {
        homeContent.style.display = 'block';
    } else if (activeTab === forumTab) {
        forumContent.style.display = 'block';
        showForumView(currentUser, forumContent);
    } else if (activeTab === blogTab) {
        blogContent.style.display = 'block';
        showBlogView(currentUser, blogContent);
    }
}

// initial setup
document.addEventListener('DOMContentLoaded', () => {
    initAuth();

    onAuthChange(user => {
        currentUser = user;
        // load initial view (home)
        switchTab(homeTab);
    });

    homeTab.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab(homeTab);
    });

    forumTab.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab(forumTab);
    });

    blogTab.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab(blogTab);
    });
});
