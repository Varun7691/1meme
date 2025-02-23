import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
	createUserWithEmailAndPassword,
	getAuth,
	sendEmailVerification,
	validatePassword,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
	Timestamp,
	collection,
	doc,
	getDocs,
	getFirestore,
	query,
	setDoc,
	where,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyDVMOTIrCVn8dMRMMeMHow5TtFLI0BF4lY",
	authDomain: "onememe-a9e5c.firebaseapp.com",
	projectId: "onememe-a9e5c",
	storageBucket: "onememe-a9e5c.firebasestorage.app",
	messagingSenderId: "458039086973",
	appId: "1:458039086973:web:e0e24911e6d6f467dac614",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
const auth = getAuth(app);

// Firestore
const firestore = getFirestore(app, "onememe");

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
						createdOn: Timestamp.fromDate(new Date()),
						display_picture:
							"https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWV6c3Z1anh0ODhobDc2dzhndGNudGlsdjZzZ2I2OGRsZ3BidmNoeCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/VIKa3CjZDCoymNcBY5/giphy.gif",
						down_posts: [],
						email: user.email,
						last_uploaded: Timestamp.fromDate(new Date()),
						profile_description: "",
						uid: user.uid,
						up_posts: [],
						userName: user.email.split("@")[0],
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
