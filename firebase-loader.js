const firebaseScripts = [
    'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js',
    'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js',
    'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'
];

function loadFirebase(callback) {
    let loadedCount = 0;
    firebaseScripts.forEach(url => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => {
            loadedCount++;
            if (loadedCount === firebaseScripts.length) {
                callback();
            }
        };
        document.head.appendChild(script);
    });
}
