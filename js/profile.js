import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
	getAuth,
	onAuthStateChanged,
	signOut,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
	Timestamp,
	collection,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	orderBy,
	query,
	setDoc,
	updateDoc,
	where,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import {
	getDownloadURL,
	getStorage,
	ref,
	uploadBytesResumable,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-storage.js";

let user = "";

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
// Firestore
const firestore = getFirestore(app, "nineone");

onAuthStateChanged(auth, async (_user) => {
	if (_user) {
		user = _user;
		// Get user data
		const q = query(
			collection(firestore, "users"),
			where("uid", "==", user.uid),
		);
		const querySnapshot = await getDocs(q);
		for (const _doc of querySnapshot.docs) {
			const user = _doc.data();

			// Set userName
			document.getElementById("welcome-user").innerHTML = user.userName;

			// Set Profile Description
			document.getElementById("profile-description").innerHTML =
				user.profile_description;

			// Set Display picture
			document.getElementById("user-display-picture").src =
				user.display_picture;

			const oldDate = user.createdOn.toDate();
			const newDate = new Date();

			const diffTime = Math.abs(oldDate - newDate);
			const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
			document.getElementById("active-since").innerHTML =
				`Active for: ${diffDays} day(s)`;

			let listHtml = "";

			// Get user posts
			const userPostsQuery = query(
				collection(firestore, "posts"),
				where("created_by", "==", user.email),
				orderBy("created_on", "desc"),
			);
			const userPostsQueryQuerySnapshot = await getDocs(userPostsQuery);
			for (const _post of userPostsQueryQuerySnapshot.docs) {
				const post = _post.data();

				listHtml += `<li class = "post-item"><div class="post-title-container"><label class = "post-title">${
					post.post_title
				}</label></div><img src="${
					post.post_image_path
				}"id='user-display-picture'/><br/><div class="vote-date-container"><div class="vote-container"><label class="post-up-btn">${
					post.up_count
				}<i class="fa fa-play fa-rotate-270 fa-xl"></i></label> <label class="post-down-btn"> ${
					post.down_count
				}<i class="fa fa-play fa-rotate-90 fa-xl"></i></label></div> <label class="post-age">${getPostAgeString(
					post.created_on.toDate(),
				)} </label></div></li>`;

				document.getElementById("my-posts-list").innerHTML = listHtml;
			}

			let updVotedPostsListHtml = "";

			// Get user's upvoted posts
			const upVotedPostsArray = user.up_posts;
			const upVotedPostsQuery = query(
				collection(firestore, "posts"),
				where("__name__", "in", upVotedPostsArray),
				orderBy("created_on", "desc"),
			); // https://stackoverflow.com/a/62150539
			const upVotedPostsQuerySnapshot = await getDocs(upVotedPostsQuery);
			for (const _post of upVotedPostsQuerySnapshot.docs) {
				const post = _post.data();

				updVotedPostsListHtml += `<li class = "post-item"><div class="post-title-container"><label class = "post-title">${
					post.post_title
				}</label></div><img src="${
					post.post_image_path
				}"id='user-display-picture'/><br/><div class="vote-date-container"><div class="vote-container"><label class="post-up-btn selected">${
					post.up_count
				}<i class="fa fa-play fa-rotate-270 fa-xl"></i></label> <label class="post-down-btn unselected"> ${
					post.down_count
				}<i class="fa fa-play fa-rotate-90 fa-xl"></i></label></div> <label class="post-age">${getPostAgeString(
					post.created_on.toDate(),
				)} </label></div></li>`;

				document.getElementById("my-upvoted-posts-list").innerHTML =
					updVotedPostsListHtml;
			}
		}
	} else {
		console.log("onAuthStateChanged - User Signed out");
		location.href = "index.html";
	}
});

function getPostAgeString(_postDate, referenceDate = new Date()) {
	const postDate = new Date(_postDate);

	const diffMs = referenceDate - postDate; // Difference in milliseconds
	const minutes = Math.floor(diffMs / (1000 * 60));
	const hours = Math.floor(diffMs / (1000 * 60 * 60));
	const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
	const weeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
	const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));

	if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
	if (weeks > 0) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
	if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
	if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
	if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

	return "Just now";
}

const myPostsButton = document.getElementById("my-posts-button");
const myCommentsButton = document.getElementById("my-comments-button");
const myUpvotesButton = document.getElementById("my-upvotes-button");
const uploadPostsButton = document.getElementById("upload-posts-button");
const uploadNewPostsButton = document.getElementById("upload-new-posts-button");

