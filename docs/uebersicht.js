"use strict";


let inputNeueLehrveranstaltung = null;
let buttonAnlegen              = null;

let divVeranstaltungen = null;


/**
 * Event-Handler, der aufgerufen wird, wenn die Webseite geladen wurde.
 */
window.addEventListener( "load", async function () {

    inputNeueLehrveranstaltung = document.getElementById( "inputNeueLehrveranstaltung" );
    divVeranstaltungen         = document.getElementById( "divVeranstaltungen"         );

    buttonAnlegen = document.getElementById( "buttonAnlegen" );
    buttonAnlegen.addEventListener( "click", onNeueLehrveranstaltungAnlegen );

    await lehrveranstaltungenAnzeigen();
});


/**
 * Liste der Lehrveranstaltungen von Datenbank lesen und anzeigen.
 */
async function lehrveranstaltungenAnzeigen() {

    const lehrveranstaltungen = await alleLehrveranstaltungen();

    divVeranstaltungen.innerHTML = "";

    if ( lehrveranstaltungen.length === 0 ) {

        divVeranstaltungen.innerHTML = "<p>Es sind keine Lehrveranstaltungen vorhanden.</p>";
        return;
    }

    lehrveranstaltungen.forEach( (veranstaltung) => {

        const div = document.createElement( "div" );
        div.className = "lehrveranstaltung-item";
        div.innerHTML = `<a href="detail.html?id=${veranstaltung.id}">${veranstaltung.name}</a>`;
        divVeranstaltungen.appendChild( div );
    });
}


/**
 * Event-Handler für Button zum Anlegen einer neuen Lehrveranstaltung.
 */
async function onNeueLehrveranstaltungAnlegen( event ) {

    event.preventDefault();

    const nameLehrveranstaltung = inputNeueLehrveranstaltung.value.trim();

    if ( !nameLehrveranstaltung ) {

        alert( "Bitte geben Sie eine Lehrveranstaltung ein." );
        return;
    }

    try {

        const id = await neueLehrveranstaltung( nameLehrveranstaltung );
        console.log( `Neue Lehrveranstaltung unter ID=${id} angelegt: \"${nameLehrveranstaltung}\"` );

        inputNeueLehrveranstaltung.value = "";

        await lehrveranstaltungenAnzeigen();

    } catch ( fehler ) {

        alert( `Fehler beim Anlegen der Lehrveranstaltung \"${fehler.message}\".` );
        console.error( `Fehler beim Anlegen der Lehrveranstaltung \"${fehler.message}\":`,
                       fehler );
    }
}
