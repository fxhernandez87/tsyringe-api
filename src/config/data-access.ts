import { IDatabase } from '../interfaces';

export default class Database implements IDatabase {

    private todos: Set<string>;

    constructor() {
        this.todos = new Set();
    }
 
    public add(collection: 'todos', todo: string) {
        
        this[collection].add(todo);
        
        return todo;
    }

    public getAll(collection: 'todos'): Set<string> {
        return this[collection];
    }

    public exists(collection: 'todos', todo: string): boolean {
        
        
        
        return this[collection].has(todo);
    }
}