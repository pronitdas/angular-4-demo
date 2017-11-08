class ToDo {
    _id:string;
    userId:number;
    title: string;
    completed: boolean;

    constructor(
    ){
        this.userId = 0
        this.title = ""
        this.completed = false
    }
}

export default ToDo;
