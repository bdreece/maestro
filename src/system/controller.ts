import type { default as Component } from '../component/index';
import type { default as ComponentManager } from '../component/manager';
import type { ComponentConstructor } from '../component/types';
import type { default as EntityManager } from '../entity/manager';
import type { default as SystemManager } from './manager';
import type {
    SystemConstructor,
    SystemNodeIterator,
    SystemInstance,
    SystemNode,
} from './types';

export interface SystemControllerInit {
    entities: EntityManager;
    components: ComponentManager;
    systems: SystemManager;
}

export default class SystemController<T extends ComponentConstructor[]> {
    private readonly _entities;
    private readonly _components;
    private readonly _type;
    readonly destroy;

    constructor(
        type: SystemConstructor<SystemInstance<T>>,
        { entities, components, systems }: SystemControllerInit,
    ) {
        this._entities = entities;
        this._components = components;
        this._type = type;

        this.destroy = systems.remove.bind(systems, type);
    }

    nodes(): SystemNodeIterator<T> {
        const iter = this._entities[Symbol.iterator]();
        const pools = this._type._node.map(t => this._components.components(t));
        return {
            next() {
                for (
                    let result = iter.next();
                    !result.done;
                    result = iter.next()
                ) {
                    let i;
                    const components: Component[] = [];
                    for (i = 0; i < pools.length; ++i) {
                        if (!pools[i]!.has(result.value)) {
                            // entity is missing a required component
                            break;
                        }

                        components.push(pools[i]!.get(result.value)!);
                    }

                    if (components.length < pools.length) {
                        // entity does not meet node requirements
                        continue;
                    }

                    return {
                        value: components as [...SystemNode<T>],
                    };
                }

                return {
                    done: true,
                    value: undefined,
                };
            },
            [Symbol.iterator]() {
                return this;
            },
        };
    }
}
