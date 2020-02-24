import {injectable, registry, inject, container} from 'tsyringe';
import {Controller, Action, HttpMethod} from 'tsyringe-express';
import { ITodoUseCase } from '../interfaces'
import TodoUseCase from '../use-cases/TodoUseCase'
import TodoCustomUseCase from '../use-cases/TodoCustomUseCase'
import { Request, Response, NextFunction} from 'express';

/**
 * Controlador, que escucha la ruta '/api'
 * Registro los distintos casos de uso
 *  Dependiendo si un parametro en el body viene en true, uso un Caso de Uso, sino uso uno Custom
 *  Se resuelve en el request mismo.
 */
@Controller({ route: "/api" })
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
export default class ExampleController {
 
    /**
     * Constructor con sus dependencias del tipo ITodoUseCase
     */
    constructor(@inject("ITodoUseCase") private adduseCase: ITodoUseCase) {}
    
    /**
     * addTodos action, escucha la ruta  POST '/api/todos'
     */
    @Action({
        route: "/todos",
        method: HttpMethod.POST,
        middlewares: [
            function (req, res, next) {
                console.log('Probando Middlewares');
                next();
            }
        ]
    })
    public addTodosAction(req: Request, res: Response) {
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
        route: "/todos",
        method: HttpMethod.GET,
        middlewares: [
            function (req, res, next) {
                next();
            }
        ]
    })
    public getTodosAction(req: Request, res: Response) {
        let mytodos: string[] = [];
        this.adduseCase.getTodos().forEach(todo => {
            mytodos.push(todo);
        });

        res.status(200).send(mytodos);
    }
}