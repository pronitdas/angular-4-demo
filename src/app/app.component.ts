import { Response } from '@angular/http';
import { TodoService } from './services/todo.service';
import ToDo from './models/todo.model';
import { Component, OnInit } from '@angular/core';
import * as XLSX from 'xlsx';
import * as _ from 'lodash';
import { saveAs } from 'file-saver';

type AOA = Array<ToDo>;

function s2ab(s: string): ArrayBuffer {
  const buf: ArrayBuffer = new ArrayBuffer(s.length);
  const view: Uint8Array = new Uint8Array(buf);
  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private todoService: TodoService
  ) { }

  public newTodo: ToDo = new ToDo()

  todosList: ToDo[];
  editTodos: ToDo[] = [];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'binary' };
  fileName: string = 'reportGen.xlsx';

  ngOnInit(): void {
    this.todoService.getToDos()
      .subscribe(todos => {
        this.todosList = todos
        console.log("init",this.todosList)
      })
  }


  create() {
    this.todoService.createTodo(this.newTodo)
      .subscribe((res) => {
        console.log(res);
        this.todosList.push(res)
        this.newTodo = new ToDo()
      })
  }

  onFileChange(evt: any) {
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, {type: 'binary'});

      /* grab first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      // console.log();
      /* save data */
      let tempList = <AOA>(XLSX.utils.sheet_to_json(ws, {header: 1}));
      let objProps = [];
      this.todosList = _.map(tempList ,(d,index)=>{
        if(index===0){
          objProps = d;
        } else {
          let a = {};
          _.each(objProps , (b,index) => {
            if(d[index] === "TRUE" || d[index] === "FALSE"){
              a[b]= d[index] === "TRUE";
            } else {
              a[b]= d[index];
            }
          });
          return a;
        }
      });
      this.todosList.splice(0,1);
    };

    reader.readAsBinaryString(target.files[0]);
  }

  export(): void {
    /* generate worksheet */
    if(this.todosList.length > 0){
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.todosList);

      /* generate workbook and add the worksheet */
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      /* save to file */
      const wbout: string = XLSX.write(wb, this.wopts);
      saveAs(new Blob([s2ab(wbout)]), this.fileName);

    }
  }

  editTodo(todo: ToDo) {
    console.log(todo)
    if(this.todosList.includes(todo)){
      if(!this.editTodos.includes(todo)){
        this.editTodos.push(todo)
      }else{
        this.editTodos.splice(this.editTodos.indexOf(todo), 1)
        this.todoService.editTodo(todo).subscribe(res => {
          console.log('Update Succesful')
        }, err => {
          this.editTodo(todo)
          console.error('Update Unsuccesful')
        })
      }
    }
  }

  doneTodo(todo:ToDo){
    todo.completed = true
    this.todoService.editTodo(todo).subscribe(res => {
      console.log('Update Succesful')
    }, err => {
      this.editTodo(todo)
      console.error('Update Unsuccesful')
    })
  }

  submitTodo(event, todo:ToDo){
    if(event.keyCode ==13){
      this.editTodo(todo)
    }
  }

  deleteTodo(todo: ToDo) {
    this.todoService.deleteTodo(todo.id).subscribe(res => {
      this.todosList.splice(this.todosList.indexOf(todo), 1);
    })
  }


  title = 'app';

}
