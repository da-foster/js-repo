/* 
 * Author: Darren Foster
 * Filename: ToDo_JS.js
 */

//Global array variable to hold to-do items
var toDoArr = [];

//Function that is triggered each time the 'Add Item' is pressed
const createToDo = () => {
    /*
      When the page reloads, there may be previous items in local storage that need to be included.
      Add these items into the array
     */        
    if (localStorage.getItem('todos')) {
        let existingItems = localStorage.getItem('todos');
        let existingParsed = JSON.parse(existingItems);
        for (let i = 0; i < existingParsed.length; i++) {
            if (!toDoArr.includes(existingParsed[i])) {
                toDoArr.push(existingParsed[i]);
            }
        }
    }
    //Validate if the input is acceptable. If so, retrieve the input and append into the global array
    if (document.querySelector) {
        let input = document.querySelector('#to-do-input').value;
        let date = document.getElementById('date-input').value;
        let time = document.querySelector('#time-input').value;
        let dateTime = date + ", " + time;
        let toDoItem = input + ": " + dateTime;
        if (input === '' || date === '' || time === '') { 
            let errorSection = document.querySelector('#error-section');
            errorSection.innerHTML = 'Please enter a date, time, and a to-do item';
            setTimeout(() => { 
                errorSection.innerHTML = "";
            }, 5000);
        } else {
            toDoArr.push(toDoItem);
            saveToDoList(); //Call to saveToDoList()
        }
    }
};

//Function that stringifies the global array and converts it into localStorage
const saveToDoList = () => {
    let stringified = JSON.stringify(toDoArr);
    localStorage.setItem('todos', stringified);
    renderToDoList(); //Call to renderToDoList()
};

//Function to render all the to-do items stored in the localStorage
const renderToDoList = () => {
    //Reset the list each time to account for the updated localStorage
    let listItems = document.querySelector('#todo-list');
    while (listItems.firstChild) {
      listItems.removeChild(listItems.firstChild);
    }
    let todos = localStorage.getItem('todos'); //Retrieve localStorage 'todos'
    let parsedToDoArr = JSON.parse(todos); //Parse the array of todos into an array of strings
    if (parsedToDoArr === null) return; //When the page loads, if the array is empty exit the function
    for (let i = 0; i < parsedToDoArr.length; i++) {
        let list = document.querySelector('#todo-list');
        let listItem = document.createElement('li');
        listItem.setAttribute('class', 'toDoItem');
        listItem.setAttribute('draggable', 'true');
        let check = document.createElement("input"); //Checkbox
        check.type='checkbox';
        check.setAttribute('class', 'completed');
        listItem.appendChild(check); //Append the checkbox
        listItem.appendChild(document.createTextNode(parsedToDoArr[i]));
        list.appendChild(listItem);
        addEventListeners(listItem); //Call to addEventListeners()
    //Clear the input fields
    document.querySelector('#to-do-input').value = '';
    document.getElementById('date-input').value = '';
    document.querySelector('#time-input').value = '';
    };
};

//Function to add event listeners to each of the to-do items from localStorage
var drag;
function addEventListeners(obj) {
    obj.addEventListener('dblclick', function(event) { //Make editable
        obj.contentEditable = true;
    });
    //Event listeners for drag / drop functionality
    obj.addEventListener('dragstart', function(event) {
        drag = this;
        this.style.opacity = .9;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/html', this.innerHTML);
    }, false);
    obj.addEventListener('dragover', function(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, false);
    obj.addEventListener('dragleave', function(event) {
        event.stopPropagation();
    }, false);
    obj.addEventListener('drop', function(event) {
        if (drag !== this) {
            drag.innerHTML = this.innerHTML;
            this.innerHTML = event.dataTransfer.getData('text/html');
        }
    }, false);
    obj.addEventListener('dragend', function(event) {
        this.style.opacity = 1;
    }, false);
}



//Function that is called after there is a selection, and the delete button is pressed.
const deleteToDo = () => {
    let checkBoxes = document.querySelectorAll('input[type=checkbox]');
    for (let checkBox of checkBoxes) {
        if (checkBox.checked) {
            let parent = checkBox.parentElement;
            let todoTxt = parent.textContent;
            console.log(todoTxt + ' removed');
            parent.remove();
            let todos = localStorage.getItem('todos'); //Retrieve localStorage 'todos'
            let newArray = JSON.parse(todos);
            newArray = newArray.filter(item => item !== todoTxt);
            let stringified = JSON.stringify(newArray);
            localStorage.setItem('todos', stringified);
            toDoArr = toDoArr.filter(item => item !== todoTxt);//Update the global array
        }
    }   
};

//Function to reset the array, clear the list, and remove the key from localStorage
const clearToDoList = () => {
    toDoArr = [];
    let listItems = document.querySelector('#todo-list');
    while (listItems.firstChild) {
      listItems.removeChild(listItems.firstChild);
    }
    localStorage.removeItem('todos');
};

//Page onload function
document.body.onload = () => {
    document.querySelector('#add-todo-button').addEventListener('click', function(){
        createToDo();
    });
    document.querySelector('#clear-list-button').addEventListener('click', function(){
        clearToDoList();
    });
    renderToDoList(); //Call to renderToDoList each time the page reloads to display localStorage items
};
