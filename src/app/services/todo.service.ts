import ToDo from '../models/todo.model';
import { Observable } from 'rxjs/Rx';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {Response} from '@angular/http';
import { Injectable } from '@angular/core';


import 'rxjs/add/operator/map';

@Injectable()
export class TodoService {

  api_url = 'https://jsonplaceholder.typicode.com';
  todoUrl = `${this.api_url}/todos`;

  constructor(
    private http: HttpClient
  ) { }


  createTodo(todo: ToDo): Observable<any>{
    console.log(todo);
    return this.http.post(`${this.todoUrl}`, todo);
  }

  getToDos(): Observable<ToDo[]>{
    return this.http.get(this.todoUrl)
    .map(res  => {
      return res as ToDo[];
    })
  }

  editTodo(todo:ToDo){
    let editUrl = `${this.todoUrl}/${todo.id}`
    return this.http.put(editUrl, todo);
  }

  deleteTodo(id:number):any{
    let deleteUrl = `${this.todoUrl}/${id}`
    return this.http.delete(deleteUrl)
    .map(res  => {
      return res;
    })
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
