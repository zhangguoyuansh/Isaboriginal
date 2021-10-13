import { NextObserver, ObservableInput, Subscribable } from 'rxjs';
export interface CdAware<U> extends Subscribable<U> {
    nextPotentialObservable: (value: ObservableInput<any> | null | undefined) => void;
}
/**
 * class CdAware
 *
 * @description
 * This abstract class holds all the shared logic for the push pipe and the let directive
 * responsible for change detection
 * If you extend this class you need to implement how the update of the rendered value happens.
 * Also custom behaviour is something you need to implement in the extending class
 */
export declare function createCdAware<U>(cfg: {
    render: () => void;
    resetContextObserver: NextObserver<void>;
    updateViewContextObserver: NextObserver<U | undefined | null>;
}): CdAware<U | undefined | null>;
