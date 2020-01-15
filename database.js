let testing = false;

let firebaseConfig = {
    apiKey: "AIzaSyAKpFHIQ_FfNHyJM7Eh1gSFxCeWTnycmKw",
    authDomain: "frc-projector.firebaseapp.com",
    databaseURL: "https://frc-projector.firebaseio.com",
    projectId: "frc-projector",
    storageBucket: "frc-projector.appspot.com",
    messagingSenderId: "582120849581",
    appId: "1:582120849581:web:ce51348e1df9092be00624",
    measurementId: "G-2TGGPRMR1B"
};

firebase.initializeApp(firebaseConfig);

let user;

window.addEventListener("load", e => {

    user = JSON.parse(localStorage.getItem("user"));

    if (user == null && !location.pathname.includes("account.html")) {

        alert("You must login.");
        location.href = "./account.html";

    } else if (user != null && location.pathname.includes("account.html")) {

        location.href = "./index.html"; // TODO uncomment

    }

    firebase.analytics();

});

function startSignIn() {

    let provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function (result) {

        localStorage.setItem("user", JSON.stringify(result.user));
        user = result.user;
        location.href = "./index.html"; // TODO uncomment

    });

}

function readDatabase(path, callback) {

    let extractAssignments = false;

    if (path == "/assignments") {

        path = "/jobs";
        extractAssignments = true;

    }

    if (testing) {

        fetch("./database.json").then(res => res.json()).then(data => {

            callback(data[path.replace(/\//g, "")]);

        });

    } else {

        firebase.database().ref(path).once('value').then(data => {

            if (extractAssignments) {

                let people = {};
                let flattened = [];
                let projects = data.val();

                for (let project of projects) {
                    
                    if (!project.title) {

                        continue;

                    }

                    if (Object.keys(people).includes(project.lead)) {

                        people[project.lead].push(project.title);

                    } else {

                        people[project.lead] = [];
                        people[project.lead].push(project.title);

                    }

                    for (let member of (project.members || [])) {

                        if (Object.keys(people).includes(member) && !people[member].includes(project.title)) {

                            people[member].push(project.title);

                        } else if (!Object.keys(people).includes(member)) {

                            people[member] = [];
                            people[member].push(project.title);

                        }

                    }

                }

                for (let person of Object.keys(people)) {

                    let arr = [];
                    arr.push(person);
                    arr = arr.concat(people[person]);
                    flattened.push(arr);

                }

                flattened.sort((a, b) => {
                    return ([a[0], b[0]].sort())[0] == a[0] ? -1 : 1;
                })

                callback(flattened);

            } else {

                let projects = data.val();

                callback(projects);

            }

        });

    }

}

function setDatabase(path, data) {

    return firebase.database().ref(path).set(data);

}

function deleteDatabase(path) {

    return firebase.database().ref(path).remove();

}
