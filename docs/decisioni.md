# Revisione del prompt "My Pickle Pete"

Il prompt è chiaro nella struttura generale (header, menu, Items, Full Sets, Custom Sets). Qui sotto i punti da chiarire, con la mia proposta di default tra parentesi quadre: se ti va bene, basta dire "ok ai default".

## 1. Dati e possesso degli item
1. ✅ **Possesso degli item.** Tutti gli item sono posseduti. Il bonus del set si attiva indossando almeno 4 dei 5 pezzi del set. In Full Sets i 5 pezzi sono sempre tutti presenti, quindi il bonus è sempre attivo; nei Custom Sets si attiva solo con almeno 4 pezzi dello stesso set.
2. ✅ **Bonus set.** Assorbito dal punto 1.
3. ✅ **Due configurazioni per item.** La configurazione *effettiva* corrisponde a rarità e livello dell'inventario, quella *top* alla massima rarità e al massimo livello. Nel censimento si definisce, per ogni item, il potenziamento ricevuto a ogni promozione di rarità. Nell'app tutti gli item partono da Comune 1/10; poi li promuovi tu e scrivi il livello a mano.
4. ✅ **Miglioramenti per rarità.** Ogni rarità tranne Comune aggiunge un potenziamento (es. +5% Raggio di raccolta, +3 Fortuna), quindi ogni item ne ha 5. I valori non si trovano online e verranno raccolti nella fase di censimento.
5. ✅ **Cambio di rarità.** Nel dettaglio dell'item si clicca direttamente la rarità voluta (si attivano anche tutte le inferiori). Se è più alta il livello resta invariato e sale solo il massimo; se è più bassa il livello scende al nuovo massimo quando lo supera. Dalla 0.2.1 sostituisce i tasti Rarità++ e Reset.
6. ✅ **Immagine.** Basta la cornice del colore della rarità effettiva.

## 2. Ordinamenti
7. ✅ **Cavaliere < Vampiro**: è l'ordine usato dal gioco.
8. ✅ **Rarità** in ordine decrescente (Artefatto per primo).
9. ✅ **Pezzi per set.** Ogni set ha un solo pezzo per slot.

