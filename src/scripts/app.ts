// TODO: check  if many listener cause problem when publish?
class Subscriber<T> {
  private subscribers: Set<(data: T) => void> = new Set(); // list of function unique

  constructor() {}

  subscrible(cb: (data: T) => void): void {
    this.subscribers.add(cb);
  }

  publish(data: T): void {
    this.subscribers.forEach(function (f) {
      console.log("data in publish:", data);
      f(data);
    });
  }

  getList() {
    return this.subscribers;
  }
}

enum ProjectStatus {
  Active,
  Finished,
}
class ProjectState extends Subscriber<Project> {
  private static _instance: ProjectState;
  listProject: Project[] = [
    {
      id: 1,
      title: "haa",
      description: "fdpofpdo",
      status: ProjectStatus.Active,
      people: 5,
    },
    {
      id: 2,
      title: "pop",
      description: "fdpofpdo",
      status: ProjectStatus.Finished,
      people: 5,
    },
  ];
  private constructor() {
    super();
  }

  static getInstance() {
    if (this._instance) {
      return this._instance;
    }
    // initiate if not
    this._instance = new ProjectState();
    return this._instance;
  }

  get projects() {
    return this.listProject;
  }

  addProject(project: Project): void {
    console.log("project:", project);
    this.listProject.push(project);
    this.publish(project);
    // loop listener
  }
}
const projectState = ProjectState.getInstance();

function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      return originalMethod.bind(this);
    },
  };

  return adjDescriptor;
}

class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;

  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById("project-input")! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(this.templateElement.content, true); // deep: child node also get
    this.element = importedNode.firstElementChild as HTMLFormElement;

    this.titleInputElement = this.element.querySelector("#title") as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector("#description") as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector("#people") as HTMLInputElement;

    this.configure();
    this.attach();
  }

  @autobind
  private submitHandler(event: Event): void {
    event.preventDefault();
    this.cleanError();
    const newProject: Project = new Project(this.titleInputElement.value, this.descriptionInputElement.value, +this.peopleInputElement.value);
    const isValidate = this.validateInput(newProject);

    if (!isValidate) {
      return;
    }
    // TODO: set state
    projectState.addProject(newProject);
    this.clearInputs();

    console.log("submit ok");
  }

  private validateInput(newProject: Project): boolean {
    const validator = new ValidateExecutor();
    const resultValidation = validator.validate(newProject);

    if (!validator.isValidateGetter && resultValidation) {
      // show error & focus
      this.showErrorInput(resultValidation);
      return false;
    }
    return true;
  }

  private cleanError() {
    const nodeList = this.element.querySelectorAll(".error");
    for (let i = 0; i < nodeList.length; i++) {
      nodeList[i].remove();
    }
  }

  private showErrorInput(resultsMap: Map<string, tupleMsgValidation>) {
    let inputFocus: HTMLInputElement | undefined = undefined;
    for (const [key, val] of resultsMap) {
      const mappingInput = {
        title: this.titleInputElement,
        description: this.descriptionInputElement,
        people: this.peopleInputElement,
      };

      if (val[0] === false) {
        const templateErr = `<div class="error">${val[1]}</div>`;
        if (!inputFocus) {
          inputFocus = (<any>mappingInput)[key];
        }

        (<any>mappingInput)[key].insertAdjacentHTML("afterend", templateErr); //
      }
    }

    if (inputFocus) {
      inputFocus.focus();
    }
  }

  //set up event listener to form
  private configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }

  private clearInputs(): void {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }
}

const projectInput = new ProjectInput();

interface Validator {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

/*
interface IProject {
  title: string;
  people: number;
  description: string;
}
*/

type tupleMsgValidation = [boolean, string];

type IRegistorValidator = {
  [nameClass: string]: { [props: string]: Validator };
};

// Decorators

function Required() {
  return function (target: any, propName: string) {
    registeredValidators[target.constructor.name] = {
      ...registeredValidators[target.constructor.name],

      [propName]: { ...(registeredValidators[target.constructor.name] ? registeredValidators[target.constructor.name][propName] ?? {} : {}), required: true },
    };

    console.log(registeredValidators);
  };
}

function Min(min: number) {
  return function (target: any, propName: string) {
    registeredValidators[target.constructor.name] = {
      ...registeredValidators[target.constructor.name],
      [propName]: { ...(registeredValidators[target.constructor.name] ? registeredValidators[target.constructor.name][propName] ?? {} : {}), min: min },
    };
  };
}

function MinLength(sizeMin: number) {
  return function (target: any, propName: string) {
    registeredValidators[target.constructor.name] = {
      ...registeredValidators[target.constructor.name],
      [propName]: { ...(registeredValidators[target.constructor.name] ? registeredValidators[target.constructor.name][propName] ?? {} : {}), minLength: sizeMin },
    };
  };
}

//const registeredValidators: IRegistorValidator = { Project: { title: { required: true }, description: { required: true, minNumber: 5 } } };
const registeredValidators: IRegistorValidator = {}; //init empty object

class Project {
  @Required()
  title: string;

