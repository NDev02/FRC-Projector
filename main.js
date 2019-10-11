window.addEventListener("load", e => {

    let dateElm = document.querySelector("#date");
    dateElm.innerHTML = (new Date()).toDateString();
    let splitPath = location.pathname.split("/");
    let dir = splitPath[splitPath.length - 1];
    if (dir == "index.html" || dir == "") {
        injectBoard();
    }
    else if (dir == "list.html") {
        injectList();
    } else if (dir == "lookup.html") {
        injectLookup();
    } else {
        injectCharter();
    }

});

function injectBoard() {

    readDatabase("/jobs", jobs => {

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
    {
        "title": "",
        "lead": "",
        "mentor": "",
        "start_date": "",
        "end_date": "",
        "members": [
        ],
        "on_track": true
    } 
    */

    let divElm = document.createElement("div");
    divElm.classList = "listing";
    divElm.setAttribute("onclick", `openCharter('${job.title.replace(/ /g, "-")}')`);

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

    readDatabase("/jobs", jobs => {

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
    row.setAttribute("onclick", `openCharter('${job.title.replace(/ /g, "-")}')`);
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

function injectLookup() {

    readDatabase("/assignments", json => {

        let list = document.querySelector(".list>tbody");
        for (let person of json) {

            let row = document.createElement("tr");
            row.className = `singular ${person[0].toLowerCase().replace(/ /g, "")}`;
            let used = [];
            for (let key of Object.keys(person)) {

                if (person[key] != "" && !used.includes(person[key])) {

                    used.push(person[key]);
                    row.appendChild(createElmWithText("td", person[key]));

                }

            }
            list.appendChild(row);

        }

    });

}

function updateSearch() {

    let elms = document.querySelectorAll(".singular");
    for (let elm of elms) {

        elm.setAttribute("hidden", "");

        if (elm.classList[1].includes(event.target.value.toLowerCase().replace(/ /g, ""))) {

            elm.removeAttribute("hidden");

        }

    }

}

function injectCharter() {

    /*
    {
        "title": "",
        "lead": "",
        "mentor": "",
        "start_date": "",
        "end_date": "",
        "members": [
        ],
        "on_track": true
    } 
    */

    let projectID = location.search.substring(location.search.indexOf("=") + 1, (location.search.indexOf("&") > -1 ? location.search.indexOf("&") : location.search.length));
    let projectName = projectID.replace(/-/g, " ");
    let edit = (location.search.includes("&edit=true"));
    document.querySelector("#project-name").innerHTML = projectName;

    readDatabase("/jobs", jobs => {

        let project;

        for (let job of jobs) {

            if (job.title == projectName) {
                project = job;
            }

        }

        if (project && !edit) {

            document.querySelector("#lead").innerHTML = `Leader: ${project.lead}`;
            document.querySelector("#mentor").innerHTML = `Mentor: ${project.mentor}`;
            document.querySelector("#start").innerHTML = `Start Date: ${project.start_date}`;
            document.querySelector("#end").innerHTML = `End Date: ${project.end_date}`;

            document.querySelector("#description").innerHTML = (project.description || "");

            createMemberBox(project, false);

            document.querySelector("#last-update").innerHTML = `Last Update: ${(project.last_update || "NA")}`;
            document.querySelector("#changes").innerHTML = `Changes: ${(project.changes || "NA")}`;
            document.querySelector("#revisor").innerHTML = `Revisor: ${(project.revisor || "NA")}`;
            document.querySelector("#approval").innerHTML = `Approval: ${(project.approval || "NA")}`;

            document.querySelector("#objectives").innerHTML = (project.objectives || "");

            createScheduleBox(project, false);

        }

        if (project && edit) {

            modifiedCharter = JSON.parse(JSON.stringify(project));
            originalCharter = JSON.parse(JSON.stringify(project));

            document.querySelector("#edit").setAttribute("hidden", "true");
            document.querySelector("#save").removeAttribute("hidden");

            document.querySelector("#lead").innerHTML = `Leader: <input type="text" onchange="updateInformation('lead')" placeholder="${project.lead}">`;
            document.querySelector("#mentor").innerHTML = `Mentor: <input type="text" onchange="updateInformation('mentor')" placeholder="${project.mentor}">`;
            document.querySelector("#start").innerHTML = `Start Date: <input type="date" onchange="updateInformation('start_date')" value="${project.start_date}">`;
            document.querySelector("#end").innerHTML = `End Date: <input type="date" onchange="updateInformation('end_date')" value="${project.end_date}">`;

            document.querySelector("#description").innerHTML = `<textarea onchange="updateInformation('description')">${(project.description || "")}</textarea>`;

            createMemberBox(project, true);

            document.querySelector("#last-update").innerHTML = `Last Update: ${(project.last_update || "NA")}`;
            document.querySelector("#changes").innerHTML = `Changes: ${(project.changes || "NA")}`;
            document.querySelector("#revisor").innerHTML = `Revisor: ${(project.revisor || "NA")}`;
            document.querySelector("#approval").innerHTML = `Approval: ${(project.approval || "NA")}`;

            document.querySelector("#objectives").innerHTML = `<textarea onchange="updateInformation('objectives')">${(project.objectives || "")}</textarea>`;

            createScheduleBox(project, true);

        }

    });

}

function createMemberBox(project, edit) {

    let memberBox = document.querySelector("#members");

    if (!edit) {

        for (let member of project.members) {

            let tr = document.createElement("tr");
            tr.appendChild(createElmWithText("td", member));
            tr.appendChild(createElmWithText("td", (project[`${member.toLowerCase().replace(/ /g, "_")}_role`] || "No role assigned"))); // TODO
            memberBox.appendChild(tr);

        }

    } else {

        for (let member of project.members) {

            let tr = document.createElement("tr");
            tr.appendChild(createElmWithText("td", member));

            let td = document.createElement("td");
            let input = document.createElement("input");
            input.onchange = () => { updateInformation(`${member.toLowerCase().replace(/ /g, "_")}_role`) };
            input.setAttribute("type", "text");
            input.setAttribute("placeholder", (project[`${member.toLowerCase().replace(/ /g, "_")}_role`] || "No role assigned"));
            td.appendChild(input);

            let removeButton = createElmWithText("label", "X");
            removeButton.onclick = () => { removeMember(member) };
            removeButton.className = "remove";
            td.appendChild(removeButton);

            tr.appendChild(td);
            memberBox.appendChild(tr);

        }

        let addButton = createElmWithText("label", "+");
        addButton.onclick = () => { addMember() };
        addButton.className = "add";
        memberBox.querySelector("th:nth-child(2)").appendChild(addButton);

    }

}

function createScheduleBox(project, edit) {

    let scheduleBox = document.querySelector("#schedule");

    if (!edit) {

        if (project.milestones && project.milestones.length > 0) {

            for (let milestone of project.milestones) {

                let tr = document.createElement("tr");
                tr.appendChild(createElmWithText("td", milestone.name));
                tr.appendChild(createElmWithText("td", (milestone.deadline || "TBD")));
                scheduleBox.appendChild(tr);

            }

        }

    } else {

        if (project.milestones && project.milestones.length > 0) {

            for (let milestone of project.milestones) {

                let tr = document.createElement("tr");
                tr.appendChild(createElmWithText("td", milestone.name));

                let td = createElmWithText("td", milestone.deadline);
                let removeButton = createElmWithText("label", "X");
                removeButton.onclick = () => { removeMilestone(milestone.name) };
                removeButton.className = "remove";
                td.appendChild(removeButton);

                tr.appendChild(td);
                scheduleBox.appendChild(tr);

            }

        }

        let addButton = createElmWithText("label", "+");
        addButton.onclick = () => { addMilestone() };
        addButton.className = "add";
        scheduleBox.querySelector("th:nth-child(2)").appendChild(addButton);

    }

}

function openCharter(projectName) {

    location.href = "./charter.html?project=" + projectName;

}

let originalCharter = {};
let modifiedCharter = {};

function editCharter() {

    location.search = location.search + "&edit=true"

}

function updateInformation(field) {

    modifiedCharter[field] = event.target.value;

}

function saveCharter() {

    readDatabase("/jobs", data => {

        for (let i = 0; i < data.length; i++) {

            if (data[i].title == originalCharter.title) {

                setDatabase(`/jobs/${i}`, modifiedCharter);
                alert("Charter saved!");
                history.back();
                return;

            }

        }

        setDatabase(`/jobs/${data.length}`, modifiedCharter);
        alert("Charter saved!");
        history.back();

    });

}

function removeMember(name) {

    modifiedCharter.members.splice(modifiedCharter.members.indexOf(name), 1);
    for (let tr of document.querySelectorAll("#members tr")) {

        for (let td of tr.children) {

            if (td.innerHTML == name) {

                tr.setAttribute("hidden", "true");

            }

        }

    }
    delete modifiedCharter[`${name.toLowerCase().replace(/ /g, "_")}_role`];

}

function addMember() {

    let member = prompt("Enter the new member's name");
    modifiedCharter.members.push(member);

    let memberBox = document.querySelector("#members")

    let tr = document.createElement("tr");
    tr.appendChild(createElmWithText("td", member));

    let td = document.createElement("td");
    let input = document.createElement("input");
    input.onchange = () => { updateInformation(`${member.toLowerCase().replace(/ /g, "_")}_role`) };
    input.setAttribute("type", "text");
    input.setAttribute("placeholder", "No role assigned");
    td.appendChild(input);

    let removeButton = createElmWithText("label", "X");
    removeButton.onclick = () => { removeMember(member) };
    removeButton.className = "remove";
    td.appendChild(removeButton);

    tr.appendChild(td);
    memberBox.appendChild(tr);

}

function removeMilestone(name) {

    modifiedCharter.milestones.splice(modifiedCharter.milestones.indexOf(modifiedCharter.milestones.find(obj => { return obj.name == name })), 1);
    for (let tr of document.querySelectorAll("#schedule tr")) {

        for (let td of tr.children) {

            if (td.innerHTML == name) {

                tr.setAttribute("hidden", "true");

            }

        }

    }

}

function addMilestone() {

    let milestone = {};
    let scheduleBox = document.querySelector("#schedule");

    milestone.name = prompt("Enter the milestone's name");
    milestone.deadline = prompt("Enter the milestone's deadline");

    if (milestone.name == null || milestone.deadline == null) {

        return;

    }

    let tr = document.createElement("tr");
    tr.appendChild(createElmWithText("td", milestone.name));

    let td = createElmWithText("td", milestone.deadline);
    let removeButton = createElmWithText("label", "X");
    removeButton.onclick = () => { removeMilestone(milestone.name) };
    removeButton.className = "remove";
    td.appendChild(removeButton);

    tr.appendChild(td);
    scheduleBox.appendChild(tr);

    if (modifiedCharter.milestones == undefined) {

        modifiedCharter.milestones = [];

    }
    modifiedCharter.milestones.push(milestone);

}
