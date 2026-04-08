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
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ]
};

async function waitForIceGathering(pc: RTCPeerConnection) {
  if (pc.iceGatheringState === "complete") {
    return;
  }

  await new Promise<void>((resolve) => {
    const onChange = () => {
      if (pc.iceGatheringState === "complete") {
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
      videoUrl: item.recordingUrl
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
    }, 2000);

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
    }, 2000);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSession?.id, currentSession?.isLive, canAccess, isAdmin]);

  useEffect(() => {
    if (!isAdmin || !currentSession?.isLive || !localStream) {
      return;
    }

    const interval = window.setInterval(async () => {
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
    }, 2000);

    return () => window.clearInterval(interval);
  }, [isAdmin, currentSession?.id, currentSession?.isLive, localStream]);

  useEffect(() => {
    if (isAdmin || !canAccess || !currentSession?.isLive) {
      return;
    }

    const interval = window.setInterval(async () => {
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
        updateDebug({
          role: "viewer",
          lastEvent: "offer request sent",
          offerRequestsSent: debug.offerRequestsSent + 1
        });
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

      updateDebug({
        role: "viewer",
        offersReceived: debug.offersReceived + 1,
        lastEvent: "offer received"
      });
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
      updateDebug({
        answersSent: debug.answersSent + 1,
        lastEvent: "answer sent",
        connectionState: peer.connectionState,
        iceConnectionState: peer.iceConnectionState,
        signalingState: peer.signalingState
      });

      viewerPeerRef.current = peer;
    }, 2000);

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
  return (
    <div className="space-y-6">
      <div className="glass-panel overflow-hidden rounded-[2rem] border border-white/10">
        {isAdmin && localStream ? (
          <video ref={localVideoRef} autoPlay muted playsInline className="aspect-video w-full bg-black" />
        ) : currentSession?.isLive ? (
          <video ref={remoteVideoRef} autoPlay playsInline controls className="aspect-video w-full bg-black" />
        ) : (
          <div className="flex aspect-video items-center justify-center bg-black px-6 text-center text-white/60">
            {canAccess || isAdmin ? "Niciun LIVE activ momentan" : "Ai nevoie de abonament activ pentru a accesa LIVE-ul"}
          </div>
        )}

        <div className="p-6 text-sm leading-7 text-white/62">
          {currentSession?.isLive
            ? isAdmin
              ? "Camera adminului transmite direct din browser, iar viewerii se conecteaza prin WebRTC cu polling HTTP."
              : "Conexiunea directa se initializeaza automat dupa ce oferta si raspunsul sunt sincronizate prin polling."
            : "Sesiunea poate fi programata din admin, iar streamul porneste doar cand adminul apasa Go Live."}
        </div>
      </div>

      {isAdmin ? (
        <div className="glass-panel rounded-[2rem] border border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Control LIVE</p>
          <h3 className="mt-3 text-2xl text-white">{currentSession?.title || "Nu exista sesiune selectata"}</h3>
          <p className="mt-3 text-sm leading-6 text-white/60">
            Creeaza sesiunea din admin, apoi porneste camera direct din telefon sau laptop. La oprire, replay-ul se salveaza in baza de date.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="button" onClick={() => void startLive()} disabled={!currentSession || currentSession.isLive}>
              Go Live
            </Button>
            <Button type="button" variant="secondary" onClick={() => void stopLive()} disabled={!currentSession?.isLive}>
              Stop Live
            </Button>
          </div>
          {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
        </div>
      ) : null}

      {(canAccess || isAdmin) && currentSession?.isLive ? (
        <div className="glass-panel rounded-[2rem] border border-white/10 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Chat LIVE</p>
              <h3 className="mt-3 text-2xl text-white">Mesaje actualizate prin polling</h3>
            </div>
            <p className="text-sm text-white/50">{messages.length} mesaje</p>
          </div>

          <div className="mt-6 h-72 overflow-y-auto rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
            {messages.length ? (
              <div className="space-y-4">
                {messages.map((item) => (
                  <div key={item.id}>
                    <p className="text-sm font-medium text-white">{item.user}</p>
                    <p className="mt-1 text-sm leading-6 text-white/70">{item.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-center text-sm text-white/50">
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
              className="flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
            />
            <button
              type="button"
              onClick={() => void sendMessage()}
              className="rounded-2xl border border-white/10 bg-white px-5 py-3 text-sm font-medium text-black transition"
            >
              Trimite
            </button>
          </div>
        </div>
      ) : null}

      {(canAccess || isAdmin) ? (
        <div className="glass-panel rounded-[2rem] border border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Debug LIVE</p>
          <div className="mt-4 grid gap-3 text-sm text-white/70 sm:grid-cols-2">
            <div className="rounded-[1rem] border border-white/10 bg-black/20 p-4">
              <p>Rol: {debug.role}</p>
              <p>Ultimul eveniment: {debug.lastEvent}</p>
              <p>Connection: {debug.connectionState}</p>
              <p>ICE: {debug.iceConnectionState}</p>
              <p>Signaling: {debug.signalingState}</p>
            </div>
            <div className="rounded-[1rem] border border-white/10 bg-black/20 p-4">
              <p>Pending requests: {debug.pendingRequests}</p>
              <p>Offer requests sent: {debug.offerRequestsSent}</p>
              <p>Offers received: {debug.offersReceived}</p>
              <p>Answers received: {debug.answersReceived}</p>
              <p>Answers sent: {debug.answersSent}</p>
              <p>Remote tracks: {debug.remoteTracks}</p>
            </div>
          </div>
        </div>
      ) : null}

      <PastLiveList
        canAccess={canAccess || isAdmin}
        sessions={recordings.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          scheduledFor: item.createdAt,
          recordingUrl: item.videoUrl
        }))}
      />
    </div>
  );
}
