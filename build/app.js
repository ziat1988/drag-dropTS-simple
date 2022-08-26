"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
class Subscriber {
    constructor() {
        this.subscribers = new Set();
    }
    subscrible(cb) {
        this.subscribers.add(cb);
    }
    publish(data) {
        this.subscribers.forEach(function (f) {
            console.log("data in publish:", data);
            f(data);
        });
    }
    getList() {
        return this.subscribers;
    }
}
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
})(ProjectStatus || (ProjectStatus = {}));
class ProjectState extends Subscriber {
    constructor() {
        super();
        this.listProject = [
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
    }
    static getInstance() {
        if (this._instance) {
            return this._instance;
        }
        this._instance = new ProjectState();
        return this._instance;
    }
    get projects() {
        return this.listProject;
    }
    addProject(project) {
        console.log("project:", project);
        this.listProject.push(project);
        this.publish(project);
    }
}
const projectState = ProjectState.getInstance();
function autobind(_, _2, descriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor = {
        configurable: true,
        get() {
            return originalMethod.bind(this);
        },
    };
    return adjDescriptor;
}
class ProjectInput {
    constructor() {
        this.templateElement = document.getElementById("project-input");
        this.hostElement = document.getElementById("app");
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.titleInputElement = this.element.querySelector("#title");
        this.descriptionInputElement = this.element.querySelector("#description");
        this.peopleInputElement = this.element.querySelector("#people");
        this.configure();
        this.attach();
    }
    submitHandler(event) {
        event.preventDefault();
        this.cleanError();
        const newProject = new Project(this.titleInputElement.value, this.descriptionInputElement.value, +this.peopleInputElement.value);
        const isValidate = this.validateInput(newProject);
        if (!isValidate) {
            return;
        }
        projectState.addProject(newProject);
        this.clearInputs();
        console.log("submit ok");
    }
    validateInput(newProject) {
        const validator = new ValidateExecutor();
        const resultValidation = validator.validate(newProject);
        if (!validator.isValidateGetter && resultValidation) {
            this.showErrorInput(resultValidation);
            return false;
        }
        return true;
    }
    cleanError() {
        const nodeList = this.element.querySelectorAll(".error");
        for (let i = 0; i < nodeList.length; i++) {
            nodeList[i].remove();
        }
    }
    showErrorInput(resultsMap) {
        let inputFocus = undefined;
        for (const [key, val] of resultsMap) {
            const mappingInput = {
                title: this.titleInputElement,
                description: this.descriptionInputElement,
                people: this.peopleInputElement,
            };
            if (val[0] === false) {
                const templateErr = `<div class="error">${val[1]}</div>`;
                if (!inputFocus) {
                    inputFocus = mappingInput[key];
                }
                mappingInput[key].insertAdjacentHTML("afterend", templateErr);
            }
        }
        if (inputFocus) {
            inputFocus.focus();
        }
    }
    configure() {
        this.element.addEventListener("submit", this.submitHandler);
    }
    attach() {
        this.hostElement.insertAdjacentElement("afterbegin", this.element);
    }
    clearInputs() {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    }
}
__decorate([
    autobind
], ProjectInput.prototype, "submitHandler", null);
const projectInput = new ProjectInput();
function Required() {
    return function (target, propName) {
        var _a;
        registeredValidators[target.constructor.name] = Object.assign(Object.assign({}, registeredValidators[target.constructor.name]), { [propName]: Object.assign(Object.assign({}, (registeredValidators[target.constructor.name] ? (_a = registeredValidators[target.constructor.name][propName]) !== null && _a !== void 0 ? _a : {} : {})), { required: true }) });
        console.log(registeredValidators);
    };
}
function Min(min) {
    return function (target, propName) {
        var _a;
        registeredValidators[target.constructor.name] = Object.assign(Object.assign({}, registeredValidators[target.constructor.name]), { [propName]: Object.assign(Object.assign({}, (registeredValidators[target.constructor.name] ? (_a = registeredValidators[target.constructor.name][propName]) !== null && _a !== void 0 ? _a : {} : {})), { min: min }) });
    };
}
function MinLength(sizeMin) {
    return function (target, propName) {
        var _a;
        registeredValidators[target.constructor.name] = Object.assign(Object.assign({}, registeredValidators[target.constructor.name]), { [propName]: Object.assign(Object.assign({}, (registeredValidators[target.constructor.name] ? (_a = registeredValidators[target.constructor.name][propName]) !== null && _a !== void 0 ? _a : {} : {})), { minLength: sizeMin }) });
    };
}
const registeredValidators = {};
class Project {
    constructor(title, description, people) {
        this.title = title;
        this.people = people;
        this.description = description;
        this.id = Math.random();
        this.status = ProjectStatus.Active;
    }
}
__decorate([
    Required()
], Project.prototype, "title", void 0);
__decorate([
    MinLength(5),
    Required()
], Project.prototype, "description", void 0);
__decorate([
    Min(2),
    Required()
], Project.prototype, "people", void 0);
class ValidateExecutor {
    constructor() {
        this._isValidate = true;
    }
    set isValidateSetter(value) {
        this._isValidate = value;
    }
    get isValidateGetter() {
        return this._isValidate;
    }
    validate(obj) {
        const objValidatorConfig = registeredValidators[obj.constructor.name];
        if (!objValidatorConfig) {
            this.isValidateSetter = true;
            return;
        }
        const resultValidation = new Map();
        for (const prop in objValidatorConfig) {
            const allConditionValidation = objValidatorConfig[prop];
            for (const [key, value] of Object.entries(allConditionValidation)) {
                const res = this[`${key}`](obj[prop], value);
                console.log("thu tu goi function:", prop);
                if (res[0] === false) {
                    this.isValidateSetter = false;
                    resultValidation.set(prop, res);
                    break;
                }
                resultValidation.set(prop, [true, ""]);
            }
        }
        console.log("bool:", this.isValidateGetter);
        return resultValidation;
    }
    required(input, val, msg) {
        if (val === false)
            return [true, ""];
        return [!(input.toString().trim().length === 0), msg !== null && msg !== void 0 ? msg : "This field is required"];
    }
    min(input, min, msg) {
        return [input > min, msg !== null && msg !== void 0 ? msg : "Number must be more than " + min + "."];
    }
    minLength(input, min, msg) {
        return [input.toString().trim().length > min, msg !== null && msg !== void 0 ? msg : "text must have more than " + min + " characters"];
    }
}
class ProjectItem {
    constructor(projectItem, idUl) {
        this.projectItem = projectItem;
        this.idUl = idUl;
        this.templateElement = document.getElementById("single-project");
        this.hostElement = document.getElementById(idUl);
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.renderContent();
        this.attach();
    }
    renderContent() {
        this.element.querySelector("h2").textContent = this.projectItem.title;
        this.element.querySelector("h3").textContent = this.projectItem.people.toString();
        this.element.querySelector("p").textContent = this.projectItem.description;
    }
    attach() {
        this.hostElement.insertAdjacentElement("beforeend", this.element);
    }
}
class ProjectList {
    constructor(type) {
        this.type = type;
        this.templateElement = document.getElementById("project-list");
        this.hostElement = document.getElementById("app");
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = `${this.type}-projects`;
        this.renderContent();
        this.attach();
        this.renderProjects();
        projectState.subscrible(this.renderProjects);
    }
    renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`);
        listEl.innerHTML = "";
        const projectsAssign = projectState.projects.filter((project) => {
            if (this.type === "active") {
                return project.status === ProjectStatus.Active;
            }
            return project.status === ProjectStatus.Finished;
        });
        console.log("apres filter:", projectState.projects);
        for (const prjItem of projectsAssign) {
            new ProjectItem(prjItem, `${this.type}-projects-list`);
        }
    }
    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul").id = listId;
        this.element.querySelector("h2").textContent = this.type.toUpperCase() + " PROJECTS";
    }
    attach() {
        this.hostElement.insertAdjacentElement("beforeend", this.element);
    }
}
__decorate([
    autobind
], ProjectList.prototype, "renderProjects", null);
new ProjectList("active");
new ProjectList("finished");
//# sourceMappingURL=app.js.map