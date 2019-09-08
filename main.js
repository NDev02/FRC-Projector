window.addEventListener("load", e => {

    let dateElm = document.querySelector("#date");
    dateElm.innerHTML = (new Date()).toDateString();
    if (location.pathname == "/index.html" || location.pathname == "/") {
        injectBoard();
    }
    else {
        injectList();
    }

});

function injectBoard() {

    fetch("./jobs.json").then(res => res.json()).then(jobs => {

        jobs.sort((a, b) => {

            let endA = a.end_date;
            let endB = b.end_date;
            return (endA > endB ? 1 : -1);

        });
        console.log(jobs);

        let board = document.querySelector(".board");
        for (let job of jobs) {

            let end = new Date(job.end_date);
            let start = new Date(job.start_date);
            let today = new Date();
            if (end >= today && today >= start) {

                board.appendChild(createJobListing(job));

            }

        }

    });

}

function createJobListing(job) {

    /*
    let job = {
        "title": "Scouting Software",
        "lead": "Nathan Gordon",
        "mentor": "Mr. Mentor",
        "end_date": "2/20/2020",
        "members": [
            "Some Kid",
            "Another Kid",
            "That One Kid",
            "A. Smart Kid"
        ],
        "on_track": true
    } 
    */

    let divElm = document.createElement("div");
    divElm.classList = "listing";

    let titleElm = createElmWithText("h3", job.title);
    divElm.appendChild(titleElm);

    let leadElm = createElmWithText("p", `Lead by: ${job.lead}`);
    divElm.appendChild(leadElm);

    let mentorElm = createElmWithText("p", `Mentor: ${job.mentor}`);
    divElm.appendChild(mentorElm);

    let endElm = createElmWithText("p", `Deadline: ${job.end_date}`);
    divElm.appendChild(endElm);

    let memberLabel = createElmWithText("label", `Members:`);
    divElm.appendChild(memberLabel);

    let memberList = createList(job.members);
    divElm.appendChild(memberList);

    if (!job.on_track) {
        divElm.style.background = "rgba(100,0,0,0.5)"
    }

    return divElm;

}

function injectList() {

    fetch("./jobs.json").then(res => res.json()).then(jobs => {

        jobs.sort((a, b) => {

            let endA = a.end_date;
            let endB = b.end_date;
            return (endA > endB ? 1 : -1);

        });
        console.log(jobs);

        let list = document.querySelector(".list>tbody");
        for (let job of jobs) {

            list.appendChild(createJobRow(job));

        }

    });

}

function createJobRow(job) {

    let row = document.createElement("tr");
    row.appendChild(createElmWithText("td", job.title));
    row.appendChild(createElmWithText("td", job.lead));
    row.appendChild(createElmWithText("td", job.mentor));
    row.appendChild(createElmWithText("td", job.start_date));
    row.appendChild(createElmWithText("td", job.end_date));
    row.appendChild(createElmWithText("td", job.on_track));
    row.appendChild(createElmWithText("td", job.members.length));

    return row;

}

function createElmWithText(type, text) {

    let elm = document.createElement(type);
    elm.appendChild(document.createTextNode(text));
    return elm;

}

function createList(items) {

    let listElm = document.createElement("ul");
    for (let item of items) {
        listElm.appendChild(createElmWithText("li", item));
    }
    return listElm;

}