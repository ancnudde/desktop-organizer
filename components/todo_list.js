class ToDoState {
    constructor(writtenText) {
        this.writtenText = writtenText ? writtenText : '';
    }

    getWrittenText() {
        return this.writtenText;
    }

    setWrittenText(newText) {
        this.writtenText = newText;
    }
}

class WritingToDoState extends ToDoState {
    constructor(writtenText) {
        super(writtenText ? writtenText : '');
    }
}

class WrittenToDoState extends ToDoState {
    constructor(writtenText) {
        super(writtenText ? writtenText : '');
    }
}



/*
Todo list containing items. 
*/

class ToDoList extends HTMLElement {

    constructor() {
        super();
        this.state = new WrittenToDoState();
        this.writtenText = 'ToDo:';
        this.content = new DocumentFragment();
        this.template = document.createElement('template');
    }

    connectedCallback() {
        this.render();
        this.appendChild(this.content);
    };

    render() {
        let templateDefinition =
            `
            <todo-title></todo-title>
            <todo-item></todo-item>
        `
        this.template.innerHTML = templateDefinition;
        this.content.appendChild(this.template.content.cloneNode(true))
    }

}


/*
Todo items added to a todo list.

A Todo item changes from a text input to a div on clikc/text entered depending
on its state {@WritingToDoState; @WrittenToDoState} to either receive a new text
of display entered one.
*/

class ToDoItem extends HTMLElement {
    constructor() {
        super();
        this.state = new WritingToDoState();
        this.writtenText = '';
        this.content = new DocumentFragment();
        this.template = document.createElement("template");
        this.boundOnEnterKeyDown = this.onEnterKeyDown.bind(this)
        this.boundSetState = this.setState.bind(this)
    }

    static get ObservedAttributes() {
        return ['state'];
    }

    render() {
        let templateDefinition =
            this.state instanceof WritingToDoState
                ? `
                <input type='text' class='todo-item' rows='1') 
                    value='${this.state.getWrittenText()}'/>
                `
                : `
                <div class='todo-item todo-item--written'>
                    <div class='todo-item--bullet'></div>
                    <div class='todo-item--text'>
                        ${this.state.getWrittenText()}
                    </div>
                </div>
                `;
        this.template.innerHTML = templateDefinition;
        this.content.append(this.template.content.cloneNode(true));
    }

    rerender() {
        this.render();
        this.append(this.content);
        if (this.state instanceof WritingToDoState) {
            this.addEventListener('keyup', this.boundOnEnterKeyDown);
            this.removeEventListener('click', this.boundSetState);
        } else {
            this.addEventListener('click', this.boundSetState);
            this.removeEventListener('keyup', this.boundOnEnterKeyDown);
        }
    }

    connectedCallback() {
        this.rerender();
    }

    setState() {
        if (this.state instanceof WritingToDoState) {
            this.state = new WrittenToDoState(this.state.getWrittenText());
        } else {
            this.state = new WritingToDoState(this.state.getWrittenText());
        }
        this.innerHTML = '';
        this.rerender();
    }

    onEnterKeyDown(event) {
        if (event.key === "Enter") {
            this.state.setWrittenText(this.writtenText);
            this.setState();
        } else {
            this.writtenText = this.children[0].value
        }
    }
}

class ToDoTitle extends ToDoItem {

    constructor() {
        super();
        this.writtenText = 'ToDo:';
        this.state = new WrittenToDoState('ToDo:');
        this.content = new DocumentFragment();
        this.template = document.createElement('template');
    }

    render() {
        let templateDefinition = this.state instanceof WrittenToDoState ?
            `
          <div class='todo-list__title'>${this.state.getWrittenText()}</div>
        ` : `
          <input type='text' class='todo-list__title' 
                 value='${this.state.getWrittenText()}'>
          </input>
        `
        this.template.innerHTML = templateDefinition;
        this.content.appendChild(this.template.content.cloneNode(true))
    }
}

customElements.define('todo-list', ToDoList);
customElements.define('todo-item', ToDoItem);
customElements.define('todo-title', ToDoTitle)