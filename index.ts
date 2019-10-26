import { fromEvent, Subject, from } from 'rxjs';
import { filter, merge } from 'rxjs/operators';

import './app.scss';

interface TodoItem {
  id: string;
  name: string;
  completed: boolean;
}

class Todo {
  template = document.getElementsByTagName('template')[0];
  submitButton = document.getElementsByTagName('button')[0];
  todoTable = document.getElementsByTagName('table')[0];
  todoInput = document.getElementsByTagName('input')[0];
  todoList: TodoItem[] = [];
  todoItem$ = new Subject<TodoItem>();

  constructor() {
    const todoListS = from(this.getData());
    todoListS.pipe(
      merge(this.todoItem$),
    ).subscribe((item) => {
      this.addNewTodo(item);
    });

    fromEvent(this.submitButton, 'click').subscribe((event) => {
      if (this.todoInput.value) {
        const todoItem = this.generateTodoItem();
        this.todoItem$.next(todoItem as TodoItem);
        this.todoInput.value = '';
      }
    });

    fromEvent(this.todoTable, 'click').pipe(
      filter(event => (event as any).target.getAttribute('event') === 'true'),
    ).subscribe((event) => {
      const target = (event as any).target;
      const id = target.closest('tr').id;
      if (target.type === 'checkbox') {
        this.updateTodoItem(id, target.checked);
      } else if (target.classList.contains('delete')) {
        this.deleteTodoItem(id);
      }
    });
  }

  addNewTodo = (todo: TodoItem) => {
    this.todoList.push(todo);
    const todoItem = this.template.content.cloneNode(true) as any;
    todoItem.querySelector('tr').setAttribute('id', todo.id);
    todoItem.querySelector('.name').innerHTML = todo.name;
    const tbody = (this.todoTable as any).querySelector('tbody');
    tbody.insertBefore(todoItem, tbody.firstChild);
    this.saveData(this.todoList);
    if (todo.completed) {
      this.updateTodoItem(todo.id, todo.completed);
    }
  }

  generateTodoItem = (id: string | null = null): TodoItem => {
    return {
      id: `todo-${id || new Date().getTime()}`,
      name: this.todoInput.value,
      completed: false,
    };
  }

  updateTodoItem = (id: string, checked: boolean): void => {
    const todoIndex = this.todoList.findIndex(todo => todo.id === id);
    this.todoList[todoIndex].completed = checked;
    const todoDom = this.todoTable.querySelector(`#${id}`);
    (todoDom as any).querySelector('input').setAttribute('checked', `${checked}`);
    if (checked) {
      (todoDom as any).classList.add('completed');
    } else {
      (todoDom as any).classList.remove('completed');
    }
    this.saveData(this.todoList);
  }

  deleteTodoItem = (id: string): void  => {
    this.todoList = this.todoList.filter(todo => todo.id !== id);
    const todoDom = this.todoTable.querySelector(`#${id}`);
    (this.todoTable as any).querySelector('tbody').removeChild(todoDom);
    this.saveData(this.todoList);
  }

  getData(): TodoItem[] {
    const localData = localStorage.getItem('todoList');
    let data = [] as TodoItem[];
    if (localData) {
      data = JSON.parse(localData) as TodoItem[];
    }
    return data;
  }

  saveData(data: TodoItem[]): void {
    localStorage.setItem('todoList', JSON.stringify(data));
  }
}

new Todo();