(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('rxjs'), require('rxjs/operators')) :
    typeof define === 'function' && define.amd ? define('@ngrx/component', ['exports', '@angular/core', 'rxjs', 'rxjs/operators'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.ngrx = global.ngrx || {}, global.ngrx.component = {}), global.ng.core, global.rxjs, global.rxjs.operators));
}(this, (function (exports, core, rxjs, operators) { 'use strict';

    /**
     * class CdAware
     *
     * @description
     * This abstract class holds all the shared logic for the push pipe and the let directive
     * responsible for change detection
     * If you extend this class you need to implement how the update of the rendered value happens.
     * Also custom behaviour is something you need to implement in the extending class
     */
    function createCdAware(cfg) {
        var potentialObservablesSubject = new rxjs.Subject();
        var observablesFromTemplate$ = potentialObservablesSubject.pipe(operators.distinctUntilChanged());
        var rendering$ = observablesFromTemplate$.pipe(
        // Compose the observables from the template and the strategy
        operators.switchMap(function (observable$) {
            // If the passed observable is:
            // - undefined - No value set
            // - null - null passed directly or no value set over `async` pipe
            if (observable$ == null) {
                // Update the value to render_creator with null/undefined
                cfg.updateViewContextObserver.next(observable$);
                // Render the view
                cfg.render();
                // Stop further processing
                return rxjs.EMPTY;
            }
            var ob$ = rxjs.isObservable(observable$)
                ? observable$
                : rxjs.from(observable$);
            // If a new Observable arrives, reset the value to render_creator
            // We do this because we don't know when the next value arrives and want to get rid of the old value
            cfg.resetContextObserver.next();
            cfg.render();
            return ob$.pipe(operators.distinctUntilChanged(), operators.tap(cfg.updateViewContextObserver), operators.tap(function () { return cfg.render(); }), operators.catchError(function (e) {
                return rxjs.EMPTY;
            }));
        }));
        return {
            nextPotentialObservable: function (value) {
                potentialObservablesSubject.next(value);
            },
            subscribe: function () {
                return rendering$.subscribe();
            },
        };
    }

    /**
     * @description
     *
     * Determines if the application uses `NgZone` or `NgNoopZone` as ngZone service instance.
     *
     * The function can be just imported and used everywhere.
     *
     * ```ts
     * import { hasZone } from `utils/has-zone`;
     *
     * console.log(hasZone());
     * ```
     */
    function hasZone(z) {
        return z instanceof core.NgZone;
    }

    function createRender(config) {
        function render() {
            if (hasZone(config.ngZone)) {
                config.cdRef.markForCheck();
            }
            else {
                config.cdRef.detectChanges();
            }
        }
        return render;
    }

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
    var PushPipe = /** @class */ (function () {
        function PushPipe(cdRef, ngZone) {
            var _this = this;
            this.resetContextObserver = {
                next: function () { return (_this.renderedValue = undefined); },
            };
            this.updateViewContextObserver = {
                next: function (value) { return (_this.renderedValue = value); },
            };
            this.cdAware = createCdAware({
                render: createRender({ cdRef: cdRef, ngZone: ngZone }),
                updateViewContextObserver: this.updateViewContextObserver,
                resetContextObserver: this.resetContextObserver,
            });
            this.subscription = this.cdAware.subscribe();
        }
        PushPipe.prototype.transform = function (potentialObservable) {
            this.cdAware.nextPotentialObservable(potentialObservable);
            return this.renderedValue;
        };
        PushPipe.prototype.ngOnDestroy = function () {
            this.subscription.unsubscribe();
        };
        return PushPipe;
    }());
    PushPipe.decorators = [
        { type: core.Pipe, args: [{ name: 'ngrxPush', pure: false },] }
    ];
    /** @nocollapse */
    PushPipe.ctorParameters = function () { return [
        { type: core.ChangeDetectorRef },
        { type: core.NgZone }
    ]; };

    /**
     * @Directive LetDirective
     *
     * @description
     *
     * The `*ngrxLet` directive serves a convenient way of binding observables to a view context (a dom element scope).
     * It also helps with several internal processing under the hood.
     *
     * The current way of binding an observable to the view looks like that:
     * ```html
     * <ng-container *ngIf="observableNumber$ as n">
     * <app-number [number]="n">
     * </app-number>
     * <app-number-special [number]="n">
     * </app-number-special>
     * </ng-container>
     *  ```
     *
     *  The problem is `*ngIf` is also interfering with rendering and in case of a `0` the component would be hidden
     *
     * Included Features:
     * - binding is always present. (`*ngIf="truthy$"`)
     * - it takes away the multiple usages of the `async` or `ngrxPush` pipe
     * - a unified/structured way of handling null and undefined
     * - triggers change-detection differently if `zone.js` is present or not (`ChangeDetectorRef.detectChanges` or `ChangeDetectorRef.markForCheck`)
     * - triggers change-detection differently if ViewEngine or Ivy is present (`ChangeDetectorRef.detectChanges` or `ɵdetectChanges`)
     * - distinct same values in a row (distinctUntilChanged operator),
     *
     * @usageNotes
     *
     * The `*ngrxLet` directive take over several things and makes it more convenient and save to work with streams in the template
     * `<ng-container *ngrxLet="observableNumber$ as c"></ng-container>`
     *
     * ```html
     * <ng-container *ngrxLet="observableNumber$ as n">
     * <app-number [number]="n">
     * </app-number>
     * </ng-container>
     *
     * <ng-container *ngrxLet="observableNumber$; let n">
     * <app-number [number]="n">
     * </app-number>
     * </ng-container>
     * ```
     *
     * In addition to that it provides us information from the whole observable context.
     * We can track the observables:
     * - next value
     * - error value
     * - complete state
     *
     * ```html
     * <ng-container *ngrxLet="observableNumber$; let n; let e = $error, let c = $complete">
     * <app-number [number]="n"  *ngIf="!e && !c">
     * </app-number>
     * <ng-container *ngIf="e">
     * There is an error: {{e}}
     * </ng-container>
     * <ng-container *ngIf="c">
     * Observable completed: {{c}}
     * </ng-container>
     * </ng-container>
     * ```
     *
     * @publicApi
     */
    var LetDirective = /** @class */ (function () {
        function LetDirective(cdRef, ngZone, templateRef, viewContainerRef) {
            var _this = this;
            this.templateRef = templateRef;
            this.viewContainerRef = viewContainerRef;
            this.ViewContext = {
                $implicit: undefined,
                ngrxLet: undefined,
                $error: false,
                $complete: false,
            };
            this.resetContextObserver = {
                next: function () {
                    // if not initialized no need to set undefined
                    if (_this.embeddedView) {
                        _this.ViewContext.$implicit = undefined;
                        _this.ViewContext.ngrxLet = undefined;
                        _this.ViewContext.$error = false;
                        _this.ViewContext.$complete = false;
                    }
                },
            };
            this.updateViewContextObserver = {
                next: function (value) {
                    // to have init lazy
                    if (!_this.embeddedView) {
                        _this.createEmbeddedView();
                    }
                    _this.ViewContext.$implicit = value;
                    _this.ViewContext.ngrxLet = value;
                },
                error: function (error) {
                    // to have init lazy
                    if (!_this.embeddedView) {
                        _this.createEmbeddedView();
                    }
                    _this.ViewContext.$error = true;
                },
                complete: function () {
                    // to have init lazy
                    if (!_this.embeddedView) {
                        _this.createEmbeddedView();
                    }
                    _this.ViewContext.$complete = true;
                },
            };
            this.cdAware = createCdAware({
                render: createRender({ cdRef: cdRef, ngZone: ngZone }),
                resetContextObserver: this.resetContextObserver,
                updateViewContextObserver: this.updateViewContextObserver,
            });
            this.subscription = this.cdAware.subscribe();
        }
        LetDirective.ngTemplateContextGuard = function (dir, ctx) {
            return true;
        };
        Object.defineProperty(LetDirective.prototype, "ngrxLet", {
            set: function (potentialObservable) {
                this.cdAware.nextPotentialObservable(potentialObservable);
            },
            enumerable: false,
            configurable: true
        });
        LetDirective.prototype.createEmbeddedView = function () {
            this.embeddedView = this.viewContainerRef.createEmbeddedView(this.templateRef, this.ViewContext);
        };
        LetDirective.prototype.ngOnDestroy = function () {
            this.subscription.unsubscribe();
            this.viewContainerRef.clear();
        };
        return LetDirective;
    }());
    LetDirective.decorators = [
        { type: core.Directive, args: [{ selector: '[ngrxLet]' },] }
    ];
    /** @nocollapse */
    LetDirective.ctorParameters = function () { return [
        { type: core.ChangeDetectorRef },
        { type: core.NgZone },
        { type: core.TemplateRef },
        { type: core.ViewContainerRef }
    ]; };
    LetDirective.propDecorators = {
        ngrxLet: [{ type: core.Input }]
    };

    var DECLARATIONS = [LetDirective, PushPipe];
    var EXPORTS = [DECLARATIONS];
    var ReactiveComponentModule = /** @class */ (function () {
        function ReactiveComponentModule() {
        }
        return ReactiveComponentModule;
    }());
    ReactiveComponentModule.decorators = [
        { type: core.NgModule, args: [{
                    declarations: [DECLARATIONS],
                    exports: [EXPORTS],
                },] }
    ];

    /**
     * DO NOT EDIT
     *
     * This file is automatically generated at build
     */

    /**
     * Generated bundle index. Do not edit.
     */

    exports.LetDirective = LetDirective;
    exports.PushPipe = PushPipe;
    exports.ReactiveComponentModule = ReactiveComponentModule;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ngrx-component.umd.js.map
