/* Marcado del tablero, tomado del prototipo aprobado (index.html). torre.js lo llena por id. */

/** Chip de corte, junto al titulo del header. */
export const HEADER_CUT_HTML = `<div class="cut">
          <div class="chip-cut has-card" tabindex="0">
            <span class="dot"></span><span class="num" id="cutNum">—</span><span class="bar"></span>
            <button class="rf" id="refresh" aria-label="Recargar"><svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6"/></svg></button>
            <div class="hover-card"><b id="cutTitle">—</b>Datos del TMS a la hora del corte. Recargar trae el estado actual.</div>
          </div>
        </div>`;

/** Chips de filtros, Filtrar y buscador: acciones del header. El tema va en el menú del avatar (DESIGN.md §4.9). */
export const HEADER_ACTIONS_HTML = `<div class="fchips" id="fchips"></div>
      <button class="hbtn" id="filterBtn">Filtrar <span class="badge" id="fbadge" hidden>0</span><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></button>
      <label class="search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input id="q" type="search" placeholder="Buscar usuario, PSL…" autocomplete="off"><button class="x" id="qx" hidden aria-label="Limpiar">×</button></label>`;

/** Contenido de la pagina y capas (tooltip, toast, modales, popover de comentarios). */
export const PAGE_HTML = `<div class="page">
      <!-- fila 1: KPIs -->
      <section class="card-row kpis" id="kpis"></section>

      <!-- fila 2: costo de transporte vs costo por km -->
      <section class="card-row row2">
        <div class="card">
          <div class="c-head ch-fix">
            <h2 id="chartTitle">Costo de transporte vs costo por km</h2>
            <div class="seg" id="lineSeg" role="group" aria-label="Comparar costo con"></div>
            <label class="psel" style="margin-left:4px"><span class="sr">Periodo de la serie</span>
              <select id="period">
                <option value="d">Por día</option>
                <option value="w">Por semana</option>
                <option value="m6">6 meses</option>
                <option value="m" selected>12 meses</option>
                <option value="q">Trimestres</option>
              </select>
              <svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
            </label>
          </div>
          <div class="legend chart-legend" id="chartLg"></div>
          <div id="chart"></div>
        </div>
        <div class="card cd-card" id="compo"></div>
      </section>

      <!-- sankey: a dónde se va el costo -->
      <section class="card" id="sankey">
        <div class="c-head">
          <h2>A dónde se va el costo</h2>
          <span class="count" id="skCount" hidden></span>
          <label class="psel"><span class="sr">Periodo del treemap</span>
            <select id="skPeriod">
              <option value="cur" selected>Mes actual</option>
              <option value="prev">Mes anterior</option>
              <option value="q">Últimos 3 meses</option>
              <option value="ytd">Año corrido</option>
              <option value="y">Últimos 12 meses</option>
            </select>
            <svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
          </label>
        </div>
        <div class="sk-stages" id="skStages"></div>
        <div class="sk-crumbs" id="skCrumbs"></div>
        <div id="skChart"></div>
      </section>

      <!-- operación: seguimiento de la operación de carga -->
      <section class="card ops" id="ops">
        <div class="c-head"><h2>Seguimiento de la operación</h2><span class="count" id="opsCount"></span></div>
        <div class="ops-pipe" id="opsPipe"></div>
        <div class="ops-alerts" id="opsAlerts"></div>
        <div class="ops-grid">
          <div class="ops-list">
            <div class="c-head sm"><h3 id="opsListT">TRs que requieren atención</h3><span class="count" id="opsListN"></span><button type="button" class="dl" data-x="ops" aria-label="Descargar en Excel" title="Descargar en Excel" hidden style="margin-left:2px"><svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg></button></div>
            <div class="ops-wrap" id="opsWrap"></div>
          </div>
          <div class="ops-app" id="opsApp" hidden></div>
        </div>
      </section>

      <!-- fila 3: usuarios -->
      <section class="card" id="users" hidden>
        <div class="c-head">
          <h2>Usuarios que más costo generan</h2>
          <span class="count" id="uCount"></span>
          <button class="btn-primary" id="alertAll">Avisar a los usuarios en riesgo</button>
        </div>
        <div class="tbl-wrap" id="tblWrap">
          <table>
            <thead><tr id="uHead"></tr></thead>
            <tbody id="uBody"></tbody>
            <tfoot><tr id="uFoot"></tr></tfoot>
          </table>
        </div>
        <div class="rule-note" id="ruleNote"></div>
      </section>

      <!-- fila 4: estratégico -->
      <section class="card-row row4">
        <div class="card" id="contracts"></div>
        <div class="card" id="carriers"></div>
        <div class="card" id="vps"></div>
      </section>

      </div>
  </div>
</div>

<div class="tip" id="tip"></div>
<div class="toast" id="toast"></div>
<div class="overlay" id="overlay" hidden></div>
<div class="overlay" id="segOv" hidden></div>
<div class="overlay" id="aiOv" hidden></div>
<div class="cm-pop" id="cmPop" hidden role="dialog" aria-label="Comentarios de seguimiento"></div>`;
