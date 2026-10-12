Io gioco a Pickle Pete, un gioco per Android presente su Google Play.
Voglio sviluppare un'applicazione web con la grafica il più possibile simile al gioco (se possibile prendendo online immagini, temi, font etc) strutturata come segue.
Intestazione principale, presente in tutto il sito: logo Pikle Pete + Scritta "My Pickle Pete" --> cliccando logo o scritta si torna alla pagina di Home
Menu laterale con le voci:
- Items (preselezionato quando si atterra sulla home) --> Tutti gli oggetti indossabili nel gioco
- Full Sets --> Set completi di abbigliamento (Bandito / Cavaliere / Vampiro / Meccanico / Banchiere / Viaggiatore / Mago / Superman / Cowboy / Giullare / Vichingo)
- Custom Sets --> Set costruiti da me

Contenuto voci menù:

** ITEMS
Ordinamento: menù a tendina con ordinamenti preimpostati
	1. "Armor Set" (preselezionato), ovvero
		- Armature < Armi < Abilità
		- a parità di armatura ordinate per set, con Bandito < CavaliereVampiro < Meccanico < Banchiere < Viaggiatore < Mago < Superman < Cowboy < Giullare < Vichingo
		-- a parità di set si ordina per specifica, con Cappello < Occhiali < Petto < Schiena < Stivali
		- a parità di arma si ordina per specifica, con A distanza < Elementale < Meccanica < Ravvicinata
		-- a parità di specifica si ordina per rarità
		-- a parità di rarità si ordina per nome
		- a parità di abilità si ordina per rarità
		-- a parità di rarità si ordina per nome
	2. "Weapons first", ovvero
		- Armi < Abilità < Armature
		- a parità di arma si ordina per specifica, con A distanza < Elementale < Meccanica < Ravvicinata
		-- a parità di specifica si ordina per rarità
		-- a parità di rarità si ordina per nome
		- a parità di abilità si ordina per rarità
		-- a parità di rarità si ordina per nome
		- a parità di armatura ordinate per set, con Bandito < CavaliereVampiro < Meccanico < Banchiere < Viaggiatore < Mago < Superman < Cowboy < Giullare < Vichingo
		-- a parità di set si ordina per specifica, con Cappello < Occhiali < Petto < Schiena < Stivali
	3. "Rarity", ovvero
		- Rarità decrescente, con Artefatto > Leggendario > Epico > Raro > Incomune > Comune
		- a parità di rarità si ordina per tipologia con Armature < Armi < Abilità
		-- a parità di armatura ordinate per set, con Bandito < CavaliereVampiro < Meccanico < Banchiere < Viaggiatore < Mago < Superman < Cowboy < Giullare < Vichingo
		--- a parità di set si ordina per specifica, con Cappello < Occhiali < Petto < Schiena < Stivali
		-- a parità di arma si ordina per specifica, con A distanza < Elementale < Meccanica < Ravvicinata
		--- a parità di specifica si ordina per nome
		-- a parità di abilità si ordina per nome
Elenco tabellare non paginato di tutti gli item indossabili del gioco (armi, pezzi di armatura e arma speciale/abilità -o qualunque cosa siano quella specie di barattoli che danno abilità particolari durante il gioco-). Il numero degli elementi è fisso, cambierà solo la rarità e il livello.
Le colonne visualizzate saranno nell'ordine:
- Immagine miniaturizzata dell'item, possibilmente contestualizzata al suo livello
- Nome
- (enum) Rarità --> Comune / Incomune / Raro / Epico / Leggendario / Artefatto (formattato come il gioco ovvero bordatura nera + rispettivamente colorazione interna Bianco / Verde / Blu / Viola / Oro / Rosso); dalla rarità deriva il livello massimo dell'item, un intero rispettivamente di valore 10/20/30/40/50/99
- Livello rappresentato come "N / M" dome M è il livello massimo dell'item (dato dalla rarità) e N è un intero con dominio [1, M]
- Caratteristica: può essere solo "Danno" o "HP"; armi e abilità hanno sempre "Danno", delle armature cappello e occhiami hanno "Danno", tutte le altre "HP"
- (enum) Tipologia (Arma / Armatura / -arma speciale- Abilità)
- (enum) Specifica:
	> Arma --> Elementale / A distanza / Ravvicinata / Meccanica (possibilmente col simbolo che precede la scritta)
	> Armatura --> Cappello / Occhiali / Petto / Schiena / Stivali (possibilmente col simbolo che precede la scritta)
	> Abilità --> nessuna specifica, visualizzare "-"
- (enum) Set:
	> Arma --> nessuna specifica, visualizzare "-"
	> Armatura --> Bandito / Cavaliere / Vampiro / Meccanico / Banchiere / Viaggiatore / Mago / Superman / Cowboy / Giullare / Vichingo
	> Abilità --> nessuna specifica, visualizzare "-"
