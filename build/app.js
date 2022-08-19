"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
        const validator = new ValidateExecutor();
        const resultValidation = validator.validate(newProject);
        console.log("result:", resultValidation);
        if (!validator.isValidateGetter && resultValidation) {
            this.showErrorInput(resultValidation);
            return;
        }
        this.clearInputs();
        console.log("submit ok");
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
//# sourceMappingURL=app.js.map