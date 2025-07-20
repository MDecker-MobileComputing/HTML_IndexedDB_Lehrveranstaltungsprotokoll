"use strict";


let spanNameLehrveranstaltung = null;
let inputDatum                = null;
let inputThema                = null;
let buttonSpeichern           = null;
let divProtokolleintraege     = null;
let linkPdfDownload           = null;

let idAlsZahl = -1;


/**
 * Event-Handler, der aufgerufen wird, wenn die Webseite geladen wurde.
 */
window.addEventListener( "load", async function () {

    spanNameLehrveranstaltung = document.getElementById( "spanNameLehrveranstaltung" );

    inputDatum            = document.getElementById( "inputDatum"            );
    inputThema            = document.getElementById( "inputThema"            );
    buttonSpeichern       = document.getElementById( "buttonSpeichern"       );
    divProtokolleintraege = document.getElementById( "divProtokolleintraege" );
    linkPdfDownload       = document.getElementById( "linkPdfDownload"       );

    buttonSpeichern.addEventListener( "click", onButtonSpeichernClick );
    linkPdfDownload.addEventListener( "click", onLinkPdfDownloadClick );

    inputDatumAufHeutigesDatumSetzen();

    const queryString = window.location.search;
    const urlParams   = new URLSearchParams( queryString );
    const id          = urlParams.get( "id" );

    if ( !id ) {

        alert( "Keine Lehrveranstaltung ausgewählt (URL-Parameter \"id\" fehlt )." );
        return;
    }

    idAlsZahl = parseInt( id, 10 );
    if ( idAlsZahl ) { await ladeLehrveranstaltung( idAlsZahl ); }
    else { alert( `Lehrveranstaltungs-ID "${id}" ist keine gültige Zahl.` ); }
});


/**
 * Setzt das Datum im Eingabefeld auf das heutige Datum; das heutige Datum wird auch als maximaler Wert gesetzt,
 * um sicherzustellen, dass keine Eintträge in der Zukunft möglich sind.
 */
function inputDatumAufHeutigesDatumSetzen() {
    
    const heute          = new Date();
    const heuteISOString = heute.toISOString();         // Vollständiger ISO-String, z.B. "2023-10-01T12:00:00.000Z"
    const datumTeile     = heuteISOString.split( "T" ); // Aufteilen in Datum- und Zeit-Teile
    const heuteISO       = datumTeile[ 0 ];             // Datum-Teil extrahieren: YYYY-MM-DD

    inputDatum.value = heuteISO;   // Heutiges Datum als Standardwert setzen
    inputDatum.max   = heuteISO;   // Maximales Datum auf heute begrenzen
}


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
            await protokolleintraegeAnzeigen();

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


/**
 * Event-Handler für Button zum Anlegen eines neuen Protokoll-Eintrags.
 */
async function onButtonSpeichernClick( event ) {

    event.preventDefault();

    if ( idAlsZahl < 0 ) {

        alert( "Keine gültige Lehrveranstaltung ausgewählt." );
        return;
    }

    const datum = inputDatum.value.trim();
    const thema = inputThema.value.trim();

    if ( !datum || !thema ) {

        alert( "Bitte füllen Sie beide Felder aus." );
        return;
    }

    try {

        await speichereProtokollEintrag( idAlsZahl, datum, thema );
        
        inputThema.value = "";
        await protokolleintraegeAnzeigen();

    } catch ( fehler ) {

        console.error( "Fehler beim Speichern des Eintrags:", fehler );
        alert( "Fehler beim Speichern des Eintrags." );
    }
} 

const datumFormatOptionen     = { day: "2-digit", month: "2-digit", year: "numeric" };
const wochentagFormatOptionen = { weekday: "short" };
const uhrzeitFormatOptionen   = { hour: "2-digit", minute: "2-digit" };


/**
 * Lädt und zeigt alle Protokolleinträge für die aktuell ausgewählte Lehrveranstaltung an.
 */
