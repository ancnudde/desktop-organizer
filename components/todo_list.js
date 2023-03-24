const ToDoState = Object.freeze({
    Selected: "selected",
    Unselected: "unselected",
});

const ToDoItemState = Object.freeze({
    Writing: "writing",
    Written: "written",
});

const CheckedToDoItem = Object.freeze({
    Checked: "checked",
    Unchecked: "unchecked"
})

/*
Todo list containing items. Can add new items by clicking button.
*/

class ToDoList extends HTMLElement {
    constructor() {
        super();
        this.writtenText = "ToDo:";
        this.content = new DocumentFragment();
        this.template = document.createElement("template");
    }


    addNewItem() {
        this.appendChild(new ToDoItem());
    }

    connectedCallback() {
        this.render();
        this.appendChild(this.content);
        this.getElementsByClassName("todo-header__add-button")[0]
            .addEventListener("click", this.addNewItem.bind(this));
    }

    render() {
        let templateDefinition = `
            <div class='todo-header'>
                <todo-title></todo-title>
                <button class='todo-header__add-button' id='add_button'>
                    +
                </button>
            </div class='todo-header'>
            <todo-item></todo-item>
        `;
        this.template.innerHTML = templateDefinition;
        this.content.appendChild(this.template.content.cloneNode(true));
    }
}

/*
Todo items added to a todo list.

A Todo item changes from a text input to a div on clikc/text entered depending
on its state {@WritingToDoItemState; @WrittenToDoItemState} to either receive 
a new text of display entered one.
*/

class ToDoItem extends HTMLElement {
    constructor() {
        super();
        this.writtenText = "";
        this.content = new DocumentFragment();
        this.template = document.createElement("template");
        this.boundOnEnterKeyDown = this.onEnterKeyDown.bind(this);
        this.boundSetState = this.toggleWriting.bind(this);
        this.boundToggleChecked = this.toggleChecked.bind(this);
        this.boundRemoveThis = this.removeThis.bind(this);
    }

    static get observedAttributes() {
        return ["state", "checked"];
    }

    /*
    Renders differentially depending on state;
      -Writting: returns a text input
      - Written - Unchecked: returns a bullet point, a text and a checkbox
      - Written - Checked: returns a bullet point, a line-trough text and 
            a checked checkbox
    */
    render() {
        let templateDefinition =
            this.getAttribute("state") === ToDoItemState.Writing
                ? `
                <input type='text' class='todo-item' rows='1') 
                    value='${this.writtenText}'/>
                `
                : this.getAttribute("checked") === CheckedToDoItem.Unchecked ? `
                <div class='todo-item todo-item--written'>
                    <div class='todo-item--bullet'></div>
                    <div class='todo-item--text'>
                        ${this.writtenText}
                    </div>
                    <div class='todo-item--checkbox'>
                </div>
                `: ` 
                <div class='todo-item todo-item--written'>
                   <div class='todo-item--bullet'></div>
                   <div class='todo-item--text todo-item--text--checked'>
                       ${this.writtenText}
                   </div>
                   <div class='todo-item--checkbox todo-item--checkbox--checked'>
               </div>` ;
        templateDefinition += `<button class='todo-item__remove-button'></button>`
        this.template.innerHTML = templateDefinition;
        this.content.append(this.template.content.cloneNode(true));
    }

    rerender() {
        this.render();
        this.append(this.content);
        if (this.getAttribute("state") === ToDoItemState.Writing) {
            this.getElementsByClassName("todo-item")[0]
                .addEventListener("keyup", this.boundOnEnterKeyDown);
        } else {
            this.getElementsByClassName("todo-item--text")[0]
                .addEventListener("click", this.boundSetState);
            this.getElementsByClassName("todo-item--checkbox")[0]
                .addEventListener('click', this.boundToggleChecked)
        }
        this.getElementsByClassName("todo-item__remove-button")[0]
            .addEventListener('click', this.boundRemoveThis)
    }

    connectedCallback() {
        this.setAttribute("state", ToDoItemState.Writing);
        this.setAttribute("checked", CheckedToDoItem.Unchecked);
    }

    disconnectedCallback() {
        if (this.getAttribute("state") === ToDoItemState.Writing) {
            this.getElementsByClassName("todo-item")[0]
                .removeEventListener("keyup", this.boundOnEnterKeyDown);
        } else {
            this.getElementsByClassName("todo-item--text")[0]
                .removeEventListener("click", this.boundSetState);
            this.getElementsByClassName("todo-item--checkbox")[0]
                .removeEventListener('click', this.boundToggleChecked)
        }
    }

    attributeChangedCallback() {
        this.innerHTML = "";
        this.rerender();
    }

    toggleWriting() {
        this.setAttribute("state",
            this.getAttribute("state") === ToDoItemState.Written
                ? ToDoItemState.Writing
                : ToDoItemState.Written
        );
    }

    toggleChecked() {
        this.setAttribute("checked",
            this.getAttribute("checked") === CheckedToDoItem.Checked
                ? CheckedToDoItem.Unchecked
                : CheckedToDoItem.Checked)
    }

    onEnterKeyDown(event) {
        if (event.key === "Enter") {
            this.toggleWriting();
        } else {
            this.writtenText = this.getElementsByTagName("input")[0].value;
        }
    }

    removeThis() {
        this.parentNode.removeChild(this);
    }
}


/*
Todo title of a todo list.

Extends @ToDoItem, differs by rendering and associated callbacks.
*/
class ToDoTitle extends ToDoItem {
    constructor() {
        super();
        this.writtenText = "ToDo:";
        this.content = new DocumentFragment();
        this.template = document.createElement("template");
    }

    connectedCallback() {
        this.setAttribute("state", ToDoItemState.Written);
    }

    disconnectedCallback() {
        if (this.getAttribute("state") === ToDoItemState.Writing) {
            this.removeEventListener('keyup', this.boundOnEnterKeyDown);
        } else {
            this.removeEventListener('click', this.boundSetState);
        }
    }

    render() {
        let templateDefinition =
            this.getAttribute("state") === ToDoItemState.Written
                ? `
          <div class='todo-title'>${this.writtenText}</div>
        `
                : `
          <input type='text' class='todo-title' 
                 value='${this.writtenText}'>
          </input>
        `;
        this.template.innerHTML = templateDefinition;
        this.content.appendChild(this.template.content.cloneNode(true));
    }

    rerender() {
        this.render();
        this.append(this.content);
        if (this.getAttribute("state") === ToDoItemState.Writing) {
            this.addEventListener('keyup', this.boundOnEnterKeyDown);
            this.removeEventListener('click', this.boundSetState);
        } else {
            this.addEventListener('click', this.boundSetState);
            this.removeEventListener('keyup', this.boundOnEnterKeyDown);
        }
    }
}

customElements.define("todo-list", ToDoList);
customElements.define("todo-item", ToDoItem);
customElements.define("todo-title", ToDoTitle);
