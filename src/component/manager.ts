import type { default as Component } from './index';
import type { ComponentConstructor, ComponentIterator } from './types';
import ComponentPool, { type ReadonlyComponentPool } from './pool';

export default class ComponentManager {
    private readonly _pools: ComponentPool[] = [];

    get<T extends Component>(
        entityId: number,
        type: ComponentConstructor<T>,
    ): T | undefined;
    get(entityId: number, type: ComponentConstructor): Component | undefined;
    get(entityId: number, type: ComponentConstructor): Component | undefined {
        if (!this._registered(type)) {
            return undefined;
        }

        return this._pools[type._id]!.get(entityId);
    }

    has(entityId: number, type: ComponentConstructor): boolean {
        return this._registered(type) && this._pools[type._id]!.has(entityId);
    }

    add(entityId: number, component: Component) {
        const type = component.constructor as ComponentConstructor;
        this._ensureRegistered(type);

        this._pools[type._id!]!.add(entityId, component);
    }

    remove<T extends Component>(
        entityId: number,
        type: ComponentConstructor<T>,
    ): T | undefined;
    remove(entityId: number, type: ComponentConstructor): Component | undefined;
    remove(
        entityId: number,
        type: ComponentConstructor,
    ): Component | undefined {
        if (!this._registered(type)) {
            return undefined;
        }

        return this._pools[type._id]!.remove(entityId);
    }

    removeAll(entityId: number): void {
        let i;
        for (i = 0; i < this._pools.length; ++i) {
            this._pools[i]!.remove(entityId);
        }
    }

    components(entityId: number): ComponentIterator;
    components<T extends Component>(
        type: ComponentConstructor<T>,
    ): ReadonlyComponentPool<T>;
    components(type: ComponentConstructor): ReadonlyComponentPool | undefined;
    components(
        input: ComponentConstructor | number,
    ): ComponentIterator | ReadonlyComponentPool | undefined {
        if (typeof input !== 'number') {
            if (!this._registered(input)) {
                return undefined;
            }

            return this._pools[input._id];
        }

        const iter = this._pools[Symbol.iterator]();
        return {
            next() {
                let result;
                for (result = iter.next(); !result.done; result = iter.next()) {
                    const component = result.value.get(input);
                    if (component) {
                        return {
                            value: component,
                        };
                    }
                }

                return result;
            },
            [Symbol.iterator]() {
                return this;
            },
        } satisfies ComponentIterator;
    }

    private _registered(
        type: ComponentConstructor,
    ): type is ComponentConstructor & { _id: number } {
        return '_id' in type;
    }

    private _ensureRegistered(
        type: ComponentConstructor,
    ): asserts type is ComponentConstructor & { _id: number } {
        if (!this._registered(type)) {
            Object.defineProperty(type, '_id', {
                value: this._pools.push(new ComponentPool()) - 1,
            });
        }
    }
}
