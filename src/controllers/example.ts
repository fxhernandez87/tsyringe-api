import {injectable, registry, inject, container} from 'tsyringe';
import {Controller, Action, HttpMethod} from '../config/decorators';
import { ITodoUseCase } from '../interfaces'
import TodoUseCase from '../use-cases/TodoUseCase'
import TodoCustomUseCase from '../use-cases/TodoCustomUseCase'
import { Request, Response } from 'express';

/**
 * Controlador, que escucha la ruta '/api'
 * Registro los distintos casos de uso
 *  Dependiendo si un parametro en el body viene en true, uso un Caso de Uso, sino uso uno Custom
 *  Se resuelve en el request mismo.
 */
@Controller()
@injectable()
@registry([
    {
        token: "ITodoUseCase",
        useClass: TodoUseCase
      },
      {
        token: "ITodoUseCase",
        useClass: TodoCustomUseCase
      }
  ])
export default class ApiController {
 
    /**
     * Constructor con sus dependencias del tipo ITodoUseCase
     */
    constructor(@inject("ITodoUseCase") private adduseCase: ITodoUseCase) {}
    
    /**
     * addTodos action, escucha la ruta  POST '/api/todos'
     */
    @Action({
        method: HttpMethod.POST,
        middlewares: [
            function (req, res, next) {
                console.log('Probando Middlewares');
                next();
            }
        ]
    })
    public add_todos_action(req: Request, res: Response) {
        // TODO esta bien que el controller decida esto? que useCase deberia usar... si por ejemplo
        // tengo que decidir esto con alguna llamada a a base de datos, pq tengo que revisar parametros en una tabla
        // el controller no tiene accesso a la DB. 
        let useCase;
        if (!req.body.todos) {
            useCase = container.resolve(TodoCustomUseCase);
        } else {
            useCase = container.resolve(TodoUseCase);
        }

        res.status(200).send( useCase.addTodo(req.body.todo));
    }

    /**
     * getTodos action, escucha la ruta  GET '/api/todos'
     * Should have express Request and Response as parameters
     */
    @Action({
        method: HttpMethod.GET,
        middlewares: [
            function (req, res, next) {
                next();
            }
        ]
    })
    public get_todos_action(req: Request, res: Response) {
        let mytodos: string[] = [];
        this.adduseCase.getTodos().forEach(todo => {
            mytodos.push(todo);
        });

        res.status(200).send(mytodos);
    }
}