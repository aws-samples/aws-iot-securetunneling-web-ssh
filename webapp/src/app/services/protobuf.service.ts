import { Injectable } from '@angular/core';
import * as protobuf from 'protobufjs'

@Injectable({
  providedIn: 'root'
})
export class ProtobufService {
  private MessageType: protobuf.Type
  private protopath = '../../../assets/protobuf/format.proto'
  constructor() { }

  async initproto (){
    let Message = await protobuf.load(this.protopath)
    this.MessageType = Message.root.lookupType('Message')
  }

get getProtoMessage():protobuf.Type {
    return this.MessageType
  }

}
