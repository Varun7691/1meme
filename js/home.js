import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
    getFirestore,
    getDocs,
    collection,
    query,
    where,
    setDoc,
    doc,
    orderBy,
    updateDoc,
    getDoc,
    arrayUnion,
    arrayRemove,
    startAfter,
    limit,
    endBefore,
    limitToLast, startAt, Timestamp
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import {
    getStorage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-storage.js";

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

// Auth - user
const auth = getAuth(app);
let user = "";

// Firestore
const firestore = getFirestore(app, "nineone");

const pageSize = 7;
let firstVisible = null;
let lastVisible = null;
let isFirstPage = true;
let isLastPage = false;

async function getData(direction) {
    let paginatedPostsquery = query(collection(firestore, "posts"), orderBy("created_on", "desc"), limit(pageSize));

    if (direction === "next" && lastVisible) {
        paginatedPostsquery = query(collection(firestore, "posts"), orderBy("created_on", "desc"), startAfter(lastVisible), limit(pageSize));
    } else if (direction === "prev" && firstVisible) {
        paginatedPostsquery = query(collection(firestore, "posts"), orderBy("created_on", "desc"), endBefore(firstVisible), limitToLast(pageSize));
    }

    const snapshot = await getDocs(paginatedPostsquery);
    if (!snapshot.empty) {
        firstVisible = snapshot.docs[0];
        lastVisible = snapshot.docs[snapshot.docs.length - 1];
        updateButton();
    }

    document.getElementById("all-posts-list").innerHTML = "";

    for (_post of snapshot) {
        renderUI(_post);
    }
}

async function renderUI(_post) {
    let post = _post.data();

    const li = document.createElement("li");

    let postUser = "";
    const userQuery = query(
        collection(firestore, "users"),
        where("email", "==", post.created_by)
    );
    const userQueryQuerySnapshot = await getDocs(userQuery);
    for (_user of userQueryQuerySnapshot) {
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

                                                        upButton.textContent =
                                                            `${_updatedPost.data().up_count} `;
                                                        upButton.setAttribute("class", "unselected");

                                                        upButton.append(upFontAwesome);
                                                        downButton.append(downFontAwesome);
                                                    })
                                                    .catch((error) => {
                                                        console.log(
                                                            `Could not get post after upvote update - ${error}`
                                                        );
                                                    });
                                            })
                                            .catch((error) => {
                                                console.log(
                                                    `Could not update up_post for user - ${error}`
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

                                                        upButton.textContent =
                                                            `${_updatedPost.data().up_count} `;
                                                        downButton.textContent =
                                                            `${_updatedPost.data().down_count} `;

                                                        upButton.setAttribute("class", "selected");
                                                        downButton.setAttribute("class", "unselected");

                                                        upButton.append(upFontAwesome);
                                                        downButton.append(downFontAwesome);
                                                    })
                                                    .catch((error) => {
                                                        console.log(
                                                            `Could not get post after upvote update - ${error}`
                                                        );
                                                    });
                                            })
                                            .catch((error) => {
                                                console.log(
                                                    `Could not update up_post for user - ${error}`
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

                                                        downButton.textContent =
                                                            `${_updatedPost.data().down_count} `;

                                                        downButton.setAttribute("class", "unselected");

                                                        upButton.append(upFontAwesome);
                                                        downButton.append(downFontAwesome);
                                                    })
                                                    .catch((error) => {
                                                        console.log(
                                                            `Could not get post after upvote update - ${error}`
                                                        );
                                                    });
                                            })
                                            .catch((error) => {
                                                console.log(
                                                    `Could not update up_post for user - ${error}`
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

                                                        downButton.textContent =
                                                            `${_updatedPost.data().down_count} `;
                                                        upButton.textContent =
                                                            `${_updatedPost.data().up_count} `;

                                                        upButton.setAttribute("class", "unselected");
                                                        downButton.setAttribute("class", "selected");

                                                        upButton.append(upFontAwesome);
                                                        downButton.append(downFontAwesome);
                                                    })
                                                    .catch((error) => {
                                                        console.log(
                                                            `Could not get post after upvote update - ${error}`
                                                        );
                                                    });
                                            })
                                            .catch((error) => {
                                                console.log(
                                                    `Could not update up_post for user - ${error}`
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
    };
    document.getElementById("all-posts-list").append(li);
    // Hiding the loading label
    document.getElementById("all-post-loading").style.display = "none";
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

async function updateButton() {
    const firstQuery = query(collection(firestore, "posts"), orderBy("created_on", "desc"), limit(1));
    const firstQuerySnapshot = await getDocs(firstQuery);
    isFirstPage = firstQuerySnapshot.docs[0]?.id === firstVisible.id;

    const nextPageQuery = query(collection(firestore, "posts"), orderBy("created_on", "desc"), startAfter(lastVisible), limit(1));
    const nextPageSnapshot = await getDocs(nextPageQuery);
    isLastPage = nextPageSnapshot.empty;

    if (isLastPage) {
        document.getElementById("btn_next").style.display = "none";
    } else {
        document.getElementById("btn_next").style.display = "block";
    }

    if (isFirstPage) {
        document.getElementById("btn_prev").style.display = "none";
    } else {
        document.getElementById("btn_prev").style.display = "block";
    }
}

document.getElementById("btn_next").addEventListener("click", () => {
    isFirstPage = false;
    getData("next");
});
document.getElementById("btn_prev").addEventListener("click", () => {
    getData("prev");
});

getData();

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

document.getElementById("home-sign-out").addEventListener("click", () => {
    signOut(auth)
        .then(() => {
            location.href = "index.html";
        })
        .catch((error) => {
            console.log(error);
        });
});

document.getElementById("home-profile").addEventListener("click", () => {
    location.href = "profile.html";
});

document.getElementById("home-upload-post-btn").addEventListener("click", () => {
    onAuthStateChanged(auth, async (_user) => {
        if (_user) {
            user = _user;
            uploadPostModal.style.display = "block";
        } else {
            console.log("onAuthStateChanged - User Signed out");
            location.href = "index.html";
        }
    });
});

// Get the modal
const uploadPostModal = document.getElementById("upload-post-modal");

// Get the <span> element that closes the modal
const span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = () => {
    uploadPostModal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = (event) => {
    if (event.target === uploadPostModal) {
        uploadPostModal.style.display = "none";
    }
};

let uploadPostBase64 = "";
let selectedFileName = "";
let postFileName = "";
document
    .getElementById("home-upload-post-image-file-selector")
    .addEventListener("change", function () {
        const file = this.files[0];
        const reader = new FileReader();
        selectedFileName = file.name;

        reader.onload = (event) => {
            uploadPostBase64 = event.target.result;
            document.getElementById("home-upload-post-image-preview").src =
                uploadPostBase64;
            document.getElementById("home-upload-post-image-preview").style.display =
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

const uploadForm = document.getElementById("home-upload-post-form");
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
                    postFileName =
                        `${user.uid}_${new Date().getTime()}_${selectedFileName}`;
                    const postImagesRef = ref(storage, `post_images/${postFileName}`);

                    const uploadPostBytes = base64ToArrayBuffer(
                        uploadPostBase64.split(",")[1]
                    );

                    const uploadTask = uploadBytesResumable(
                        postImagesRef,
                        uploadPostBytes
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
                                }
                            );
                        }
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
