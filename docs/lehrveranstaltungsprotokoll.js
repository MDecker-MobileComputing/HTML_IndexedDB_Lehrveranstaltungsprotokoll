"use strict";

let pZitat = null;
let pAutor = null;


/**
 * Event-Handler, der aufgerufen wird, wenn die Webseite geladen wurde.
 */
window.addEventListener( "load", async function () {

    pZitat = document.getElementById( "zitatText"  );
    pAutor = document.getElementById( "zitatAutor" );

    await zitatLaden();

});


/**
 * Zitat von Supabase laden und auf der Webseite anzeigen.
 */
async function zitatLaden() {

    const supabaseClient = supabase.createClient(
            "https://annymgkbnrknvkjnhdhy.supabase.co",
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubnltZ2tibnJrbnZram5oZGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDM4NzAsImV4cCI6MjA2NzgxOTg3MH0.tJTJmU_jrlEBHpFk3_TUWVLyvVDLoVPk64Dnq7hgf6U"
    );

    const { data, fehler } = await supabaseClient.rpc( "get_zufaelliges_zitat" );
    if ( fehler ) {

        zeigeFehler( fehler );
        return;
    }

    if ( !data || data.length === 0 ) {

        zeigeFehler( "Leere Antwort von Server erhalten." );
        return;
    }

    pZitat.textContent = data[0].zitat;
    pAutor.textContent = data[0].autor;
}


/**
 * Hilfsfunktion zum Anzeigen eines Fehlers auf JavaScript-Konsole
 * und auf Webseite.
 */
function zeigeFehler( fehler ) {

    console.error( fehler );

    pZitat.textContent = "Fehler: " + fehler;
    pAutor.textContent = "";
}
