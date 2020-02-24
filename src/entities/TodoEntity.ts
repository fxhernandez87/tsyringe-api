import { ITodoEntity } from '../interfaces';

export default class TodoEntity implements ITodoEntity {

    private todo: string;

    constructor() {
        this.todo = '';
    }

    private isValid = (string: string) => {
        return !!string.length;
    }

    getTodo = () => {
        return this.todo;
    }

    setTodo = (todo: string) => {
        if (this.isValid(todo)) {
            this.todo = todo;
        } else {
            throw { message: 'Invalid Todo', code: 'MALO'}
        }
    }

}