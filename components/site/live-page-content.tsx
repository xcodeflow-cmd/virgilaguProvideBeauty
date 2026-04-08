"use client";

import { useEffect, useRef, useState } from "react";

import { PastLiveList } from "@/components/past-live-list";
import { Button } from "@/components/ui/button";

type LiveSessionSummary = {
  id: string;
  title: string;
  description: string;
  scheduledFor: string;
  isLive: boolean;
};

type PastLiveSession = {
  id: string;
  title: string;
  description: string;
  scheduledFor: string;
  recordingUrl: string;
  price?: number | null;
  visibility?: string;
};

type ChatMessage = {
  id: string;
  user: string;
  text: string;
  timestamp: string;
};

type LiveRecording = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  videoUrl: string;
  price?: number | null;
  visibility?: string;
};

type LiveDebugState = {
  role: "admin" | "viewer";
  lastEvent: string;
  connectionState: string;
  iceConnectionState: string;
  signalingState: string;
  pendingRequests: number;
  answersReceived: number;
  offerRequestsSent: number;
  offersReceived: number;
  answersSent: number;
  remoteTracks: number;
};

const rtcConfiguration: RTCConfiguration = {
  iceCandidatePoolSize: 10,
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ]
};

const LIVE_POLL_INTERVAL = 1000;
const SIGNAL_POLL_INTERVAL = 250;
const CHAT_POLL_INTERVAL = 2000;
const ICE_GATHERING_TIMEOUT = 300;

async function waitForIceGathering(pc: RTCPeerConnection) {
  if (pc.iceGatheringState === "complete") {
    return;
  }

  await new Promise<void>((resolve) => {
    const timeout = window.setTimeout(() => {
      pc.removeEventListener("icegatheringstatechange", onChange);
      resolve();
    }, ICE_GATHERING_TIMEOUT);

    const onChange = () => {
      if (pc.iceGatheringState === "complete") {
        window.clearTimeout(timeout);
        pc.removeEventListener("icegatheringstatechange", onChange);
        resolve();
      }
    };

    pc.addEventListener("icegatheringstatechange", onChange);
  });
}

