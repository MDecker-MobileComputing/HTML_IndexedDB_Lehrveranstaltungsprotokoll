"use strict";


let inputNeueLehrveranstaltung = null;
let buttonAnlegen = null;


/**
 * Event-Handler, der aufgerufen wird, wenn die Webseite geladen wurde.
 */
window.addEventListener( "load", async function () {

    inputNeueLehrveranstaltung = document.getElementById( "inputNeueLehrveranstaltung" );

    buttonAnlegen = document.getElementById( "buttonAnlegen" );
    buttonAnlegen.addEventListener( "click", onNeueLehrveranstaltungAnlegen );
});


/**
 * Event-Handler für Button zum Anlegen einer neuen Lehrveranstaltung.
 */
async function onNeueLehrveranstaltungAnlegen() {

    let neueLehrveranstaltung = inputNeueLehrveranstaltung.value.trim();

    if ( !neueLehrveranstaltung ) {

        alert( "Bitte geben Sie eine Lehrveranstaltung ein." );
        return;
    }

    try {

        const id = await neueLehrveranstaltung( neueLehrveranstaltung );
        console.log( `Neue Lehrveranstaltung unter ID=${id} angelegt: \"${neueLehrveranstaltung}\"` );

    } catch ( fehler ) {

        alert( `Fehler beim Anlegen der Lehrveranstaltung \"${fehler.message}\".` );
        console.error( `Fehler beim Anlegen der Lehrveranstaltung \"${fehler.message}\":`, fehler );
    }

}
