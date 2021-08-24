import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './modules/app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { AmplifyAngularModule, AmplifyService } from 'aws-amplify-angular';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { MenuComponent } from './components/menu/menu.component';
import { HomeComponent } from './components/home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule} from './modules/material.module';
import { AuthComponent } from './components/auth/auth.component';
import { UiService } from './services/ui.service';
import { AuthService } from './services/auth.service';
import { XtermService } from './services/xterm.service';
import { SocketService } from './services/socket.service';
import { ProtobufService } from './services/protobuf.service';
import { ErrorService } from './services/error.service';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MenuComponent,
    HomeComponent,
    AuthComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    AmplifyAngularModule,
    MaterialModule,
    FlexLayoutModule
  ],
  providers: [UiService, AuthService, AmplifyService, XtermService, SocketService, ProtobufService, ErrorService],
  bootstrap: [AppComponent]
})
export class AppModule { }
