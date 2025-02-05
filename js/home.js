import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, getDocs, collection, query, where, setDoc, doc, orderBy, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
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
var listHtml = "";
let br = document.createElement("br");

// Get all posts
const allPostsQuery = query(collection(firestore, "posts"), orderBy("created_on", "desc"));
const allPostsQueryQuerySnapshot = await getDocs(allPostsQuery);
allPostsQueryQuerySnapshot.forEach(async (_post) => {
    const post = _post.data();

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
            console.log(this.id);
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
                            debugger;
                            await updateDoc(doc(firestore, "posts", _post.id), {
                                up_count: post.up_count - 1,
                            }).then(async () => {
                                await updateDoc(doc(firestore, "users", _user.email), {
                                    up_posts: user.up_posts.splice(user.up_posts.indexOf(_post.id), 1)
                                }).then(async () => {
                                    console.log(user.up_posts.length + " - UpVote successfully updated for user");
                                    await getDoc(doc(firestore, "posts", _post.id)).then((_updatedPost) => {
                                        upButton.textContent = _pdatedPost.data().up_count + " Ups";
                                        console.log(this.id + " - Up count updated Successfully");
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
                            await updateDoc(doc(firestore, "posts", _post.id), {
                                up_count: post.up_count + 1,
                            }).then(async () => {
                                debugger;
                                console.log("UpCount updated successfully");
                                await updateDoc(doc(firestore, "users", _user.email), {
                                    up_posts: user.up_posts.push(_post.id)
                                }).then(async () => {
                                    debugger;
                                    console.log(user.up_posts.length + " - UpVote successfully updated for user");
                                    await getDoc(doc(firestore, "posts", _post.id))
                                        .then((_updatedPost) => {
                                            debugger;
                                            upButton.textContent = _updatedPost.data().up_count + " Ups";
                                            console.log(this.id + " - Up count updated Successfully");
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
            console.log(this.id);

            onAuthStateChanged(auth, async (_user) => {
                if (_user) {
                    user = _user;
                    await updateDoc(doc(firestore, "posts", _post.id), {
                        down_count: post.down_count + 1,
                    }).then(async () => {
                        var updatedPost = await getDoc(doc(firestore, "posts", _post.id));
                        downButton.textContent = updatedPost.data().down_count + " Downs";
                        console.log(this.id + " - down count updated Successfully");
                    }).catch((error) => {
                        console.log(error);
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