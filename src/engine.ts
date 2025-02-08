import type { default as Entity } from './entity/index';
import type { EntityConstructor } from './entity/types';
import type { SystemConstructor, SystemInstance } from './system/types';
import EntityController from './entity/controller';
import EntityManager from './entity/manager';
import ComponentManager from './component/manager';
import SystemController from './system/controller';
import SystemManager from './system/manager';

export default class Engine {
    private readonly _components = new ComponentManager();
    private readonly _systems = new SystemManager();
    private readonly _entities = new EntityManager(
        this._components.removeAll.bind(this._components),
    );

    createEntity<T extends Entity>(type: EntityConstructor<T>): T {
        return Reflect.construct(type, [
            new EntityController(this._entities, this._components),
        ]);
    }

    destroyEntity(entity: Entity): void {
        this._entities.destroy(entity.id);
    }

    createSystem<T extends SystemInstance, TArgs extends unknown[]>(
        priority: number,
        type: SystemConstructor<T>,
        ...args: TArgs
    ): T {
        const system = Reflect.construct(type, [
            new SystemController(type, {
                entities: this._entities,
                components: this._components,
                systems: this._systems,
            }),
            ...args,
        ]);

        this._systems.add(priority, system);
        return system as T;
    }

    destroySystem(system: SystemInstance): void {
        this._systems.remove(system.constructor as SystemConstructor);
    }

    update(deltaTime: DOMHighResTimeStamp) {
        for (const system of this._systems.values()) {
            system.update(deltaTime);
        }
    }
}
