"use strict";

if ( window.indexedDB ) { console.log( "IndexedDB ist verfügbar." ); }
else { alert( "Web-App funktioniert nicht weil IndexedDB nicht zur Verfügung steht." ); }

const DATENBANK_NAME            = "LehrveranstaltungsProtokoll";
const STORE_LEHRVERANSTALTUNGEN = "lehrveranstaltungen";
const STORE_PROTOKOLLEINTRAG    = "protokolleintrag";


/**
 * Verbindungsobjekt der Datenbank holen (Datenbank wird ggf. erstellt).
 * 
 * @returns {Promise<IDBDatabase>} Promise auf Verbindungsobjekt der Datenbank
 */
function holeDatenbankVerbindung() {

  return new Promise( (resolve, reject ) => {

    const idbOpenRequest = window.indexedDB.open( DATENBANK_NAME, 1 );

    idbOpenRequest.onupgradeneeded = (event) => {

      const db = event.target.result;
      if ( !db.objectStoreNames.contains( STORE_LEHRVERANSTALTUNGEN ) ) {

        db.createObjectStore( STORE_LEHRVERANSTALTUNGEN, { keyPath: "id", autoIncrement: true } );
      }
      if ( !db.objectStoreNames.contains( STORE_PROTOKOLLEINTRAG ) ) {

        const store = db.createObjectStore( STORE_PROTOKOLLEINTRAG, { keyPath: "id", autoIncrement: true } );
        store.createIndex( "vorlesungId", "vorlesungId", { unique: false } );
      }
    };

    idbOpenRequest.onsuccess = function( ) {

        console.log( `Datenbank \"${DATENBANK_NAME}\" erfolgreich geöffnet.` );
        return resolve( idbOpenRequest.result );    
    };

    idbOpenRequest.onerror = function( ) {

        console.error( `Fehler beim Öffnen der Datenbank \"${DATENBANK_NAME}\": ${idbOpenRequest.error}` );
        reject ( idbOpenRequest.error  );
    };
  });
}


/**
 * Neue Lehrveranstaltung in Datenbank anlegen.
 *
 * @param {string} nameLehrveranstaltung Name der neuen Lehrveranstaltung
 *
 * @returns {Promise<number>} Promise mit ID der neu erstellten Lehrveranstaltung
 */
async function neueLehrveranstaltung( nameLehrveranstaltung ) {

    const datenbank = await holeDatenbankVerbindung();

      return new Promise( ( resolve, reject ) => {

        const tx      = datenbank.transaction( STORE_LEHRVERANSTALTUNGEN, "readwrite" );
        const store   = tx.objectStore( STORE_LEHRVERANSTALTUNGEN );
        const request = store.add({ name: nameLehrveranstaltung });

        request.onsuccess = () => resolve( request.result );
        request.onerror   = () => reject(  request.error  );
      });
}


/**
 * Alle Lehrveranstaltungen aus der Datenbank holen.
 *
 * @returns {Promise<Array>} Promise mit Array aller Lehrveranstaltungen
 */
async function getAlleLehrveranstaltungen() {

    const datenbank = await holeDatenbankVerbindung();

    return new Promise( ( resolve, reject ) => {

        const tx      = datenbank.transaction( STORE_LEHRVERANSTALTUNGEN, "readonly" );
        const store   = tx.objectStore( STORE_LEHRVERANSTALTUNGEN );
        const request = store.getAll();

        request.onsuccess = () => resolve( request.result );
        request.onerror   = () => reject(  request.error  );
    });
}


/**
 * Eine bestimmte Lehrveranstaltung anhand ihrer ID aus der Datenbank holen.
 *
 * @param {number} id ID der Lehrveranstaltung
 *
 * @returns {Promise<Object|null>} Promise mit Lehrveranstaltung-Objekt oder null wenn nicht gefunden
 */
async function getLehrveranstaltungById( id ) {

    const datenbank = await holeDatenbankVerbindung();

    return new Promise( ( resolve, reject ) => {

        const tx      = datenbank.transaction( STORE_LEHRVERANSTALTUNGEN, "readonly" );
        const store   = tx.objectStore( STORE_LEHRVERANSTALTUNGEN );
        const request = store.get( id );

        request.onsuccess = () => resolve( request.result || null );
        request.onerror   = () => reject(  request.error  );
    });
}


/**
 * Speichert einen neuen Protokolleintrag für eine bestimmte Lehrveranstaltung 
 * und ein bestimmtes Datum in der Datenbank.
 *
 * @param {number} idVorlesung ID (Primärschlüssel) der Lehrveranstaltung
 * 
 * @param {string} datum Datum des Protokolleintrags
 * 
 * @param {string} thema Eigentlicher Inhalt, z.B. behandelte Themen
 *
 * @returns {Promise<number>} Promise mit ID des neu erstellten Protokolleintrags
 */
async function speichereProtokollEintrag( idVorlesung, datum, thema ) {

    const datenbank = await holeDatenbankVerbindung();

    // Erst prüfen, ob Lehrveranstaltung mit dieser ID existiert
    const lehrveranstaltung = await getLehrveranstaltungById( idVorlesung );
    if ( !lehrveranstaltung ) {

        throw new Error( `Keine Lehrveranstaltung mit ID=${idVorlesung} gefunden.` );
    }

    return new Promise( ( resolve, reject ) => {

        const tx      = datenbank.transaction( STORE_PROTOKOLLEINTRAG, "readwrite" );
        const store   = tx.objectStore( STORE_PROTOKOLLEINTRAG );
        const request = store.add({ vorlesungId: idVorlesung, datum: datum, thema: thema });

        request.onsuccess = () => resolve( request.result );
        request.onerror   = () => reject(  request.error  );
    });
}


/**
 * Holt alle Protokolleinträge für eine bestimmte Lehrveranstaltung.
 *
 * @param {number} idVorlesung ID der Lehrveranstaltung
 * 
 * @returns {Promise<Array>} Promise mit Array aller Protokolleinträge, 
 *                           aufsteigend nach Datum sortiert
 */
async function getAlleProtokolleintraege( idVorlesung ) {

    const datenbank = await holeDatenbankVerbindung();

    return new Promise( ( resolve, reject ) => {

        const tx      = datenbank.transaction( STORE_PROTOKOLLEINTRAG, "readonly" );
        const store   = tx.objectStore( STORE_PROTOKOLLEINTRAG );
        const index   = store.index( "vorlesungId" );
        const request = index.getAll( idVorlesung );

        request.onsuccess = () => {

            const protokolleintraege = request.result;
            protokolleintraege.sort( (a, b) => a.datum.localeCompare(b.datum) );
            resolve( protokolleintraege );
        };
        request.onerror   = () => reject(  request.error  );
    });
}
