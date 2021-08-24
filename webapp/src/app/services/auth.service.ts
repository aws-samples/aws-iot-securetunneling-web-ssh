import { Injectable } from '@angular/core';
import { AmplifyService } from 'aws-amplify-angular';
import { Hub } from '@aws-amplify/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

const initialAuthState = {
  isLoggedIn: false,
  username: null,
  id: null,
  email: null
};

export interface AuthState {
  isLoggedIn: boolean;
  username: string | null;
  id: string | null;
  email: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _authState = new BehaviorSubject<AuthState>(initialAuthState);
  readonly auth$ = this._authState.asObservable();
  readonly isLoggedIn$ = this.auth$.pipe(map(state => state.isLoggedIn));

  constructor(private amp: AmplifyService, private router: Router) {

    this.amp.auth().currentAuthenticatedUser().then(
      (user: any) => this.setUser(user),
      _err => this._authState.next(initialAuthState)
    );

    Hub.listen('auth', ({payload: {event, data, message}}) => {
      if (event === 'signIn') {
        this.setUser(data);
      } else { this._authState.next(initialAuthState); }
    });

   }

  signin(username, password){
    return  this.amp.auth().signIn(username, password);
  }
  
  getCurrentUser(){
      return this.amp.auth().currentAuthenticatedUser();
  }

  async signout(){
    try {
      let signout = await this.amp.auth().signOut();
      localStorage.clear();
      this._authState.next(initialAuthState);
      this.router.navigateByUrl('/auth');
    } catch (error) {
      localStorage.clear();
      this._authState.next(initialAuthState);
      this.router.navigateByUrl('/auth');

    }

  }

  private setUser(user: any) {
    if (!user) {
      return;
    }
    const {attributes: { sub: id, email }, username } = user;
    this._authState.next({ isLoggedIn: true, id, username, email });
  }
  
}
