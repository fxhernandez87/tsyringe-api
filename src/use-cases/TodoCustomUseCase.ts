import {ITodoUseCase, IDatabase, ITodoEntity} from '../interfaces';
import {injectable, inject} from 'tsyringe';

@injectable()
export default class TodoCustomUseCase implements ITodoUseCase {

    /**
     * Constructor with dependencies
     */
    constructor(@inject("IDatabase") private database: IDatabase, @inject("ITodoEntity") private todoEntity: ITodoEntity) {}

    public addTodo = (todo: string) => {
        
        this.todoEntity.setTodo(todo + ' -.-');
        if (this.database.exists('todos', this.todoEntity.getTodo())){
            throw { message: 'Already exists', error: 'duplicated'}
        }

        return this.database.add('todos', this.todoEntity.getTodo());
    };

    public getTodos = () => {
        return this.database.getAll('todos');
    }
}