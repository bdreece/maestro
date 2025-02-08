import { EntityIterator } from './types';

export default class EntityManager {
    private readonly _entities: number[] = [];
    private readonly _free: number[] = [];
    private readonly _onDestroy;

    constructor(onDestroy?: (entityId: number) => void) {
        this._onDestroy = onDestroy;
    }

    get size() {
        return this._entities.length - this._free.length;
    }

    create(): number {
        return (
            this._free.pop() ?? this._entities.push(this._entities.length) - 1
        );
    }

    destroy(entityId: number) {
        this._free.push(entityId);
        this._onDestroy?.(entityId);
    }

    has(entityId: number): boolean {
        return (
            entityId > 0 &&
            entityId < this._entities.length &&
            !this._free.includes(entityId)
        );
    }

    entities(): EntityIterator {
        return this[Symbol.iterator]();
    }

    [Symbol.iterator](): EntityIterator {
        const iter = this._entities[Symbol.iterator]();
        return {
            next: () => {
                let result;

                for (
                    result = iter.next();
                    !result.done && this._free.includes(result.value);
                    result = iter.next()
                );

                return result;
            },
            [Symbol.iterator]() {
                return this;
            },
        };
    }
}
