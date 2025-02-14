// ToDo - if (document.readyState === "complete") { }// https://stackoverflow.com/a/8100952

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInAnonymously,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfBXlbUUWygLra3FdkbaMoX5PEaHAvxmg",
  authDomain: "one-5769e.firebaseapp.com",
  projectId: "one-5769e",
  storageBucket: "one-5769e.firebasestorage.app",
  messagingSenderId: "851668219021",
  appId: "1:851668219021:web:da67de784fd13188655ec4",
  measurementId: "G-ZEVQ84F4B0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
const auth = getAuth(app);

// Login - https://stackoverflow.com/a/74987210
const form = document.getElementById("login-form");
const email = document.getElementById("email");
const password = document.getElementById("password");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  signInWithEmailAndPassword(auth, email.value.trim(), password.value.trim())
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      localStorage.setItem("authenticatedUser", JSON.stringify(user));
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

document.getElementById("forgot-password-btn").onclick = function () {
  modal.style.display = "block";
};

var EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const validateEmail = (email) => {
  return String(email).toLowerCase().match(EMAIL_REGEX);
};

const forgotPasswordform = document.getElementById("forgot-password-form");
forgotPasswordform.addEventListener("submit", function (event) {
  event.preventDefault();
  const email = document.getElementById("forgot-password-email").value;
  if (validateEmail(email)) {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert("An email has been sent to " + email);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  } else {
    alert("Please enter a valid email.");
  }
});

// Get the modal
var modal = document.getElementById("myModal");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};
