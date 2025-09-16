import { 
  auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from './firebase-config.js';

// DOM elements
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const closeButtons = document.querySelectorAll('.close');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// Open modals
loginBtn.addEventListener('click', () => {
  loginModal.style.display = 'block';
});

registerBtn.addEventListener('click', () => {
  registerModal.style.display = 'block';
});

// Close modals
closeButtons.forEach(button => {
  button.addEventListener('click', () => {
    loginModal.style.display = 'none';
    registerModal.style.display = 'none';
  });
});

// Close when clicking outside modal
window.addEventListener('click', (event) => {
  if (event.target === loginModal) {
    loginModal.style.display = 'none';
  }
  if (event.target === registerModal) {
    registerModal.style.display = 'none';
  }
});

// Login
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      loginModal.style.display = 'none';
      updateAuthUI();
    })
    .catch(error => {
      alert(error.message);
    });
});

// Register
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      registerModal.style.display = 'none';
      updateAuthUI();
    })
    .catch(error => {
      alert(error.message);
    });
});

// Logout
logoutBtn.addEventListener('click', () => {
  signOut(auth).then(() => {
    updateAuthUI();
  }).catch(error => {
    alert(error.message);
  });
});

// Update UI based on auth state
export function updateAuthUI() {
  const user = auth.currentUser;
  const postFormContainer = document.getElementById('post-form-container');

  if (user) {
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    logoutBtn.style.display = 'block';
    postFormContainer.style.display = 'block';
  } else {
    loginBtn.style.display = 'block';
    registerBtn.style.display = 'block';
    logoutBtn.style.display = 'none';
    postFormContainer.style.display = 'none';
  }
}

// Initialize auth state listener
auth.onAuthStateChanged(user => {
  updateAuthUI();
});