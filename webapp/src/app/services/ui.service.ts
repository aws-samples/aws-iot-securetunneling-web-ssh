import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

function _window() : any {
  // return the global native browser window object
  return window;
}

@Injectable({
  providedIn: 'root'
})
export class UiService {
  menuToggle$ = new Subject();
  progressBar$ = new Subject();
  constructor() { }
  get nativeWindow() : any {
    return _window();
 }
}
