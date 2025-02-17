import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
	getAuth,
	onAuthStateChanged,
	signOut,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
	Timestamp,
	arrayRemove,
	arrayUnion,
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

			// let listHtml = "";

			// Get user posts
			const userPostsQuery = query(
				collection(firestore, "posts"),
				where("created_by", "==", user.email),
				orderBy("created_on", "desc"),
			);
			const userPostsQueryQuerySnapshot = await getDocs(userPostsQuery);
			for (const _post of userPostsQueryQuerySnapshot.docs) {
				// const post = _post.data();

				// listHtml += `<li class = "post-item"><div class="post-title-container"><label class = "post-title">${post.post_title
				// 	}</label></div><img src="${post.post_image_path
				// 	}"id='user-display-picture'/><br/><div class="vote-date-container"><div class="vote-container"><label class="post-up-btn">${post.up_count
				// 	}<i class="fa fa-play fa-rotate-270 fa-xl"></i></label> <label class="post-down-btn"> ${post.down_count
				// 	}<i class="fa fa-play fa-rotate-90 fa-xl"></i></label></div> <label class="post-age">${getPostAgeString(
				// 		post.created_on.toDate(),
				// 	)} </label></div></li>`;

				// document.getElementById("my-posts-list").innerHTML = listHtml;

				renderPostsUI(_post, document.getElementById("my-posts-list"));
			}

			// Get My UpVoted posts
			// let updVotedPostsListHtml = "";

			// Get user's upvoted posts
			const upVotedPostsArray = user.up_posts;
			const upVotedPostsQuery = query(
				collection(firestore, "posts"),
				where("__name__", "in", upVotedPostsArray),
				orderBy("created_on", "desc"),
			); // https://stackoverflow.com/a/62150539
			const upVotedPostsQuerySnapshot = await getDocs(upVotedPostsQuery);
			for (const _post of upVotedPostsQuerySnapshot.docs) {
				// const post = _post.data();

				// updVotedPostsListHtml += `<li class = "post-item"><div class="post-title-container"><label class = "post-title">${post.post_title
				// 	}</label></div><img src="${post.post_image_path
				// 	}"id='user-display-picture'/><br/><div class="vote-date-container"><div class="vote-container"><label class="post-up-btn selected">${post.up_count
				// 	}<i class="fa fa-play fa-rotate-270 fa-xl"></i></label> <label class="post-down-btn unselected"> ${post.down_count
				// 	}<i class="fa fa-play fa-rotate-90 fa-xl"></i></label></div> <label class="post-age">${getPostAgeString(
				// 		post.created_on.toDate(),
				// 	)} </label></div></li>`;

				// document.getElementById("my-upvoted-posts-list").innerHTML =
				// 	updVotedPostsListHtml;

				renderPostsUI(_post, document.getElementById("my-upvoted-posts-list"));
			}
		}
	} else {
		console.log("onAuthStateChanged - User Signed out");
		location.href = "index.html";
	}
});