// Passing parameter to a function - https://stackoverflow.com/a/12024498
myPostsButton.addEventListener(
	"click",
	() => {
		showHideTabs(1);
	},
	false,
);
myCommentsButton.addEventListener(
	"click",
	() => {
		showHideTabs(2);
	},
	false,
);
myUpvotesButton.addEventListener(
	"click",
	() => {
		showHideTabs(3);
	},
	false,
);
uploadPostsButton.addEventListener(
	"click",
	() => {
		showHideTabs(4);
	},
	false,
);
uploadNewPostsButton.addEventListener(
	"click",
	() => {
		showHideTabs(5);
	},
	false,
);

function showHideTabs(containerNumber) {
	const myPostsContainer = document.getElementById("my-posts-container");
	const myCommentsContainer = document.getElementById("my-comments-container");
	const myUpvotesContainer = document.getElementById("my-upvotes-container");
	const uploadPostsContainer = document.getElementById(
		"upload-posts-container",
	);
	const uploadNewPostsContainer = document.getElementById(
		"upload-new-posts-container",
	);
	switch (containerNumber) {
		case 1:
			myPostsContainer.style.display = "block";
			myCommentsContainer.style.display = "none";
			myUpvotesContainer.style.display = "none";
			uploadPostsContainer.style.display = "none";
			uploadNewPostsContainer.style.display = "none";

			myPostsButton.className = "tab-selected";
			myCommentsButton.className = "tab-unselected";
			myUpvotesButton.className = "tab-unselected";
			uploadPostsButton.className = "tab-upload-unselected";
			uploadNewPostsButton.className = "tab-unselected";
			break;
		case 2:
			myPostsContainer.style.display = "none";
			myCommentsContainer.style.display = "block";
			myUpvotesContainer.style.display = "none";
			uploadPostsContainer.style.display = "none";
			uploadNewPostsContainer.style.display = "none";

			myPostsButton.className = "tab-unselected";
			myCommentsButton.className = "tab-selected";
			myUpvotesButton.className = "tab-unselected";
			uploadPostsButton.className = "tab-upload-unselected";
			uploadNewPostsButton.className = "tab-unselected";
			break;
		case 3:
			myPostsContainer.style.display = "none";
			myCommentsContainer.style.display = "none";
			myUpvotesContainer.style.display = "block";
			uploadPostsContainer.style.display = "none";
			uploadNewPostsContainer.style.display = "none";
			uploadNewPostsButton.className = "tab-unselected";

			myPostsButton.className = "tab-unselected";
			myCommentsButton.className = "tab-unselected";
			myUpvotesButton.className = "tab-selected";
			uploadPostsButton.className = "tab-upload-unselected";
			uploadNewPostsButton.className = "tab-unselected";
			break;
		case 4:
			myPostsContainer.style.display = "none";
			myCommentsContainer.style.display = "none";
			myUpvotesContainer.style.display = "none";
			uploadPostsContainer.style.display = "block";
			uploadNewPostsContainer.style.display = "none";

			myPostsButton.className = "tab-unselected";
			myCommentsButton.className = "tab-unselected";
			myUpvotesButton.className = "tab-unselected";
			uploadPostsButton.className = "tab-upload-selected";
			uploadNewPostsButton.className = "tab-unselected";
			break;
		case 5:
			myPostsContainer.style.display = "none";
			myCommentsContainer.style.display = "none";
			myUpvotesContainer.style.display = "none";
			uploadPostsContainer.style.display = "none";
			uploadNewPostsContainer.style.display = "block";

			myPostsButton.className = "tab-unselected";
			myCommentsButton.className = "tab-unselected";
			myUpvotesButton.className = "tab-unselected";
			uploadPostsButton.className = "tab-upload-unselected";
			uploadNewPostsButton.className = "tab-selected";
			break;
		default:
			myPostsContainer.style.display = "block";
			myCommentsContainer.style.display = "none";
			myUpvotesContainer.style.display = "none";
			uploadPostsContainer.style.display = "none";
			uploadNewPostsContainer.style.display = "none";

			myPostsButton.className = "tab-selected";
			myCommentsButton.className = "tab-unselected";
			myUpvotesButton.className = "tab-unselected";
			uploadPostsButton.className = "tab-unselected";
			uploadNewPostsButton.className = "tab-unselected";
	}
}
showHideTabs(1);

