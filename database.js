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

function readDatabase(path, callback) {

    if (testing) {

        fetch("./database.json").then(res => res.json()).then(data => {

            callback(data[path.replace(/\//g, "")]);

        });

    } else {

        firebase.database().ref(path).once('value').then(data => {

            callback(data.val());

        });

    }

}

function setDatabase(path, data) {

    firebase.database().ref(path).set(data);

}