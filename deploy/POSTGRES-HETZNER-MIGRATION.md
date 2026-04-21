# PostgreSQL Migration: Neon -> Hetzner

Scopul aici este simplu: pastrezi aplicatia exact cum este acum, iar schimbarea reala se face doar la nivel de infrastructura si `DATABASE_URL`.

Codul actual foloseste:
- Prisma
- PostgreSQL generic
- o singura conexiune configurata prin `DATABASE_URL`

Asta inseamna ca aplicatia nu trebuie rescrisa pentru a iesi din Neon. Trebuie doar:
1. sa ridici PostgreSQL pe serverul Hetzner
2. sa importi schema + datele curente din Neon
3. sa schimbi `DATABASE_URL` in mediul de productie
4. sa verifici ca aplicatia raspunde identic

## 1. Ridica PostgreSQL pe Hetzner

In server:

```bash
mkdir -p /opt/virgilagu/postgres
cd /opt/virgilagu/postgres
```

Copiaza aici:
- `deploy/postgres/docker-compose.yml`
- `deploy/postgres/.env.example` ca `.env`

Editeaza `.env` cu valori reale, puternice:

```env
POSTGRES_DB=frizer
POSTGRES_USER=frizer_app
POSTGRES_PASSWORD=schimba-cu-o-parola-lunga-si-random
POSTGRES_PORT=5432
```

Porneste baza:

```bash
docker compose up -d
docker compose ps
```

Verifica sanatatea:

```bash
docker exec -it virgilagu-postgres pg_isready -U frizer_app -d frizer
```

## 2. Creeaza backup din Neon

Pe masina de unde ai acces la Neon:

```bash
pg_dump --format=custom --no-owner --no-privileges "$SOURCE_DATABASE_URL" -f neon.dump
```

Note:
- `SOURCE_DATABASE_URL` este connection string-ul actual din Neon.
- Formatul `custom` este preferat pentru restore curat si sigur.
- Backup-ul include si tabela `_prisma_migrations`, ceea ce e important pentru Prisma.

## 3. Restaureaza dump-ul in PostgreSQL de pe Hetzner

Dupa ce ai copiat `neon.dump` pe server:

```bash
createdb -h 127.0.0.1 -p 5432 -U frizer_app frizer
```

Daca baza exista deja si vrei restore peste o baza goala:

```bash
dropdb -h 127.0.0.1 -p 5432 -U frizer_app --if-exists frizer
createdb -h 127.0.0.1 -p 5432 -U frizer_app frizer
pg_restore --clean --if-exists --no-owner --no-privileges -h 127.0.0.1 -p 5432 -U frizer_app -d frizer neon.dump
```

Alternativ, daca vrei sa rulezi restore direct in container:

```bash
cat neon.dump | docker exec -i virgilagu-postgres sh -c "cat > /tmp/neon.dump"
docker exec -it virgilagu-postgres pg_restore --clean --if-exists --no-owner --no-privileges -U frizer_app -d frizer /tmp/neon.dump
```

## 4. Verifica structura Prisma dupa restore

In proiect:

```bash
npm run prisma:generate
npx prisma migrate status
```

Rezultatul corect este:
- schema sincronizata
- migratiile marcate ca aplicate
- fara nevoia de schimbari in `prisma/schema.prisma`

Important:
- Dupa un restore complet, nu rula `prisma migrate deploy` peste o baza deja restaurata din dump decat daca `prisma migrate status` iti arata clar ca lipsesc migratii.
- Daca dump-ul vine din baza de productie curenta, `_prisma_migrations` ar trebui sa fie deja la zi.

## 5. Schimba doar `DATABASE_URL`

Aplicatia actuala citeste conexiunea din `.env` prin:

```env
DATABASE_URL=...
```

Pentru aplicatie pe acelasi server cu PostgreSQL:

```env
DATABASE_URL="postgresql://frizer_app:PAROLA@127.0.0.1:5432/frizer?schema=public"
```

Pentru aplicatie pe alt server din aceeasi retea privata:

```env
DATABASE_URL="postgresql://frizer_app:PAROLA@IP_PRIVAT_HETZNER:5432/frizer?schema=public"
```

Daca alegi conexiune fara TLS in interiorul infrastructurii tale:
- foloseste acces doar pe loopback sau retea privata
- nu expune portul 5432 public pe internet

## 6. Verificare functionala minima

Testeaza exact lucrurile care depind direct de DB:
- login
- register
- citirea continutului din admin
- bookings
- live sessions
- subscriptions/purchases afisate sau persistate

Teste SQL rapide:

```bash
psql "postgresql://frizer_app:PAROLA@127.0.0.1:5432/frizer" -c "select count(*) from \"User\";"
psql "postgresql://frizer_app:PAROLA@127.0.0.1:5432/frizer" -c "select count(*) from \"LiveSession\";"
psql "postgresql://frizer_app:PAROLA@127.0.0.1:5432/frizer" -c "select count(*) from \"_prisma_migrations\";"
```

## 7. Cutover fara downtime mare

Ordinea sigura este:
1. pui aplicatia in maintenance scurt sau opresti scrierile
2. faci backup final din Neon
3. faci restore pe Hetzner
4. schimbi `DATABASE_URL`
5. repornesti aplicatia
6. verifici login + cateva query-uri critice

Asa eviti sa pierzi ultimele scrieri dintre un backup vechi si momentul mutarii.

## 8. Rollback

Daca ceva nu iese bine:
1. pui inapoi vechiul `DATABASE_URL` cu Neon
2. repornesti aplicatia
3. investighezi separat diferenta de date sau permisiuni

Fiindca nu modifici codul si nu modifici schema Prisma, rollback-ul este practic instant.

## 9. Ce NU trebuie schimbat in proiect

Nu trebuie schimbate:
- `prisma/schema.prisma`
- `lib/prisma.ts`
- modelele Prisma
- query-urile din app
- auth
- Stripe persistence

Toate raman identice daca noul PostgreSQL are aceeasi schema si aceleasi date.
