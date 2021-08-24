export const API_SET_COOKIE = {
    default: 'https://20c1ih4cd7.execute-api.eu-west-1.amazonaws.com/api',
    nvir: 'https://mm4jzel5d0.execute-api.us-east-1.amazonaws.com/api'
}

export enum IoTSecureType { 
    UNKNOWN      = 0,
    DATA         = 1,
    STREAM_START = 2,
    STREAM_RESET = 3
}

export class IoTSecureObject {
    type: IoTSecureType;
    streamId: number;
    ignorable: boolean;
    payload: Uint8Array
    constructor(type: IoTSecureType, streamId: number, ignorable: boolean, payload: Uint8Array){
        this.type = type
        this.streamId = streamId
        this.ignorable = ignorable
        this.payload = payload
    }
}