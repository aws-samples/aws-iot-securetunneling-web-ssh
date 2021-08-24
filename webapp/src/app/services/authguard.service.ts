import { Injectable } from '@angular/core';
import {CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthguardService {

  constructor( private router: Router, private authService: AuthService) { }
   canActivate( next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
          return this.authService.getCurrentUser()
                                  .then(() => {return true})
                                  .catch(()=> { this.router.navigateByUrl('/auth'); return false});
  }
}
