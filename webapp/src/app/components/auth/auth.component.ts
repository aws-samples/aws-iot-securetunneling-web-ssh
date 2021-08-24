import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  authForm: FormGroup;
  error = false;
  hide= false
  errorLogin = ''; 
  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private uiService: UiService) { }

  ngOnInit() {
    this.authForm = this.fb.group({
      username: [''],
      password: ['', [Validators.required, Validators.minLength(5)]]
    });
  }


   async onSubmit(form: FormGroup) {
     this.error = false;
     this.uiService.progressBar$.next(true);
    try {
      let user = await this.authService.signin(form.value.username, form.value.password);

      this.uiService.progressBar$.next(false);
      this.router.navigateByUrl('/');
    } catch (e) {
      this.error = true;
      if (e.code === 'NotAuthorizedException'){
        this.uiService.progressBar$.next(false);
          console.log('The error happens when the incorrect password is provided');
          this.errorLogin = "Your authentication information is incorrect. Please try again"
          this.error = true;
      } else if (e.code === 'UserNotFoundException'){
        this.uiService.progressBar$.next(false);
        console.log('The error happens when the supplied username/email does not exist in the Cognito user pool');
        this.errorLogin = "Your authentication information is incorrect. Please try again"
        this.error = true;
      } else {
        this.uiService.progressBar$.next(false);
        console.log(e);
        this.errorLogin = "Oops seomthing went wrong. Please try again"
        this.error = true;
      }
    }

  
  }
}
