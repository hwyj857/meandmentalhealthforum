import { initAuth, onAuthChange } from './auth.js';
import { showForumView } from './forum.js';
import { showBlogView } from './blog.js';
import { showChatroomView } from './chatroom.js';
import { showCommunityView } from './community.js';

const homeTab = document.getElementById('home-tab');
const forumTab = document.getElementById('forum-tab');
const blogTab = document.getElementById('blog-tab');
const chatroomTab = document.getElementById('chatroom-tab');
const communityTab = document.getElementById('community-tab'); // FIX: Define communityTab

const homeContent = document.getElementById('home-content');
const forumContent = document.createElement('div');
forumContent.id = 'forum-content';
const blogContent = document.createElement('div');
blogContent.id = 'blog-content';
const chatroomContent = document.createElement('div');
chatroomContent.id = 'chatroom-content';
const communityContent = document.createElement('div'); // FIX: Define communityContent
communityContent.id = 'community-content';

document.getElementById('content-container').append(forumContent, blogContent, chatroomContent, communityContent); // FIX: Append communityContent

let currentUser = null;

// handle tab switching
function switchTab(activeTab) {
    console.log('switching tab to:', activeTab.id);
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active-tab'));
    activeTab.classList.add('active-tab');

    homeContent.style.display = 'none';
    forumContent.style.display = 'none';
    blogContent.style.display = 'none';
    chatroomContent.style.display = 'none';
    communityContent.style.display = 'none'; // FIX: Hide communityContent

    if (activeTab === homeTab) {
        homeContent.style.display = 'block';
    } else if (activeTab === forumTab) {
        forumContent.style.display = 'block';
        showForumView(currentUser, forumContent);
    } else if (activeTab === blogTab) {
        blogContent.style.display = 'block';
        showBlogView(currentUser, blogContent);
    } else if (activeTab === chatroomTab) {
        chatroomContent.style.display = 'block';
        showChatroomView(currentUser, chatroomContent);
    } else if (activeTab === communityTab) {
        communityContent.style.display = 'block';
        showCommunityView(currentUser, communityContent);
    }
}

// initial setup
document.addEventListener('DOMContentLoaded', () => {
    console.log('dom content loaded');
    initAuth();

    onAuthChange(user => {
        currentUser = user;
        console.log('auth state changed, user:', user);
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

    chatroomTab.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab(chatroomTab);
    });

    communityTab.addEventListener('click', (e) => { // FIX: Add event listener for communityTab
        e.preventDefault();
        switchTab(communityTab);
    });
});