export function LivePageContent({
  canAccess,
  isAdmin,
  initialSession,
  pastSessions
}: {
  canAccess: boolean;
  isAdmin: boolean;
  initialSession: LiveSessionSummary | null;
  pastSessions: PastLiveSession[];
}) {
  const [currentSession, setCurrentSession] = useState<LiveSessionSummary | null>(initialSession);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatText, setChatText] = useState("");
  const [recordings, setRecordings] = useState<LiveRecording[]>(
    pastSessions.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      createdAt: item.scheduledFor,
      videoUrl: item.recordingUrl,
      price: item.price,
      visibility: item.visibility
    }))
  );
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<LiveDebugState>({
    role: isAdmin ? "admin" : "viewer",
    lastEvent: "idle",
    connectionState: "new",
    iceConnectionState: "new",
    signalingState: "stable",
    pendingRequests: 0,
    answersReceived: 0,
    offerRequestsSent: 0,
    offersReceived: 0,
    answersSent: 0,
    remoteTracks: 0
  });
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const adminPeersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const viewerPeerRef = useRef<RTCPeerConnection | null>(null);
  const viewerIdRef = useRef("");
  const requestedOfferLiveIdRef = useRef<string | null>(null);

  useEffect(() => {
    viewerIdRef.current = crypto.randomUUID();
  }, []);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  async function api<T>(input: RequestInfo, init?: RequestInit) {
    const response = await fetch(input, {
      ...init,
      credentials: "include",
      cache: "no-store",
      headers: {
        ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(init?.headers || {})
      }
    });

    const data = (await response.json().catch(() => null)) as (T & { error?: string }) | null;

    if (!response.ok) {
      throw new Error(data?.error || "Request failed.");
    }

    return data as T;
  }

  function createPeerConnection() {
    return new RTCPeerConnection(rtcConfiguration);
  }

  function updateDebug(patch: Partial<LiveDebugState>) {
    setDebug((current) => ({
      ...current,
      ...patch
    }));
  }

  async function loadCurrentLive() {
    if (!canAccess && !isAdmin) {
      return;
    }

    try {
      const data = await api<{ live: { id: string; title: string; description: string; createdAt: string } | null }>("/api/live/current");

      setCurrentSession((current) => {
        if (!data.live) {
          return current ? { ...current, isLive: false } : current;
        }

        if (current?.id === data.live.id) {
          return { ...current, isLive: true };
        }

        requestedOfferLiveIdRef.current = null;

        if (viewerPeerRef.current) {
          viewerPeerRef.current.close();
          viewerPeerRef.current = null;
        }

        return {
          id: data.live.id,
          title: data.live.title,
          description: data.live.description,
          scheduledFor: data.live.createdAt,
          isLive: true
        };
      });
    } catch {
      setCurrentSession((current) => (current ? { ...current, isLive: false } : null));
    }
  }

  async function loadMessages() {
    if (!currentSession?.isLive) {
      return;
    }

    const data = await api<{ messages: ChatMessage[] }>(`/api/chat/${currentSession.id}`);
    setMessages(data.messages);
  }

  async function loadRecordings() {
    if (!canAccess && !isAdmin) {
      return;
    }

    const data = await api<{ recordings: LiveRecording[] }>("/api/live/recordings");
    setRecordings(data.recordings);
  }

  async function startLive() {
    if (!currentSession) {
      setError("Creeaza mai intai o sesiune LIVE din admin.");
      return;
    }

    setError(null);
    updateDebug({
      lastEvent: "getUserMedia ok",
      role: "admin"
    });
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setLocalStream(stream);

    recordedChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
    mediaRecorder.start(2000);
    mediaRecorderRef.current = mediaRecorder;

    await api("/api/live/start", {
      method: "POST",
      body: JSON.stringify({ liveId: currentSession.id })
    });

    updateDebug({
      lastEvent: "live started",
      pendingRequests: 0,
      answersReceived: 0,
      remoteTracks: 0
    });
    setCurrentSession({ ...currentSession, isLive: true });
  }

  async function stopLive() {
    if (!currentSession) {
      return;
    }

    await api("/api/live/stop", {
      method: "POST",
      body: JSON.stringify({ liveId: currentSession.id })
    });

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      await new Promise<void>((resolve) => {
        mediaRecorderRef.current?.addEventListener("stop", () => resolve(), { once: true });
        mediaRecorderRef.current?.stop();
      });
    }

    if (recordedChunksRef.current.length) {
      const formData = new FormData();
      formData.append("liveId", currentSession.id);
      formData.append("video", new File(recordedChunksRef.current, `${currentSession.id}.webm`, { type: "video/webm" }));

      const uploadResponse = await fetch("/api/live/upload", {
        method: "POST",
        credentials: "include",
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error("Recording upload failed.");
      }
    }

    localStream?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
    mediaRecorderRef.current = null;
    recordedChunksRef.current = [];
    adminPeersRef.current.forEach((peer) => peer.close());
    adminPeersRef.current.clear();
    viewerPeerRef.current?.close();
    viewerPeerRef.current = null;
    setCurrentSession({ ...currentSession, isLive: false });
    setMessages([]);
    await loadRecordings();
  }

  useEffect(() => {
    if (!canAccess && !isAdmin) {
      return;
    }

    void loadRecordings();
    void loadCurrentLive();
    const interval = window.setInterval(() => {
      void loadCurrentLive();
    }, LIVE_POLL_INTERVAL);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAccess, isAdmin]);

  useEffect(() => {
    if (!currentSession?.isLive || (!canAccess && !isAdmin)) {
      return;
    }

    void loadMessages();
    const interval = window.setInterval(() => {
      void loadMessages();
    }, CHAT_POLL_INTERVAL);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSession?.id, currentSession?.isLive, canAccess, isAdmin]);

  useEffect(() => {
    if (!isAdmin || !currentSession?.isLive || !localStream) {
      return;
    }

    const runAdminSignalTick = async () => {
      const data = await api<{ pendingRequests: string[]; answers: Array<{ viewerId: string; sdp: RTCSessionDescriptionInit }> }>(
        `/api/signal/${currentSession.id}?role=admin`
      );
      updateDebug({
        role: "admin",
        lastEvent: "admin poll ok",
        pendingRequests: data.pendingRequests.length,
        answersReceived: data.answers.length
      });

      for (const viewerId of data.pendingRequests) {
        if (adminPeersRef.current.has(viewerId)) {
          continue;
        }

        const peer = createPeerConnection();
        updateDebug({
          lastEvent: `creating offer for ${viewerId}`,
          connectionState: peer.connectionState,
          iceConnectionState: peer.iceConnectionState,
          signalingState: peer.signalingState
        });
        peer.oniceconnectionstatechange = () => {
          updateDebug({
            iceConnectionState: peer.iceConnectionState,
            signalingState: peer.signalingState,
            connectionState: peer.connectionState,
            lastEvent: `admin ice ${peer.iceConnectionState}`
          });
        };
        peer.onsignalingstatechange = () => {
          updateDebug({
            signalingState: peer.signalingState,
            lastEvent: `admin signaling ${peer.signalingState}`
          });
        };
        peer.onconnectionstatechange = () => {
          updateDebug({
            connectionState: peer.connectionState,
            iceConnectionState: peer.iceConnectionState,
            signalingState: peer.signalingState,
            lastEvent: `admin peer ${peer.connectionState}`
          });
          if (peer.connectionState === "failed" || peer.connectionState === "disconnected" || peer.connectionState === "closed") {
            peer.close();
            adminPeersRef.current.delete(viewerId);
          }
        };

        localStream.getTracks().forEach((track) => {
          peer.addTrack(track, localStream);
        });

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        await waitForIceGathering(peer);

        await api("/api/signal/offer", {
          method: "POST",
          body: JSON.stringify({
            liveId: currentSession.id,
            viewerId,
            type: "offer",
            sdp: peer.localDescription
          })
        });
        updateDebug({
          lastEvent: `offer sent to ${viewerId}`,
          connectionState: peer.connectionState,
          iceConnectionState: peer.iceConnectionState,
          signalingState: peer.signalingState
        });

        adminPeersRef.current.set(viewerId, peer);
      }

      for (const answer of data.answers) {
        const peer = adminPeersRef.current.get(answer.viewerId);

        if (peer && !peer.currentRemoteDescription) {
          await peer.setRemoteDescription(answer.sdp);
          updateDebug({
            lastEvent: `answer applied for ${answer.viewerId}`,
            connectionState: peer.connectionState,
            iceConnectionState: peer.iceConnectionState,
            signalingState: peer.signalingState
          });
        }
      }
    };

    void runAdminSignalTick();
    const interval = window.setInterval(() => {
      void runAdminSignalTick();
    }, SIGNAL_POLL_INTERVAL);

    return () => window.clearInterval(interval);
  }, [isAdmin, currentSession?.id, currentSession?.isLive, localStream]);

  useEffect(() => {
    if (isAdmin || !canAccess || !currentSession?.isLive) {
      return;
    }

    const runViewerSignalTick = async () => {
      if (!requestedOfferLiveIdRef.current || requestedOfferLiveIdRef.current !== currentSession.id) {
        await api("/api/signal/offer", {
          method: "POST",
          body: JSON.stringify({
            liveId: currentSession.id,
            viewerId: viewerIdRef.current,
            type: "request"
          })
        });

        requestedOfferLiveIdRef.current = currentSession.id;
        setDebug((current) => ({
          ...current,
          role: "viewer",
          lastEvent: "offer request sent",
          offerRequestsSent: current.offerRequestsSent + 1
        }));
      }

      if (viewerPeerRef.current) {
        return;
      }

      const data = await api<{ offer: RTCSessionDescriptionInit | null }>(
        `/api/signal/${currentSession.id}?viewerId=${encodeURIComponent(viewerIdRef.current)}`
      );

      if (!data.offer) {
        updateDebug({
          role: "viewer",
          lastEvent: "waiting for offer"
        });
        return;
      }

      setDebug((current) => ({
        ...current,
        role: "viewer",
        offersReceived: current.offersReceived + 1,
        lastEvent: "offer received"
      }));
      const peer = createPeerConnection();
      peer.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        updateDebug({
          remoteTracks: event.streams[0]?.getTracks().length || 1,
          lastEvent: "remote track received"
        });
      };
      peer.oniceconnectionstatechange = () => {
        updateDebug({
          iceConnectionState: peer.iceConnectionState,
          signalingState: peer.signalingState,
          connectionState: peer.connectionState,
          lastEvent: `viewer ice ${peer.iceConnectionState}`
        });
      };
      peer.onsignalingstatechange = () => {
        updateDebug({
          signalingState: peer.signalingState,
          lastEvent: `viewer signaling ${peer.signalingState}`
        });
      };
      peer.onconnectionstatechange = () => {
        updateDebug({
          connectionState: peer.connectionState,
          iceConnectionState: peer.iceConnectionState,
          signalingState: peer.signalingState,
          lastEvent: `viewer peer ${peer.connectionState}`
        });
        if (peer.connectionState === "failed" || peer.connectionState === "disconnected" || peer.connectionState === "closed") {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
          peer.close();
          viewerPeerRef.current = null;
          requestedOfferLiveIdRef.current = null;
        }
      };

      await peer.setRemoteDescription(data.offer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      await waitForIceGathering(peer);

      await api("/api/signal/answer", {
        method: "POST",
        body: JSON.stringify({
          liveId: currentSession.id,
          viewerId: viewerIdRef.current,
          sdp: peer.localDescription
        })
      });
      setDebug((current) => ({
        ...current,
        answersSent: current.answersSent + 1,
        lastEvent: "answer sent",
        connectionState: peer.connectionState,
        iceConnectionState: peer.iceConnectionState,
        signalingState: peer.signalingState
      }));

      viewerPeerRef.current = peer;
    };

    void runViewerSignalTick();
    const interval = window.setInterval(() => {
      void runViewerSignalTick();
    }, SIGNAL_POLL_INTERVAL);

    return () => window.clearInterval(interval);
  }, [isAdmin, canAccess, currentSession?.id, currentSession?.isLive]);

  async function sendMessage() {
    if (!chatText.trim() || !currentSession?.isLive) {
      return;
    }

    await api(`/api/chat/${currentSession.id}`, {
      method: "POST",
      body: JSON.stringify({ text: chatText.trim() })
    });

    setChatText("");
    await loadMessages();
  }

  const canViewLive = canAccess || isAdmin;
  const diagnostics = [
    `Rol: ${debug.role}`,
    `Ultimul eveniment: ${debug.lastEvent}`,
    `Connection: ${debug.connectionState}`,
    `ICE: ${debug.iceConnectionState}`,
    `Signaling: ${debug.signalingState}`,
    `Pending requests: ${debug.pendingRequests}`,
    `Offer requests sent: ${debug.offerRequestsSent}`,
    `Offers received: ${debug.offersReceived}`,
    `Answers received: ${debug.answersReceived}`,
    `Answers sent: ${debug.answersSent}`,
    `Remote tracks: ${debug.remoteTracks}`
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.42fr)_25rem]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[2.35rem] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(214,185,140,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.012))] shadow-luxury">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5 sm:px-7">
              <div>
                <div className="flex items-center gap-3">
                  <span className="live-dot" />
                  <p className="text-xs uppercase tracking-[0.35em] text-red-300">
                    {currentSession?.isLive ? "LIVE" : "Offline"}
                  </p>
                </div>
                <h3 className="mt-3 text-3xl text-white sm:text-4xl">
                  {currentSession?.title || "LIVE Barber Experience"}
                </h3>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/60">
                {currentSession?.scheduledFor
                  ? new Date(currentSession.scheduledFor).toLocaleString("ro-RO")
                  : "Va fi disponibil cand se porneste o sesiune LIVE"}
              </div>
            </div>

            <div className="relative bg-black">
              <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_top,rgba(214,185,140,0.12),transparent_28%)]" />
              {isAdmin && localStream ? (
                <video ref={localVideoRef} autoPlay muted playsInline className="aspect-video w-full bg-black object-cover" />
              ) : currentSession?.isLive ? (
                <video ref={remoteVideoRef} autoPlay playsInline controls className="aspect-video w-full bg-black object-cover" />
              ) : (
                <div className="flex aspect-video items-center justify-center bg-black px-6 text-center text-white/60">
                  {canViewLive
                    ? "Niciun LIVE activ momentan"
                    : "Ai nevoie de abonament activ pentru a accesa LIVE-ul"}
                </div>
              )}
            </div>

            <div className="grid gap-4 px-6 py-6 sm:px-7 lg:grid-cols-[1fr_auto] lg:items-center">
              <p className="max-w-2xl text-sm leading-7 text-white/60">
                {currentSession?.isLive
                  ? "Stream-ul este live. In dreapta ai chatul, iar sub el replay-urile care pot fi deblocate."
                  : "Va fi disponibil cand se porneste o sesiune live, daca nu a fost programat nimic din contul de admin."}
              </p>
              {isAdmin ? (
                <div className="flex flex-wrap gap-3">
                  <Button type="button" onClick={() => void startLive()} disabled={!currentSession || currentSession.isLive}>
                    Go Live
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => void stopLive()} disabled={!currentSession?.isLive}>
                    Stop Live
                  </Button>
                </div>
              ) : null}
            </div>
            {error ? <p className="px-6 pb-6 text-sm text-red-300 sm:px-7">{error}</p> : null}
          </div>

          {canViewLive ? (
            <details className="premium-card p-5 sm:p-6">
              <summary className="cursor-pointer list-none text-sm uppercase tracking-[0.34em] text-white/55">
                Diagnostic LIVE
              </summary>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {diagnostics.map((item) => (
                  <div key={item} className="rounded-[1.1rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/68">
                    {item}
                  </div>
                ))}
              </div>
            </details>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="flex min-h-[540px] flex-col overflow-hidden rounded-[2.2rem] bg-[radial-gradient(circle_at_top,rgba(214,185,140,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.028),rgba(255,255,255,0.008))] shadow-[0_26px_80px_rgba(0,0,0,0.2)]">
            <div className="border-b border-white/10 px-5 py-5 sm:px-6">
              <p className="text-xs uppercase tracking-[0.35em] text-[#d6b98c]">Live Chat</p>
              <h3 className="mt-3 text-3xl text-white">Chat in timp real</h3>
            </div>

            <div className="flex-1 bg-[#070707] px-4 py-4 sm:px-5">
              {canViewLive && currentSession?.isLive ? (
                <div className="flex h-full flex-col">
                  <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                    {messages.length ? (
                      messages.map((item, index) => {
                        const isRight = index % 2 === 1;

                        return (
                          <div key={item.id} className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[88%] rounded-[1.5rem] px-4 py-3 ${
                                isRight
                                  ? "rounded-br-md bg-[linear-gradient(180deg,#ecd4ac,#cfab72)] text-black shadow-[0_20px_36px_rgba(214,185,140,0.18)]"
                                  : "rounded-bl-md border border-white/10 bg-white/[0.05] text-white"
                              }`}
                            >
                              <p className={`text-xs font-medium ${isRight ? "text-black/70" : "text-white/55"}`}>
                                {item.user}
                              </p>
                              <p className="mt-1 text-sm leading-6">{item.text}</p>
                              <p className={`mt-2 text-[11px] ${isRight ? "text-black/55" : "text-white/35"}`}>
                                {new Date(item.timestamp).toLocaleTimeString("ro-RO", {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex h-full items-center justify-center rounded-[1.6rem] border border-white/10 bg-white/[0.03] px-5 text-center text-sm text-white/50">
                        Chatul este activ. Primul mesaj poate fi trimis acum.
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-3">
                    <input
                      value={chatText}
                      onChange={(event) => setChatText(event.target.value)}
                      maxLength={500}
                      placeholder="Scrie un mesaj"
                      className="premium-input flex-1"
                    />
                    <Button type="button" onClick={() => void sendMessage()}>
                      Trimite
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex h-full min-h-[280px] items-center justify-center rounded-[1.6rem] border border-white/10 bg-white/[0.03] px-5 text-center text-sm text-white/50">
                  {canViewLive
                    ? "Chatul devine activ cand sesiunea este LIVE."
                    : "Chatul este disponibil dupa autentificare si acces activ."}
                </div>
              )}
            </div>
          </div>

          <PastLiveList
            canAccess={canViewLive}
            sessions={recordings.map((item) => ({
              id: item.id,
              title: item.title,
              description: item.description,
              scheduledFor: item.createdAt,
              recordingUrl: item.videoUrl,
              price: item.price,
              visibility: item.visibility
            }))}
          />
        </div>
      </div>
    </div>
  );
}