async function renderPostsUI(_post, myPostsListElement) {
	let post = _post.data();

	const li = document.createElement("li");

	let postUser = "";
	const userQuery = query(
		collection(firestore, "users"),
		where("email", "==", post.created_by),
	);
	const userQueryQuerySnapshot = await getDocs(userQuery);
	for (const _user of userQueryQuerySnapshot.docs) {
		postUser = _user.data();

		const postUsernameContainer = document.createElement("div");
		const postUsernameLabel = document.createElement("label");
		const postTitleContainer = document.createElement("div");
		const postTitleLabel = document.createElement("label");
		const postImage = document.createElement("img");

		const voteDateContainer = document.createElement("div");
		const postDateLabel = document.createElement("label");

		const voteContainer = document.createElement("div");
		const upButton = document.createElement("label");
		const downButton = document.createElement("label");

		// <i class="fa fa-play fa-rotate-270 fa-xl"></i>
		const upFontAwesome = document.createElement("i");
		upFontAwesome.setAttribute("class", "fa fa-play fa-rotate-270 fa-xl");

		const downFontAwesome = document.createElement("i");
		downFontAwesome.setAttribute("class", "fa fa-play fa-rotate-90 fa-xl");

		postUsernameLabel.textContent = postUser.userName;
		postUsernameLabel.className = "post-username";
		postTitleLabel.textContent = post.post_title;
		postTitleLabel.className = "post-title";

		postImage.src = post.post_image_path;
		postImage.setAttribute("width", "30%");
		postImage.setAttribute("height", "30%");

		upButton.textContent = `${post.up_count}  `;
		upButton.id = `up_${_post.id}`;
		downButton.textContent = `${post.down_count}  `;
		downButton.id = `down_${_post.id}`;

		postDateLabel.textContent = getPostAgeString(post.created_on.toDate());

		postTitleContainer.append(postTitleLabel);
		postTitleContainer.setAttribute("class", "post-title-container");
		postTitleLabel.setAttribute("class", "post-title");

		postUsernameContainer.append(postUsernameLabel);
		postUsernameContainer.setAttribute("class", "post-user-container");
		postUsernameLabel.setAttribute("class", "post-user");

		voteDateContainer.setAttribute("class", "vote-date-container");
		postDateLabel.setAttribute("class", "post-age");

		voteContainer.setAttribute("class", "vote-container");
		upButton.setAttribute("class", "post-up-btn");
		downButton.setAttribute("class", "post-down-btn");

		upButton.append(upFontAwesome);
		downButton.append(downFontAwesome);
		voteContainer.append(upButton);
		voteContainer.append(downButton);

		voteDateContainer.append(voteContainer);
		voteDateContainer.append(postDateLabel);

		li.append(postTitleContainer);
		// li.append(postUsernameContainer);
		li.append(postImage);
		li.append(voteDateContainer);

		li.setAttribute("class", "post-item");
		downFontAwesome.setAttribute("class", "fa fa-play fa-rotate-90 fa-xl");
		setVotesByUser(_post, upButton, downButton);

		upButton.addEventListener("click", async () => {
			onAuthStateChanged(auth, async (_user) => {
				if (_user) {
					await getDoc(doc(firestore, "users", _user.email))
						.then(async (_usersDocument) => {
							user = _usersDocument.data();
							let isPostUpVoted = false;
							for (let i = 0; i < user.up_posts.length; i++) {
								if (_post.id === user.up_posts[i]) {
									isPostUpVoted = true;
								}
							}

							if (isPostUpVoted === true) {
								await updateDoc(doc(firestore, "posts", _post.id), {
									up_count: post.up_count - 1,
								})
									.then(async () => {
										await updateDoc(doc(firestore, "users", _user.email), {
											up_posts: arrayRemove(_post.id),
										})
											.then(async () => {
												await getDoc(doc(firestore, "posts", _post.id))
													.then((_updatedPost) => {
														post = _updatedPost.data();

														upButton.textContent = `${_updatedPost.data().up_count} `;
														upButton.setAttribute("class", "unselected");

														upButton.append(upFontAwesome);
														downButton.append(downFontAwesome);
													})
													.catch((error) => {
														console.log(
															`Could not get post after upvote update - ${error}`,
														);
													});
											})
											.catch((error) => {
												console.log(
													`Could not update up_post for user - ${error}`,
												);
											});
									})
									.catch((error) => {
										console.log(`Could not update upvote on post - ${error}`);
									});
							} else {
								let downCount = post.down_count;
								for (let i = 0; i < user.down_posts.length; i++) {
									if (_post.id === user.down_posts[i]) {
										downCount = downCount - 1;
									}
								}
								await updateDoc(doc(firestore, "posts", _post.id), {
									up_count: post.up_count + 1,
									down_count: downCount,
								})
									.then(async () => {
										await updateDoc(doc(firestore, "users", _user.email), {
											up_posts: arrayUnion(_post.id),
											down_posts: arrayRemove(_post.id),
										})
											.then(async () => {
												await getDoc(doc(firestore, "posts", _post.id))
													.then((_updatedPost) => {
														post = _updatedPost.data();

														upButton.textContent = `${_updatedPost.data().up_count} `;
														downButton.textContent = `${_updatedPost.data().down_count} `;

														upButton.setAttribute("class", "selected");
														downButton.setAttribute("class", "unselected");

														upButton.append(upFontAwesome);
														downButton.append(downFontAwesome);
													})
													.catch((error) => {
														console.log(
															`Could not get post after upvote update - ${error}`,
														);
													});
											})
											.catch((error) => {
												console.log(
													`Could not update up_post for user - ${error}`,
												);
											});
									})
									.catch((error) => {
										console.log(`Could not update upvote on post - ${error}`);
									});
							}
						})
						.catch((error) => {
							console.log(`Could not fetch user - ${error}`);
						});
				} else {
					console.log("onAuthStateChanged - User Signed out");
					location.href = "index.html";
				}
			});
		});

		downButton.addEventListener("click", async () => {
			onAuthStateChanged(auth, async (_user) => {
				if (_user) {
					await getDoc(doc(firestore, "users", _user.email))
						.then(async (_usersDocument) => {
							user = _usersDocument.data();
							let isPostDownVoted = false;
							for (let i = 0; i < user.down_posts.length; i++) {
								if (_post.id === user.down_posts[i]) {
									isPostDownVoted = true;
								}
							}

							if (isPostDownVoted === true) {
								await updateDoc(doc(firestore, "posts", _post.id), {
									down_count: post.down_count - 1,
								})
									.then(async () => {
										await updateDoc(doc(firestore, "users", _user.email), {
											down_posts: arrayRemove(_post.id),
										})
											.then(async () => {
												await getDoc(doc(firestore, "posts", _post.id))
													.then((_updatedPost) => {
														post = _updatedPost.data();

														downButton.textContent = `${_updatedPost.data().down_count} `;

														downButton.setAttribute("class", "unselected");

														upButton.append(upFontAwesome);
														downButton.append(downFontAwesome);
													})
													.catch((error) => {
														console.log(
															`Could not get post after upvote update - ${error}`,
														);
													});
											})
											.catch((error) => {
												console.log(
													`Could not update up_post for user - ${error}`,
												);
											});
									})
									.catch((error) => {
										console.log(`Could not update upvote on post - ${error}`);
									});
							} else {
								let upCount = post.up_count;
								for (let i = 0; i < user.up_posts.length; i++) {
									if (_post.id === user.up_posts[i]) {
										upCount = upCount - 1;
									}
								}
								await updateDoc(doc(firestore, "posts", _post.id), {
									down_count: post.down_count + 1,
									up_count: upCount,
								})
									.then(async () => {
										await updateDoc(doc(firestore, "users", _user.email), {
											down_posts: arrayUnion(_post.id),
											up_posts: arrayRemove(_post.id),
										})
											.then(async () => {
												await getDoc(doc(firestore, "posts", _post.id))
													.then((_updatedPost) => {
														post = _updatedPost.data();

														downButton.textContent = `${_updatedPost.data().down_count} `;
														upButton.textContent = `${_updatedPost.data().up_count} `;

														upButton.setAttribute("class", "unselected");
														downButton.setAttribute("class", "selected");

														upButton.append(upFontAwesome);
														downButton.append(downFontAwesome);
													})
													.catch((error) => {
														console.log(
															`Could not get post after upvote update - ${error}`,
														);
													});
											})
											.catch((error) => {
												console.log(
													`Could not update up_post for user - ${error}`,
												);
											});
									})
									.catch((error) => {
										console.log(`Could not update upvote on post - ${error}`);
									});
							}
						})
						.catch((error) => {
							console.log(`Could not fetch user - ${error}`);
						});
				} else {
					console.log("onAuthStateChanged - User Signed out");
					location.href = "index.html";
				}
			});
		});
	}
	myPostsListElement.append(li);
}

function setVotesByUser(_post, upButton, downButton) {
	onAuthStateChanged(auth, async (_user) => {
		if (_user) {
			await getDoc(doc(firestore, "users", _user.email))
				.then((_usersDocument) => {
					const user = _usersDocument.data();
					for (let i = 0; i < user.up_posts.length; i++) {
						if (_post.id === user.up_posts[i]) {
							upButton.setAttribute("class", "selected");
						}
					}

					for (let i = 0; i < user.down_posts.length; i++) {
						if (_post.id === user.down_posts[i]) {
							downButton.setAttribute("class", "selected");
						}
					}
				})
				.catch((error) => {
					console.log(`Could not update upvote on post - ${error}`);
				});
		} else {
			console.log("onAuthStateChanged - User Signed out");
		}
	});
}

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
