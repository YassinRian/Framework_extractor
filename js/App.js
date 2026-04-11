define(["jquery", "./UI", "./Extractor", "./Styles"], function($, UI, Extractor, Styles) {
    "use strict";

    class App {
        constructor() {
            this.extractor = new Extractor();
            this.ui = null;

            // laad styles direct tijdens het instantieren van de class
            Styles.inject();
        }

        draw(oControlHost) {
            this.ui = new UI(oControlHost.container);
            this.ui.renderSkeleton();

            // Delegate events
            $(oControlHost.container).on("change", "#xml-upload", (e) => this.handleUpload(e));
        }

        async handleUpload(e) {
            const file = e.target.files[0];
            if (!file) return;

            this.ui.updateStatus("Analyzing" + file.name + "...");

            try {
                const xmlDoc = await this.extractor.parseFile(file);

                // let's see what the root of the file is
                console.log("Root Element Name:", xmlDoc.documentElement.nodeName);
                console.log("Root Attributes:", xmlDoc.documentElement.attributes);

                // This will find the first 5 child nodes of the root to give us a clue
                const children = xmlDoc.documentElement.children;
                for (let i=0; i < Math.min(children.length, 5); i++) {
                    console.log(`Child ${i}:`, children[i].nodeName);
                }
                this.ui.updateStatus("Analysis complete. Check the F12 Console.");
            } catch (err) {
                this.ui.updateStatus("Error: " + err.message);
            }
        }
    }
    return App;
});
