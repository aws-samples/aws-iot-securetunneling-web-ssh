import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { UiService } from './services/ui.service';
import { Subscription } from 'rxjs';
import { ProtobufService } from './services/protobuf.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  @ViewChild('menu', {static: true}) public menu;
  private menuSubscription: Subscription;
  constructor(private uiService: UiService, private protobufService: ProtobufService) { }
 async ngOnInit() {
        this.uiService.menuToggle$.subscribe( (toggle: boolean) => this.menu.toggle());
        await this.protobufService.initproto()
  }
  ngOnDestroy() {
    this.menuSubscription.unsubscribe();
  }
}
