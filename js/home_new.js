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
    limitToLast, startAt
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut,
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

// Auth - user
const auth = getAuth(app);
var user = "";

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

    snapshot.forEach((_post) => {
        renderUI(_post);
    });
}

async function renderUI(_post) {
    var post = _post.data();

    let li = document.createElement("li");

    var postUser = "";
    const userQuery = query(
        collection(firestore, "users"),
        where("email", "==", post.created_by)
    );
    const userQueryQuerySnapshot = await getDocs(userQuery);
    userQueryQuerySnapshot.forEach((_user) => {
        postUser = _user.data();

        let postUsernameContainer = document.createElement("div");
        let postUsernameLabel = document.createElement("label");
        let postTitleContainer = document.createElement("div");
        let postTitleLabel = document.createElement("label");
        let postImage = document.createElement("img");

        let voteDateContainer = document.createElement("div");
        let postDateLabel = document.createElement("label");

        let voteContainer = document.createElement("div");
        let upButton = document.createElement("label");
        let downButton = document.createElement("label");

        // <i class="fa fa-play fa-rotate-270 fa-xl"></i>
        let upFontAwesome = document.createElement("i");
        upFontAwesome.setAttribute("class", "fa fa-play fa-rotate-270 fa-xl");

        let downFontAwesome = document.createElement("i");
        downFontAwesome.setAttribute("class", "fa fa-play fa-rotate-90 fa-xl");

        postUsernameLabel.textContent = postUser.userName;
        postUsernameLabel.className = "post-username";
        postTitleLabel.textContent = post.post_title;
        postTitleLabel.className = "post-title";

        postImage.src = post.post_image_path;
        postImage.setAttribute("width", "30%");
        postImage.setAttribute("height", "30%");

        upButton.textContent = post.up_count + " ";
        upButton.id = "up_" + _post.id;
        downButton.textContent = post.down_count + " ";
        downButton.id = "down_" + _post.id;

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

        upButton.addEventListener("click", async function () {
            onAuthStateChanged(auth, async (_user) => {
                if (_user) {
                    await getDoc(doc(firestore, "users", _user.email))
                        .then(async (_usersDocument) => {
                            user = _usersDocument.data();
                            var isPostUpVoted = false;
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
                                                            _updatedPost.data().up_count + " ";
                                                        upButton.setAttribute("class", "unselected");

                                                        upButton.append(upFontAwesome);
                                                        downButton.append(downFontAwesome);
                                                    })
                                                    .catch((error) => {
                                                        console.log(
                                                            "Could not get post after upvote update - " +
                                                            error
                                                        );
                                                    });
                                            })
                                            .catch((error) => {
                                                console.log(
                                                    "Could not update up_post for user - " + error
                                                );
                                            });
                                    })
                                    .catch((error) => {
                                        console.log("Could not update upvote on post - " + error);
                                    });
                            } else {
                                var downCount = post.down_count;
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
                                                            _updatedPost.data().up_count + " ";
                                                        downButton.textContent =
                                                            _updatedPost.data().down_count + " ";

                                                        upButton.setAttribute("class", "selected");
                                                        downButton.setAttribute("class", "unselected");

                                                        upButton.append(upFontAwesome);
                                                        downButton.append(downFontAwesome);
                                                    })
                                                    .catch((error) => {
                                                        console.log(
                                                            "Could not get post after upvote update - " +
                                                            error
                                                        );
                                                    });
                                            })
                                            .catch((error) => {
                                                console.log(
                                                    "Could not update up_post for user - " + error
                                                );
                                            });
                                    })
                                    .catch((error) => {
                                        console.log("Could not update upvote on post - " + error);
                                    });
                            }
                        })
                        .catch((error) => {
                            console.log("Could not fetch user - " + error);
                        });
                } else {
                    console.log("onAuthStateChanged - User Signed out");
                    location.href = "index.html";
                }
            });
        });

        downButton.addEventListener("click", async function () {
            onAuthStateChanged(auth, async (_user) => {
                if (_user) {
                    await getDoc(doc(firestore, "users", _user.email))
                        .then(async (_usersDocument) => {
                            user = _usersDocument.data();
                            var isPostDownVoted = false;
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
                                                            _updatedPost.data().down_count + " ";

                                                        downButton.setAttribute("class", "unselected");

                                                        upButton.append(upFontAwesome);
                                                        downButton.append(downFontAwesome);
                                                    })
                                                    .catch((error) => {
                                                        console.log(
                                                            "Could not get post after upvote update - " +
                                                            error
                                                        );
                                                    });
                                            })
                                            .catch((error) => {
                                                console.log(
                                                    "Could not update up_post for user - " + error
                                                );
                                            });
                                    })
                                    .catch((error) => {
                                        console.log("Could not update upvote on post - " + error);
                                    });
                            } else {
                                var upCount = post.up_count;
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
                                                            _updatedPost.data().down_count + " ";
                                                        upButton.textContent =
                                                            _updatedPost.data().up_count + " ";

                                                        upButton.setAttribute("class", "unselected");
                                                        downButton.setAttribute("class", "selected");

                                                        upButton.append(upFontAwesome);
                                                        downButton.append(downFontAwesome);
                                                    })
                                                    .catch((error) => {
                                                        console.log(
                                                            "Could not get post after upvote update - " +
                                                            error
                                                        );
                                                    });
                                            })
                                            .catch((error) => {
                                                console.log(
                                                    "Could not update up_post for user - " + error
                                                );
                                            });
                                    })
                                    .catch((error) => {
                                        console.log("Could not update upvote on post - " + error);
                                    });
                            }
                        })
                        .catch((error) => {
                            console.log("Could not fetch user - " + error);
                        });
                } else {
                    console.log("onAuthStateChanged - User Signed out");
                    location.href = "index.html";
                }
            });
        });
    });
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
                    console.log("Could not update upvote on post - " + error);
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

function getPostAgeString(postDate, referenceDate = new Date()) {
    postDate = new Date(postDate);
    referenceDate = new Date(referenceDate);

    let diffMs = referenceDate - postDate; // Difference in milliseconds
    let minutes = Math.floor(diffMs / (1000 * 60));
    let hours = Math.floor(diffMs / (1000 * 60 * 60));
    let days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    let weeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
    let years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));

    if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
    if (weeks > 0) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

    return "Just now";
}

document.getElementById("home-sign-out").addEventListener("click", function () {
    signOut(auth)
        .then(() => {
            location.href = "index.html";
        })
        .catch((error) => {
            console.log(error);
        });
});

document.getElementById("home-profile").addEventListener("click", function () {
    location.href = "profile.html";
});
