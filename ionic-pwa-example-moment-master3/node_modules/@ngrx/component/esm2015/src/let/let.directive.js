import { ChangeDetectorRef, Directive, Input, NgZone, TemplateRef, ViewContainerRef, } from '@angular/core';
import { createCdAware } from '../core/cd-aware/cd-aware_creator';
import { createRender } from '../core/cd-aware/creator_render';
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
export class LetDirective {
    constructor(cdRef, ngZone, templateRef, viewContainerRef) {
        this.templateRef = templateRef;
        this.viewContainerRef = viewContainerRef;
        this.ViewContext = {
            $implicit: undefined,
            ngrxLet: undefined,
            $error: false,
            $complete: false,
        };
        this.resetContextObserver = {
            next: () => {
                // if not initialized no need to set undefined
                if (this.embeddedView) {
                    this.ViewContext.$implicit = undefined;
                    this.ViewContext.ngrxLet = undefined;
                    this.ViewContext.$error = false;
                    this.ViewContext.$complete = false;
                }
            },
        };
        this.updateViewContextObserver = {
            next: (value) => {
                // to have init lazy
                if (!this.embeddedView) {
                    this.createEmbeddedView();
                }
                this.ViewContext.$implicit = value;
                this.ViewContext.ngrxLet = value;
            },
            error: (error) => {
                // to have init lazy
                if (!this.embeddedView) {
                    this.createEmbeddedView();
                }
                this.ViewContext.$error = true;
            },
            complete: () => {
                // to have init lazy
                if (!this.embeddedView) {
                    this.createEmbeddedView();
                }
                this.ViewContext.$complete = true;
            },
        };
        this.cdAware = createCdAware({
            render: createRender({ cdRef, ngZone }),
            resetContextObserver: this.resetContextObserver,
            updateViewContextObserver: this.updateViewContextObserver,
        });
        this.subscription = this.cdAware.subscribe();
    }
    static ngTemplateContextGuard(dir, ctx) {
        return true;
    }
    set ngrxLet(potentialObservable) {
        this.cdAware.nextPotentialObservable(potentialObservable);
    }
    createEmbeddedView() {
        this.embeddedView = this.viewContainerRef.createEmbeddedView(this.templateRef, this.ViewContext);
    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.viewContainerRef.clear();
    }
}
LetDirective.decorators = [
    { type: Directive, args: [{ selector: '[ngrxLet]' },] }
];
/** @nocollapse */
LetDirective.ctorParameters = () => [
    { type: ChangeDetectorRef },
    { type: NgZone },
    { type: TemplateRef },
    { type: ViewContainerRef }
];
LetDirective.propDecorators = {
    ngrxLet: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGV0LmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL21vZHVsZXMvY29tcG9uZW50L3NyYy9sZXQvbGV0LmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0wsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxLQUFLLEVBQ0wsTUFBTSxFQUVOLFdBQVcsRUFDWCxnQkFBZ0IsR0FDakIsTUFBTSxlQUFlLENBQUM7QUFJdkIsT0FBTyxFQUFXLGFBQWEsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQzNFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQWEvRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FpRUc7QUFFSCxNQUFNLE9BQU8sWUFBWTtJQTZEdkIsWUFDRSxLQUF3QixFQUN4QixNQUFjLEVBQ0csV0FBMkMsRUFDM0MsZ0JBQWtDO1FBRGxDLGdCQUFXLEdBQVgsV0FBVyxDQUFnQztRQUMzQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBL0RwQyxnQkFBVyxHQUF5QztZQUNuRSxTQUFTLEVBQUUsU0FBUztZQUNwQixPQUFPLEVBQUUsU0FBUztZQUNsQixNQUFNLEVBQUUsS0FBSztZQUNiLFNBQVMsRUFBRSxLQUFLO1NBQ2pCLENBQUM7UUFJZSx5QkFBb0IsR0FBdUI7WUFDMUQsSUFBSSxFQUFFLEdBQUcsRUFBRTtnQkFDVCw4Q0FBOEM7Z0JBQzlDLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtvQkFDckIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO29CQUN2QyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUM7b0JBQ3JDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztvQkFDaEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO2lCQUNwQztZQUNILENBQUM7U0FDRixDQUFDO1FBQ2UsOEJBQXlCLEdBQW1DO1lBQzNFLElBQUksRUFBRSxDQUFDLEtBQTJCLEVBQUUsRUFBRTtnQkFDcEMsb0JBQW9CO2dCQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTtvQkFDdEIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7aUJBQzNCO2dCQUNELElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztnQkFDbkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1lBQ25DLENBQUM7WUFDRCxLQUFLLEVBQUUsQ0FBQyxLQUFZLEVBQUUsRUFBRTtnQkFDdEIsb0JBQW9CO2dCQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTtvQkFDdEIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7aUJBQzNCO2dCQUNELElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztZQUNqQyxDQUFDO1lBQ0QsUUFBUSxFQUFFLEdBQUcsRUFBRTtnQkFDYixvQkFBb0I7Z0JBQ3BCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO29CQUN0QixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztpQkFDM0I7Z0JBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBQ3BDLENBQUM7U0FDRixDQUFDO1FBc0JBLElBQUksQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFJO1lBQzlCLE1BQU0sRUFBRSxZQUFZLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDdkMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLG9CQUFvQjtZQUMvQyx5QkFBeUIsRUFBRSxJQUFJLENBQUMseUJBQXlCO1NBQzFELENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUMvQyxDQUFDO0lBMUJELE1BQU0sQ0FBQyxzQkFBc0IsQ0FDM0IsR0FBb0IsRUFDcEIsR0FBK0I7UUFFL0IsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBSUQsSUFDSSxPQUFPLENBQUMsbUJBQTBEO1FBQ3BFLElBQUksQ0FBQyxPQUFPLENBQUMsdUJBQXVCLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBZ0JELGtCQUFrQjtRQUNoQixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FDMUQsSUFBSSxDQUFDLFdBQVcsRUFDaEIsSUFBSSxDQUFDLFdBQVcsQ0FDakIsQ0FBQztJQUNKLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNoQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDaEMsQ0FBQzs7O1lBdEZGLFNBQVMsU0FBQyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUU7Ozs7WUEzRmxDLGlCQUFpQjtZQUdqQixNQUFNO1lBRU4sV0FBVztZQUNYLGdCQUFnQjs7O3NCQThJZixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIERpcmVjdGl2ZSxcbiAgSW5wdXQsXG4gIE5nWm9uZSxcbiAgT25EZXN0cm95LFxuICBUZW1wbGF0ZVJlZixcbiAgVmlld0NvbnRhaW5lclJlZixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IE5leHRPYnNlcnZlciwgT2JzZXJ2YWJsZUlucHV0LCBPYnNlcnZlciwgVW5zdWJzY3JpYmFibGUgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgQ2RBd2FyZSwgY3JlYXRlQ2RBd2FyZSB9IGZyb20gJy4uL2NvcmUvY2QtYXdhcmUvY2QtYXdhcmVfY3JlYXRvcic7XG5pbXBvcnQgeyBjcmVhdGVSZW5kZXIgfSBmcm9tICcuLi9jb3JlL2NkLWF3YXJlL2NyZWF0b3JfcmVuZGVyJztcblxuZXhwb3J0IGludGVyZmFjZSBMZXRWaWV3Q29udGV4dDxUPiB7XG4gIC8vIHRvIGVuYWJsZSBgbGV0YCBzeW50YXggd2UgaGF2ZSB0byB1c2UgJGltcGxpY2l0ICh2YXI7IGxldCB2ID0gdmFyKVxuICAkaW1wbGljaXQ6IFQ7XG4gIC8vIHRvIGVuYWJsZSBgYXNgIHN5bnRheCB3ZSBoYXZlIHRvIGFzc2lnbiB0aGUgZGlyZWN0aXZlcyBzZWxlY3RvciAodmFyIGFzIHYpXG4gIG5ncnhMZXQ6IFQ7XG4gIC8vIHNldCBjb250ZXh0IHZhciBjb21wbGV0ZSB0byB0cnVlICh2YXIkOyBsZXQgZSA9ICRlcnJvcilcbiAgJGVycm9yOiBib29sZWFuO1xuICAvLyBzZXQgY29udGV4dCB2YXIgY29tcGxldGUgdG8gdHJ1ZSAodmFyJDsgbGV0IGMgPSAkY29tcGxldGUpXG4gICRjb21wbGV0ZTogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBARGlyZWN0aXZlIExldERpcmVjdGl2ZVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIFRoZSBgKm5ncnhMZXRgIGRpcmVjdGl2ZSBzZXJ2ZXMgYSBjb252ZW5pZW50IHdheSBvZiBiaW5kaW5nIG9ic2VydmFibGVzIHRvIGEgdmlldyBjb250ZXh0IChhIGRvbSBlbGVtZW50IHNjb3BlKS5cbiAqIEl0IGFsc28gaGVscHMgd2l0aCBzZXZlcmFsIGludGVybmFsIHByb2Nlc3NpbmcgdW5kZXIgdGhlIGhvb2QuXG4gKlxuICogVGhlIGN1cnJlbnQgd2F5IG9mIGJpbmRpbmcgYW4gb2JzZXJ2YWJsZSB0byB0aGUgdmlldyBsb29rcyBsaWtlIHRoYXQ6XG4gKiBgYGBodG1sXG4gKiA8bmctY29udGFpbmVyICpuZ0lmPVwib2JzZXJ2YWJsZU51bWJlciQgYXMgblwiPlxuICogPGFwcC1udW1iZXIgW251bWJlcl09XCJuXCI+XG4gKiA8L2FwcC1udW1iZXI+XG4gKiA8YXBwLW51bWJlci1zcGVjaWFsIFtudW1iZXJdPVwiblwiPlxuICogPC9hcHAtbnVtYmVyLXNwZWNpYWw+XG4gKiA8L25nLWNvbnRhaW5lcj5cbiAqICBgYGBcbiAqXG4gKiAgVGhlIHByb2JsZW0gaXMgYCpuZ0lmYCBpcyBhbHNvIGludGVyZmVyaW5nIHdpdGggcmVuZGVyaW5nIGFuZCBpbiBjYXNlIG9mIGEgYDBgIHRoZSBjb21wb25lbnQgd291bGQgYmUgaGlkZGVuXG4gKlxuICogSW5jbHVkZWQgRmVhdHVyZXM6XG4gKiAtIGJpbmRpbmcgaXMgYWx3YXlzIHByZXNlbnQuIChgKm5nSWY9XCJ0cnV0aHkkXCJgKVxuICogLSBpdCB0YWtlcyBhd2F5IHRoZSBtdWx0aXBsZSB1c2FnZXMgb2YgdGhlIGBhc3luY2Agb3IgYG5ncnhQdXNoYCBwaXBlXG4gKiAtIGEgdW5pZmllZC9zdHJ1Y3R1cmVkIHdheSBvZiBoYW5kbGluZyBudWxsIGFuZCB1bmRlZmluZWRcbiAqIC0gdHJpZ2dlcnMgY2hhbmdlLWRldGVjdGlvbiBkaWZmZXJlbnRseSBpZiBgem9uZS5qc2AgaXMgcHJlc2VudCBvciBub3QgKGBDaGFuZ2VEZXRlY3RvclJlZi5kZXRlY3RDaGFuZ2VzYCBvciBgQ2hhbmdlRGV0ZWN0b3JSZWYubWFya0ZvckNoZWNrYClcbiAqIC0gdHJpZ2dlcnMgY2hhbmdlLWRldGVjdGlvbiBkaWZmZXJlbnRseSBpZiBWaWV3RW5naW5lIG9yIEl2eSBpcyBwcmVzZW50IChgQ2hhbmdlRGV0ZWN0b3JSZWYuZGV0ZWN0Q2hhbmdlc2Agb3IgYMm1ZGV0ZWN0Q2hhbmdlc2ApXG4gKiAtIGRpc3RpbmN0IHNhbWUgdmFsdWVzIGluIGEgcm93IChkaXN0aW5jdFVudGlsQ2hhbmdlZCBvcGVyYXRvciksXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBUaGUgYCpuZ3J4TGV0YCBkaXJlY3RpdmUgdGFrZSBvdmVyIHNldmVyYWwgdGhpbmdzIGFuZCBtYWtlcyBpdCBtb3JlIGNvbnZlbmllbnQgYW5kIHNhdmUgdG8gd29yayB3aXRoIHN0cmVhbXMgaW4gdGhlIHRlbXBsYXRlXG4gKiBgPG5nLWNvbnRhaW5lciAqbmdyeExldD1cIm9ic2VydmFibGVOdW1iZXIkIGFzIGNcIj48L25nLWNvbnRhaW5lcj5gXG4gKlxuICogYGBgaHRtbFxuICogPG5nLWNvbnRhaW5lciAqbmdyeExldD1cIm9ic2VydmFibGVOdW1iZXIkIGFzIG5cIj5cbiAqIDxhcHAtbnVtYmVyIFtudW1iZXJdPVwiblwiPlxuICogPC9hcHAtbnVtYmVyPlxuICogPC9uZy1jb250YWluZXI+XG4gKlxuICogPG5nLWNvbnRhaW5lciAqbmdyeExldD1cIm9ic2VydmFibGVOdW1iZXIkOyBsZXQgblwiPlxuICogPGFwcC1udW1iZXIgW251bWJlcl09XCJuXCI+XG4gKiA8L2FwcC1udW1iZXI+XG4gKiA8L25nLWNvbnRhaW5lcj5cbiAqIGBgYFxuICpcbiAqIEluIGFkZGl0aW9uIHRvIHRoYXQgaXQgcHJvdmlkZXMgdXMgaW5mb3JtYXRpb24gZnJvbSB0aGUgd2hvbGUgb2JzZXJ2YWJsZSBjb250ZXh0LlxuICogV2UgY2FuIHRyYWNrIHRoZSBvYnNlcnZhYmxlczpcbiAqIC0gbmV4dCB2YWx1ZVxuICogLSBlcnJvciB2YWx1ZVxuICogLSBjb21wbGV0ZSBzdGF0ZVxuICpcbiAqIGBgYGh0bWxcbiAqIDxuZy1jb250YWluZXIgKm5ncnhMZXQ9XCJvYnNlcnZhYmxlTnVtYmVyJDsgbGV0IG47IGxldCBlID0gJGVycm9yLCBsZXQgYyA9ICRjb21wbGV0ZVwiPlxuICogPGFwcC1udW1iZXIgW251bWJlcl09XCJuXCIgICpuZ0lmPVwiIWUgJiYgIWNcIj5cbiAqIDwvYXBwLW51bWJlcj5cbiAqIDxuZy1jb250YWluZXIgKm5nSWY9XCJlXCI+XG4gKiBUaGVyZSBpcyBhbiBlcnJvcjoge3tlfX1cbiAqIDwvbmctY29udGFpbmVyPlxuICogPG5nLWNvbnRhaW5lciAqbmdJZj1cImNcIj5cbiAqIE9ic2VydmFibGUgY29tcGxldGVkOiB7e2N9fVxuICogPC9uZy1jb250YWluZXI+XG4gKiA8L25nLWNvbnRhaW5lcj5cbiAqIGBgYFxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW25ncnhMZXRdJyB9KVxuZXhwb3J0IGNsYXNzIExldERpcmVjdGl2ZTxVPiBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgZW1iZWRkZWRWaWV3OiBhbnk7XG4gIHByaXZhdGUgcmVhZG9ubHkgVmlld0NvbnRleHQ6IExldFZpZXdDb250ZXh0PFUgfCB1bmRlZmluZWQgfCBudWxsPiA9IHtcbiAgICAkaW1wbGljaXQ6IHVuZGVmaW5lZCxcbiAgICBuZ3J4TGV0OiB1bmRlZmluZWQsXG4gICAgJGVycm9yOiBmYWxzZSxcbiAgICAkY29tcGxldGU6IGZhbHNlLFxuICB9O1xuXG4gIHByb3RlY3RlZCByZWFkb25seSBzdWJzY3JpcHRpb246IFVuc3Vic2NyaWJhYmxlO1xuICBwcml2YXRlIHJlYWRvbmx5IGNkQXdhcmU6IENkQXdhcmU8VSB8IG51bGwgfCB1bmRlZmluZWQ+O1xuICBwcml2YXRlIHJlYWRvbmx5IHJlc2V0Q29udGV4dE9ic2VydmVyOiBOZXh0T2JzZXJ2ZXI8dm9pZD4gPSB7XG4gICAgbmV4dDogKCkgPT4ge1xuICAgICAgLy8gaWYgbm90IGluaXRpYWxpemVkIG5vIG5lZWQgdG8gc2V0IHVuZGVmaW5lZFxuICAgICAgaWYgKHRoaXMuZW1iZWRkZWRWaWV3KSB7XG4gICAgICAgIHRoaXMuVmlld0NvbnRleHQuJGltcGxpY2l0ID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLlZpZXdDb250ZXh0Lm5ncnhMZXQgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuVmlld0NvbnRleHQuJGVycm9yID0gZmFsc2U7XG4gICAgICAgIHRoaXMuVmlld0NvbnRleHQuJGNvbXBsZXRlID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSxcbiAgfTtcbiAgcHJpdmF0ZSByZWFkb25seSB1cGRhdGVWaWV3Q29udGV4dE9ic2VydmVyOiBPYnNlcnZlcjxVIHwgbnVsbCB8IHVuZGVmaW5lZD4gPSB7XG4gICAgbmV4dDogKHZhbHVlOiBVIHwgbnVsbCB8IHVuZGVmaW5lZCkgPT4ge1xuICAgICAgLy8gdG8gaGF2ZSBpbml0IGxhenlcbiAgICAgIGlmICghdGhpcy5lbWJlZGRlZFZpZXcpIHtcbiAgICAgICAgdGhpcy5jcmVhdGVFbWJlZGRlZFZpZXcoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuVmlld0NvbnRleHQuJGltcGxpY2l0ID0gdmFsdWU7XG4gICAgICB0aGlzLlZpZXdDb250ZXh0Lm5ncnhMZXQgPSB2YWx1ZTtcbiAgICB9LFxuICAgIGVycm9yOiAoZXJyb3I6IEVycm9yKSA9PiB7XG4gICAgICAvLyB0byBoYXZlIGluaXQgbGF6eVxuICAgICAgaWYgKCF0aGlzLmVtYmVkZGVkVmlldykge1xuICAgICAgICB0aGlzLmNyZWF0ZUVtYmVkZGVkVmlldygpO1xuICAgICAgfVxuICAgICAgdGhpcy5WaWV3Q29udGV4dC4kZXJyb3IgPSB0cnVlO1xuICAgIH0sXG4gICAgY29tcGxldGU6ICgpID0+IHtcbiAgICAgIC8vIHRvIGhhdmUgaW5pdCBsYXp5XG4gICAgICBpZiAoIXRoaXMuZW1iZWRkZWRWaWV3KSB7XG4gICAgICAgIHRoaXMuY3JlYXRlRW1iZWRkZWRWaWV3KCk7XG4gICAgICB9XG4gICAgICB0aGlzLlZpZXdDb250ZXh0LiRjb21wbGV0ZSA9IHRydWU7XG4gICAgfSxcbiAgfTtcblxuICBzdGF0aWMgbmdUZW1wbGF0ZUNvbnRleHRHdWFyZDxVPihcbiAgICBkaXI6IExldERpcmVjdGl2ZTxVPixcbiAgICBjdHg6IHVua25vd24gfCBudWxsIHwgdW5kZWZpbmVkXG4gICk6IGN0eCBpcyBMZXRWaWV3Q29udGV4dDxVPiB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBzdGF0aWMgbmdUZW1wbGF0ZUd1YXJkX25ncnhMZXQ6ICdiaW5kaW5nJztcblxuICBASW5wdXQoKVxuICBzZXQgbmdyeExldChwb3RlbnRpYWxPYnNlcnZhYmxlOiBPYnNlcnZhYmxlSW5wdXQ8VT4gfCBudWxsIHwgdW5kZWZpbmVkKSB7XG4gICAgdGhpcy5jZEF3YXJlLm5leHRQb3RlbnRpYWxPYnNlcnZhYmxlKHBvdGVudGlhbE9ic2VydmFibGUpO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgY2RSZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIG5nWm9uZTogTmdab25lLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPExldFZpZXdDb250ZXh0PFU+PixcbiAgICBwcml2YXRlIHJlYWRvbmx5IHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWZcbiAgKSB7XG4gICAgdGhpcy5jZEF3YXJlID0gY3JlYXRlQ2RBd2FyZTxVPih7XG4gICAgICByZW5kZXI6IGNyZWF0ZVJlbmRlcih7IGNkUmVmLCBuZ1pvbmUgfSksXG4gICAgICByZXNldENvbnRleHRPYnNlcnZlcjogdGhpcy5yZXNldENvbnRleHRPYnNlcnZlcixcbiAgICAgIHVwZGF0ZVZpZXdDb250ZXh0T2JzZXJ2ZXI6IHRoaXMudXBkYXRlVmlld0NvbnRleHRPYnNlcnZlcixcbiAgICB9KTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbiA9IHRoaXMuY2RBd2FyZS5zdWJzY3JpYmUoKTtcbiAgfVxuXG4gIGNyZWF0ZUVtYmVkZGVkVmlldygpIHtcbiAgICB0aGlzLmVtYmVkZGVkVmlldyA9IHRoaXMudmlld0NvbnRhaW5lclJlZi5jcmVhdGVFbWJlZGRlZFZpZXcoXG4gICAgICB0aGlzLnRlbXBsYXRlUmVmLFxuICAgICAgdGhpcy5WaWV3Q29udGV4dFxuICAgICk7XG4gIH1cblxuICBuZ09uRGVzdHJveSgpIHtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMudmlld0NvbnRhaW5lclJlZi5jbGVhcigpO1xuICB9XG59XG4iXX0=