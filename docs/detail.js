"use strict";


let spanNameLehrveranstaltung = null;


/**
 * Event-Handler, der aufgerufen wird, wenn die Webseite geladen wurde.
 */
window.addEventListener( "load", async function () {

    spanNameLehrveranstaltung = document.getElementById( "spanNameLehrveranstaltung" );

    const urlParams = new URLSearchParams( window.location.search );
    const id = urlParams.get( "id" );

    if ( !id ) {

        alert( "Keine Lehrveranstaltung ausgewählt (URL-Parameter \"id\" fehlt )." );
        return;
    }

    const idAlsZahl = parseInt( id, 10 );

    if ( idAlsZahl ) {

        await ladeLehrveranstaltung( idAlsZahl );

    } else {

        alert( `Lehrveranstaltungs-ID "${id}" ist keine gültige Zahl.` );
    }
});


/**
 * Ladet die Lehrveranstaltung anhand der ID.
 * 
 * @param {number} id ID der Lehrveranstaltung, die geladen werden soll
 */
async function ladeLehrveranstaltung( id ) {

    try {

        const lehrveranstaltung = await getLehrveranstaltungById( id );
        if ( lehrveranstaltung ) {

            spanNameLehrveranstaltung.textContent = lehrveranstaltung.name;

        } else {

            alert( `Keine Lehrveranstaltung mit ID=${id} gefunden.`, id );
        }
    }
    catch ( fehler ) {

        console.error( "Fehler beim Laden der Lehrveranstaltung von Datenbank:", fehler );
        alert( "Fehler beim Laden der Lehrveranstaltung von Datenbank." );
        return;
    }
}