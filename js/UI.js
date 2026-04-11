define(["jquery"], function($) {
    "use strict";

    class UI {
        constructor(container) {
            this.$cnt = $(container);
        }

        renderSkeleton() {
            this.$cnt.html
            (`
              <div class="cognos-custom-control">
                <input type="file" id="xml-upload" accept=".xml"/>
                <div id="status-bar">Bestand wordt geladen...</div>
              </div>
            `)
        }

        updateStatus(msg) {
            this.$cnt.find("#status-bar").text(msg);
        }

        displayResults(data) {
            const $preview = this.$cnt.find("#data-preview");
            $preview.empty();
            data.slice(0, 50).forEach(item => {
                $preview.append(`${item.nodeName}: ${item.textContent.substring(0, 50)}`);
            })
        }
    }
    return UI;
});
