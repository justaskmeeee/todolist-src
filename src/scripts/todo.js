import { INPUT_MAX_LENGTH } from './globalVariables';

let todos = JSON.parse(localStorage.getItem('todos')) || [];

function createTodoItem(value, itemId) {
  const todoItem = `
    <li class='list-item todo-list__list-item' data-id='${itemId}'>
      <input class='toggle list-item__toggle' type='checkbox'>
      <label class='list-item__text'>${value}</label>
      <button class='remove list-item__remove'></button>
    </li>
  `;

  return todoItem;
}

function setTheLimitLength(text, element) {
  switch (element) {
    case 'todoInput': 
      if (text.value.length > INPUT_MAX_LENGTH) {
        text.value = text.value.slice(0, INPUT_MAX_LENGTH);
      };
      
      break;
    case 'todoItem': 
      if (text.innerText.length > INPUT_MAX_LENGTH) {
        text.innerText = text.innerText.slice(0, INPUT_MAX_LENGTH);
      };

      break;
  }
}

function appendTodoItemToList(title, itemId) {
  const todoList = document.querySelector('.todo-list');

  todoList.insertAdjacentHTML('afterbegin', createTodoItem(title, itemId));
}

function getCreateTodo() {
  return document.querySelector('.create-todo');
}

function clearCreateTodoValue(createTodo) {
  createTodo.value = '';
}

function generateId() {
  const minNum = 1000;
  const maxNum = 2000;
  const num = Math.floor(Math.random() * (maxNum - minNum)) + minNum;
  
  return `123${num}`;
}

function createTodoList() {
  const createTodo = document.querySelector('.create-todo');
  todos.forEach(item => appendTodoItemToList(item.text, item.id));  
  
  createTodo.addEventListener('keyup', (event) => {
    const createTodoValue = getCreateTodo().value;
    
    const item = {
      text: createTodoValue,
      completed: false,
      id: generateId(),
    };
    
    setTheLimitLength(createTodo, 'todoInput');
    
    if (event.key === 'Enter' && createTodo.value.trim() !== '') {      
      todos.push(item);
      localStorage.setItem('todos', JSON.stringify(todos));
  
      const lastTabOfHistoryState = `/${history.state.page.split('/').pop()}`;

      if (lastTabOfHistoryState !== '/completed') {
        appendTodoItemToList(item.text, item.id);
      }

      changeVisibilityStateOfToggleAll();      
      clearCreateTodoValue(createTodo);
      countTodoItems(getCountOfTodos());
      checkTheCompletionOfAllTasks();
      filterPanelVisibilityControl(todos.length);
    }
  });
}

function getCountOfTodos() {
  return todos.filter(item => !item.completed).length;
}

function countTodoItems(items) {
  const count = document.querySelector('.count');

  count.textContent = items > 1 || items === 0 ? `${items} items left` : `${items} item left`;
} 

function removeCountOfTodoItems(count) {
  if (count === 0) {
    document.querySelector('.count').textContent = '';
  } 
}

function removeTodoItem() {
  document.addEventListener('click', (event) => {      
    const removeTodoButton = event.target.closest('.remove');

    if (!removeTodoButton) {
      return;
    }

    const todoItem = removeTodoButton.parentElement;
    const todoItemId = todoItem.dataset.id;
    const currentTodoItemButton = todos.find(item => item.id === todoItemId);
    const buttonPressedIndex = todos.indexOf(currentTodoItemButton);

    if (buttonPressedIndex !== - 1) {
      todos.splice(buttonPressedIndex, 1);
      localStorage.setItem('todos', JSON.stringify(todos));
    }
    
    const countOfActiveTodos = getCountOfTodos();
    const countOfAllTodos = todos.length;

    removeTodoButton.parentElement.remove();
    countTodoItems(countOfActiveTodos);
    removeCountOfTodoItems(countOfAllTodos);
    changeVisibilityStateOfToggleAll();
    setDisplayOfClearCompletedButton();
    filterPanelVisibilityControl(todos.length);
  })
}

