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
async function alleLehrveranstaltungen() {

    const datenbank = await holeDatenbankVerbindung();

    return new Promise( ( resolve, reject ) => {

        const tx      = datenbank.transaction( STORE_LEHRVERANSTALTUNGEN, "readonly" );
        const store   = tx.objectStore( STORE_LEHRVERANSTALTUNGEN );
        const request = store.getAll();

        request.onsuccess = () => resolve( request.result );
        request.onerror   = () => reject(  request.error  );
    });
}
