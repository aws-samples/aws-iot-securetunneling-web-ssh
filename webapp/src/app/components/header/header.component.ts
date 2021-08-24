import { Component, OnInit } from '@angular/core';
import { UiService } from 'src/app/services/ui.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  progress= false;
  isLoggedIn = false;
  user: { id: string; username: string; email: string };

  constructor(private uiService: UiService, private authService: AuthService) { }

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(
      isLoggedIn => (this.isLoggedIn = isLoggedIn)
    );

    this.authService.auth$.subscribe(({ id, username, email }) => {
      this.user = { id, username, email };
    });

    this.uiService.progressBar$.subscribe((toggle: boolean) => this.progress = toggle);
  }
  onToggleMenu() {
    this.uiService.menuToggle$.next(true);
}

onLogOut(){
  this.authService.signout();
}

}
