define(["jquery"], function($) {
        "use strict";

        class UI {
                constructor(container) {
                        this.$cnt = $(container);
                }

                renderSkeleton() {
                        this.$cnt.html
                                (`
        <div class="cognos-extractor-wrapper" style="font-family: sans-serif; padding: 15px;">
            <div id="status-bar" style="background: #f8f9fa; padding: 10px; border-radius: 4px; margin-bottom: 15px; border-left: 4px solid #005fb8;">
                Ready to load model...
            </div>
            
            <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 20px;">
                <input type="file" id="xml-upload" accept=".xml" />
                <input type="text" id="search-box" placeholder="Search tables or columns..." 
                       style="flex-grow: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
            </div>

            <div id="data-preview"></div>
            
            <div id="pagination-controls" style="margin-top: 20px; text-align: center; display: none;">
                <button id="load-more" style="padding: 10px 20px; cursor: pointer; background: #005fb8; color: white; border: none; border-radius: 4px;">
                    Load More Results
                </button>
            </div>
        </div>

            `)
                }

                updateStatus(msg) {
                        this.$cnt.find("#status-bar").text(msg);
                }


                displayModel(tables, append = false) { // Add 'append = false' here
                        const $preview = this.$cnt.find("#data-preview");

                        // Als we niet 'bijplakken', maken we de lijst eerst leeg
                        if (!append) $preview.empty();

                        // Check of er resultaten zijn
                        if (tables.length === 0 && !append) {
                                $preview.html("<p style='color: #666;'>Geen resultaat gevonden voor ingevoerde zoekterm.</p>");
                                return; // Stop de functie hier
                        }

                        tables.forEach(table => {
                                const badgeColor = table.layer === 'Data' ? '#4caf50' : '#ff9800';

                                // Alleen een folder-prefix tonen als er een folder is gevonden
                                const folderPrefix = table.folder
                                        ? `<span style="opacity: 0.7; font-weight: normal; font-size: 0.9em;">${table.folder} / </span>`
                                        : "";

                                const columnList = table.columns.map(col =>
                                        `<span style="display:inline-block; background:#ddd; padding:2px 8px; margin:2px; border-radius:4px; font-family:sans-serif; font-size:11px;">${col}</span>`
                                ).join("");

                                const html = `
                                    <div style="margin-top:20px; border:1px solid #005fb8; border-radius:5px; position:relative; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                                      <div style="background:#005fb8; color:white; padding:8px 12px; display:flex; justify-content:space-between; align-items:center;">
                                          <div style="display: flex; align-items: center; gap: 5px;">
                                              <span style="font-size: 1.1em;">📂</span>
                                              <span style="font-weight:bold;">${folderPrefix}${table.name}</span>
                                          </div>
                                          <span style="background:${badgeColor}; color:white; font-size:10px; padding:2px 6px; border-radius:3px; text-transform:uppercase; font-weight:bold; letter-spacing: 0.5px;">
                                              ${table.layer}
                                          </span>
                                      </div>
                                      <div style="padding:15px; background: white;">
                                              <pre style="background:#f8f9fa; color: #333; padding:12px; border:1px solid #dee2e6; border-radius:3px; white-space:pre-wrap; font-size:12px; font-family: 'Consolas', 'Monaco',
                                              monospace;">${table.sql}</pre>
                                          <div style="margin-top:12px;">${columnList}</div>
                                      </div>
                                  </div>
                              `;
                               $preview.append(html);
                        });
                }



                // this is the end of the class
        }
        return UI;
});
