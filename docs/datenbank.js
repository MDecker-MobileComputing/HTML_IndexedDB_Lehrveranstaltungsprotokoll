"use strict";

if ( window.indexedDB ) {

    console.log( "IndexedDB ist verfügbar." );

} else {

	alert( "Web-App funktioniert nicht weil IndexedDB nicht zur Verfügung steht." );
}


const DATENBANK_NAME            = "LehrveranstaltungsProtokoll";
const STORE_LEHRVERANSTALTUNGEN = "lehrveranstaltungen";
const STORE_PROTOKOLLEINTRAG    = "protokolleintrag";


const datenbank = window.indexedDB.open( DATENBANK_NAME, 1 );


/**
 * Event-Handler für das Upgrade der Datenbank; wird auch aufgerufen,
 * wenn die Datenbank zum ersten Mal erstellt wird.
 * Hier werden die Object Stores erstellt, die für die Anwendung benötigt werden
 * (diese Objects Stores sind vergleichbar mit Tabellen in relationalen Datenbanken).
 */
datenbank.onupgradeneeded = function( event ) {

    const db = event.target.result;

    if ( !db.objectStoreNames.contains( STORE_LEHRVERANSTALTUNGEN ) ) {

        db.createObjectStore( STORE_LEHRVERANSTALTUNGEN, { keyPath: "id", autoIncrement: true } );
        console.log( `Object Store \"${STORE_LEHRVERANSTALTUNGEN}\" erstellt.` );

    } else {

        console.log( `Object Store \"${STORE_LEHRVERANSTALTUNGEN}\" existiert bereits.` );
    }
}


/**
 * Event-Handler, der aufgerufen wird, wenn die Datenbank erfolgreich geöffnet wurde.
 */
datenbank.onsuccess = function() {

    console.log( `Datenbank \"${DATENBANK_NAME}\" erfolgreich geöffnet.` );
}

/**
 * Event-Handler für Fehler beim Öffnen der Datenbank, z.B. wenn Speicherplatz
 * erschöpft ist oder die Datenbankdatei fehlerhaft ist.
 */
datenbank.onerror = function( event ) {

    const fehler = event.target.error;
    console.error( `Fehler beim Öffnen der Datenbank \"${DATENBANK_NAME}\": ${fehler}` );
}

async function neueLehrveranstaltung( nameLehrveranstaltung ) {

    return new Promise((resolve, reject) => {

        const tx      = datenbank.transaction( STORE_LEHRVERANSTALTUNGEN, "readwrite" );
        const store   = tx.objectStore( STORE_LEHRVERANSTALTUNGEN );
        const request = store.add( { name: nameLehrveranstaltung } );

        request.onsuccess = function() {

            resolve( request.result ); // Returns the generated ID
        };

        request.onerror = function() {

            reject( request.error );
        };
    });
}
