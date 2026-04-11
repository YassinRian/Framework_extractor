define([], function() {
    "use strict";

    class Extractor {
        constructor() {
            this.xmlDoc = null;
        }


        async parseFile(file) {
            const text = await file.text();
            const parser = new DOMParser();
            this.xmlDoc = parser.parseFromString(text, "text/xml");

            if (this.xmlDoc.getElementsByTagName("parsererror").length > 0) {
                throw new Error("Invalide XML formaat")
            }
            return this.xmlDoc;
        }

        query(xpath) {
            if (!this.xmlDoc) return [];                                              // als xmlDoc nog is niet ingeladen stopt de functie hier, return is een lege array.
            const result = this.xmlDoc.evaluate(
                xpath,                                                                // string patroon
                this.xmlDoc,                                                          // het xml bestand
                null,                                                                 // namespace resover
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,                               // static snapshot for performance redenen
                null
            );                                                                        // De evaluate functie geeft een XPathResult object terug, deze plaatsen we in een array om het makkelijk te maken om ermee te werken.

            let nodes = [];
            for (let i=0; i < result.snapshotLength; i++) {
                node.push(result.snapshotItem(i));
            }
            return nodes;
        }
    }
    return Extractor
});
