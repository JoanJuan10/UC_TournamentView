// ==UserScript==
// @name         UC Tournament View
// @namespace    https://github.com/JoanJuan10/UC_TournamentView
// @version      0.1.0
// @description  Plugin para UnderScript que mejora la vista de espectador en Undercards.net con plantillas modernas
// @author       JoanJuan10
// @match        https://undercards.net/*
// @require      https://github.com/UCProjects/UnderScript/releases/latest/download/undercards.user.js
// @grant        none
// @run-at       document-body
// ==/UserScript==

(function() {
    'use strict';

    // Registro del plugin
    const plugin = underscript.plugin('TournamentView', '0.1.0');
    const settings = plugin.settings();
    
    // Setting básico de activación
    const isEnabled = settings.add({
        key: 'enabled',
        name: 'Activar Tournament View',
        type: 'boolean',
        default: true,
    });
    
})();
