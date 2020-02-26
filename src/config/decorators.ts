import { RequestHandler, Express } from "express";
import { DependencyContainer, InjectionToken, injectable } from "tsyringe";

export enum HttpMethod {
    GET = "get",
    POST = "post",
    PUT = "put",
    PATCH = "patch",
    DELETE = "delete",
    ALL = "all"
}

const ControllersRegsitry = new Array<Function>();

export interface ControllerInfo {
    route: string
}

export interface ActionInfo {
    method: HttpMethod,
    route?: string,
    middlewares?: RequestHandler[]
}

export const EXPRESS_CONTROLLER = Symbol.for("express:controller");
export const EXPRESS_ACTION = Symbol.for("express:action");

export function Controller(info?: ControllerInfo): Function {
    return function(target: Function) {
        // injectable()(<any> target);
        const controllerInfo = info || { route: '/' + target.name.replace('Controller', '').toLowerCase() };
        
        Reflect.defineMetadata(EXPRESS_CONTROLLER, controllerInfo, target)
        if (ControllersRegsitry.indexOf(target) != -1) {
            ControllersRegsitry.push(target);
        }
    }
}

export function Action(info: ActionInfo): Function {
    return function(target: any, propertyKey: string) {
        // if the route in action doesnt exist, we infere it from the action name
        const actionInfoRoute = info.route || '/' + propertyKey.split('_')[1].toLowerCase()
        const actionInfo = {...info, route: actionInfoRoute};
        
        if (target.constructor) {
            Reflect.defineMetadata(EXPRESS_ACTION, actionInfo, target.constructor, propertyKey);
        }
    }
}

function _join_routes(...routes: string[]): string {
    let route = "";
    routes.forEach( r => route = route + "/" + r.trim().replace(/^\//, '').replace(/\/$/, ''));
    return route;
}

export function attachController(app: Express, di: DependencyContainer, controllers: Function[] = []) {
    if (controllers.length == 0) {
        controllers = ControllersRegsitry;
    }
    controllers.forEach( controller => {
        let controllerInfo: ControllerInfo = Reflect.getMetadata(EXPRESS_CONTROLLER, controller);
        if (!controllerInfo) return; // Pass to next controller
        // let instance = di.resolve(<InjectionToken<any>> controller);

        app.use((req,res,next)=> {
            (req as any).container = di.createChildContainer();
            next();
        }
            )
        // Get all methods from the controller
        let controllerMethods = Object.getOwnPropertyNames(controller.prototype);
        controllerMethods.forEach( actionKey => {
            
            let actionInfo: ActionInfo = Reflect.getMetadata(EXPRESS_ACTION, controller, actionKey);
            if (!actionInfo) return; // pass to next method

            // Attach to controller
            let route = _join_routes(controllerInfo.route, actionInfo.route!);
            if (actionInfo.middlewares) {
                app[actionInfo.method](route, ...actionInfo.middlewares, (req, res, next) =>{ 
                    let instance = (req as any).container .resolve(<InjectionToken<any>> controller);
                    return instance[actionKey](req, res, next);
                });
            } else {
                app[actionInfo.method](route, (req, res, next) => { 
                    let instance = (req as any).container .resolve(<InjectionToken<any>> controller);
                    return instance[actionKey](req, res, next);
                });
            }
        })
    })
}
