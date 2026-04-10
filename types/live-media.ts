export type LiveRole = "broadcaster" | "viewer";

export type LiveIceServer = {
  urls: string | string[];
  username?: string;
  credential?: string;
};

export type LiveBootstrapResponse = {
  liveId: string;
  role: LiveRole;
  websocketUrl: string;
  token: string;
  secret: string | null;
  iceServers: LiveIceServer[];
  reconnectDelayMs: number;
  heartbeatIntervalMs: number;
  joinStaggerMs: number;
};

export type LiveConsumerProfile = "low" | "medium" | "high";

export type LiveWsRequestMap = {
  getRouterRtpCapabilities: undefined;
  createTransport: {
    direction: "send" | "recv";
  };
  connectTransport: {
    transportId: string;
    dtlsParameters: unknown;
  };
  produce: {
    transportId: string;
    kind: "audio" | "video";
    rtpParameters: unknown;
  };
  consume: {
    transportId: string;
    producerId: string;
    rtpCapabilities: unknown;
  };
  resumeConsumer: {
    consumerId: string;
  };
  updateConsumerProfile: {
    consumerId: string;
    profile: LiveConsumerProfile;
    reason?: string;
  };
  restartIce: {
    transportId: string;
  };
  stopBroadcast: undefined;
  heartbeat: undefined;
};

export type LiveWsResponseMap = {
  getRouterRtpCapabilities: {
    routerRtpCapabilities: unknown;
  };
  createTransport: {
    id: string;
    iceParameters: unknown;
    iceCandidates: unknown[];
    dtlsParameters: unknown;
    sctpParameters?: unknown;
  };
  connectTransport: {
    connected: true;
  };
  produce: {
    id: string;
  };
  consume: {
    id: string;
    producerId: string;
    kind: "audio" | "video";
    rtpParameters: unknown;
  };
  resumeConsumer: {
    resumed: true;
  };
  updateConsumerProfile: {
    updated: true;
    profile: LiveConsumerProfile;
  };
  restartIce: {
    iceParameters: unknown;
  };
  stopBroadcast: {
    stopped: true;
  };
  heartbeat: {
    pong: true;
  };
};

export type LiveWsEvent =
  | {
      type: "event";
      event: "roomState";
      data: {
        liveId: string;
        broadcasterOnline: boolean;
        viewerCount: number;
        producers: Array<{ producerId: string; kind: "audio" | "video" }>;
      };
    }
  | {
      type: "event";
      event: "producerAdded";
      data: {
        producerId: string;
        kind: "audio" | "video";
      };
    }
  | {
      type: "event";
      event: "producerRemoved";
      data: {
        producerId: string;
        kind: "audio" | "video";
      };
    }
  | {
      type: "event";
      event: "streamOffline";
      data: {
        liveId: string;
      };
    }
  | {
      type: "event";
      event: "consumerProfileChanged";
      data: {
        consumerId: string;
        profile: LiveConsumerProfile;
        reason: string;
      };
    }
  | {
      type: "event";
      event: "error";
      data: {
        message: string;
      };
    }
  | {
      type: "event";
      event: "ping";
      data: {
        ts: number;
      };
    };

export type LiveWsRequest<K extends keyof LiveWsRequestMap = keyof LiveWsRequestMap> = {
  type: "request";
  requestId: string;
  action: K;
  data: LiveWsRequestMap[K];
};

export type LiveWsResponse<K extends keyof LiveWsResponseMap = keyof LiveWsResponseMap> =
  | {
      type: "response";
      requestId: string;
      ok: true;
      action: K;
      data: LiveWsResponseMap[K];
    }
  | {
      type: "response";
      requestId: string;
      ok: false;
      action: K;
      error: string;
    };

export type LiveWsMessage = LiveWsEvent | LiveWsRequest | LiveWsResponse;

export type LiveWsClientControlMessage =
  | {
      type: "auth";
      secret: string;
    }
  | {
      type: "pong";
      ts?: number;
    };
