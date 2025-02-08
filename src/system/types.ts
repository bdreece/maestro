import type { ComponentConstructor } from '../component/types';
import type { default as System } from './index';
import type { default as SystemController } from './controller';

export type SystemInstance<
    T extends ComponentConstructor[] = ComponentConstructor[],
> = InstanceType<ReturnType<typeof System<T>>>;

export type SystemComponents<T extends SystemInstance> =
    T extends SystemInstance<infer TComponents> ? TComponents
    :   ComponentConstructor[];

export interface SystemConstructor<
    T extends SystemInstance = SystemInstance,
    TArgs extends unknown[] = unknown[],
> {
    new (controller: SystemController<SystemComponents<T>>, ...args: TArgs): T;
    prototype: T;

    /** @internal */
    _node: SystemComponents<T>;
}

/** Represents a system-specific view over an entity's components */
export type SystemNode<T extends ComponentConstructor[] = []> =
    T extends [infer TFirst, ...infer TRest] ?
        TFirst extends ComponentConstructor<infer TComponent> ?
            TRest extends ComponentConstructor[] ?
                [TComponent, ...SystemNode<TRest>]
            :   [TComponent]
        :   []
    :   [];

export interface SystemIterator
    extends IterableIterator<SystemInstance, void, undefined> {
    [Symbol.iterator](): SystemIterator;
}

/** Iterates over the present nodes */
export interface SystemNodeIterator<T extends ComponentConstructor[]>
    extends IterableIterator<[...SystemNode<T>], void, undefined> {
    [Symbol.iterator](): SystemNodeIterator<T>;
}