  @MinLength(5)
  @Required()
  description: string;

  @Min(2)
  @Required()
  people: number;

  id: number;
  status: ProjectStatus;

  constructor(title: string, description: string, people: number) {
    this.title = title;
    this.people = people;
    this.description = description;

    this.id = Math.random();
    this.status = ProjectStatus.Active;
  }
}

class ValidateExecutor {
  private _isValidate: boolean = true;

  constructor() {}

  set isValidateSetter(value: boolean) {
    this._isValidate = value;
  }

  get isValidateGetter(): boolean {
    return this._isValidate;
  }

  validate(obj: any): Map<string, tupleMsgValidation> | void {
    const objValidatorConfig = registeredValidators[obj.constructor.name];

    // check object empty
    if (!objValidatorConfig) {
      this.isValidateSetter = true;
      return;
    }

    const resultValidation: Map<string, tupleMsgValidation> = new Map<string, tupleMsgValidation>();

    for (const prop in objValidatorConfig) {
      const allConditionValidation: Validator = objValidatorConfig[prop]; // {required: true, minNumber: 5 }

      for (const [key, value] of Object.entries(allConditionValidation)) {
        //console.log(prop, key, value); //title required true

        const res = (<any>this)[`${key}`](obj[prop], value); // call function by string name
        console.log("thu tu goi function:", prop);
        if (res[0] === false) {
          this.isValidateSetter = false;
          resultValidation.set(prop, res);
          break; // exit loop inner to get only first false condition
        }
        resultValidation.set(prop, [true, ""]); //will be override but its ok
      }
    }

    console.log("bool:", this.isValidateGetter);

    return resultValidation;
  }

  required(input: string, val: boolean, msg?: string): tupleMsgValidation {
    if (val === false) return [true, ""]; // do nothing
    return [!(input.toString().trim().length === 0), msg ?? "This field is required"];
  }

  min(input: number, min: number, msg?: string): tupleMsgValidation {
    return [input > min, msg ?? "Number must be more than " + min + "."];
  }

  minLength(input: string, min: number, msg?: string): tupleMsgValidation {
    return [input.toString().trim().length > min, msg ?? "text must have more than " + min + " characters"];
  }
}

class ProjectItem {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;

  constructor(public projectItem: Project, public idUl: string) {
    this.templateElement = document.getElementById("single-project")! as HTMLTemplateElement;
    this.hostElement = document.getElementById(idUl)! as HTMLDivElement;
    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLElement;
    this.renderContent();
    this.attach();
    this.configure();
  }

  private renderContent() {
    this.element.querySelector("h2")!.textContent = this.projectItem.title;
    this.element.querySelector("h3")!.textContent = this.projectItem.people.toString();
    this.element.querySelector("p")!.textContent = this.projectItem.description;
  }

  private attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.element);
  }

  //set up event listener
  private configure() {
    this.element.addEventListener("dragstart", this.dragStart);
  }

  @autobind
  private dragStart(event: DragEvent) {
    event.dataTransfer?.setData("text/plain", this.projectItem.id.toString());
  }
}

// render list wrapper init
class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;

  constructor(private type: "active" | "finished") {
    this.templateElement = document.getElementById("project-list")! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;
    this.renderContent();
    this.attach();
    this.renderProjects(); // suppose persist database
    this.configure();
    projectState.subscrible(this.renderProjects); // subscribe to state
    console.log(projectState);
  }

  @autobind
  private renderProjects() {
    console.log("go here:", this.type);
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    listEl.innerHTML = "";

    const projectsAssign = projectState.projects.filter((project) => {
      if (this.type === "active") {
        return project.status === ProjectStatus.Active;
      }

      return project.status === ProjectStatus.Finished;
    });

    for (const prjItem of projectsAssign) {
      new ProjectItem(prjItem, `${this.type}-projects-list`);
    }
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId; // we add an id to the `ul` element (based on the list type, active or finished)
    this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + " PROJECTS"; // we fill the h2 title (based on the list type, active or finished)
  }

  private attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.element);
  }

  private configure() {
    // listener on drop
    this.element.addEventListener("dragenter", this.dragEnter);
    this.element.addEventListener("dragover", this.dragOver);
    this.element.addEventListener("drop", this.handleDrop);
  }
  private dragEnter(event: DragEvent) {
    // console.log(event);
    event.preventDefault();
  }

  private dragOver(event: DragEvent) {
    event.preventDefault();
  }

  @autobind
  private handleDrop(event: DragEvent) {
    event.preventDefault();

    console.log(event.dataTransfer!.effectAllowed);
    const idLi = event.dataTransfer!.getData("text/plain");

    // search item with id
    const project = projectState.projects.find((p) => p.id === +idLi);
    const newStatus = this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished;

    if (project && project.status !== newStatus) {
      project.status = newStatus;

      projectState.publish(project);

      console.log("here render after drop");
    }
  }
}

new ProjectList("active");
new ProjectList("finished");