let uploadPostBase64 = "";
let selectedFileName = "";
let postFileName = "";
document
	.getElementById("upload-post-image-file-selector")
	.addEventListener("change", function () {
		const file = this.files[0];
		const reader = new FileReader();
		selectedFileName = file.name;

		reader.onload = (event) => {
			uploadPostBase64 = event.target.result;
			document.getElementById("upload-post-image-preview").src =
				uploadPostBase64;
			document.getElementById("upload-post-image-preview").style.display =
				"block";
		};

		reader.readAsDataURL(file);
	});

function canPost(oldDate, newDate) {
	const oldTime = new Date(oldDate).getTime();
	const newTime = new Date(newDate).getTime();

	const diffInMs = Math.abs(oldTime - newTime);
	const fifteenMinsInMs = 15 * 60 * 1000;

	return diffInMs > fifteenMinsInMs;
}

const uploadForm = document.getElementById("upload-post-form");
uploadForm.addEventListener("submit", async (event) => {
	event.preventDefault();

	if (user.emailVerified) {
		await getDoc(doc(firestore, "users", user.email))
			.then((_userDocument) => {
				const user = _userDocument.data();

				//https://stackoverflow.com/a/7709819
				const oldDate = user.last_uploaded.toDate();
				const newDate = new Date();

				if (canPost(oldDate, newDate)) {
					// Storage
					const storage = getStorage(app);

					// Create a storage reference from our storage service
					postFileName = `${user.uid}_${new Date().getTime()}_${selectedFileName}`;
					const postImagesRef = ref(storage, `post_images/${postFileName}`);

					const uploadPostBytes = base64ToArrayBuffer(
						uploadPostBase64.split(",")[1],
					);

					const uploadTask = uploadBytesResumable(
						postImagesRef,
						uploadPostBytes,
					); // uploadPostBase64, metadata
					uploadTask.on(
						"state_changed",
						(snapshot) => {
							const progress =
								(snapshot.bytesTransferred / snapshot.totalBytes) * 100;
							console.log(`Upload is ${progress}% done`);
							switch (snapshot.state) {
								case "paused":
									console.log("Upload is paused");
									break;
								case "running":
									console.log("Upload is running");
									break;
							}
						},
						(error) => {
							console.log(`Upload failed${error}`);
						},
						() => {
							getDownloadURL(uploadTask.snapshot.ref).then(
								async (downloadURL) => {
									const postTitle =
										document.getElementById("upload-post-title").value;
									await setDoc(doc(firestore, "posts", postFileName), {
										created_by: user.email,
										post_image_path: downloadURL,
										post_title: postTitle,
										down_count: 0,
										up_count: 0,
										created_on: Timestamp.fromDate(new Date()),
									})
										.then(async (setPost) => {
											await updateDoc(doc(firestore, "users", user.email), {
												last_uploaded: Timestamp.fromDate(new Date()),
											})
												.then((_updatedUser) => {
													location.reload();
												})
												.catch((error) => {
													console.log(error);
												});
										})
										.catch((error) => {
											console.log(error);
										});
								},
							);
						},
					);
				} else {
					alert("Please wait for 15 mins before uploading again.");
				}
			})
			.catch((error) => {
				console.log(`Check last upload time - fetch user - ${error}`);
			});
	} else {
		alert("Pleaes verify your email before uploading.");
	}
});

// https://stackoverflow.com/a/21797381/2776913
function base64ToArrayBuffer(base64) {
	const binaryString = atob(base64);
	const bytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes.buffer;
}

document.getElementById("profile-sign-out").addEventListener("click", () => {
	signOut(auth)
		.then(() => {
			location.href = "index.html";
		})
		.catch((error) => {
			console.log(error);
		});
});

document.getElementById("profile-home-button").addEventListener("click", () => {
	location.href = "home.html";
});

const dropArea = document.querySelector(".drop_box");
const button = dropArea.querySelector("button");
const input = dropArea.querySelector("input");
const dragText = dropArea.querySelector("header");

button.onclick = () => {
	input.click();
};

input.addEventListener("change", (e) => {
	const fileName = e.target.files[0].name;
	const filedata = `
      <form action="" method="post">
      <div class="form">
      <h4>${fileName}</h4>
      <input type="text" placeholder="Enter post title">
      <button class="btn">Upload</button>
      </div>
      </form>`;
	dropArea.innerHTML = filedata;
});
