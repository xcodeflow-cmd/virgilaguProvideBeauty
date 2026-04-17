# LiveKit deploy pentru `live.provibe.ro`

Repo-ul acesta foloseste LiveKit in UI:

- frontend-ul se conecteaza la `NEXT_PUBLIC_LIVEKIT_URL`
- token-ul este generat de `app/api/live/token/route.ts`
- pentru productie, URL-ul public trebuie sa fie `wss://live.provibe.ro`

## Ce fisiere ai in repo

- `deploy/nginx/live.provibe.ro.http.conf`
  Foloseste-l prima data, inainte sa emiti certificatul.
- `deploy/nginx/live.provibe.ro.conf`
  Foloseste-l dupa ce certificatul LetsEncrypt exista.
- `deploy/livekit/livekit.yaml.example`
  Config exemplu pentru serverul LiveKit.
- `deploy/systemd/livekit.service`
  Serviciu `systemd` pentru procesul `livekit-server`.

## Ordinea corecta pe server

1. Pune DNS:
   - `A live.provibe.ro -> 78.47.119.183`
2. Verifica DNS:
   - `dig live.provibe.ro +short`
3. Instaleaza configul HTTP temporar:
   - copiezi `deploy/nginx/live.provibe.ro.http.conf` in `/etc/nginx/sites-available/live.provibe.ro`
   - faci link in `/etc/nginx/sites-enabled/live.provibe.ro`
   - rulezi `sudo nginx -t && sudo systemctl reload nginx`
4. Emite certificatul:
   - `sudo certbot --nginx -d live.provibe.ro`
5. Inlocuiesti configul HTTP cu `deploy/nginx/live.provibe.ro.conf`
6. Rulezi din nou:
   - `sudo nginx -t && sudo systemctl reload nginx`
7. Configurezi si pornesti LiveKit:
   - copiezi `deploy/livekit/livekit.yaml.example` in `/opt/provibe/livekit/livekit.yaml`
   - inlocuiesti `replace-me-api-key` si `replace-me-api-secret`
   - instalezi binarul `livekit-server` in `/usr/local/bin/livekit-server`
   - copiezi `deploy/systemd/livekit.service` in `/etc/systemd/system/livekit.service`
   - `sudo systemctl daemon-reload`
   - `sudo systemctl enable --now livekit`

## Porturi de deschis

Conform documentatiei oficiale LiveKit:

- `7880/tcp` pentru API si WebSocket, in spatele Nginx
- `7881/tcp` pentru ICE/TCP fallback
- `50000-50100/udp` pentru media WebRTC

Sursa:

- https://docs.livekit.io/home/self-hosting/ports-firewall/

## Variabilele din Vercel

In Vercel trebuie sa ai:

- `NEXT_PUBLIC_LIVEKIT_URL=wss://live.provibe.ro`
- `LIVEKIT_API_KEY=<aceeasi cheie ca in livekit.yaml>`
- `LIVEKIT_API_SECRET=<acelasi secret ca in livekit.yaml>`

Nu pune URL-ul in `LIVEKIT_API_KEY`. Cheia, secretul si URL-ul sunt valori separate.

## Comenzi utile

Verificare serviciu:

```bash
sudo systemctl status livekit
sudo journalctl -u livekit -n 100 --no-pager
```

Verificare Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Verificare DNS:

```bash
dig live.provibe.ro +short
```

Verificare WebSocket public:

```bash
curl -I https://live.provibe.ro
```

## Observatie importanta

Pagina `https://78.47.119.183:3000/live` nu este o adresa buna pentru broadcast in browser. Camera si microfonul functioneaza corect doar pe:

- `https` valid pe domeniu
- `localhost`

Deci testeaza broadcast-ul pe `https://provibe.ro/live`, nu pe IP-ul brut.
