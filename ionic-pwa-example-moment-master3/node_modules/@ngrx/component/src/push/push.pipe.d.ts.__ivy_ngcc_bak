import { ChangeDetectorRef, NgZone, OnDestroy, PipeTransform } from '@angular/core';
import { ObservableInput } from 'rxjs';
/**
 * @Pipe PushPipe
 *
 * @description
 *
 * The `ngrxPush` pipe serves as a drop-in replacement for the `async` pipe.
 * It contains intelligent handling of change detection to enable us
 * running in zone-full as well as zone-less mode without any changes to the code.
 *
 * The current way of binding an observable to the view looks like that:
 *  ```html
 *  {{observable$ | async}}
 * <ng-container *ngIf="observable$ | async as o">{{o}}</ng-container>
 * <component [value]="observable$ | async"></component>
 * ```
 *
 * The problem is `async` pipe just marks the component and all its ancestors as dirty.
 * It needs zone.js microtask queue to exhaust until `ApplicationRef.tick` is called to render_creator all dirty marked
 *     components.
 *
 * Heavy dynamic and interactive UIs suffer from zones change detection a lot and can
 * lean to bad performance or even unusable applications, but the `async` pipe does not work in zone-less mode.
 *
 * `ngrxPush` pipe solves that problem.
 *
 * Included Features:
 *  - Take observables or promises, retrieve their values and render_creator the value to the template
 *  - Handling null and undefined values in a clean unified/structured way
 *  - Triggers change-detection differently if `zone.js` is present or not (`detectChanges` or `markForCheck`)
 *  - Distinct same values in a row to increase performance
 *  - Coalescing of change detection calls to boost performance
 *
 * @usageNotes
 *
 * `ngrxPush` pipe solves that problem. It can be used like shown here:
 * ```html
 * {{observable$ | ngrxPush}}
 * <ng-container *ngIf="observable$ | ngrxPush as o">{{o}}</ng-container>
 * <component [value]="observable$ | ngrxPush"></component>
 * ```
 *
 * @publicApi
 */
export declare class PushPipe<S> implements PipeTransform, OnDestroy {
    private renderedValue;
    private readonly subscription;
    private readonly cdAware;
    private readonly resetContextObserver;
    private readonly updateViewContextObserver;
    constructor(cdRef: ChangeDetectorRef, ngZone: NgZone);
    transform<T>(potentialObservable: null): null;
    transform<T>(potentialObservable: undefined): undefined;
    transform<T>(potentialObservable: ObservableInput<T>): T | undefined;
    ngOnDestroy(): void;
}