function changeTheProgressStatusOfTodoItem(clickedItemId, status) {
  const todoItemIsCompleted = status;
  todos.find(item => {
    if (item.id === clickedItemId) {
      item.completed = todoItemIsCompleted;
    }
  })
}

function todoItemCompletionCheck(clickedItemId, itemText, isChecked) {
  changeTheProgressStatusOfTodoItem(clickedItemId, isChecked);
  isChecked ? itemText.classList.add('completed') : itemText.classList.remove('completed');
}

function todoItemStatusTracking() {
  const todoApp = document.querySelector('.todo');
  
  todoApp.addEventListener('click', (event) => {
    const toggle = event.target.closest('.toggle');

    if (!toggle) return;

    const todoItem = toggle.parentElement;
    const todoItemText = todoItem.querySelector('.list-item__text');
    const todoItemId = todoItem.dataset.id;

    todoItemCompletionCheck(todoItemId, todoItemText, toggle.checked);
    countTodoItems(getCountOfTodos());
    todoItemsFiltering(history.state);
    localStorage.setItem('todos', JSON.stringify(todos));
    setDisplayOfClearCompletedButton();
  })
}

function makeTodoItemsChecked() {
  const updatedSwitches = document.getElementsByClassName('toggle');

  for (let toggle of updatedSwitches) {
    const todoItem = toggle.parentElement;
    const todoItemText = todoItem.querySelector('.list-item__text');
    const todoItemId = todoItem.dataset.id;
    const storageCompletedItems = todos.filter(todo => todo.completed);
    storageCompletedItems.forEach(item => {
      if (item.id === todoItemId) {
        toggle.checked = item.completed;
        todoItemText.classList.add('completed');
      }
    })
  }
}

function toggleAllTodoItems() {
  const mainToggle = document.querySelector('.toggle-all');
  const switches = document.getElementsByClassName('toggle');

  mainToggle.addEventListener('click', () => {
    for (let toggle of switches) {
      const todoItem = toggle.parentElement;
      const todoItemText = todoItem.querySelector('.list-item__text');
      
      toggle.checked = mainToggle.checked;
      mainToggle.checked ? todoItemText.classList.add('completed') : todoItemText.classList.remove('completed');
      todos.forEach(item => {
        item.completed = toggle.checked;
      });
      todoItemsFiltering(history.state);
    }

    checkTheCompletionOfAllTasks();
    setDisplayOfClearCompletedButton();
    countTodoItems(getCountOfTodos());
    localStorage.setItem('todos', JSON.stringify(todos));
  })
}

function editTodo() {
  document.addEventListener('dblclick', (event) => {
    const todoItemText = event.target.closest('.list-item__text');
    
    if (!todoItemText) return;
    
    const todoItem = todoItemText.parentElement;
    const edit = document.createElement('input');
        
    todoItemText.replaceWith(edit);
    // save todo text value
    edit.classList.add('edit');
    edit.value = todoItemText.innerText;
    edit.focus();
    setVisibilityOfRemoveTodoItemButton(todoItem, true);
    visibilityControlOfToggle(todoItem, true);
    removeCompletedStatus(todoItemText, true);
  })
}

function setVisibilityOfRemoveTodoItemButton(currentTodoItem, editing) {
  const removeButton = currentTodoItem.querySelector('.remove');

  editing ? removeButton.classList.add('remove_editing') : removeButton.classList.remove('remove_editing');
}

function changeTodoItemTextInStorage() {  
  const todoItemId = this.dataset.id;
  const todoItemText = this.querySelector('.list-item__text');

  todos.map(item => {
    if (item.id === todoItemId) {
      item.text = todoItemText.textContent;
    }
  })
}