## 3. Full Sets
10. ✅ **Lista fissa delle caratteristiche** (22, da [TouchTapPlay](https://www.touchtapplay.com/pickle-pete-survivor-guide-tips-tricks/)): Danno, HP Max, Velocità d'attacco, Rigenerazione, Armatura, Cura alla raccolta, Raggio di raccolta, Velocità di movimento, Guadagno XP, Probabilità di schivata, Probabilità di critico, Danno critico, Furto di vita, Danno ravvicinato, Danno a distanza, Danno elementale, Danno meccanico, Fortuna, Guadagni pattuglia, Danno ai boss, Interessi, Contraccolpo. L'unità (% o valore) di ciascuna la ricavo dal censimento; nel gioco in italiano i nomi potrebbero essere diversi, li allineeremo.
11. ✅ **Evidenziazione dei massimi.** Se il valore massimo compare 2 o più volte, si evidenziano tutte le sue occorrenze e ci si ferma lì. Se compare una volta sola, si evidenziano quel valore e tutte le occorrenze del secondo valore più alto. Per i minimi vale la regola speculare. Lo 0 è un valore valido ed è sempre il più basso.
12. ✅ **Bonus set.** È solo un effetto testuale e non entra nella tabella delle caratteristiche. Online si trovano 8 effetti su 11 (mancano Bandito, Cavaliere e Vampiro), riportati sotto; i 3 mancanti vanno censiti come semplici stringhe.

## 4. Custom Sets (TODO)
13. ✅ **Modalità "Da zero".** Si apre una modale con il nome del set e 5 slot vuoti (Cappello, Occhiali, Petto, Schiena, Stivali). Ogni slot ha un + che apre la lista degli item di quello slot, ordinata per rarità decrescente e poi per nome.
14. ✅ **Composizione dei set.** Full Set e Custom Set contengono solo armature; armi e abilità compaiono solo in Items.
15. ✅ **Best now / Best potential.** La caratteristica principale pesa di più e la secondaria fa da spareggio; si mostrano al massimo 3 proposte.

### Scelte fatte nello sviluppo dei Custom Sets (0.2.0)
- Un set custom può avere slot vuoti, ma per salvarlo serve almeno un pezzo; il nome è unico (senza distinzione di maiuscole).
- Il bonus è quello del set di cui si indossano almeno 4 pezzi (con 5 slot ce n'è al massimo uno).
- Best now e Best potential riempiono tutti gli slot che hanno pezzi censiti. Ordine delle proposte: caratteristica principale,
  poi secondaria, poi bonus di set attivo, poi somma di Danno/HP base dei pezzi. "Fortuna" e "Fortuna (%)" sono caratteristiche distinte.
- La proposta scelta si apre in modifica: a sinistra la proposta, a destra la copia da cambiare, con le frecce verdi e rosse
  su ogni valore (attuale e top) migliorato o peggiorato.
- Cancellando un item, o cambiandone tipologia o slot nel censimento, lo si toglie dai set custom che lo indossano.

## 5. Aspetti tecnici
16. ✅ **Architettura.** App solo per te con database H2. Regole da Dropbox/MyClaudeProjects/MyCodingStyle (vedi sotto).
17. ✅ **Lingua.** Interfaccia in italiano.
18. ✅ **Uso.** Solo personale.

## Lookup: cosa si trova online
Online **non esiste un database completo** degli item di Pickle Pete: Survivor (niente wiki, niente fandom). Ho trovato solo:
- i bonus set a rarità Leggendaria di 8 set su 11 (Vichingo, Giullare, Superman, Mago, Viaggiatore, Cowboy, Banchiere, Meccanico) da [TouchTapPlay](https://www.touchtapplay.com/pickle-pete-survivor-best-build-best-gear-mutations-hero-loadout/). Mancano Bandito, Cavaliere e Vampiro;
- nomi sparsi di armi (SMG, minigun, taser, plasma gun, shotgun...), senza statistiche ([AppGamer](https://www.appgamer.com/pickle-pete-survivor/what-best-weapons-to-use-upgrade)).

Mancano l'elenco degli item, i bonus per rarità, le icone e le statistiche. Questi dati vanno inseriti da te, quindi la fase "Crea item" è necessaria.

## Fase di censimento ("Crea item")
Confermata: i potenziamenti per rarità degli item non si trovano online.

Una sezione **Gestione dati** (voce in fondo al menu, o icona ingranaggio) con:
- **Crea / Modifica item**: nome, tipologia, specifica, set, immagine (upload), caratteristica (calcolata in automatico) e, per ogni rarità, l'elenco dei bonus sbloccati (caratteristica + valore + unità %/valore);
- **Set**: nome, ordine, bonus a 4 pezzi (testo + eventuale valore numerico);
- **Caratteristiche**: elenco fisso modificabile (nome, unità);
- **Export / Import JSON**, così i dati si inseriscono una volta e si ripristinano quando serve.

Scorciatoia: puoi mandarmi gli screenshot delle schede item del gioco. Io estraggo i dati e preparo il JSON iniziale, così in "Crea item" devi solo correggere.

## Bonus set trovati online (rarità Leggendaria)
| Set | Effetto |
|---|---|
| Vichingo | +10% velocità d'attacco e +5% probabilità di critico per le armi ravvicinate |
| Giullare | Sconto del 10% nel negozio |
| Superman | 15% di probabilità di diventare invincibile per 2 s quando colpito |
| Mago | 1% di probabilità di ottenere +10 danno elementale per 5 s quando attacchi |
| Viaggiatore | 10% di probabilità di ottenere +30% velocità di movimento per 2 s quando colpito |
| Cowboy | +30% velocità d'attacco sotto il 30% di HP |
| Banchiere | 10% di probabilità che i nemici lascino una moneta quando muoiono |
| Meccanico | Scintille elettriche colpiscono i nemici vicini quando vieni colpito |
| Bandito, Cavaliere, Vampiro | da censire |

## Stack e regole di sviluppo
Le regole vengono da **MyCodingStyle/STYLE.md** in Dropbox (regole R1–R40), che è la fonte unica.
- **Backend:** Java 25 e Spring Boot 4 senza Lombok (R21), con record e costruttori espliciti. Accesso ai dati con jOOQ (R27), H2 su file e Liquibase (file `YYYYMMDD_<versione>_<descrizione>.xml`, changeset idempotenti).
- **Schema:** tabelle con il prefisso `mpp_` e chiavi naturali dove esiste un codice (set, rarità, slot). Nessun cascade, indici su FK e colonne di ricerca (R28).
- **Codice:** nomi, log ed errori in inglese, commenti brevi in italiano. I comportamenti per tipo stanno negli enum (R11): per esempio `Rarity` contiene il livello massimo e il colore, `ArmorSlot` decide la caratteristica (Danno/HP). Classi base generiche per il CRUD (R12) e utility copiate dal toolkit (R35).
- **API REST:** path in kebab-case con la risorsa al singolare (`/item`, `/armor-set`, `/custom-set`) e azioni esplicite per le operazioni non CRUD (`/item/rarity`, `/custom-set/calculate-best-now`).
- **Test:** JUnit 5 package-private, con tabelle di casi tramite `switch` sugli enum (R36).
- **Git:** commit di una riga in italiano (`Area - Descrizione.`), merge e non rebase (R38).
- **Frontend:** React, TypeScript, Vite e Mantine come in salary-manager, con un tema personalizzato che riprende i colori del gioco.
- **Cartella:** C:\Progetti\Privati\my-pickle-pete (oggi vuota).
