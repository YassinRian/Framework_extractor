define(["jquery"], function ($) {
  "use strict";

  class UI {
    constructor(container, app) {
      this.$cnt = $(container);
      this.app = app; // Reference to app to access timeMachine
    }

    renderSkeleton() {
      this.$cnt.html(`
                <div class="cognos-extractor-wrapper" style="font-family: sans-serif; padding: 15px;">
                    <div id="status-bar" style="background: #f8f9fa; padding: 10px; border-radius: 4px; margin-bottom: 15px; border-left: 4px solid #005fb8;">
                        Ready to load model...
                    </div>

                    <div class="time-travel-panel" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: #fcfcfc; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 20px;">
                        <span class="time-label" style="font-size: 11px; font-weight: 800; color: #005fb8; text-transform: uppercase; letter-spacing: 1px;">🕒 Time Travel</span>
                        <select id="time-range-select" style="padding: 4px 8px; border-radius: 4px; border: 1px solid #ccc; font-size: 12px;">
                            <option value="all">Anytime (Full Model)</option>
                            <option value="1">Last 24 Hours</option>
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                            <option value="90">Last 90 Days</option>
                        </select>
                        <span id="time-info-msg" style="font-size: 11px; color: #666; font-style: italic;"></span>
                    </div>

                    <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 20px;">
                        <input type="file" id="xml-upload" accept=".xml" />
                        <input type="text" id="search-box" placeholder="Zoek tabellen of kolommen..."
                               style="flex-grow: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
                    </div>

                    <div id="layer-tabs" style="display: flex; gap: 5px; margin-bottom: 15px;">
                        <button class="layer-tab active" data-layer="all">Alles</button>
                        <button class="layer-tab" data-layer="Data">Datalaag</button>
                        <button class="layer-tab" data-layer="Model">Modellaag</button>
                    </div>

                    <div id="data-preview"></div>

                    <div id="pagination-controls" style="margin-top: 20px; text-align: center; display: none;">
                        <button id="load-more" style="padding: 10px 20px; cursor: pointer; background: #005fb8; color: white; border: none; border-radius: 4px;">
                            Load More Results
                        </button>
                    </div>
                </div>
            `);
    }

    updateStatus(msg) {
      this.$cnt.find("#status-bar").text(msg);
    }

    displayModel(tables, append = false) {
      const $preview = this.$cnt.find("#data-preview");
      const searchTerm = $("#search-box").val() || "";

      if (!append) $preview.empty();

      tables.forEach((table) => {
        let sqlContent = "";

        if (table.layer === "Model") {
          sqlContent = this.generateVirtualSQL(table);
        } else {
          sqlContent = table.sql && table.sql.length > 5 ? table.sql : "/* Geen SQL bron gevonden in Datalaag */";
        }

        const highlightedSQL = this.highlightSQL(sqlContent);
        const searchHighlightedSQL = this.highlightText(highlightedSQL, searchTerm);

        // --- TIME TRAVEL LOGIC FOR TABLE ---
        const isTableModified = this.app.timeMachine.isModified(table.lastModified);
        const tableRecentBadge = isTableModified 
            ? `<span class="modified-indicator" title="Gewijzigd op: ${table.lastModified.toLocaleString()} door ${table.modifiedBy}">MODIFIED</span>` 
            : "";

        // --- TIME TRAVEL LOGIC FOR COLUMNS ---
        const columnList = table.columns
          .map((col) => {
            const hName = this.highlightText(col.name, searchTerm);
            const isColModified = this.app.timeMachine.isModified(col.lastModified);
            
            // Gebruik oranje badge als de kolom recent gewijzigd is
            const badgeClass = isColModified ? "column-badge-modified" : "column-badge";
            const tooltip = isColModified 
                ? `title="Gewijzigd op: ${col.lastModified.toLocaleString()} door ${col.modifiedBy}"` 
                : "";

            return `<span class="${badgeClass}" ${tooltip}>${hName}</span>`;
          })
          .join("");

        const html = `
            <div class="card">
                <div class="card-header">
                    <div class="breadcrumb-wrapper" title="Klik om het volledige pad te zien/verbergen">
                        <span style="color: #ffc107; margin-right: 5px; flex-shrink: 0;">📂</span>
                        
                        <div class="path-collapsed" style="display: flex; align-items: center; overflow: hidden;">
                            <span class="path-ellipsis">...</span>
                            <span class="folder-path" style="margin-left: 5px;">${this.highlightText(table.parentFolder, searchTerm)}</span>
                        </div>

                        <div class="path-expanded" style="display: none; overflow: hidden;">
                            <span class="full-path-display">${this.highlightText(table.fullPath, searchTerm)}</span>
                        </div>

                        <span style="color: #ccc; margin: 0 8px; flex-shrink: 0;">/</span>
                        <strong class="table-name" style="color: #333; flex-shrink: 0;">
                            ${this.highlightText(table.name, searchTerm)}
                        </strong>
                        ${tableRecentBadge}
                    </div>

                    <div class="btn-group">
                        <button class="toggle-view active" data-view="grid">📊 Grid</button>
                        <button class="toggle-view" data-view="sql">⌨️ SQL</button>
                    </div>
                </div>

                <div class="view-content grid-view" style="padding: 15px;">
                    ${columnList}
                </div>

                <div class="view-content sql-view" style="padding: 0; display: none; position: relative;">
                    <button class="copy-sql-btn">Copy SQL</button>
                    <div class="sql-container clickable-sql" title="Click to toggle highlighting" data-highlight="on">
                        <pre class="sql-block highlighted-version">${searchHighlightedSQL}</pre>
                        <pre class="sql-block clean-version" style="display:none;">${highlightedSQL}</pre>
                    </div>
                </div>
            </div>`;
        $preview.append(html);
      });
    }

    highlightSQL(sql) {
      if (!sql) return "";

      // 1. Escapen voor veiligheid
      let html = sql
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      // 2. Keywords (SELECT, FROM, WHERE, etc.)
      const keywords =
        /\b(SELECT|FROM|WHERE|JOIN|LEFT|INNER|ON|AND|OR|GROUP BY|ORDER BY|CASE|WHEN|THEN|ELSE|END|AS|IN|NOT|NULL|DISTINCT)\b/gi;
      html = html.replace(keywords, '<span class="sql-keyword">$1</span>');

      // 3. Brackets [Table].[Column]
      html = html.replace(/(\[.*?\])/g, '<span class="sql-bracket">$1</span>');

      // 4. Strings 'text'
      html = html.replace(/('.*?')/g, '<span class="sql-string">$1</span>');

      // 5. Functies COUNT(), SUM(), etc.
      html = html.replace(
        /\b(COUNT|SUM|AVG|MIN|MAX|CAST|CONVERT|COALESCE)\b/gi,
        '<span class="sql-function">$1</span>',
      );

      return html;
    }

    highlightText(text, term) {
      if (!text || !term || term.length < 2) return text;

      const parts = term
        .split("::")
        .map((p) => p.trim())
        .filter((p) => p.length >= 2);
      let highlightedText = text;

      parts.forEach((part, index) => {
        const colorClass = `match-${index % 5}`;
        let regex;

        try {
          // PROBEER: Gebruik de term direct als Regex (voor ^, $, |, etc.)
          // We wrappen het in haakjes () zodat we $1 kunnen gebruiken voor de match
          regex = new RegExp(`(${part})`, "gi");
        } catch (e) {
          // FALLBACK: Als de Regex ongeldig is (bijv. een losse [ ),
          // dan ontsnappen we de tekens en zoeken we letterlijk.
          regex = new RegExp(`(${this.escapeRegExp(part)})`, "gi");
        }

        // Gebruik $1 om de exact gevonden tekst (met behoud van casing) terug te zetten
        highlightedText = highlightedText.replace(
          regex,
          `<span class="search-match ${colorClass}">$1</span>`,
        );
      });

      return highlightedText;
    }

    // Hulpmiddel om speciale tekens in de zoekterm te ontsnappen (zoals . of *)
    escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }


    generateVirtualSQL(table) {
      if (!table.columns || table.columns.length === 0) return "-- Geen kolommen gevonden --";

      let rawLines = [];
      let physicalTable = "BRONTABEL";
      let aliasName = "ALIAS";

      table.columns.forEach((col) => {
        const lineage = col.lineage || [];
        const aliasMatch = lineage[0]?.match(/\[.*?\]\.\[(.*?)\]/);
        const sourceMatch = lineage[lineage.length - 1]?.match(/\[.*?\]\.\[(.*?)\]\.\[(.*?)\]/);

        if (sourceMatch && aliasMatch) {
          physicalTable = sourceMatch[1];
          aliasName = aliasMatch[1];
          const sourcePart = `${aliasName}.${sourceMatch[2]}`;
          rawLines.push({ source: sourcePart, alias: `"${col.name}"` });
        }
      });

      if (rawLines.length === 0) return "-- Geen lineage data beschikbaar --";

      const maxLength = Math.max(...rawLines.map((l) => l.source.length));

      const selectLines = rawLines.map((line, index) => {
        const prefix = index === 0 ? " " : ",";
        const padding = " ".repeat(maxLength - line.source.length);
        return `${prefix}${line.source}${padding} AS ${line.alias}`;
      });

      return `SELECT\n${selectLines.join("\n")}\nFROM ${physicalTable} ${aliasName}`;
    }
  }
  return UI;
});