function removeEmptyTodoItem(todoItemText) {
  const todoItem = todoItemText.parentElement; 
  const todoItemId = todoItem.dataset.id;

  if (todoItemText.innerText === '') {
    const editableItemId = todos.find(editableItem => editableItem.id === todoItemId);
    const editableItemIndex = todos.indexOf(editableItemId);

    if (editableItemIndex !== -1) {
      todos.splice(editableItemIndex, 1);
      todoItem.remove();
      countTodoItems(getCountOfTodos());
      removeCountOfTodoItems(getCountOfTodos());
      changeVisibilityStateOfToggleAll();
      setDisplayOfClearCompletedButton();
      filterPanelVisibilityControl(todos.length);
    }
  }
}

function applyEditing() {
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const edit = document.querySelector('.edit');

      if (!edit) return;

      
      const todoItem = edit.parentElement;
      const todoItemText = document.createElement('label');
      
      todoItemText.classList.add('list-item__text');
      edit.replaceWith(todoItemText);
      todoItemText.innerText = edit.value; 
      // change text in label and save him in localstorage
      const changeTodoItemStorageText = changeTodoItemTextInStorage.bind(todoItem);
      changeTodoItemStorageText();

      removeEmptyTodoItem(todoItemText);
      setVisibilityOfRemoveTodoItemButton(todoItem, false);
      visibilityControlOfToggle(todoItem, false);
      addCompletedStatus(todoItem, todoItemText);
      setTheLimitLength(todoItemText, 'todoItem');

      localStorage.setItem('todos', JSON.stringify(todos));
    }
  })
}

function cancelEditing() {
  const eventListeners = ['click', 'keyup'];

  eventListeners.forEach(listener => {
    document.addEventListener(listener, (event) => {
      const edit = document.querySelector('.edit');

      if (!edit) return;

      switch (listener) {
        case 'click':
          if (event.target !== edit) {
            const todoItem = edit.parentElement;
                      
            const todoItemText = document.createElement('label');
            todoItemText.classList.add('list-item__text');
            edit.replaceWith(todoItemText);
            todoItemText.innerText = edit.value;
            // change text in label and save him in localstorage
            const changeTodoItemStorageText = changeTodoItemTextInStorage.bind(todoItem);
            changeTodoItemStorageText();
            setVisibilityOfRemoveTodoItemButton(todoItem, false);
            visibilityControlOfToggle(todoItem, false);
            addCompletedStatus(todoItem, todoItemText);

            localStorage.setItem('todos', JSON.stringify(todos));
          }
        case 'keyup':
          if (event.key === 'Escape') {
            const todoItem = edit.parentElement;
            const editableTodoItemId = todoItem.dataset.id;
            const currentNotChangedLocalStorageTodoItem = todos.find(item => item.id === editableTodoItemId);
            
            const todoItemText = document.createElement('label');
            todoItemText.classList.add('list-item__text');
            edit.replaceWith(todoItemText);
            todoItemText.innerText = currentNotChangedLocalStorageTodoItem.text;
            
            setVisibilityOfRemoveTodoItemButton(todoItem, false);
            visibilityControlOfToggle(todoItem, false);
            addCompletedStatus(todoItem, todoItemText);            
          }
      }
    })
  })
}

function visibilityControlOfToggle(todoItem, editing) {
  const toggle = todoItem.querySelector('.toggle');

  editing ? toggle.classList.add('editing') : toggle.classList.remove('editing');
}

function removeCompletedStatus(todoText, editing) {
  if (todoText.classList.contains('completed') && editing) {
    todoText.classList.remove('completed');
  }
} 

function addCompletedStatus(todoItem, todoText) {
  const toggle = todoItem.querySelector('.toggle');

  if (toggle.checked) {
    todoText.classList.add('completed');
  }
}

function checkTheCompletionOfAllTasks() {
  const toggleOfAllTodoItems = document.querySelector('.toggle-all');
  const toggleAllIcon = document.querySelector('.toggle-all-icon');
  const eachToggleIsCompleted = todos.every(item => item.completed);

  toggleOfAllTodoItems.checked = eachToggleIsCompleted;
  toggleOfAllTodoItems.checked ? toggleAllIcon.classList.add('toggle-all-icon_highlighted') : toggleAllIcon.classList.remove('toggle-all-icon_highlighted');
}

