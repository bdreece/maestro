import type { default as Component } from '../component/index';
import type { default as ComponentManager } from '../component/manager';
import type {
    ComponentConstructor,
    ComponentIterator,
} from '../component/types';
import type { default as EntityManager } from './manager';

export default class EntityController {
    readonly id: number;

    readonly destroy: () => void;

    readonly addComponent: (component: Component) => void;

    readonly removeComponent: {
        <T extends Component>(type: ComponentConstructor<T>): T | undefined;
        (type: ComponentConstructor): Component | undefined;
    };

    readonly getComponent: {
        <T extends Component>(type: ComponentConstructor<T>): T | undefined;
        (type: ComponentConstructor): Component | undefined;
    };

    readonly components: () => ComponentIterator;

    constructor(entities: EntityManager, components: ComponentManager) {
        this.id = entities.create();
        this.destroy = entities.destroy.bind(entities, this.id);
        this.addComponent = components.add.bind(components, this.id);
        this.removeComponent = components.remove.bind(components, this.id);
        this.getComponent = components.get.bind(components, this.id);
        this.components = components.components.bind(
            components,
            this.id as unknown as ComponentConstructor,
        ) as unknown as () => ComponentIterator;
    }
}
