// ToDo - if (document.readyState === "complete") { }// https://stackoverflow.com/a/8100952

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js"

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBfBXlbUUWygLra3FdkbaMoX5PEaHAvxmg",
    authDomain: "one-5769e.firebaseapp.com",
    projectId: "one-5769e",
    storageBucket: "one-5769e.firebasestorage.app",
    messagingSenderId: "851668219021",
    appId: "1:851668219021:web:da67de784fd13188655ec4",
    measurementId: "G-ZEVQ84F4B0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
const auth = getAuth(app);

// Login - https://stackoverflow.com/a/74987210
const form = document.getElementById('login-form');
const email = document.getElementById('email');
const password = document.getElementById('password');

form.addEventListener('submit', function (event) {
    event.preventDefault();

    signInWithEmailAndPassword(auth, email.value.trim(), password.value.trim())
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            localStorage.setItem('authenticatedUser', JSON.stringify(user));
            location.href = "home.html";
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorMessage);
        });
});

document.getElementById("signup-button").onclick = function () {
    location.href = "signup.html";
};

document.getElementById("guest-button").onclick = function () {
    location.href = "home.html";
};