function resetToggleOfAllTodoItems() {
  document.addEventListener('change', (event) => {
    if (event.target.classList.contains('toggle')) {
      checkTheCompletionOfAllTasks();
    }
  })
}

function filterPanelVisibilityControl(numberOfTasks) {
  const filterPanel = document.querySelector('.footer');

  numberOfTasks >= 1 ? filterPanel.classList.remove('footer_completed') : filterPanel.classList.add('footer_completed');
}

function setDisplayOfClearCompletedButton() {
  const clearCompletedButton = document.querySelector('.clear-items');
  const allTodoItemsIsCompleted = todos.some(item => item.completed);

  allTodoItemsIsCompleted ? clearCompletedButton.classList.remove('clear-items_removed') : clearCompletedButton.classList.add('clear-items_removed');
}

function clearCompleted() {
  const clearCompletedButton = document.querySelector('.clear-items');

  clearCompletedButton.addEventListener('click', () => {
    const completedItems = document.getElementsByClassName('completed');
    todos = todos.filter(item => !item.completed);
    const numberOfActiveItems = getCountOfTodos();

    [...completedItems].forEach(itemText => {
      const todoItem = itemText.parentElement;
      todoItem.remove()
    });
    
    countTodoItems(numberOfActiveItems);
    removeCountOfTodoItems(numberOfActiveItems);
    localStorage.setItem('todos', JSON.stringify(todos));
    changeVisibilityStateOfToggleAll();
    setDisplayOfClearCompletedButton();
    filterPanelVisibilityControl(todos.length);
  })
}

function changeVisibilityStateOfToggleAll() {
  const toggleAll = document.querySelector('.toggle-all-icon');
  const todoItemsLength = todos.length;

  const showToggleAll = () => toggleAll.classList.remove('toggle-all-icon_off');
  const hideToggleAll = () => toggleAll.classList.add('toggle-all-icon_off');

  todoItemsLength >= 1 ? showToggleAll() : hideToggleAll();
}

function removeSelectedStateOfButtons() {
  const filterLinks = document.getElementsByClassName('filters__link');

  [...filterLinks].forEach(filterLink => {
    const filterItem = filterLink.parentElement;
      filterItem.classList.remove('filters__item_selected');
  })
}

function getCurrentPathName(path) {
  const splittedPathName = path.split('/');
  const historyStatePathName = splittedPathName[splittedPathName.length - 1];

  return historyStatePathName;
}

function selectTheCurrentLinkTab(state) {
  const filterButtons = document.getElementsByClassName('filters__link');

  [...filterButtons].forEach(filterButton => {
    const lastTabOfCurrentPathName = getCurrentPathName(state);
    const filterButtonLink = getCurrentPathName(filterButton.pathname);

    if (filterButtonLink === lastTabOfCurrentPathName) {
      const currentTodoItem = filterButton.parentElement;
      currentTodoItem.classList.add('filters__item_selected');
    }
  })
}

function appendTodoItemsCreatedOnTheCompledTabToList(todoList, todoItems) {
  const idsOfAddedTodoItems = []; 
  todoItems.forEach(item => idsOfAddedTodoItems.push(item.getAttribute('data-id')));

  const todoItemsCreatedOnTheCompletedTab = todos.filter(todo => {
    return !idsOfAddedTodoItems.includes(todo.id);
  });

  const allTodoItemsIsAdded = todos.every(todo => {
    return idsOfAddedTodoItems.includes(todo.id);
  });

  if (!allTodoItemsIsAdded) {
    todoItemsCreatedOnTheCompletedTab.forEach(item => {
      todoList.insertAdjacentHTML('afterbegin', createTodoItem(item.text, item.id));
    });
  } 
}

