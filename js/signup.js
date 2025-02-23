import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
	createUserWithEmailAndPassword,
	getAuth,
	sendEmailVerification,
	validatePassword,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
	Timestamp,
	doc,
	getFirestore,
	setDoc,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { firebaseConfig } from './app_secrets.js'

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
const auth = getAuth(app);

// Firestore
const firestore = getFirestore(app, "nineone");

// Signup
const form = document.getElementById("signup-form");
const email = document.getElementById("email");
const password = document.getElementById("password");

const EMAIL_REGEX =
	/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const validateEmail = (email) => {
	return String(email).toLowerCase().match(EMAIL_REGEX);
};

form.addEventListener("submit", async (event) => {
	event.preventDefault();
	if (validateEmail(email.value)) {
		const status = await validatePassword(auth, password.value);
		if (status.isValid) {
			createUserWithEmailAndPassword(auth, email.value, password.value)
				.then(async (userCredential) => {
					// Signed in
					const user = userCredential.user;

					await setDoc(doc(firestore, "users", user.email), {
						display_picture:
							"https://firebasestorage.googleapis.com/v0/b/one-5769e.firebasestorage.app/o/user_placeholder.jpg?alt=media&token=356c6aa7-a290-4167-a0c6-e9f72bef8909",
						email: user.email,
						profile_description: "",
						uid: user.uid,
						userName: user.email.split("@")[0],
						createdOn: Timestamp.fromDate(new Date()),
					})
						.then((setPost) => {
							location.href = "home.html";
						})
						.catch((error) => {
							console.log(error);
						});

					sendEmailVerification(user)
						.then(() => {
							// Email verification sent!
							const msg = `An email verification link has been sent to ${user.email}`;
						})
						.catch((error) => {
							console.log(error);
						});
				})
				.catch((error) => {
					const errorCode = error.code;
					const errorMessage = error.message;
					alert(errorMessage);
				});
		} else {
			alert("Enter a password");
		}
	} else {
		alert("Enter a valid email");
	}
});

document.getElementById("cancel-sign-up").addEventListener("click", () => {
	window.history.go(-1);
	return false;
});
