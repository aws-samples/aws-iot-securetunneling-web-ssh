import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
 werror = new Subject();
  constructor() { }
}
