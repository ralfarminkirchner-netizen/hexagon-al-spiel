/* HEXAGON-AL × AiTHENTiSCH — Backend-Client
 * Die App bleibt reines Frontend. Die Pipeline (AiTHENTiSCH / ki_tisch)
 * ist das Backend: Spielstand-Slots + Spiel-Tisch (Multi-Agenten-Beratung).
 *
 * Basis-URL-Auflösung (in dieser Reihenfolge):
 *   1. localStorage 'hexal-backend-url'  (manuell überschreibbar)
 *   2. window.HEXAL_BACKEND_URL          (Build/Host-Konstante)
 *   3. lokaler Default http://127.0.0.1:8765
 * Auf GitHub Pages zeigt der Default auf Railway (siehe RAILWAY_URL unten).
 */
(function () {
  'use strict';

  var RAILWAY_URL = 'https://ki-tisch-production.up.railway.app';

  function baseUrl() {
    try {
      var manual = localStorage.getItem('hexal-backend-url');
      if (manual && manual.trim()) return manual.trim().replace(/\/+$/, '');
    } catch (e) { /* localStorage nicht verfügbar */ }
    if (typeof window.HEXAL_BACKEND_URL === 'string' && window.HEXAL_BACKEND_URL.trim()) {
      return window.HEXAL_BACKEND_URL.trim().replace(/\/+$/, '');
    }
    if (location.hostname === '127.0.0.1' || location.hostname === 'localhost' || location.protocol === 'file:') {
      return 'http://127.0.0.1:8765';
    }
    return RAILWAY_URL;
  }

  function req(path, opts, timeoutMs) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, timeoutMs || 15000);
    return fetch(baseUrl() + path, Object.assign({ signal: ctrl.signal }, opts || {}))
      .then(function (res) {
        clearTimeout(timer);
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data.error || ('HTTP ' + res.status));
          return data;
        });
      })
      .catch(function (err) {
        clearTimeout(timer);
        throw err;
      });
  }

  window.HEXAL_API = {
    url: baseUrl,

    health: function () {
      return req('/api/health', {}, 4000);
    },

    /* Spielstand speichern: beliebiges JSON unter einem Slot-Namen. */
    saveState: function (name, state) {
      return req('/api/hexagon/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, state: state })
      });
    },

    loadState: function (name) {
      return req('/api/hexagon/state?name=' + encodeURIComponent(name));
    },

    listStates: function () {
      return req('/api/hexagon/states');
    },

    /* Spiel-Tisch fragen (Default: HEXAGON-Tisch, Dummy = kostenlos). */
    askTisch: function (topic, inputText, table) {
      return req('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: table || 'configs/tables/hexagon_tisch.yaml',
          topic: topic || 'HEXAGON-AL Spielfeld-Beratung',
          input_text: inputText || ''
        })
      }, 60000);
    }
  };
})();