async function protokolleintraegeAnzeigen() {

    if ( idAlsZahl < 0 ) {

        alert( "Keine gültige Lehrveranstaltung ausgewählt." );
        return;
    }

    try {

        const protokolleintraegeArray = await getAlleProtokolleintraege( idAlsZahl );

        divProtokolleintraege.innerHTML = ""; // sicherstellen, dass der Container leer ist, bevor neue Einträge hinzugefügt werden

        protokolleintraegeArray.forEach( (eintrag) => {

            // Datum von ISO-Format (YYYY-MM-DD) in deutsches Format umwandeln
            const datumISO    = eintrag.datum; // z.B. "2025-07-03"
            const datumObjekt = new Date( datumISO + "T00:00:00" );
            
            const datumOhneWochentag = datumObjekt.toLocaleDateString( "de-DE", datumFormatOptionen     );
            const wochentag          = datumObjekt.toLocaleDateString( "de-DE", wochentagFormatOptionen );
            
            // Zusammenfügen: "03.07.2025 (Do)"
            const datumFormatiert = `${datumOhneWochentag} (${wochentag})`;
            
            const div = document.createElement( "div" );
            div.className = "protokoll-eintrag";
            div.innerHTML = `<strong>${datumFormatiert}</strong>: ${eintrag.thema}`;
            divProtokolleintraege.appendChild( div );
        });
    }
    catch ( fehler ) {

        console.error( "Fehler beim Laden der Protokolleinträge:", fehler );
        alert( "Fehler beim Laden der Protokolleinträge." );
        return;
    }
}


/**
 * Event-Handler für Erzeugung PDF-Export mit jsPDF.
 */
async function onLinkPdfDownloadClick( event ) {

    event.preventDefault();
    
    if ( idAlsZahl < 0 ) {
        alert( "Keine gültige Lehrveranstaltung ausgewählt." );
        return;
    }

    const protokolleintraegeArray = await getAlleProtokolleintraege( idAlsZahl );

    if ( protokolleintraegeArray.length === 0 ) {

        alert( "Leeres Protokoll, kann kein PDF erzeugen." );
        return;
    }

    try {

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Lehrveranstaltungsname holen
        const lehrveranstaltungsName = spanNameLehrveranstaltung.textContent;

        // PDF-Metadaten setzen
        const dokumententitel = `Lehrveranstaltungsprotokoll für ${lehrveranstaltungsName}`;
        doc.setProperties({
            title: dokumententitel,
            subject: "Lehrveranstaltungsprotokoll",
            author: "Lehrveranstaltungsprotokoll (Demo für IndexedDB)",
            creator: "jsPDF"
        });

        // Überschrift
        doc.setFontSize(16);
        doc.text( `Lehrveranstaltungsprotokoll: ${lehrveranstaltungsName}`, 20, 20);

        // Erstellungsdatum und -zeit in Fußzeile
        const jetzt = new Date();
        const erstellungsdatum = jetzt.toLocaleDateString( "de-DE", datumFormatOptionen );

        const erstellungszeit = jetzt.toLocaleTimeString("de-DE", uhrzeitFormatOptionen );
        const footerText = `Erstellt am ${erstellungsdatum} um ${erstellungszeit} Uhr`;

        const addFooter = () => {
            doc.setFontSize( 10 );
            doc.setFont( undefined, "normal" );
            doc.text( footerText, 20, pageHeight - 10 );
        };

        const protokolleintraegeArray = await getAlleProtokolleintraege( idAlsZahl );

        doc.setFontSize( 12 );
        let yPosition = 55;
        const lineHeight = 8;
        const pageHeight = doc.internal.pageSize.height;

        protokolleintraegeArray.forEach( (eintrag) => {
            // Prüfen ob neue Seite benötigt wird
            if ( yPosition > pageHeight - 40 ) { // Mehr Platz für Footer lassen
                addFooter(); // Footer auf aktuelle Seite
                doc.addPage();
                yPosition = 20;
            }

            const datumISO = eintrag.datum;
            const datumObjekt        = new Date( datumISO + "T00:00:00" );
            const datumOhneWochentag = datumObjekt.toLocaleDateString( "de-DE", datumFormatOptionen );
            const wochentag          = datumObjekt.toLocaleDateString( "de-DE", wochentagFormatOptionen );
            const datumFormatiert = `${datumOhneWochentag} (${wochentag})`;

            // Datum (fett)
            doc.setFont( undefined, "bold" );
            doc.text( datumFormatiert + ":", 20, yPosition );
            
            // Thema (normal)
            doc.setFont( undefined, "normal" );
            const themaLines = doc.splitTextToSize( eintrag.thema, 150 );
            doc.text( themaLines, 70, yPosition );
            
            yPosition += lineHeight * themaLines.length + 5;
        });

        // Footer auf letzte Seite hinzufügen
        addFooter();

        // PDF-Datei unter einem spezifischen Namen speichern
        const bereinigterName = lehrveranstaltungsName.replace( /[^a-zA-Z0-9äöüÄÖÜß]/g, "_" );
        const dateiname       = `Protokoll_${bereinigterName}.pdf`;
        doc.save( dateiname );
        
    } catch ( fehler ) {

        console.error( "Fehler beim Erstellen der PDF:", fehler );
        alert( "Fehler beim Erstellen der PDF-Datei." );
    }
}
