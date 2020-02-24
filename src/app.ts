import "reflect-metadata";
import { attachController } from "tsyringe-express";
import { container, instanceCachingFactory } from "tsyringe";
import express = require('express');
import bodyParser from 'body-parser';
import Database from './config/data-access';
import TodoEntity from './entities/TodoEntity';
import ExampleController from './controllers/example';

const app = express();
app.use(bodyParser.json());
container.register("ITodoEntity", {
    useClass: TodoEntity
});
container.register("IDatabase", {
    useFactory: instanceCachingFactory<Database>(c => c.resolve(Database))
});

attachController(app, container, [ ExampleController ]);

app.use(function (err: express.ErrorRequestHandler, req: express.Request, res: express.Response, next: express.NextFunction) {
    
    res.status(400).json(err);
})
 
app.listen(3001);