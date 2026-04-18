declare module "livekit-client" {
  export const RoomEvent: any;
  export const Track: any;
  export class Room {
    constructor(options?: any);
    remoteParticipants: Map<any, any>;
    localParticipant: any;
    on(event: any, listener: (...args: any[]) => void): void;
    connect(url: string, token: string): Promise<void>;
    disconnect(): Promise<void>;
  }
  export type RemoteTrack = any;
}

declare module "livekit-server-sdk" {
  export class AccessToken {
    constructor(apiKey: string, apiSecret: string, options?: any);
    addGrant(grant: any): void;
    toJwt(): Promise<string>;
  }
}
