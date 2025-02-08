import type { default as Component } from '../component/index';
import EntityController from './controller';

export default class Entity {
    private readonly _controller;

    get id() {
        return this._controller.id;
    }
    get components() {
        return this._controller.components();
    }

    get destroy() {
        return this._controller.destroy;
    }
    get getComponent() {
        return this._controller.getComponent;
    }
    get removeComponent() {
        return this._controller.removeComponent;
    }

    addComponent(component: Component): this {
        this._controller.addComponent(component);
        return this;
    }

    constructor(controller: EntityController) {
        this._controller = controller;
    }
}
