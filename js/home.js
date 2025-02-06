import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, getDocs, collection, query, where, setDoc, doc, orderBy, updateDoc, getDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

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

// Auth - user
const auth = getAuth(app);
var user = "";

// Firestore
const firestore = getFirestore(app, "nineone");
let br = document.createElement("br");

// Get all posts
const allPostsQuery = query(collection(firestore, "posts"), orderBy("created_on", "desc"));
const allPostsQueryQuerySnapshot = await getDocs(allPostsQuery);
allPostsQueryQuerySnapshot.forEach(async (_post) => {
    var post = _post.data();

    let li = document.createElement("li");

    var postUser = "";
    const userQuery = query(collection(firestore, "users"), where("email", "==", post.created_by));
    const userQueryQuerySnapshot = await getDocs(userQuery);
    userQueryQuerySnapshot.forEach((_user) => {
        postUser = _user.data();

        let postUsernameLabel = document.createElement("label");
        let postTitleLabel = document.createElement("label");
        let postImage = document.createElement("img");
        let upButton = document.createElement("button");
        let downButton = document.createElement("button");

        postUsernameLabel.textContent = " - " + postUser.userName;
        postUsernameLabel.className = "post-username";
        postTitleLabel.textContent = post.post_title;
        postTitleLabel.className = "post-title";

        postImage.src = post.post_image_path;
        postImage.setAttribute('width', '30%')
        postImage.setAttribute('height', '30%')

        upButton.textContent = post.up_count + " Ups";
        upButton.id = "up_" + _post.id;
        downButton.textContent = post.down_count + " Downs";
        downButton.id = "down_" + _post.id;

        onAuthStateChanged(auth, async (_user) => {
            if (_user) {
                await getDoc(doc(firestore, "users", _user.email)).then((_usersDocument) => {
                    for (let i = 0; i < _usersDocument.data().up_posts.length; i++) {
                        if (_post.id === _usersDocument.data().up_posts[i]) {
                            upButton.setAttribute("class", "selected");
                        } else {
                            upButton.setAttribute("class", "unselected");
                        }
                    }

                    for (let i = 0; i < _usersDocument.data().down_posts.length; i++) {
                        if (_post.id === _usersDocument.data().down_posts[i]) {
                            downButton.setAttribute("class", "selected");
                        } else {
                            downButton.setAttribute("class", "unselected");
                        }
                    }
                }).catch((error) => {
                    console.log("Could not update upvote on post - " + error);
                });
            } else {
                console.log("onAuthStateChanged - User Signed out");
                location.href = "index.html";
            }
        });

        li.append(postTitleLabel);
        li.append(postUsernameLabel);
        li.append(br.cloneNode(true));
        li.append(br.cloneNode(true));
        li.append(postImage);
        li.append(br.cloneNode(true));
        li.append(upButton);
        li.append(downButton);
        li.append(br.cloneNode(true));
        li.append(br.cloneNode(true));

        upButton.addEventListener("click", async function () {
            onAuthStateChanged(auth, async (_user) => {
                if (_user) {
                    console.log(_user);
                    await getDoc(doc(firestore, "users", _user.email)).then(async (_usersDocument) => {
                        user = _usersDocument.data();
                        var isPostUpVoted = false;
                        for (let i = 0; i < user.up_posts.length; i++) {
                            if (_post.id === user.up_posts[i]) {
                                isPostUpVoted = true
                            }
                        }
                        debugger;
                        if (isPostUpVoted === true) {
                            await updateDoc(doc(firestore, "posts", _post.id), {
                                up_count: post.up_count - 1,
                            }).then(async () => {
                                debugger;
                                await updateDoc(doc(firestore, "users", _user.email), {
                                    up_posts: arrayRemove(_post.id)
                                }).then(async () => {
                                    debugger;
                                    console.log(user.up_posts.length + " - UpVote successfully updated for user");
                                    await getDoc(doc(firestore, "posts", _post.id)).then((_updatedPost) => {
                                        debugger;
                                        post = _updatedPost.data();
                                        upButton.textContent = _updatedPost.data().up_count + " Ups";
                                        upButton.setAttribute("class", "unselected");
                                    }).catch((error) => {
                                        console.log("Could not get post after upvote update - " + error);
                                    });
                                }).catch((error) => {
                                    console.log("Could not update up_post for user - " + error);
                                });
                            }).catch((error) => {
                                console.log("Could not update upvote on post - " + error);
                            });

                        } else {
                            debugger;
                            var downCount = post.down_count;
                            for (let i = 0; i < user.down_posts.length; i++) {
                                if (_post.id === user.down_posts[i]) {
                                    downCount = downCount - 1;
                                }
                            }
                            await updateDoc(doc(firestore, "posts", _post.id), {
                                up_count: post.up_count + 1,
                                down_count: downCount
                            }).then(async () => {
                                debugger;
                                console.log("UpCount updated successfully");
                                await updateDoc(doc(firestore, "users", _user.email), {
                                    up_posts: arrayUnion(_post.id),
                                    down_posts: arrayRemove(_post.id)
                                }).then(async () => {
                                    debugger;
                                    console.log(user.up_posts.length + " - UpVote successfully updated for user");
                                    await getDoc(doc(firestore, "posts", _post.id))
                                        .then((_updatedPost) => {
                                            debugger;
                                            post = _updatedPost.data();
                                            upButton.textContent = _updatedPost.data().up_count + " Ups";
                                            downButton.textContent = _updatedPost.data().down_count + " Downs";

                                            upButton.setAttribute("class", "selected");
                                            downButton.setAttribute("class", "unselected");
                                        }).catch((error) => {
                                            console.log("Could not get post after upvote update - " + error);
                                        });
                                }).catch((error) => {
                                    console.log("Could not update up_post for user - " + error);
                                });
                            }).catch((error) => {
                                console.log("Could not update upvote on post - " + error);
                            });
                        }
                    }).catch((error) => {
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
                    await getDoc(doc(firestore, "users", _user.email)).then(async (_usersDocument) => {
                        user = _usersDocument.data();
                        var isPostDownVoted = false;
                        for (let i = 0; i < user.down_posts.length; i++) {
                            if (_post.id === user.down_posts[i]) {
                                isPostDownVoted = true
                            }
                        }
                        debugger;
                        if (isPostDownVoted === true) {
                            await updateDoc(doc(firestore, "posts", _post.id), {
                                down_count: post.down_count - 1,
                            }).then(async () => {
                                debugger;
                                await updateDoc(doc(firestore, "users", _user.email), {
                                    down_posts: arrayRemove(_post.id)
                                }).then(async () => {
                                    debugger;
                                    console.log(user.down_posts.length + " - DownVote successfully updated for user");
                                    await getDoc(doc(firestore, "posts", _post.id)).then((_updatedPost) => {
                                        debugger;
                                        post = _updatedPost.data();
                                        downButton.textContent = _updatedPost.data().down_count + " Downs";

                                        downButton.setAttribute("class", "unselected");
                                    }).catch((error) => {
                                        console.log("Could not get post after upvote update - " + error);
                                    });
                                }).catch((error) => {
                                    console.log("Could not update up_post for user - " + error);
                                });
                            }).catch((error) => {
                                console.log("Could not update upvote on post - " + error);
                            });

                        } else {
                            debugger;
                            var upCount = post.up_count;
                            for (let i = 0; i < user.up_posts.length; i++) {
                                if (_post.id === user.up_posts[i]) {
                                    upCount = upCount - 1;
                                }
                            }
                            await updateDoc(doc(firestore, "posts", _post.id), {
                                down_count: post.down_count + 1,
                                up_count: upCount
                            }).then(async () => {
                                debugger;
                                await updateDoc(doc(firestore, "users", _user.email), {
                                    down_posts: arrayUnion(_post.id),
                                    up_posts: arrayRemove(_post.id)
                                }).then(async () => {
                                    debugger;
                                    console.log(user.down_posts.length + " - DownVote successfully updated for user");
                                    await getDoc(doc(firestore, "posts", _post.id))
                                        .then((_updatedPost) => {
                                            debugger;
                                            post = _updatedPost.data();
                                            downButton.textContent = _updatedPost.data().down_count + " Downs";
                                            upButton.textContent = _updatedPost.data().up_count + " Ups";

                                            upButton.setAttribute("class", "unselected");
                                            downButton.setAttribute("class", "selected");
                                        }).catch((error) => {
                                            console.log("Could not get post after upvote update - " + error);
                                        });
                                }).catch((error) => {
                                    console.log("Could not update up_post for user - " + error);
                                });
                            }).catch((error) => {
                                console.log("Could not update upvote on post - " + error);
                            });
                        }
                    }).catch((error) => {
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
});

document.getElementById('profile-sign-out').addEventListener('click', function () {
    signOut(auth).then(() => {
        location.href = "index.html";
    }).catch((error) => {
        console.log(error);
    });
})