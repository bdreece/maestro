import type { default as Entity } from './index';
import type { default as EntityController } from './controller';

export interface EntityConstructor<T extends Entity = Entity> {
    new (controller: EntityController): T;
    prototype: T;
}

export interface EntityIterator
    extends IterableIterator<number, void, undefined> {
    [Symbol.iterator](): EntityIterator;
}
