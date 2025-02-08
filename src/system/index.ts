import type { ComponentConstructor } from '../component/types';
import type { default as SystemController } from './controller';

export default function System<T extends ComponentConstructor[]>(...types: T) {
    return class System {
        /** @internal */
        static readonly _node = types;

        /** @internal */
        _controller;

        get nodes() {
            return this._controller.nodes();
        }
        get destroy() {
            return this._controller.destroy;
        }

        constructor(controller: SystemController<T>) {
            this._controller = controller;
        }

        // @ts-expect-error 6133
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        update(deltaTime: DOMHighResTimeStamp): void {}
    };
}
