// ToDo - if (document.readyState === "complete") { }// https://stackoverflow.com/a/8100952

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
	getAuth,
	sendPasswordResetEmail,
	signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { firebaseConfig } from './app_secrets.js'

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
const auth = getAuth(app);

// Login - https://stackoverflow.com/a/74987210
const form = document.getElementById("login-form");
const email = document.getElementById("email");
const password = document.getElementById("password");

form.addEventListener("submit", (event) => {
	event.preventDefault();

	signInWithEmailAndPassword(auth, email.value.trim(), password.value.trim())
		.then((userCredential) => {
			// Signed in
			const user = userCredential.user;
			sessionStorage.setItem("isGuestVisit", false);
			localStorage.setItem("authenticatedUser", JSON.stringify(user));
			location.href = "home.html";
		})
		.catch((error) => {
			const errorCode = error.code;
			const errorMessage = error.message;
			alert(errorMessage);
		});
});

document.getElementById("signup-button").onclick = () => {
	location.href = "signup.html";
};

document.getElementById("guest-button").onclick = () => {
	sessionStorage.setItem("isGuestVisit", true);
	location.href = "home.html";
};

document.getElementById("forgot-password-btn").onclick = () => {
	modal.style.display = "block";
};

const EMAIL_REGEX =
	/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const validateEmail = (email) => {
	return String(email).toLowerCase().match(EMAIL_REGEX);
};

const forgotPasswordform = document.getElementById("forgot-password-form");
forgotPasswordform.addEventListener("submit", (event) => {
	event.preventDefault();
	const email = document.getElementById("forgot-password-email").value;
	if (validateEmail(email)) {
		sendPasswordResetEmail(auth, email)
			.then(() => {
				alert(`An email has been sent to ${email}`);
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
const modal = document.getElementById("myModal");

// Get the <span> element that closes the modal
const span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = () => {
	modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = (event) => {
	if (event.target === modal) {
		modal.style.display = "none";
	}
};