function todoItemsFiltering(state) {
  const todoList = document.querySelector('.todo-list');
  const todoItems = [...document.getElementsByClassName('list-item')];
  const todoItemsText = [...document.getElementsByClassName('list-item__text')];
  const hiddenTodoItems = todoItems.filter(hiddenItem => hiddenItem.classList.contains('list-item_hide'));

  if (!state) return;

  const splittedHistoryState = state.page.split('/');
  const removedLastTab = splittedHistoryState.pop();
  const lastTabOfHistoryState = `/${removedLastTab}`;

  switch (lastTabOfHistoryState) {
    case '/':
      appendTodoItemsCreatedOnTheCompledTabToList(todoList, todoItems);
      hiddenTodoItems.forEach(hiddenItem => hiddenItem.classList.remove('list-item_hide'));

      break;
    case '/active':
      const completedTodoItems = todoItemsText.filter(completedItem => completedItem.classList.contains('completed'));

      hiddenTodoItems.forEach(hiddenTodoItem => {
        const activeTodoItemText = hiddenTodoItem.children[1];

        if (!activeTodoItemText.classList.contains('completed')) {
          hiddenTodoItem.classList.remove('list-item_hide');
        }
      });
      
      completedTodoItems.forEach(completedItem => {
        const todoItem = completedItem.parentElement;

        todoItem.classList.add('list-item_hide')
      });
      
      break;
    case '/completed':  
      appendTodoItemsCreatedOnTheCompledTabToList(todoList, todoItems);
      const activeTodoItems = todoItemsText.filter(activeItem => !activeItem.classList.contains('completed'));  

      hiddenTodoItems.forEach(hiddenTodoItem => {
        const completedTodoItemText = hiddenTodoItem.children[1];

        if (completedTodoItemText.classList.contains('completed')) {
          hiddenTodoItem.classList.remove('list-item_hide');
        }
      });

      activeTodoItems.forEach(activeItem => {
        const todoItem = activeItem.parentElement;

        todoItem.classList.add('list-item_hide')
      });

      break;
    }
}

function routeHandling() {  
  document.addEventListener('click', (event) => {
    const containsFilterLink = event.target.classList.contains('filters__link');
    
    if (containsFilterLink) {
      event.preventDefault();
      const filterLink = event.target;
      
      const splittedCurrentWindowHref = window.location.href.split('/');
      const lastTabOfCurrentWindowHref = splittedCurrentWindowHref.pop();
      const currentWindowHrefWithoutLastTab = splittedCurrentWindowHref.join('/');

      const state = {
        page: `${currentWindowHrefWithoutLastTab}${filterLink.pathname}`,
      }

      const filterItemButton = filterLink.parentElement; 
      
      removeSelectedStateOfButtons();
      filterItemButton.classList.add('filters__item_selected');

      history.pushState(state, null, state.page);
      todoItemsFiltering(state);
    }
  })
}

window.addEventListener('load', () => {
  const currentPathName = getCurrentPathName(window.location.pathname);
  selectTheCurrentLinkTab(currentPathName);
  todoItemsFiltering(history.state);
  routeHandling();
});

window.addEventListener('popstate', (event) => {
  todoItemsFiltering(event.state);
});

function displayItemsFromStorage() {
  makeTodoItemsChecked();
  countTodoItems(getCountOfTodos());
  removeCountOfTodoItems(todos.length);
  changeVisibilityStateOfToggleAll();
  filterPanelVisibilityControl(todos.length);
}

createTodoList();
filterPanelVisibilityControl(todos.length);
removeTodoItem();
editTodo();
setDisplayOfClearCompletedButton();
clearCompleted();
applyEditing();
cancelEditing();
toggleAllTodoItems();
resetToggleOfAllTodoItems();
todoItemStatusTracking();
checkTheCompletionOfAllTasks();

if (localStorage.length > 0) {
  displayItemsFromStorage();
}