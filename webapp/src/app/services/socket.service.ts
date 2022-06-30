import { Injectable } from '@angular/core'
import { UiService } from './ui.service'
import { ProtobufService } from './protobuf.service'
import { IoTSecureType, IoTSecureObject } from '../shared/constants'
import { XtermService } from './xterm.service'
import { Buffer } from 'buffer'
import { ErrorService } from './error.service'
import { setInterval } from 'timers'
declare var SSHyClient: any
declare var transport:any
declare var window: any
declare var term: any
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  socket: WebSocket
  window: any
  protomessage: any
  streamId: number
  term: any
  private tunnelingUrl: string
  private iotsprotocol: string
  constructor(private uiService: UiService, private protoService: ProtobufService, private xtermService: XtermService, private errorService: ErrorService) {
    this.window = uiService.nativeWindow
    this.term = this.xtermService.getTerminal
    window.ws = null
    window.term = null
   }

  openWebSocket(url, protocol){
    this.tunnelingUrl = url
    this.iotsprotocol = protocol
    this.protomessage = this.protoService.getProtoMessage
    this.term = this.xtermService.getTerminal
    console.log(this.term)
    this.term.clear()
    this.term.writeln('')
    this.term.writeln(`$ Waiting to ssh to ${url.split(':433')[0]}...`)
    this.window.wsproxyURL = url
    this.socket = new WebSocket(url, protocol)
    this.socket.binaryType = 'arraybuffer'
    Object.defineProperty(this.socket, 'sendB64', { value: (e) => { this.sendB64Message(e);} })
    this.socket.onopen = (e) => { this.onWebSocketOpen(e)}
    this.socket.onclose = (e) => {this.onWebSocketClose(e)}
    this.socket.onerror = (e) => {this.onWebSocketError(e)}
    this.socket.onmessage = (e) => {this.onWebSocketMessage(e)}

   // this.xtermService.startxtermjs

    setTimeout(() => {
      //console.log(transport)
      this.startStream
    }, 3000);
   
  }

  private onWebSocketOpen(e){
    console.log('websocket opened')
    this.openSSH()

  }

  private onWebSocketClose(e){
    console.log('websocket closed')
    console.log(e)
    let err_msg = e.reason ? e.reason : 'Error. Connection closed....'
    this.errorService.werror.next(`${err_msg}`)
    this.xtermService.term.clear()
    this.socket.close()

    if(term){
      term.clear()
      this.xtermService.termReset()
      return
    }

    if(e.code == 1008){
      console.log('Connection is replaced by another connection')

      this.xtermService.term.clear()
      window.ws.close()

      this.xtermService.termReset()
      return
    }
    this.xtermService.termReset()

  }

  private onWebSocketError(e){
    console.log('websocket error')
    console.log(e)
    this.socket.close()
    this.errorService.werror.next('Oops! Something went wrong')
  }

  private onWebSocketMessage(e) {
    let payload = null
    console.log("WebSocket Incoming Message ")
    try {
      let decodedMessage:protobuf.Message = this.protomessage.decode(new Uint8Array(e.data,2))
      let jsonMessage = decodedMessage.toJSON()
      //console.log(jsonMessage)
      let messageType:number = parseInt(IoTSecureType[jsonMessage.type], 10)
      // console.log(messageType)
      switch (messageType) {
        case 0:
          console.log("UNKNOW")
          break;
        case 1:
        //  console.log("DATA")
          if (jsonMessage.payload){
            payload = jsonMessage.payload
            payload = atob(payload)
            // console.log(payload)
            transport.settings.setNetTraffic(transport.parceler.receiveData, true);
            transport.settings.setNetTraffic(transport.parceler.transmitData, false);
            transport.parceler.handle(payload);
          }
          break;
        case 2:
     //       console.log("STREAM START")
            this.streamId = jsonMessage.streamId
          break;
        case 3:
            console.log("STREAM RESET")
            this.streamId = jsonMessage.streamId
          break;
        default:
          break;
      }


    } catch (e) {
      console.log(e)
      this.errorService.werror.next('Ooops! Something went wrong... Please refresh the page')
    }
  }

  private async sendB64Message(e){
    let dataType: number
    let payloadBuffer: Buffer = null
    if (typeof(e) == 'number'){
      dataType = e
    } else {
      dataType = IoTSecureType.DATA
      payloadBuffer = Buffer.from(btoa(e), 'base64')
    }

    let iotSecureObject = new IoTSecureObject(dataType, this.streamId, true, payloadBuffer)
    let errCheckMsg = this.protomessage.verify(iotSecureObject)
    if (errCheckMsg)
        throw Error(errCheckMsg)
    let encodedProtoMessage: Uint8Array = await this.protomessage.encode(iotSecureObject).finish()
    let msglg = encodedProtoMessage.byteLength
    let protomsg = new Uint8Array(2 + msglg)
    protomsg.set( new Uint8Array( [ Math.floor(msglg / 256), msglg % 256 ] ))
    protomsg.set(encodedProtoMessage, 2)
    this.socket.send(protomsg)
    transport.parceler.transmitData += msglg
    transport.settings.setNetTraffic(transport.parceler.transmitData, false)
  }


  private startStream() {
       this.streamId = Math.floor(Math.random() * 1000);
      (this.socket as any).sendB64(IoTSecureType.STREAM_START)
  }
  
  private openSSH(){
    let settings = null
    let transport = null
    settings = new SSHyClient.settings()
    transport = new SSHyClient.Transport(this.socket,settings)
    this.window.ws = this.socket
    window.ws = this.socket
    this.window.transport = transport
    transport.settings.rsaCheckEnabled = false
    this.term.focus()
    this.startStream()
  }


}

