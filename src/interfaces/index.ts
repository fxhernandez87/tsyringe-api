export interface ITodoEntity {
    getTodo() : string;
    setTodo(todo: string) : void;
}

export interface ITodoUseCase {
    addTodo: (todo: string) => string | never;
    getTodos: () => Set<string>;
}

export interface IDatabase {
    add(col: string, data: string) : string;
    getAll(col: string) : Set<string>;
    exists(col: string, data: string) : boolean;
}