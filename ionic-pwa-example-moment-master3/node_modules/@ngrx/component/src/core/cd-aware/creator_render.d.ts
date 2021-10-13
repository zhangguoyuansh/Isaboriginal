import { ChangeDetectorRef, NgZone } from '@angular/core';
export interface RenderConfig {
    ngZone: NgZone;
    cdRef: ChangeDetectorRef;
}
export declare function createRender<T>(config: RenderConfig): () => void;
