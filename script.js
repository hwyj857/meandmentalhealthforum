import { initAuth, onAuthChange } from './auth.js';
import { showForumView } from './forum.js';
import { showBlogView } from './blog.js';
import { showChatroomView } from './chatroom.js';
import { showCommunityView } from './community.js';
import { showMinecraftView } from './minecraft.js';

export function main() {
    // Get tab elements
    const homeTab = document.getElementById('home-tab');
    const forumTab = document.getElementById('forum-tab');
    const blogTab = document.getElementById('blog-tab');
    const chatroomTab = document.getElementById('chatroom-tab');
    const communityTab = document.getElementById('community-tab');
    const minecraftTab = document.getElementById('minecraft-tab');

    // Get content containers
    const homeContent = document.getElementById('home-content');
    const forumContent = document.createElement('div');
    forumContent.id = 'forum-content';
    const blogContent = document.createElement('div');
    blogContent.id = 'blog-content';
    const chatroomContent = document.createElement('div');
    chatroomContent.id = 'chatroom-content';
    const communityContent = document.createElement('div');
    communityContent.id = 'community-content';
    const minecraftContent = document.createElement('div');
    minecraftContent.id = 'minecraft-content';


    // Append dynamically created content containers to the main content area
    document.getElementById('content-container').append(forumContent, blogContent, chatroomContent, communityContent, minecraftContent);

    const categories = ['cats', 'mental health', 'general', 'help', 'loneliness', 'art', 'music', 'others'];
    let currentUser = null;

    // Function to handle tab switching and content display
    function switchTab(activeTab) {
        console.log('switching tab to:', activeTab.id);

        // Remove active class from all tabs
        document.querySelectorAll('nav a').forEach(a => a.classList.remove('active-tab'));
        // Add active class to the clicked tab
        activeTab.classList.add('active-tab');

        // Hide all content sections
        homeContent.style.display = 'none';
        forumContent.style.display = 'none';
        blogContent.style.display = 'none';
        chatroomContent.style.display = 'none';
        communityContent.style.display = 'none';
        minecraftContent.style.display = 'none';

        // Show the active content section and call its rendering function
        if (activeTab === homeTab) {
            homeContent.style.display = 'block';
        } else if (activeTab === forumTab) {
            forumContent.style.display = 'block';
                        showForumView(currentUser, forumContent, categories);
        } else if (activeTab === blogTab) {
            blogContent.style.display = 'block';
            showBlogView(currentUser, blogContent);
        } else if (activeTab === chatroomTab) {
            chatroomContent.style.display = 'block';
            showChatroomView(currentUser, chatroomContent);
        } else if (activeTab === communityTab) {
            communityContent.style.display = 'block';
            showCommunityView(currentUser, communityContent);
        } else if (activeTab === minecraftTab) {
            minecraftContent.style.display = 'block';
            showMinecraftView(minecraftContent);
        }
    }

    try {
        console.log('dom content loaded');
        initAuth(); // Initialize Firebase Authentication

        // Listen for authentication state changes
        onAuthChange(user => {
            currentUser = user;
            console.log('auth state changed, user:', user);
            // Load initial view (home) after auth state is known
            switchTab(homeTab);
        });

        // Add event listeners for navigation tabs
        homeTab.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default anchor link behavior
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

        communityTab.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(communityTab);
        });

        minecraftTab.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab(minecraftTab);
        });

        const themeToggle = document.getElementById('theme-toggle');
        const themeStyle = document.getElementById('theme-style');
        themeToggle.addEventListener('click', () => {
            if (themeStyle.getAttribute('href') === 'dark.css') {
                themeStyle.setAttribute('href', 'light.css');
            } else {
                themeStyle.setAttribute('href', 'dark.css');
            }
        });

    } catch (error) {
        console.error('Error during DOMContentLoaded setup:', error);
    }
}