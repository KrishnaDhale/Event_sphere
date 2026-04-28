document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. PRE-REGISTER DEFAULT USER ---
    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (!users.find(u => u.email === "omkarshelke2006@gmail.com")) {
        users.push({ name: "Omkar Shelke", email: "omkarshelke2006@gmail.com", password: "123456" });
        localStorage.setItem('users', JSON.stringify(users));
    }

    // --- 2. AUTO-REDIRECT IF ALREADY LOGGED IN ---
    const currentUser = localStorage.getItem('currentUser');
    const path = window.location.pathname;
    
    // If user is logged in AND tries to access login/signup pages, send them to home
    if (currentUser && (path.includes('index.html') || path.includes('signup.html') || path.endsWith('/'))) {
        window.location.href = 'home.html';
        return; // Stop further execution on this page
    }

    // --- 3. LOGIN LOGIC ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const currentUsers = JSON.parse(localStorage.getItem('users')) || [];
            const user = currentUsers.find(u => u.email === email && u.password === password);

            if (user) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                window.location.href = 'home.html';
            } else {
                alert('Invalid email or password!');
            }
        });
    }

    // --- 4. SIGNUP LOGIC ---
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            let currentUsers = JSON.parse(localStorage.getItem('users')) || [];
            
            if (currentUsers.find(u => u.email === email)) {
                alert('Email already registered!');
                return;
            }

            currentUsers.push({ name, email, password });
            localStorage.setItem('users', JSON.stringify(currentUsers));
            alert('Registration successful! Please login.');
            window.location.href = 'index.html';
        });
    }
});

// --- 5. GLOBAL AUTH FUNCTIONS ---
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function checkAuth() {
    if (!localStorage.getItem('currentUser')) {
        window.location.href = 'index.html';
    }
}