define([], function() {
        "use strict";

        class Extractor {
                constructor() {
                        this.xmlDoc = null;
                }

                async parseFile(file) {
                        const text = await file.text();
                        this.xmlDoc = new DOMParser().parseFromString(text, "text/xml");
                        if (this.xmlDoc.getElementsByTagName("parsererror").length > 0) throw new Error("Ongeldige XML");
                        return this.xmlDoc;
                }

                // Helper for Namespace-agnostic tag selection
                ln(name) { return `*[local-name()='${name}']`; }

                // Generic query method
                query(xpath, context = this.xmlDoc) {
                        const res = this.xmlDoc.evaluate(xpath, context, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                        let nodes = [];
                        for (let i = 0; i < res.snapshotLength; i++) nodes.push(res.snapshotItem(i));
                        return nodes;
                }

                /**
                 * Generic Scoped Extraction
                 * @param {string} layerName - e.g., 'Datalaag', 'Modellaag'
                 */


                getLayerData(layerName) {
                        const ln = this.ln;

                        // Stap 1: Vind de namespace scope
                        const scopePath = `//*[local-name()='namespace'][${ln('name')}='${layerName}']`;
                        const scopeNode = this.xmlDoc.evaluate(scopePath, this.xmlDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

                        if (!scopeNode) return [];

                        // Stap 2: Pak alle querySubjects (gebruik de index 'i' voor de console log)
                        return this.query(`.//${ln('querySubject')}`, scopeNode).map((qs, i) => {
                                const name = this.xmlDoc.evaluate(`./${ln('name')}`, qs, null, XPathResult.STRING_TYPE, null).stringValue;

                                // Gebruik .// om SQL diep in de structuur te vinden
                                const sqlNode = this.xmlDoc.evaluate(`.//${ln('sql')}`, qs, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

                                // Gebruik .// om queryItems overal binnen dit querySubject te vinden
                                const columnNodes = this.query(`.//${ln('queryItem')}/${ln('name')}`, qs);

                                // Alleen loggen voor het eerste item om de console schoon te houden
                                if (i === 0) {
                                        console.log("Debug D_GEBRUIKER:", {
                                                hasSql: !!sqlNode,
                                                columnCount: columnNodes.length,
                                                rawSql: sqlNode ? sqlNode.textContent.substring(0, 50) : "Niet gevonden"
                                        });
                                }

                                return {
                                        name: name,
                                        sql: sqlNode ? sqlNode.textContent.trim() : "SQL NIET GEVONDEN",
                                        columns: columnNodes.map(n => n.textContent)
                                };
                        });
                }






        }

        return Extractor;
});
