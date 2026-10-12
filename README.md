# My Pickle Pete

App personale per gestire gli item di Pickle Pete: Survivor: inventario (Items), set completi (Full Sets) e,
nella prossima versione, set personalizzati (Custom Sets).

Specifica e decisioni prese: [docs/specifica.md](docs/specifica.md), [docs/decisioni.md](docs/decisioni.md).

## Struttura

| Cartella    | Contenuto                                                                 |
|-------------|---------------------------------------------------------------------------|
| `backend/`  | Spring Boot 4 (Java 25), jOOQ, Liquibase, H2 su file                      |
| `frontend/` | React 19 + TypeScript + Vite + Mantine, pensato anche per il cellulare    |
| `docs/`     | Specifica e decisioni                                                     |

## Prerequisiti

- JDK 25
- Node.js 22 o superiore

## Avvio

Su Windows basta un doppio clic su `avvia.bat`: compila il frontend se serve, avvia il backend e apre il browser.
Per usare un JDK 25 diverso da quello di sistema copia `.env.example` in `.env` e imposta `JAVA_HOME`:
il file vale solo per l'avvio ed è escluso da git.

A mano:

```bash
# 1. Frontend: build servita direttamente dal backend
cd frontend
npm install
npm run build

# 2. Backend
cd ../backend
./mvnw spring-boot:run        # su Windows: mvnw.cmd spring-boot:run
```

Poi apri <http://localhost:8080/my-pickle-pete/>.

Per sviluppare sul frontend con il ricaricamento automatico: backend avviato e `npm run dev` in `frontend/`
(apre <http://localhost:5173/my-pickle-pete/>, le chiamate alle API vanno al backend).

### Dal cellulare

Di default il backend ascolta solo su `127.0.0.1`. Per usarlo dal telefono sulla stessa rete Wi-Fi:

```bash
MPP_SERVER_ADDRESS=0.0.0.0 ./mvnw spring-boot:run
```

e apri `http://<ip-del-pc>:8080/my-pickle-pete/` dal telefono (su Windows potrebbe servire consentire Java nel firewall).

## Configurazione

| Variabile            | Default                     | Significato                          |
|----------------------|-----------------------------|--------------------------------------|
| `MPP_PORT`           | `8080`                      | Porta HTTP                           |
| `MPP_SERVER_ADDRESS` | `127.0.0.1`                 | Interfaccia di ascolto               |
| `MPP_DB_PATH`        | `./data/my-pickle-pete`     | File H2 (relativo a `backend/`)      |
| `MPP_FRONTEND_DIST`  | `../frontend/dist`          | Build del frontend da servire        |

I dati restano in `backend/data/` (esclusa da git): per un backup basta copiare quella cartella a backend fermo.

Documentazione API: <http://localhost:8080/my-pickle-pete/swagger-ui.html>.

## Primo utilizzo

Non esiste un database online degli item: si parte dalla pagina **Censimento**, dove si creano gli item
(nome, tipologia, specifica, set e i 5 potenziamenti per rarità, ciascuno a valore o in percentuale; l'immagine è quella
predefinita della categoria) e si inseriscono i testi dei bonus
dei set. Bandito, Cavaliere e Vampiro non hanno ancora il testo del bonus.

Ogni caratteristica ha un'unità predefinita (in `backend/src/main/java/com/fcusumano/mpp/core/enums/Stat.java`), usata per la
statistica base del livello e proposta in censimento; la stessa caratteristica in unità diverse resta su righe separate.

## Test

```bash
cd backend && ./mvnw test
cd frontend && npm test
```
