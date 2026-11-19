# My Pickle Pete

Web app personale di supporto al gioco Android *Pickle Pete: Survivor*: inventario degli item (armature, armi,
abilità), Full Sets del gioco e Custom Sets costruiti dall'utente, con ricerca del set migliore. Con utenze: un ADMIN
censisce i dati del gioco, ogni utente normale ha i propri progressi e Custom Set. Uso solo personale,
interfaccia in italiano, deve essere comoda da cellulare (menu a burger, modali a tutto schermo, tabelle leggibili).

Rispondi sempre in italiano.

## Documenti di riferimento

- `docs/specifica.md`: specifica funzionale originale.
- `docs/decisioni.md`: decisioni prese dove la specifica taceva, divise per versione. Aggiornalo quando prendi una
  nuova decisione funzionale.
- `README.md`: presentazione in inglese per i recruiter (architettura, stack, avvio, test). Non va tradotto.

## Struttura

- `backend/` Spring Boot 4.0.8, Java 25, jOOQ, Liquibase, H2 su file (`backend/data/`, escluso da git).
  Package `com.fcusumano.mpp`: `application` (endpoint REST e DTO), `core` (modello, enum, service, calcoli,
  validazione), `infrastructure` (repository jOOQ, gestione eccezioni, Spring Security), `tools` (utility copiate dal
  toolkit).
  Le classi jOOQ si generano dal changelog Liquibase in fase di build.
- `frontend/` React 19, TypeScript, Vite, Mantine, TanStack Query. In produzione il backend serve `frontend/dist`.
- App su `http://localhost:8080/my-pickle-pete/` (context path `/my-pickle-pete`, API sotto `/my-pickle-pete/api`).
  La porta si cambia con `MPP_PORT` nel file `.env`.
- `avvia.bat` (Windows): legge `.env` (copia di `.env.example`, escluso da git), ricompila il frontend se il codice
  è cambiato, avvia il backend e apre il browser (Brave di default).

## Comandi

```bash
cd backend && ./mvnw test           # Windows: mvnw.cmd test
cd backend && ./mvnw spring-boot:run
cd frontend && npm test             # Vitest
cd frontend && npm run typecheck && npm run lint
cd frontend && npm run build
cd frontend && npm run dev          # http://localhost:5173/my-pickle-pete/ con proxy verso il backend
```

Prima di dire che una modifica è finita: test del backend se tocchi `backend/`, typecheck, lint e test del frontend
se tocchi `frontend/`.

## Regole di codice

Le regole complete sono in `~/Dropbox/MyClaudeProjects/MyCodingStyle/STYLE.md` (R1–R40, con i file tematici e il
toolkit in `toolkit/src/tools`). Se la cartella è raggiungibile leggila prima di scrivere codice; i punti essenziali:

- Java moderno (record, stream, switch expression), `final` sulle variabili locali, `var` quasi mai.
- Niente Lombok: record per DTO, costruttori espliciti per la DI, `LoggerFactory.getLogger`.
- Codice, log, messaggi d'errore e OpenAPI in inglese; commenti brevi in italiano, a fine riga, che spiegano il perché.
- Comportamenti per tipo negli enum (`Rarity`, `ArmorSlot`...), non in `if` sparsi nei service.
- Metodo pubblico che si legge come sequenza di passi, helper privati, guard clause in testa.
- Eccezioni di dominio con codice in un enum, mappate su HTTP in un solo `@RestControllerAdvice`.
- Controller sottili, `@Transactional` sui metodi pubblici degli application service.
- Database: tabelle con prefisso `mpp_`, chiavi naturali dove esiste un codice, niente cascade.
  Liquibase: un file per modifica `YYYYMMDD_<versione>_<descrizione>.xml`, changeset idempotenti, mai modificare un
  changeset già rilasciato.
- REST: path kebab-case, risorsa al singolare (`/item`, `/armor-set`, `/custom-set`), verbo solo per azioni non CRUD
  (`/custom-set/calculate-best-now`); query param in camelCase.
- Utility statiche: prima cercale nel toolkit e copiale in `tools`.
- Test JUnit 5 package-private con nomi che descrivono lo scenario; per gli enum casi con `switch` sui valori.
- Niente codice commentato o morto.

## Git

- Commit di una riga in italiano: `Area - Descrizione.` (es. `Censimento - Seconda fase con rarità e livello.`).
- Branch `<versione>/<tema>` (es. `0.5.4/census-from-picker`); merge, mai rebase.
- La versione sta nel `pom.xml` e nel `package.json` del frontend (oggi 0.6.0): avanzala a ogni rilascio.
- Merge su `main` solo quando lo chiedo. Se scrivo "lavora direttamente su main", niente branch né PR.

## Regole di dominio da non perdere

- Non esiste un database online degli item: li inserisce l'ADMIN con il **censimento** ("Crea item").
- Utenze: l'ADMIN censisce item, composizione dei Full Set ed effetti dei set, ma non ha progressi né Custom Sets
  (vede Items e Full Sets a Comune 1). Gli USER salvano rarità e livello (`mpp_user_item`, senza riga = Comune 1) e i
  propri Custom Set (nome unico per utente). I permessi stanno negli endpoint (`@AdminOnly`, `@UserOnly`) e in
  `frontend/src/domain/permissions.ts`. Password iniziali da `MPP_ADMIN_PASSWORD` / `MPP_OWNER_PASSWORD`.
- Ogni item ha 5 bonus, uno per rarità (Incomune → Artefatto), tutti obbligatori, minimo +1, unità `#` (valore)
  o `%`, mostrati come `+2` / `+2%`. Stessa caratteristica in unità diverse = righe separate. I bonus delle armi
  possono essere "Proprio dell'arma".
- I set riguardano solo le armature. Un Custom Set può avere anche un'arma e un'abilità, mostrate a parte; l'arma non
  influisce sui tipi d'arma consigliati/sconsigliati. I nomi dei Custom Set sono unici (senza distinzione maiuscole).
- Le tabelle delle statistiche dei set mostrano solo i bonus di rarità e devono essere il più compatte possibile in
  verticale. Danno (moltiplicatore x4) e HP dal livello stanno accanto al nome del set: `👊 +X% / +XX%  ❤️ +Y / +YY`
  (attuale / massimo).
- Best now / Best potential confrontano solo i bonus; Danno/HP da livello sono l'ultimo criterio di spareggio.
- Censimento aperto dal "+" di un Full Set (solo ADMIN): nome precompilato `<Pezzo> da <Set>`. Il censimento è in
  una sola fase: rarità e livello si impostano dal dettaglio dell'item (solo USER).
- Dettaglio item: cliccare una rarità attiva quella e le inferiori; abbassandola il livello si limita al nuovo
  massimo, alzandola resta. Le frecce del livello aggiornano Danno/HP subito; i set si aggiornano alla chiusura.
- Immagini: nessun upload. Un'immagine fissa per categoria (SVG, fondo neutro, linee di un colore), con `+` per
  aggiungere, matita per modificare, X rossa per i pezzi mancanti.
- L'ordine Cavaliere < Vampiro è voluto.
- Mantine `Modal` a tutto schermo: non impostare `centered` (le tendine si aprono spostate su mobile).

## Problemi noti

- Escape nel picker dello slot chiude anche l'editor del Custom Set (non ancora corretto).
- Da verificare: le somme dei set già censiti, con i dati di `/api/item/list` e `/api/custom-set/list` (ora servono
  login e cookie di sessione).