- Un'utlima colonna che avrà una casella selezionabile (vuoto = false, check verde = true) con queste specifiche:
	> In intestazione avrà due simboli dinamici:
		1. Una check-box inizialmente vuota in posizione centrale e allineata con le check-box delle righe della tabella; al click compare un check verde e tutte le righe visibili della tabella vengono selezionate; al click sulla check-box con check verde la check-box torna vuota e tutte le righe selezionate vengono deselezionate. Se anche solo una riga viene selezionata compare il check verde in intestazione. Tutte le righe scartate dai filtri vengono automaticamente deselezionate (qualora fossero selezionate), mentre tutte le righe che compaiono alla modifica dei filtri compaiono come deselezionate.
		2. Un occhietto ancorato a destra dell'intestazione, in grigetto e non cliccabile se nessuna riga è selezionata, cliccabile se almeno una riga è selezionata; al click apre una modale con eventuale barra di scorrimento verticale dove tutti gli item selezionati vengono visualizzati (descrizione nella sezione a seguire) uno di seguito all'altro con un separatore (una linea orizzontale) --> Sola lettura (no tasti "Rarità++" e "Reset") e tasto "Chiudi" ancorato in basso a destra della modale.
		
Le colonne "Rarità", "Tipologia", "Specifica" e "Set" avranno il simbolo di un imbuto nella riga di intestazione (allineamento a destra); cliccando sull'imbuto si aprirà una tendina per filtrare la colonna; il filtro può avvenire per una o più delle voci a tendina (selezionabili con una check-box allineata a destra) che corrisponderanno alla lista dei valori in colonna (per "Specifica" e "Set" ci sarà anche la voce "-nessuno-" come ultima voce della tendina); nessun valore selezionato = tutti i velori (ovvero nessun filtro applicato). Il primo valore di ogni tendina sarà "-Rimuovi filtro-"; gli altri valori saranno ordinati secondo gli ordinamenti sopra specificati. Quando c'è almeno un filtro attivo per la colonna il rispettivo imbuto assume una colorazione diversa.

Cliccando in un qualsiasi punto di ogni riga si aprirà una modale inerente all'item selezionato. La modale sarà così composta
- L'immagine (non miniaturizzata) dell'item (possibilmente contestualizzata al suo livello)
- Il nome dell'Item
- Tipologia dell'Item
- Specifica dell'Item (se presente)
- Lista di tutte le rarità in ordine crescente con rispettivo miglioramento di caratteristica --> i livelli non ancora sbloccati saranno in grigetto (o similare)
- Livello dell'item rappresentato come "N / M" (vedi sopra) --> N è modificabile a mano entro i valori di dominio
- Caratteristica dell'item rappresentato come 4xN (Per il danno è %, per HP è a valore), esempio per N=10 si ha "+40% Danno" oppure "+40 HP"
- Tasti "Rarità++" (aumenta la rarità al livello successivo sbloccando il rispettivo miglioramento di caratteristica), "Reset" (riporta la rarità a Comune rimuovendo gli eventuali miglioramenti di caratteristica relativi ai livelli di rarità rimossi) e "Chiudi" (chiude la modale)

** FULL SETS
Una lista di righe espandibili che hanno ognuna come label il nome di un set nell'ordine Bandito / Cavaliere / Vampiro / Meccanico / Banchiere / Viaggiatore / Mago / Superman / Cowboy / Giullare / Vichingo; inizialmente le righe sono tutte compresse, al click si espandono, possono essere espanse anche più di una per volta (potenzialmente anche tutte insieme).
Quando una riga si espande compare sotto un'area così composta:
- Abilità bonus del set se si posseggono almeno 4 item sui 5 disponibili (Cappello, Occhiali, Petto, Schiena, Stivali)
- Miniature in colonna delle immagini degli item del set (possibilmente contestualizzate al rispettivo livello), nome dell'item al passaggio del mouse; sotto ogni miniatura il livello rappresentato come "N / M" (vedi sopra)
- Una tabella le cui righe sono tutti i possibili migioramenti di caratteristica (in percentuale o a valore); nella colonna di sinistra ci sarà la somma dei miglioramenti di caratteristica di ogni item del set alla rarità a al livello effettivi, mentre a destra il valore che ci sarebbe alla massima rarità e al massimo livello. La lista delle caratteristiche è fissa, ma verranno evidenziate con un alone verde le due caratteristiche di picco del set e con un alone rosso le due caratteristiche peggiori (possono essere diverse tra destra e sinistra).

** CUSTOM SETS -- TODO
Lista dei set custom già creati (eventualmente vuota) --> stessa visualizzazione di Full Sets, ma con tasto cancella (sulla riga stessa) e modifica (dopo espansione area); il nome visualizzato è il nome scelto per il set.
Tasto + per aggiungerne una.

Modalità:
1. Da zero --> selezioni pezzo per pezzo Cappello, Occhiali, Petto, Schiena, Stivali, clicchi sul + e te li dà tutti in ordine di rarità/nome; salva alla fine.
2. Best now --> selezioni massimo 2 caratteristiche (principale obbligatoria e secondaria opzionale) e ti dà un massimo di 3 set che massimizzano quelle caratteristiche al livello attuale degli item; si atterra in modalità modifica.
3. Best potential --> selezioni massimo 2 caratteristiche (principale obbligatoria e secondaria opzionale) e ti dà un massimo di 3 set che massimizzano quelle caratteristiche al livello massimo degli item; si atterra in modalità modifica.

Emtrando in visualizzazione si vede come FULL SET il confronto tra attuale e massimo.
Entrando in modifica a sinistra c'è il set statico, a destra c'è lo stesso set, ma si possono sostituire i pezzi con un sistema simile a "Da zero" e se si modifica, la tabellina mette vicino alle caratteristiche che vengono modificate una freccetta verde in su o rossa in giù a seconda se la caratteristica è migliorata o peggiorata. Alla fine si può salvare sovrascrivendo o in un nuovo set (in questo caso fa specificare un nuovo nome).
