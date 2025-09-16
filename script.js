import { initAuth, onAuthChange } from './auth.js';
import { showForumView } from './forum.js';

export function main() {
    const forumContent = document.getElementById('forum-content');

    initAuth();

    onAuthChange(user => {
        showForumView(user, forumContent);
    });
}