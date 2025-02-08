import type { EntityIterator } from '../entity/types';
import type { default as Component } from './index';
import type { ComponentIterator } from './types';

export type ComponentPoolEntry<T> = [number, T];

/** Readonly interface of a {@link ComponentPool} */
export interface ReadonlyComponentPool<T extends Component = Component> {
    size: number;
    get(entityId: number): T | undefined;
    has(entityId: number): boolean;
    forEach(
        callbackfn: (
            component: T,
            entityId: number,
            pool: ComponentPool<T>,
        ) => void,
        thisArg?: unknown,
    ): void;
    entities(): EntityIterator;
    components(): ComponentIterator<T>;
    entries(): IterableIterator<ComponentPoolEntry<T>>;
    [Symbol.iterator](): IterableIterator<ComponentPoolEntry<T>>;
}

/** Map-like container for accessing a particular type of component. */
export default class ComponentPool<T extends Component = Component>
    implements ReadonlyComponentPool<T>
{
    /** Sentinel value used to denote null entities in the sparse list */
    private readonly _DEAD = -1;

    private readonly _dense: ComponentPoolEntry<T>[] = [];
    private readonly _sparse: number[] = [];

    /** The number of components in the pool */
    get size() {
        return this._dense.length;
    }

    /**
     * Retrieves a component by its corresponding {@link entityId}, returning
     * undefined if it does not exist
     */
    get(entityId: number): T | undefined {
        if (entityId < 0 || entityId >= this._sparse.length) {
            return undefined;
        }

        const index = this._sparse[entityId]!;
        if (index === this._DEAD) {
            return undefined;
        }

        return this._dense[index]![1];
    }

    /**
     * Checks if a component with the given {@link entityId} is present in
     * the pool
     */
    has(entityId: number): boolean {
        return (
            entityId > 0 &&
            entityId < this._sparse.length &&
            this._sparse[entityId] !== this._DEAD
        );
    }

    /**
     * Adds the provided {@link component} with the corrensponding
     * {@link entityId}, overwriting any existing component
     */
    add(entityId: number, component: T): void {
        if (entityId < 0) {
            // invalid entity id
            return;
        }

        if (entityId >= this._sparse.length) {
            // reserve space for the new entity id and any preceding that are
            // also missing.
            const start = this._sparse.length;
            this._sparse.length = entityId + 1;
            this._sparse.fill(this._DEAD, start);
        }

        const index = this._sparse[entityId];
        if (index === this._DEAD) {
            this._sparse[entityId] =
                this._dense.push([entityId, component]) - 1;
        }
    }

    remove(entityId: number): T | undefined {
        if (entityId < 0 || entityId >= this._sparse.length) {
            return undefined;
        }

        const index = this._sparse[entityId]!;
        if (index === -1) {
            return undefined;
        }

        const tmp = this._dense[index]!;

        // pop the last entry from the dense list, and use it to replace the
        // target entry
        const replacement = this._dense.pop()!;
        this._dense[index] = replacement;
        this._sparse[replacement[0]] = index;

        // mark the entity as dead in the sparse list
        this._sparse[entityId] = this._DEAD;

        return tmp[1];
    }

    /** Executes a {@link callbackfn} for each component present in the pool */
    forEach(
        callbackfn: (
            component: T,
            entityId: number,
            pool: ComponentPool<T>,
        ) => void,
        thisArg?: unknown,
    ): void {
        let i;
        for (i = 0; i < this._dense.length; ++i) {
            const entry = this._dense[i]!;
            callbackfn.call(thisArg, entry[1], entry[0], this);
        }
    }

    /** Iterates over the entity IDs present in the pool */
    entities(): EntityIterator {
        return this._sparse.keys();
    }

    /** Iterates over the components present in the pool */
    components(): ComponentIterator<T> {
        const iter = this._dense[Symbol.iterator]();

        return {
            next() {
                const result = iter.next();
                if (result.done) {
                    return result;
                }

                return {
                    value: result.value[1],
                };
            },
            [Symbol.iterator]() {
                return this;
            },
        };
    }

    /** Iterates over the entity-component pairs present in the pool */
    entries(): IterableIterator<ComponentPoolEntry<T>> {
        return this._dense[Symbol.iterator]();
    }

    /** Iterates over the entity-component pairs present in the pool */
    [Symbol.iterator](): IterableIterator<ComponentPoolEntry<T>> {
        return this._dense[Symbol.iterator]();
    }
}
