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

                        try {
                                await this.extractor.parseFile(file);

                                // Get the full array for Datalaag
                                const dataLayer = this.extractor.getLayerData('Datalaag');

                                if (dataLayer.length > 0) {
                                        // Send the array to the UI
                                        this.ui.displayModel([dataLayer[0]]);
                                        this.ui.updateStatus(`Weergeven van ${dataLayer[0].name}`);
                                }

                        } catch (err) {
                                this.ui.updateStatus("Fout: " + err.message);
                        }
                }


        }
        return App;
});
