# TODO

## Primo rilascio sul server personale (0.7.0)
My Pickle Pete è il progetto di prova per il primo rilascio sul server personale, seguito nel progetto Claude
"Mio server di servizio" (che prevede anche CaPo e SalaryManager, da portare più avanti).

Già pronto nel codice (vedi README, sezione "Releases and PostgreSQL"):
- profilo `prod` con PostgreSQL (`MPP_DB_URL`, `MPP_DB_USERNAME`, `MPP_DB_PASSWORD`);
- porting una tantum dal file H2 con i profili `prod,porting` (`MPP_PORTING_H2_PATH`), provato sui dati reali;
- schema dei branch: `main` di sviluppo in `-SNAPSHOT`, `release/x.y.z` chiuso dal tag `vx.y.z` e poi congelato.

Da fare:
1. Tagliare `release/0.7.0` da `main` (versione 0.7.0 in `pom.xml` e `package.json`), poi `main` a `0.7.1-SNAPSHOT`
   o `0.8.0-SNAPSHOT`.
2. Decidere il pacchetto da installare: jar unico con il frontend compilato dentro (oggi il backend lo legge da
   `frontend/dist`, vedi `MPP_FRONTEND_DIST`) oppure immagine Docker.
3. Sul server: PostgreSQL con database e utente dedicati, variabili d'ambiente (`SPRING_PROFILES_ACTIVE=prod`,
   `MPP_DB_*`, `MPP_REMEMBER_ME_KEY`, `MPP_SERVER_ADDRESS`, `MPP_PORT`), servizio di avvio automatico, proxy HTTPS
   davanti al context path `/my-pickle-pete`, backup del database.
4. Porting: fermare l'app locale, copiare `backend/data/my-pickle-pete.mv.db` sul server (o lanciare il porting dal
   PC verso il PostgreSQL del server) e avviare una volta con `prod,porting`; poi avvio normale con `prod`.
5. Verificare dal telefono: login con le stesse password, progressi e Custom Set.
6. Chiudere la release con il tag `v0.7.0`.

## Seed Liquibase dei dati censiti
Trasformare gli item, i bonus e gli effetti dei set censiti finora in un changeset Liquibase di inserimento
(precondizione: `mpp_item` vuota, così sul DB esistente non fa nulla). Serve per installazioni nuove, demo e test.
L'ADMIN resta per i censimenti successivi.

**In attesa:** prima va rivisto il modello degli item per un item trovato con un'eccezione.
