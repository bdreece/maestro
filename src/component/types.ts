import type { default as Component } from './index';

export interface ComponentConstructor<
    T extends Component = Component,
    TArgs extends unknown[] = unknown[],
> {
    new (...args: TArgs): T;
    prototype: T;
}

export interface ComponentIterator<T extends Component = Component>
    extends IterableIterator<T> {
    [Symbol.iterator](): ComponentIterator<T>;
}
