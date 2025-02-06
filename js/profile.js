import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, getDocs, collection, query, where, setDoc, doc, Timestamp, orderBy } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-storage.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

var user = "";

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
// Auth
const auth = getAuth(app);
// Firestore
const firestore = getFirestore(app, "nineone");


onAuthStateChanged(auth, async (_user) => {
    if (_user) {
        user = _user;
        // Get user data
        const q = query(collection(firestore, "users"), where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (doc) => {
            const user = doc.data();

            // Set userName
            document.getElementById("welcome-user").innerHTML = user.userName;

            // Set Profile Description
            document.getElementById("profile-description").innerHTML = user.profile_description;

            // Set Display picture
            document.getElementById("user-display-picture").src = user.display_picture;

            const oldDate = user.createdOn.toDate();
            const newDate = new Date();

            const diffTime = Math.abs(oldDate - newDate);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            document.getElementById("active-since").innerHTML = "Active for: " + diffDays + " day(s)";

            const userRef = doc.id;

            var listHtml = "";

            // Get user posts
            const userPostsQuery = query(collection(firestore, "posts"), where("created_by", "==", user.email), orderBy("created_on", "desc"));
            const userPostsQueryQuerySnapshot = await getDocs(userPostsQuery);
            userPostsQueryQuerySnapshot.forEach((_post) => {
                const post = _post.data();

                listHtml += `<li>${post.post_title}<br/><img src="${post.post_image_path}"id='user-display-picture' width="10%" height="10%"/><br/>${post.up_count} Ups - ${post.down_count} Downs</li>`;

                document.getElementById("my-posts-list").innerHTML = listHtml;
            });
        });

    } else {
        console.log("onAuthStateChanged - User Signed out");
        location.href = "index.html";
    }
});

const myPostsButton = document.getElementById("my-posts-button");
const myCommentsButton = document.getElementById("my-comments-button");
const myUpvotesButton = document.getElementById("my-upvotes-button");
const uploadPostsButton = document.getElementById("upload-posts-button");

// Passing parameter to a function - https://stackoverflow.com/a/12024498
myPostsButton.addEventListener("click", function () { showHideTabs(1) }, false);
myCommentsButton.addEventListener("click", function () { showHideTabs(2) }, false);
myUpvotesButton.addEventListener("click", function () { showHideTabs(3) }, false);
uploadPostsButton.addEventListener("click", function () { showHideTabs(4) }, false);

function showHideTabs(containerNumber) {
    const myPostsContainer = document.getElementById("my-posts-container");
    const myCommentsContainer = document.getElementById("my-comments-container");
    const myUpvotesContainer = document.getElementById("my-upvotes-container");
    const uploadPostsContainer = document.getElementById("upload-posts-container");
    switch (containerNumber) {
        case 1:
            myPostsContainer.style.display = "block";
            myCommentsContainer.style.display = "none";
            myUpvotesContainer.style.display = "none";
            uploadPostsContainer.style.display = "none";
            break;
        case 2:
            myPostsContainer.style.display = "none";
            myCommentsContainer.style.display = "block";
            myUpvotesContainer.style.display = "none";
            uploadPostsContainer.style.display = "none";
            break;
        case 3:
            myPostsContainer.style.display = "none";
            myCommentsContainer.style.display = "none";
            myUpvotesContainer.style.display = "block";
            uploadPostsContainer.style.display = "none";
            break;
        case 4:
            myPostsContainer.style.display = "none";
            myCommentsContainer.style.display = "none";
            myUpvotesContainer.style.display = "none";
            uploadPostsContainer.style.display = "block";
            break;
        default:
            myPostsContainer.style.display = "block";
            myCommentsContainer.style.display = "none";
            myUpvotesContainer.style.display = "none";
            uploadPostsContainer.style.display = "none";
    }
}
showHideTabs(1);

var uploadPostBase64 = "";
var selectedFileName = "";
var postFileName = "";
document.getElementById('upload-post-image-file-selector').addEventListener('change', function () {
    let file = this.files[0];
    let reader = new FileReader();
    selectedFileName = file.name;

    reader.onload = function (event) {
        uploadPostBase64 = event.target.result;
        document.getElementById('upload-post-image-preview').src = uploadPostBase64;
        document.getElementById('upload-post-image-preview').style.display = 'block';
        console.log(uploadPostBase64);
    };

    reader.readAsDataURL(file);
});

const uploadForm = document.getElementById('upload-post-form');
uploadForm.addEventListener('submit', function (event) {
    event.preventDefault();

    // Storage
    const storage = getStorage(app);

    // Create a storage reference from our storage service
    postFileName = user.uid + "_" + new Date().getTime() + "_" + selectedFileName;
    const postImagesRef = ref(storage, "post_images/" + postFileName);

    var uploadPostBytes = base64ToArrayBuffer(uploadPostBase64.split(",")[1]);

    const uploadTask = uploadBytesResumable(postImagesRef, uploadPostBytes) // uploadPostBase64, metadata
    uploadTask.on('state_changed',
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
                case 'paused':
                    console.log('Upload is paused');
                    break;
                case 'running':
                    console.log('Upload is running');
                    break;
            }
        },
        (error) => {
            console.log('Upload failed');
        },
        () => {
            getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                console.log('File available at', downloadURL);
                const postTitle = document.getElementById('upload-post-title').value;
                await setDoc(doc(firestore, "posts", postFileName), {
                    created_by: user.email,
                    post_image_path: downloadURL,
                    post_title: postTitle,
                    down_count: 0,
                    up_count: 0,
                    created_on: Timestamp.fromDate(new Date())
                }).then((setPost) => { console.log("Post uploaded successfully."); location.reload(); }).catch((error) => { console.log(error) });
            });
        }
    );
});

// https://stackoverflow.com/a/21797381/2776913
function base64ToArrayBuffer(base64) {
    var binaryString = atob(base64);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}


document.getElementById('profile-sign-out').addEventListener('click', function () {
    signOut(auth).then(() => {
        location.href = "index.html";
    }).catch((error) => {
        console.log(error);
    });
})

document.getElementById('profile-home-button').addEventListener('click',
    function () { location.href = "home.html" }
)