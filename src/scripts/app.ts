document.getElementById("user-input").addEventListener("submit", function (event) {
  event.preventDefault();

  const titleInput = document.getElementById("title")! as HTMLInputElement;
  const descriptionInput = document.getElementById("description")! as HTMLTextAreaElement;
  const peopleInput = document.getElementById("people")! as HTMLTextAreaElement;

  const title = titleInput.value;
  const description = descriptionInput.value;
  const people = +peopleInput.value;
  const newProject = new Project(title, description, people);

  newProject.renderListActive();
});

let draggingLi = undefined;
// drag event
document.addEventListener("dragstart", function (event) {
  const element = event.target as Element;
  draggingLi = element;
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

const allDropZone = document.querySelectorAll(".drop-zone") as NodeList;
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
  let element = event.target as HTMLElement; // ul
  const draggItem = document.getElementById(id)! as HTMLElement;

  if (element.tagName === "UL") {
    element.insertAdjacentElement("beforeend", draggItem);
    return;
  }

  if (element.tagName !== "LI") {
    element = element.closest("LI"); // only work with LI
  }

  // get the ul of that element
  const listItem = element.parentNode as HTMLElement;
  console.log("list item:", listItem);
  console.log("element:", element);
  const arrItem = Array.from(listItem.children);
  const indexElement = arrItem.indexOf(element);
  const indexDragItem = arrItem.indexOf(draggItem);

  // if indexDragItem = -1 : swap list

  if (indexDragItem < 0) {
    listItem.insertBefore(draggItem, listItem.firstChild); // insert in first place
    return;
  }

  if (indexDragItem < indexElement) {
    // insert after
    listItem.insertBefore(draggItem, element.nextSibling);
  } else {
    //insert before
    listItem.insertBefore(draggItem, element);
  }
}

class Project {
  title: string;
  description: string;
  people: number;
  uid: number;

  constructor(title: string, description: string, people: number) {
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
