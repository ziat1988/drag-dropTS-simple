document.getElementById("user-input").addEventListener("submit", function (event) {
    event.preventDefault();
    const titleInput = document.getElementById("title");
    const descriptionInput = document.getElementById("description");
    const peopleInput = document.getElementById("people");
    const title = titleInput.value;
    const description = descriptionInput.value;
    const people = +peopleInput.value;
    const newProject = new Project(title, description, people);
    newProject.renderListActive();
});
// drag event
document.addEventListener("dragstart", function (event) {
    const element = event.target;
    if (!element || !element.classList.contains("item-project")) {
        return;
    }
    const uid = element.getAttribute("id");
    event.dataTransfer.setData("text/plain", uid);
    setTimeout(() => {
        //element.classList.add('hide');
    }, 0);
});
// drop target
const allDropZone = document.querySelectorAll(".drop-zone");
allDropZone.forEach((item) => {
    item.addEventListener("dragenter", dragEnter, { once: true });
    item.addEventListener("dragover", dragOver);
    item.addEventListener("drop", handleDrop);
});
function dragEnter(event) {
    console.log("listening");
    event.preventDefault();
}
function dragOver(event) {
    event.preventDefault();
}
function handleDrop(event) {
    const id = event.dataTransfer.getData("text/plain");
    let element = event.target;
    const draggItem = document.getElementById(id);
    const currentZone = event.currentTarget;
    const zoneDropList = currentZone.querySelector("UL");
    const zoneDragList = draggItem.parentNode;
    if (zoneDropList !== zoneDragList) {
        zoneDropList.prepend(draggItem);
        return;
    }
    // traitement inside same zone
    if (element.tagName !== "LI") {
        element = element.closest("LI"); // only work with LI
    }
    const arrItem = Array.from(zoneDropList.children);
    const indexElement = arrItem.indexOf(element);
    const indexDragItem = arrItem.indexOf(draggItem);
    if (indexDragItem < indexElement) {
        // insert after
        zoneDropList.insertBefore(draggItem, element.nextSibling);
    }
    else {
        //insert before
        zoneDropList.insertBefore(draggItem, element);
    }
}
class Project {
    constructor(title, description, people) {
        this.title = title;
        this.description = description;
        this.people = people;
        this.uid = Math.random();
    }
    renderListActive() {
        // render list in active prject section
        document.getElementById("active-project-list").insertAdjacentHTML("beforeend", this.templateCardItem());
    }
    templateCardItem() {
        return `
            <li class="item-project" draggable="true" id=${this.uid}>
                <h2>${this.title}</h2>
                <h3>${this.people} persons assigned</h3>
                <p>${this.description}</p>
            </li>
        `;
    }
}
