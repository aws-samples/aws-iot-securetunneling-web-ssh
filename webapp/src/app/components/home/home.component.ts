import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core'
import { FormGroup,  FormControl, Validators, FormBuilder } from '@angular/forms'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import {API_SET_COOKIE} from '../../../awsconfig.js'
import { XtermService } from 'src/app/services/xterm.service'
import { SocketService } from 'src/app/services/socket.service'
import { ErrorService } from 'src/app/services/error.service'
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('term', {static: true}) term: ElementRef
  
  form: FormGroup
  werror : Subscription
  public error = ''
  public awsregion = null
  private wsprotocol = `aws.iot.securedtunneling-1.0`
  private protopath = '../../../assets/protobuf/format.proto' 
  hideRequiredControl = new FormControl(false)
  floatLabelControl = new FormControl('auto')

  aws_regions:any = [
    {
      name: 'US East (N. Virginia) us-east-1',
      region: 'us-east-1',

    },
    {
      name: 'US East (Ohio) us-east-2',
      region: 'us-east-2'
    },
    {
      name: 'US West (N. California) us-west-1',
      region: 'us-west-1'
    },
    {
      name: 'US West (Oregon) us-west-2',
      region: 'us-west-2'
    },
    {
      name: 'Europe (Frankfurt) eu-central-1',
      region: 'eu-central-1'
    },
    {
      name: 'Europe (Ireland) eu-west-1',
      region: 'eu-west-1'
    },
    {
      name: 'Europe (London) eu-west-2',
      region: 'eu-west-2'
    },
    {
      name: 'Europe (Paris) eu-west-3',
      region: 'eu-west-3'
    },
    {
      name: 'Europe (Stockholm) eu-north-1',
      region: 'eu-north-1' 
    },
    {
      name: 'Asia Pacific (Hong Kong) ap-east-1',
      region: 'ap-east-1' 
    },
    {
      name: 'Asia Pacific (Mumbai) ap-south-1',
      region: 'ap-south-1'
    },
    {
      name: 'Asia Pacific (Seoul) ap-northeast-2',
      region: 'ap-northeast-2'
    },
    {
      name: 'Asia Pacific (Singapore) ap-southeast-1',
      region: 'ap-southeast-1'
    },
    {
      name: 'Asia Pacific (Sydney) ap-southeast-2',
      region: 'ap-southeast-2'
    },
    {
      name: 'Asia Pacific (Tokyo) ap-northeast-1',
      region: 'ap-northeast-1'
    },
    {
      name: 'Canada (Central) ca-central-1',
      region: 'ca-central-1'
    },
    {
      name: 'Middle East (Bahrain) me-south-1',
      region: 'me-south-1'
    },
    {
      name: 'South America (São Paulo) sa-east-1',
      region: 'sa-east-1'
    }
]

  constructor (private fb: FormBuilder, private http: HttpClient, private xtermService: XtermService, private socketService: SocketService, private errorService: ErrorService) { 
    this.form = this.fb.group({ 
      hideRequired: this.hideRequiredControl,
      region: [null, Validators.required],
      token: [null, Validators.required]
    });
  }


  async ngOnInit() {

   this.werror = this.errorService.werror.subscribe((d:string) => this.error = d)
   
  }

  async ngAfterViewInit(){
    this.xtermService.termInit(this.term.nativeElement)

  }

  async onSubmit(form: FormGroup) { 

    this.errorService.werror.next('')
    const url = `wss://data.tunneling.iot.${form.value.region.region}.amazonaws.com/tunnel?local-proxy-mode=source`
    const cookie = await this.http.post(`${API_SET_COOKIE}`, {token: form.value.token, region: form.value.region.region}, {withCredentials: true, }).toPromise()

 
    this.startSSH(url)
  }

  startSSH(url){
    this.socketService.openWebSocket(url, this.wsprotocol)
  }

  ngOnDestroy() {
    this.werror.unsubscribe()
}
   
}
