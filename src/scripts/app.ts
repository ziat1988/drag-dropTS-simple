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

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLFormElement;

    this.titleInputElement = this.element.querySelector("#title") as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector("#description") as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector("#people") as HTMLInputElement;

    this.configure();
    this.attach();
  }

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    this.cleanError();
    const newProject = new Project(this.titleInputElement.value, this.descriptionInputElement.value, +this.peopleInputElement.value);

    const validator = new ValidateExecutor();
    const resultValidation = validator.validate(newProject);

    console.log(resultValidation);
    if (!validator.isValidateGetter) {
      // show error & focus
      this.showErrorInput(resultValidation);

      return;
    }

    this.clearInputs();

    console.log("submit ok");
  }

  private cleanError() {
    const nodeList = this.element.querySelectorAll(".error");
    for (let i = 0; i < nodeList.length; i++) {
      nodeList[i].remove();
    }
  }
  private showErrorInput(obj: IResultValitation) {
    for (const [key] of Object.entries(obj)) {
      const mappingInput = {
        title: this.titleInputElement,
        description: this.descriptionInputElement,
        people: this.peopleInputElement,
      };

      if (obj[key][0] === false) {
        const templateErr = `<div class="error">${obj[key][1]}</div>`;
        (<any>mappingInput)[key].focus();
        (<any>mappingInput)[key].insertAdjacentHTML("afterend", templateErr); //
      }
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
type IResultValitation = {
  // {title:[true,"something"]}
  [nameProp: string]: tupleMsgValidation;
};

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

//TODO: get after decorator implement
//const registeredValidators: IRegistorValidator = { Project: { title: { required: true }, description: { required: true, minNumber: 5 } } };
const registeredValidators: IRegistorValidator = {}; //init empty object

class Project {
  @Required()
  title: string;

  @Min(2)
  @Required()
  people: number;

  @MinLength(5)
  @Required()
  description: string;

  constructor(title: string, description: string, people: number) {
    this.title = title;
    this.people = people;
    this.description = description;
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

  validate(obj: any): IResultValitation {
    const objValidatorConfig = registeredValidators[obj.constructor.name];

    // check if (Object.keys({}).length === 0) {
    //console.log('I will not print');
    // }

    const resultValidation: IResultValitation = {}; // {title:[false,"somethingwrong"]}
    for (const prop in objValidatorConfig) {
      const allConditionValidation: Validator = objValidatorConfig[prop]; // {required: true, minNumber: 5 }

      for (const [key, value] of Object.entries(allConditionValidation)) {
        //console.log(prop, key, value); //title required true

        const res = (<any>this)[`${key}`](obj[prop], value); // call function by string name
        console.log("thu tu goi function:", prop);
        if (res[0] === false) {
          this.isValidateSetter = false;
          resultValidation[prop] = res;
          break; // exit loop inner to get only first false condition
        }
        resultValidation[prop] = [true, ""]; //will be override but its ok
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
