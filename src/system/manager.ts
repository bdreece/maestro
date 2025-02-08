import type {
    SystemConstructor,
    SystemInstance,
    SystemIterator,
} from './types';

export type SystemManagerEntry = [priority: number, system: SystemInstance];

/** Provides a priority-queue-like collection of systems */
export default class SystemManager {
    private readonly _types: number[] = [];
    private readonly _systems: SystemManagerEntry[] = [];

    /** Retrieves the system of the given {@link type} from the manager, if it exists */
    get<T extends SystemInstance>(type: SystemConstructor<T>): T | undefined;
    get(type: SystemConstructor): SystemInstance | undefined;
    get(type: SystemConstructor): SystemInstance | undefined {
        if (!this._registered(type)) {
            return undefined;
        }

        const index = this._types[type._id]!;
        if (index === -1) {
            return undefined;
        }

        return this._systems[index]![1];
    }

    /** Returns whether a system of the given {@link type} exists in the manager */
    has(type: SystemConstructor): boolean {
        return this._registered(type) && this._types[type._id] !== -1;
    }

    /** Adds a {@link system} with the given {@link priority} to the manager */
    add(priority: number, system: SystemInstance): void {
        const type = system.constructor as SystemConstructor;
        this._ensureRegistered(type);

        const index = this._types[type._id]!;
        if (index !== -1) {
            // remove existing system if it exists
            this._systems.splice(index, 1);
        }

        let i;
        for (i = 0; i < this._systems.length; ++i) {
            if (this._systems[i]![0] > priority) {
                this._systems.splice(i, 0, [priority, system]);
                this._types[type._id] = i;
                return;
            }
        }

        this._types[type._id] = this._systems.push([priority, system]) - 1;
    }

    /**
     * Removes the system with the given {@link type} from the manager, if
     * it exists
     */
    remove<T extends SystemInstance>(type: SystemConstructor<T>): T | undefined;
    remove(type: SystemConstructor): SystemInstance | undefined;
    remove(type: SystemConstructor): SystemInstance | undefined {
        if (!this._registered(type)) {
            return undefined;
        }

        const index = this._types[type._id]!;
        if (index === -1) {
            return undefined;
        }

        const [[, system] = []] = this._systems.splice(index, 1);
        this._types[type._id] = -1;
        return system;
    }

    /** Iterates over the systems in the manager */
    values(): SystemIterator {
        const iter = this._systems[Symbol.iterator]();

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

    entries(): IterableIterator<SystemManagerEntry> {
        return this._systems[Symbol.iterator]();
    }

    [Symbol.iterator](): IterableIterator<SystemManagerEntry> {
        return this._systems[Symbol.iterator]();
    }

    private _registered(
        type: SystemConstructor,
    ): type is SystemConstructor & { _id: number } {
        return '_id' in type;
    }

    private _ensureRegistered(
        type: SystemConstructor,
    ): asserts type is SystemConstructor & { _id: number } {
        if (!this._registered(type)) {
            Object.defineProperty(type, '_id', {
                value: this._types.push(-1) - 1,
            });
        }
    }
}
