const underscript = window.underscript;
const plugin = underscript.plugin('TournamentView', GM_info.version);

// ============================================
// I18N SYSTEM
// ============================================

class I18n {
    constructor() {
        this.currentLanguage = 'es';
        this.translations = {
            es: {
                // UI Labels
                'ui.turn': 'Turno',
                'ui.toggleHistory': 'Mostrar/Ocultar Historial',
                'ui.historyTitle': 'Historial de Acciones',
                'ui.waitingHistory': 'Esperando historial del juego...',
                'ui.noActions': 'Sin acciones registradas aún',
                'ui.totalTurns': 'Turnos totales:',
                'ui.finalHP': 'HP Final:',
                'ui.hand': 'Mano',
                'ui.deck': 'Mazo',
                'ui.graveyard': 'Cementerio',
                
                // Game Results
                'result.victory': '¡VICTORIA!',
                'result.defeat': 'DERROTA',
                
                // Notifications
                'notif.receivedDamage': '{player} recibió {damage} de daño',
                'notif.healed': '{player} sanó {heal} HP',
                'notif.cardPlayed': '{player} jugó {card}',
                'notif.spellCast': '{player} lanzó {spell}',
                'notif.monsterDestroyed': '{monster} fue destruido',
                'notif.artifactActivated': 'Artefacto activado: {artifact}',
                'notif.soulEffect': 'Efecto de alma: {soul}',
                
                // Settings
                'settings.enabled': 'Activar Tournament View',
                'settings.language': 'Idioma',
                'settings.languageDesc': 'Seleccionar idioma de la interfaz',
                'settings.template': 'Plantilla Visual',
                'settings.templateDesc': 'Seleccionar estilo visual de la interfaz',
                'settings.exportTemplate': 'Exportar Plantilla',
                'settings.exportTemplateDesc': 'Descargar la plantilla actual como archivo JSON',
                'settings.importTemplate': 'Importar Plantilla',
                'settings.importTemplateDesc': 'Cargar una plantilla personalizada desde archivo',
                
                // Player defaults
                'player.default': 'Jugador',
                'player.opponent': 'Oponente',
            },
            en: {
                // UI Labels
                'ui.turn': 'Turn',
                'ui.toggleHistory': 'Toggle History',
                'ui.historyTitle': 'Action History',
                'ui.waitingHistory': 'Waiting for game history...',
                'ui.noActions': 'No actions recorded yet',
                'ui.totalTurns': 'Total Turns:',
                'ui.finalHP': 'Final HP:',
                'ui.hand': 'Hand',
                'ui.deck': 'Deck',
                'ui.graveyard': 'Graveyard',
                
                // Game Results
                'result.victory': 'VICTORY!',
                'result.defeat': 'DEFEAT',
                
                // Notifications
                'notif.receivedDamage': '{player} received {damage} damage',
                'notif.healed': '{player} healed {heal} HP',
                'notif.cardPlayed': '{player} played {card}',
                'notif.spellCast': '{player} cast {spell}',
                'notif.monsterDestroyed': '{monster} was destroyed',
                'notif.artifactActivated': 'Artifact activated: {artifact}',
                'notif.soulEffect': 'Soul effect: {soul}',
                
                // Settings
                'settings.enabled': 'Enable Tournament View',
                'settings.language': 'Language',
                'settings.languageDesc': 'Select interface language',
                'settings.template': 'Visual Template',
                'settings.templateDesc': 'Select interface visual style',
                'settings.exportTemplate': 'Export Template',
                'settings.exportTemplateDesc': 'Download current template as JSON file',
                'settings.importTemplate': 'Import Template',
                'settings.importTemplateDesc': 'Load custom template from file',
                
                // Player defaults
                'player.default': 'Player',
                'player.opponent': 'Opponent',
            }
        };
    }

    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            console.log(`[TournamentView] Idioma cambiado a: ${lang}`);
            return true;
        }
        console.warn(`[TournamentView] Idioma no soportado: ${lang}`);
        return false;
    }

    t(key, params = {}) {
        const translation = this.translations[this.currentLanguage][key] || key;
        
        // Reemplazar parámetros {param} en la traducción
        return translation.replace(/\{(\w+)\}/g, (match, param) => {
            return params[param] !== undefined ? params[param] : match;
        });
    }
}

// Initialize I18n
const i18n = new I18n();

// ============================================
// GAME STATE MODULE
// ============================================

class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.isActive = false;
        this.isSpectate = false;
        this.player = {
            id: null,
            username: '',
            hp: 0,
            maxHp: 0,
            gold: 0,
            soul: '',
            soulLives: 0,
            artifacts: [],
            handCount: 0,
            deckCount: 0,
            boardCount: 0,
            graveyardCount: 0,
        };
        this.opponent = {
            id: null,
            username: '',
            hp: 0,
            maxHp: 0,
            gold: 0,
            soul: '',
            soulLives: 0,
            artifacts: [],
            handCount: 0,
            deckCount: 0,
            boardCount: 0,
            graveyardCount: 0,
        };
        this.turn = 0;
        this.currentPlayer = null;
        this.gameResult = null; // 'victory', 'defeat', or null
    }

    updatePlayer(data) {
        if (data.hp !== undefined) this.player.hp = data.hp;
        if (data.maxHp !== undefined) this.player.maxHp = data.maxHp;
        if (data.gold !== undefined) this.player.gold = data.gold;
        if (data.soul !== undefined) this.player.soul = data.soul;
        if (data.soulLives !== undefined) this.player.soulLives = data.soulLives;
        if (data.artifacts !== undefined) this.player.artifacts = data.artifacts;
        if (data.handCount !== undefined) this.player.handCount = data.handCount;
        if (data.deckCount !== undefined) this.player.deckCount = data.deckCount;
        if (data.boardCount !== undefined) this.player.boardCount = data.boardCount;
        if (data.graveyardCount !== undefined) this.player.graveyardCount = data.graveyardCount;
    }

    updateOpponent(data) {
        if (data.hp !== undefined) this.opponent.hp = data.hp;
        if (data.maxHp !== undefined) this.opponent.maxHp = data.maxHp;
        if (data.gold !== undefined) this.opponent.gold = data.gold;
        if (data.soul !== undefined) this.opponent.soul = data.soul;
        if (data.soulLives !== undefined) this.opponent.soulLives = data.soulLives;
        if (data.artifacts !== undefined) this.opponent.artifacts = data.artifacts;
        if (data.handCount !== undefined) this.opponent.handCount = data.handCount;
        if (data.deckCount !== undefined) this.opponent.deckCount = data.deckCount;
        if (data.boardCount !== undefined) this.opponent.boardCount = data.boardCount;
        if (data.graveyardCount !== undefined) this.opponent.graveyardCount = data.graveyardCount;
    }

    getState() {
        return {
            isActive: this.isActive,
            isSpectate: this.isSpectate,
            player: { ...this.player },
            opponent: { ...this.opponent },
            turn: this.turn,
            currentPlayer: this.currentPlayer,
            gameResult: this.gameResult,
        };
    }
}

// Initialize GameState
const gameState = new GameState();

// ============================================
// TEMPLATE SYSTEM
// ============================================

class TemplateManager {
    constructor() {
        this.templates = [];           // Array de todas las plantillas disponibles
        this.activeTemplate = null;    // Plantilla actualmente activa
        this.cssElement = null;
        this.customTemplates = [];     // Plantillas importadas por el usuario
        
        // Cargar plantillas predefinidas
        this.loadPredefinedTemplates();
        
        // Cargar plantillas custom desde localStorage
        this.loadCustomTemplates();
        
        // Establecer plantilla por defecto
        this.setActiveTemplate('default');
    }

    /**
     * Registra una plantilla en el sistema
     */
    registerTemplate(template) {
        // Validar estructura básica
        if (!template.metadata || !template.metadata.id) {
            console.error('[TournamentView] Plantilla inválida: falta metadata.id');
            return false;
        }
        
        // Verificar si ya existe
        const index = this.templates.findIndex(t => t.metadata.id === template.metadata.id);
        if (index >= 0) {
            // Reemplazar plantilla existente
            this.templates[index] = template;
            console.log('[TournamentView] Plantilla actualizada:', template.metadata.id);
        } else {
            // Añadir nueva plantilla
            this.templates.push(template);
            console.log('[TournamentView] Plantilla registrada:', template.metadata.id);
        }
        
        return true;
    }

    /**
     * Carga todas las plantillas predefinidas
     */
    loadPredefinedTemplates() {
        // Plantilla Default (la actual convertida a JSON)
        const defaultTemplate = this.createDefaultTemplate();
        this.registerTemplate(defaultTemplate);
        
        // Plantilla Minimal (minimalista)
        const minimalTemplate = this.createMinimalTemplate();
        this.registerTemplate(minimalTemplate);
        
        // Plantilla Esports (broadcast profesional)
        const esportsTemplate = this.createEsportsTemplate();
        this.registerTemplate(esportsTemplate);
        
        console.log('[TournamentView] Plantillas predefinidas cargadas:', this.templates.length);
    }

    /**
     * Carga plantillas personalizadas desde localStorage
     */
    loadCustomTemplates() {
        try {
            const stored = localStorage.getItem('uc_tournament_custom_templates');
            if (stored) {
                const customs = JSON.parse(stored);
                this.customTemplates = Array.isArray(customs) ? customs : [];
                
                // Registrar cada plantilla custom
                this.customTemplates.forEach(template => {
                    this.registerTemplate(template);
                });
                
                console.log('[TournamentView] Plantillas custom cargadas:', this.customTemplates.length);
            }
        } catch (error) {
            console.error('[TournamentView] Error cargando plantillas custom:', error);
            this.customTemplates = [];
        }
    }

    /**
     * Establece la plantilla activa por ID
     */
    setActiveTemplate(templateId) {
        const template = this.getTemplateById(templateId);
        
        if (!template) {
            console.error('[TournamentView] Plantilla no encontrada:', templateId);
            return false;
        }
        
        this.activeTemplate = template;
        console.log('[TournamentView] Plantilla activa:', template.metadata.name);
        return true;
    }

    /**
     * Obtiene una plantilla por su ID
     */
    getTemplateById(id) {
        return this.templates.find(t => t.metadata.id === id) || null;
    }

    /**
     * Lista todas las plantillas disponibles
     */
    listTemplates() {
        return this.templates.map(t => ({
            id: t.metadata.id,
            name: t.metadata.name,
            author: t.metadata.author,
            description: t.metadata.description,
            isCustom: this.customTemplates.some(ct => ct.metadata.id === t.metadata.id)
        }));
    }

    /**
     * Obtiene todos los IDs de plantillas disponibles
     * @returns {string[]} Array de IDs de plantillas
     */
    getAllTemplateIds() {
        return this.templates.map(t => t.metadata.id);
    }

    /**
     * Obtiene el ID de la plantilla actualmente activa
     * @returns {string} ID de la plantilla activa
     */
    getActiveTemplateId() {
        return this.activeTemplate ? this.activeTemplate.metadata.id : null;
    }

    /**
     * Elimina una plantilla del sistema
     * @param {string} templateId - ID de la plantilla a eliminar
     * @returns {boolean} True si se eliminó correctamente
     */
    deleteTemplate(templateId) {
        // No permitir eliminar plantillas predefinidas
        const predefinedIds = ['default', 'minimal', 'esports'];
        if (predefinedIds.includes(templateId)) {
            console.error('[TournamentView] No se pueden eliminar plantillas predefinidas');
            return false;
        }
        
        // Buscar y eliminar la plantilla
        const index = this.templates.findIndex(t => t.metadata.id === templateId);
        if (index >= 0) {
            this.templates.splice(index, 1);
            console.log('[TournamentView] Plantilla eliminada:', templateId);
            
            // Eliminar de customTemplates también
            const customIndex = this.customTemplates.findIndex(t => t.metadata.id === templateId);
            if (customIndex >= 0) {
                this.customTemplates.splice(customIndex, 1);
            }
            
            // Actualizar localStorage
            this.saveCustomTemplates();
            
            return true;
        }
        
        console.error('[TournamentView] Plantilla no encontrada:', templateId);
        return false;
    }

    /**
     * Exporta una plantilla a JSON
     */
    exportTemplate(templateId) {
        const template = this.getTemplateById(templateId);
        if (!template) {
            return { success: false, error: 'Plantilla no encontrada' };
        }
        
        return {
            success: true,
            data: JSON.stringify(template, null, 2)
        };
    }

    /**
     * Importa una plantilla desde JSON
     */
    importTemplate(jsonString) {
        try {
            const template = JSON.parse(jsonString);
            
            // Validar estructura
            const validation = this.validateTemplate(template);
            if (!validation.valid) {
                return {
                    success: false,
                    error: `Plantilla inválida: ${validation.errors.join(', ')}`
                };
            }
            
            // Registrar plantilla
            this.registerTemplate(template);
            
            // Guardar en custom templates
            this.saveCustomTemplate(template);
            
            return {
                success: true,
                template: template
            };
        } catch (error) {
            return {
                success: false,
                error: `Error parseando JSON: ${error.message}`
            };
        }
    }

    /**
     * Valida la estructura de una plantilla
     */
    validateTemplate(template) {
        const errors = [];
        
        // Validar metadata
        if (!template.metadata) {
            errors.push('Falta sección "metadata"');
        } else {
            if (!template.metadata.id) errors.push('Falta metadata.id');
            if (!template.metadata.name) errors.push('Falta metadata.name');
            if (!template.metadata.version) errors.push('Falta metadata.version');
        }
        
        // Validar variables
        if (!template.variables) {
            errors.push('Falta sección "variables"');
        } else {
            const required = ['primaryColor', 'secondaryColor', 'backgroundColor', 'textColor'];
            required.forEach(key => {
                if (!template.variables[key]) {
                    errors.push(`Falta variable requerida: ${key}`);
                }
            });
        }
        
        // Validar customCSS (debe ser string)
        if (template.customCSS && typeof template.customCSS !== 'string') {
            errors.push('customCSS debe ser un string');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Guarda una plantilla custom en localStorage
     */
    saveCustomTemplate(template) {
        // Verificar si ya existe
        const index = this.customTemplates.findIndex(t => t.metadata.id === template.metadata.id);
        
        if (index >= 0) {
            // Actualizar existente
            this.customTemplates[index] = template;
        } else {
            // Añadir nueva
            this.customTemplates.push(template);
        }
        
        // Guardar en localStorage
        try {
            localStorage.setItem('uc_tournament_custom_templates', JSON.stringify(this.customTemplates));
            console.log('[TournamentView] Plantilla custom guardada:', template.metadata.id);
        } catch (error) {
            console.error('[TournamentView] Error guardando plantilla custom:', error);
        }
    }

    /**
     * Elimina una plantilla custom
     */
    deleteCustomTemplate(templateId) {
        // Filtrar de customTemplates
        this.customTemplates = this.customTemplates.filter(t => t.metadata.id !== templateId);
        
        // Filtrar de templates
        this.templates = this.templates.filter(t => t.metadata.id !== templateId);
        
        // Guardar en localStorage
        try {
            localStorage.setItem('uc_tournament_custom_templates', JSON.stringify(this.customTemplates));
            console.log('[TournamentView] Plantilla custom eliminada:', templateId);
            return true;
        } catch (error) {
            console.error('[TournamentView] Error eliminando plantilla custom:', error);
            return false;
        }
    }

    /**
     * Inyecta el CSS de la plantilla activa
     */
    injectCSS() {
        if (!this.activeTemplate) {
            console.error('[TournamentView] No hay plantilla activa');
            return;
        }

        // Generar CSS completo
        const cssVariables = this.generateCSSVariables();
        const customCSS = this.activeTemplate.customCSS || '';
        
        const fullCSS = `
${cssVariables}
${customCSS}
`;

        // Inyectar CSS usando la API de UnderScript
        if (this.cssElement && this.cssElement.replace) {
            // Si ya existe, usar replace() para actualizar
            this.cssElement.replace(fullCSS);
        } else {
            // Primera vez, crear con addStyle()
            this.cssElement = plugin.addStyle(fullCSS);
        }

        console.log('[TournamentView] CSS inyectado -', this.activeTemplate.metadata.name);
        console.log('[TournamentView] CSS Variables:', cssVariables.substring(0, 200));
        console.log('[TournamentView] CSS Length:', fullCSS.length, 'chars');
        console.log('[TournamentView] CSS Element:', this.cssElement);
        console.log('[TournamentView] CSS Element tagName:', this.cssElement ? this.cssElement.tagName : 'null');
        console.log('[TournamentView] CSS Element in DOM:', this.cssElement && this.cssElement.parentNode !== null);
        console.log('[TournamentView] CSS First 500 chars:', fullCSS.substring(0, 500));
    }

    /**
     * Remueve el CSS inyectado
     */
    removeCSS() {
        if (this.cssElement && this.cssElement.parentNode) {
            this.cssElement.remove();
        }
        this.cssElement = null;
        console.log('[TournamentView] CSS removido');
    }

    /**
     * Genera las variables CSS desde la plantilla activa
     */
    generateCSSVariables() {
        if (!this.activeTemplate || !this.activeTemplate.variables) {
            return '';
        }
        
        const vars = this.activeTemplate.variables;
        let cssVars = ':root {\n';
        
        for (const [key, value] of Object.entries(vars)) {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            cssVars += `  --tv-${cssKey}: ${value};\n`;
        }
        
        cssVars += '}\n';
        return cssVars;
    }

    /**
     * Crea la plantilla Default (convierte la plantilla actual hardcodeada a JSON)
     */
    createDefaultTemplate() {
        return {
            metadata: {
                id: 'default',
                name: 'Default Tournament View',
                version: '1.0.0',
                author: 'JoanJuan10',
                description: 'Plantilla por defecto con diseño moderno y gradientes vibrantes',
                created: '2025-12-24',
                modified: '2025-12-24',
                tags: ['default', 'modern', 'gradient']
            },
            variables: {
                primaryColor: '#667eea',
                secondaryColor: '#764ba2',
                accentColor: '#f093fb',
                backgroundColor: '#0f0f23',
                textColor: '#ffffff'
            },
            customCSS: `
/* Ocultar historiales nativos de Underscript y Undercards */
#history {
    display: none !important;
}

#game-history {
    display: none !important;
}

/* 
 * TABLERO DE JUEGO - Ajuste de posición
 * 
 * NOTA FASE 4: Este elemento .mainContent y todos sus subelementos deberán ser gestionables
 * en el sistema de plantillas. Incluye:
 * - Avatares (#enemyAvatar, #yourAvatar)
 * - Fases del juego (#phase1, #phase2)
 * - Perfiles de jugadores (.profile)
 * - Tablero de juego (#board con celdas y cartas)
 * - Información de HP, ORO, cartas en mano/mazo
 * - Timer (.timer)
 * - Cartas en mano (#handCards)
 * - Emotes (bubbles y emotes)
 * 
 * Propiedades configurables en plantillas:
 * - Posición vertical (margin-top)
 * - Escala/zoom (transform: scale)
 * - Opacidad durante overlay
 * - Filtros visuales (blur, brightness)
 */
.mainContent {
    margin-top: 100px !important;
}

/* Tournament View Base Styles */
#uc-tournament-view {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: var(--tv-text-color, #ffffff);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    pointer-events: none;
}

#uc-tournament-view * {
    box-sizing: border-box;
}

/* Header Bar */
.tv-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 80px;
    background: linear-gradient(135deg, var(--tv-primary-color) 0%, var(--tv-secondary-color) 100%);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    pointer-events: auto;
}

.tv-player-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
    position: relative;
    transition: all 0.3s ease;
}

.tv-player-info.active-turn::before {
    content: '';
    position: absolute;
    top: -8px;
    left: -8px;
    right: -8px;
    bottom: -8px;
    border: 3px solid #fbbf24;
    border-radius: 12px;
    animation: pulse-border 2s infinite;
    pointer-events: none;
}

@keyframes pulse-border {
    0%, 100% {
        opacity: 1;
        transform: scale(1);
    }
    50% {
        opacity: 0.7;
        transform: scale(1.02);
    }
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    50% { transform: translateX(4px); }
    75% { transform: translateX(-4px); }
}

@keyframes slideInRight {
    from {
        right: -350px;
        opacity: 0;
    }
    to {
        right: 20px;
        opacity: 1;
    }
}

@keyframes slideOutRight {
    from {
        right: 20px;
        opacity: 1;
    }
    to {
        right: -350px;
        opacity: 0;
    }
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
}

@keyframes glow {
    0%, 100% {
        box-shadow: 0 0 5px currentColor;
    }
    50% {
        box-shadow: 0 0 20px currentColor, 0 0 30px currentColor;
    }
}

@keyframes artifactPulse {
    0%, 100% {
        transform: scale(1);
        filter: drop-shadow(0 0 5px #fbbf24);
    }
    50% {
        transform: scale(1.1);
        filter: drop-shadow(0 0 15px #fbbf24) drop-shadow(0 0 25px #fbbf24);
    }
}

.tv-player-name {
    font-size: 1.5rem;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    letter-spacing: 0.5px;
}

.tv-player-hp {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(0, 0, 0, 0.3);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    backdrop-filter: blur(10px);
}

.tv-hp-bar {
    width: 120px;
    height: 12px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 6px;
    overflow: hidden;
    position: relative;
}

.tv-hp-fill {
    height: 100%;
    background: linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #10b981 100%);
    transition: width 0.3s ease;
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
}

.tv-hp-fill.hp-damage {
    animation: shake 0.3s ease;
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.8);
}

.tv-hp-fill.hp-heal {
    animation: bounce 0.5s ease;
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.8);
}

.tv-soul-image.soul-glow {
    animation: glow 0.5s ease 2;
    color: #3b82f6;
}

.tv-artifact-image.artifact-glow {
    animation: artifactPulse 0.6s ease 2;
}

.tv-hp-text {
    font-size: 0.875rem;
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    min-width: 50px;
    text-align: center;
}

.tv-player-gold {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(0, 0, 0, 0.3);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    backdrop-filter: blur(10px);
}

.tv-gold-text {
    font-size: 1rem;
    font-weight: bold;
    color: var(--tv-accent-color, #f093fb);
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.tv-player-soul {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(0, 0, 0, 0.3);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    backdrop-filter: blur(10px);
}

.tv-soul-text {
    font-size: 0.875rem;
    font-weight: bold;
    color: #fbbf24;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    text-transform: uppercase;
}

.tv-player-artifacts {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(0, 0, 0, 0.3);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    backdrop-filter: blur(10px);
    flex-wrap: wrap;
}

.tv-artifacts-text {
    font-size: 0.75rem;
    font-weight: bold;
    color: #a78bfa;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tv-player-cards {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: rgba(0, 0, 0, 0.3);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    backdrop-filter: blur(10px);
}

.tv-card-counter {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
}

.tv-card-counter-label {
    font-size: 0.625rem;
    color: #a0a0b0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.tv-card-counter-value {
    font-size: 1rem;
    font-weight: bold;
    color: #ffffff;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

/* Center Info */
.tv-center-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
}

.tv-turn-indicator {
    background: rgba(0, 0, 0, 0.4);
    padding: 0.5rem 1.5rem;
    border-radius: 8px;
    backdrop-filter: blur(10px);
    text-align: center;
}

.tv-turn-label {
    font-size: 0.875rem;
    color: #a0a0b0;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.tv-turn-number {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--tv-accent-color, #f093fb);
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.tv-turn-timer {
    font-size: 0.875rem;
    color: #fbbf24;
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    min-width: 30px;
    text-align: center;
}

.tv-turn-timer.low {
    color: #ef4444;
    animation: pulse 1s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

/* Opponent Info */
.tv-opponent-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
    justify-content: flex-end;
    flex-direction: row-reverse;
    position: relative;
    transition: all 0.3s ease;
}

.tv-opponent-info.active-turn::before {
    content: '';
    position: absolute;
    top: -8px;
    left: -8px;
    right: -8px;
    bottom: -8px;
    border: 3px solid #fbbf24;
    border-radius: 12px;
    animation: pulse-border 2s infinite;
    pointer-events: none;
}

/* Result Overlay */
.tv-result-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(5px);
    pointer-events: auto;
    animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.tv-result-container {
    background: linear-gradient(135deg, #1a1a2e 0%, var(--tv-background-color) 100%);
    border: 2px solid #2a2a3e;
    border-radius: 8px;
    padding: 2rem 3rem;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    text-align: center;
    animation: scaleIn 0.5s ease;
    min-width: 400px;
}

@keyframes scaleIn {
    from {
        opacity: 0;
        transform: scale(0.8);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.tv-result-title {
    font-size: 3rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
    text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.8);
}

.tv-result-title.victory {
    color: #10b981;
    text-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
}

.tv-result-title.defeat {
    color: #ef4444;
    text-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
}

.tv-result-stats {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1.5rem;
}

.tv-result-stat {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
}

.tv-result-stat-label {
    color: #a0a0b0;
}

.tv-result-stat-value {
    color: var(--tv-text-color, #ffffff);
    font-weight: bold;
}

/* Notificaciones Flotantes */
.tv-notification {
    position: fixed;
    top: 90px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    color: white;
    font-weight: 600;
    font-size: 1.1rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10001;
    animation: slideInRight 0.3s ease forwards;
    margin-bottom: 10px;
    backdrop-filter: blur(10px);
    max-width: 400px;
    word-wrap: break-word;
}

.tv-notification.hiding {
    animation: slideOutRight 0.3s ease forwards;
}

.tv-notification-info {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9));
}

.tv-notification-card {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9));
}

.tv-notification-spell {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(109, 40, 217, 0.9));
}

.tv-notification-damage {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9));
}

.tv-notification-heal {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9));
}

.tv-notification-artifact {
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.9), rgba(245, 158, 11, 0.9));
}

/* Panel de Historial */
.tv-action-log {
    position: fixed;
    top: 90px;
    right: 0;
    width: 450px;
    max-height: calc(100vh - 100px);
    background: linear-gradient(135deg, rgba(15, 15, 35, 0.95), rgba(30, 30, 60, 0.95));
    backdrop-filter: blur(10px);
    border-radius: 12px 0 0 12px;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5);
    z-index: 9999;
    transition: transform 0.3s ease;
    display: flex;
    flex-direction: column;
}

.tv-action-log.collapsed {
    transform: translateX(450px);
}

.tv-log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: linear-gradient(135deg, var(--tv-primary-color), var(--tv-secondary-color));
    border-radius: 12px 0 0 0;
    color: white;
    font-weight: bold;
    font-size: 1.2rem;
}

.tv-log-toggle {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.tv-log-toggle:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
}

.tv-log-content {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
}

.tv-log-content::-webkit-scrollbar {
    width: 6px;
}

.tv-log-content::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
}

.tv-log-content::-webkit-scrollbar-thumb {
    background: var(--tv-accent-color);
    border-radius: 3px;
}

.tv-log-entry {
    padding: 0.75rem 1rem;
    margin-bottom: 0.7rem;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
    border-left: 3px solid var(--tv-accent-color);
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.9);
    animation: fadeIn 0.3s ease;
    line-height: 1.8;
}

/* Estilos para el contenido HTML de Underscript dentro de las entradas */
.tv-log-entry img {
    width: 22px;
    height: 22px;
    vertical-align: middle;
    margin: 0 3px;
    display: inline-block;
}

.tv-log-entry span {
    vertical-align: middle;
}

.tv-log-entry span[style*="text-decoration: underline"] {
    color: #fbbf24;
    font-weight: 500;
}

/* Clases de almas de Underscript */
.tv-log-entry .DETERMINATION {
    color: #ff0000;
}

.tv-log-entry .BRAVERY {
    color: #ff8800;
}

.tv-log-entry .JUSTICE {
    color: #ffff00;
}

.tv-log-entry .KINDNESS {
    color: #00ff00;
}

.tv-log-entry .PATIENCE {
    color: #00ffff;
}

.tv-log-entry .INTEGRITY {
    color: #0000ff;
}

.tv-log-entry .PERSEVERANCE {
    color: #ff00ff;
}

.tv-log-entry-turn {
    border-left-color: #fbbf24;
    background: rgba(251, 191, 36, 0.1);
    font-weight: bold;
}

.tv-log-entry-hp {
    border-left-color: #ef4444;
    background: rgba(239, 68, 68, 0.08);
}

.tv-log-entry-heal {
    border-left-color: #10b981;
    background: rgba(16, 185, 129, 0.08);
}

.tv-log-entry-card {
    border-left-color: #10b981;
    background: rgba(16, 185, 129, 0.05);
}

.tv-log-entry-spell {
    border-left-color: #8b5cf6;
    background: rgba(139, 92, 246, 0.08);
}

.tv-log-entry-artifact {
    border-left-color: #fbbf24;
    background: rgba(251, 191, 36, 0.08);
}

.tv-log-entry-soul {
    border-left-color: #3b82f6;
    background: rgba(59, 130, 246, 0.08);
}

.tv-log-entry-damage {
    border-left-color: #dc2626;
    background: rgba(220, 38, 38, 0.08);
}

.tv-log-turn {
    color: #fbbf24;
    font-weight: bold;
    font-size: 0.75rem;
}

.tv-log-player {
    color: var(--tv-accent-color);
    font-weight: 600;
}

.tv-log-message {
    margin-top: 0.25rem;
}

/* Botón Toggle Flotante para Historial */
.tv-log-float-toggle {
    position: fixed;
    top: 100px;
    right: 10px;
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, var(--tv-primary-color), var(--tv-secondary-color));
    border: none;
    border-radius: 50%;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.tv-log-float-toggle:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

/* Responsive Design */
@media (max-width: 1280px) {
    .tv-header {
        height: 60px;
        padding: 0 1rem;
    }
    
    .tv-player-name {
        font-size: 1.2rem;
    }
    
    .tv-hp-bar {
        width: 100px;
    }
    
    .tv-card-counter-label {
        font-size: 0.5rem;
    }
    
    .tv-artifact-image {
        width: 30px;
        height: 30px;
    }
}

@media (max-width: 768px) {
    .tv-header {
        height: auto;
        flex-direction: column;
        padding: 0.5rem;
        gap: 0.5rem;
    }
    
    .tv-player-info,
    .tv-opponent-info {
        width: 100%;
        justify-content: space-between;
    }
    
    .tv-turn-info {
        width: 100%;
        order: -1;
    }
    
    .tv-result-container {
        min-width: 90vw;
        padding: 1.5rem;
    }
    
    .tv-action-log {
        width: 100%;
        max-height: 50vh;
        border-radius: 12px 12px 0 0;
        top: auto;
        bottom: 0;
    }
    
    .tv-action-log.collapsed {
        transform: translateY(100%);
    }
    
    .tv-notification {
        max-width: calc(100vw - 40px);
        right: 10px;
    }
}

@media (max-width: 480px) {
    .tv-player-name {
        font-size: 1rem;
    }
    
    .tv-hp-bar {
        width: 80px;
        height: 10px;
    }
    
    .tv-card-counters {
        gap: 0.25rem;
    }
    
    .tv-artifact-image {
        width: 24px;
        height: 24px;
    }
    
    .tv-soul-image {
        width: 20px;
        height: 20px;
    }
}
`
        };
    }

    /**
     * Crea la plantilla Minimal (diseño minimalista)
     */
    createMinimalTemplate() {
        return {
            metadata: {
                id: 'minimal',
                name: 'Minimal Clean',
                version: '1.0.0',
                author: 'JoanJuan10',
                description: 'Diseño minimalista con colores planos y solo información esencial',
                created: '2025-12-24',
                modified: '2025-12-24',
                tags: ['minimal', 'clean', 'simple']
            },
            variables: {
                primaryColor: '#2c3e50',
                secondaryColor: '#34495e',
                accentColor: '#3498db',
                backgroundColor: '#ecf0f1',
                textColor: '#2c3e50'
            },
            customCSS: `
/* Ocultar historiales nativos */
#history,
#game-history {
    display: none !important;
}

.mainContent {
    margin-top: 100px !important;
}

/* Minimal Base */
#uc-tournament-view {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    color: var(--tv-text-color);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    pointer-events: none;
}

#uc-tournament-view * {
    box-sizing: border-box;
}

/* Header minimalista */
.tv-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: var(--tv-primary-color);
    border-bottom: 2px solid var(--tv-accent-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem;
    pointer-events: auto;
}

.tv-player-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
}

.tv-player-info.active-turn {
    opacity: 1;
}

.tv-player-name {
    font-size: 1.25rem;
    font-weight: 600;
    color: white;
}

.tv-player-hp {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
}

.tv-hp-bar {
    width: 100px;
    height: 8px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    overflow: hidden;
}

.tv-hp-fill {
    height: 100%;
    background: var(--tv-accent-color);
    transition: width 0.3s ease;
}

.tv-hp-text {
    font-size: 0.875rem;
    font-weight: 600;
    color: white;
    min-width: 50px;
}

.tv-player-gold {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
}

.tv-gold-text {
    font-size: 0.875rem;
    font-weight: 600;
    color: #f39c12;
}

.tv-player-soul {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.tv-soul-image {
    width: 24px;
    height: 24px;
}

.tv-player-artifacts {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.tv-artifact-image {
    width: 28px;
    height: 28px;
    border-radius: 4px;
}

.tv-artifact-counter {
    position: absolute;
    top: -4px;
    right: -4px;
    background: var(--tv-accent-color);
    color: white;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    font-size: 0.625rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}

.tv-player-cards {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.tv-card-counter {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.tv-card-counter-label {
    font-size: 0.625rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
}

.tv-card-counter-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: white;
}

/* Center Info */
.tv-center-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.tv-turn-indicator {
    background: rgba(255, 255, 255, 0.1);
    padding: 0.4rem 1rem;
    border-radius: 4px;
}

.tv-turn-label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
}

.tv-turn-number {
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
}

.tv-turn-timer {
    font-size: 0.875rem;
    color: white;
    font-weight: 600;
}

.tv-turn-timer.low {
    color: #e74c3c;
}

/* Opponent Info */
.tv-opponent-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
    justify-content: flex-end;
    flex-direction: row-reverse;
}

/* Notificaciones simples */
.tv-notification {
    position: fixed;
    top: 70px;
    right: 20px;
    padding: 0.75rem 1.25rem;
    border-radius: 4px;
    color: white;
    font-weight: 500;
    font-size: 0.875rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    z-index: 10001;
    background: var(--tv-accent-color);
    max-width: 300px;
}

/* Panel de historial simple */
.tv-action-log {
    position: fixed;
    top: 70px;
    right: 0;
    width: 350px;
    max-height: calc(100vh - 80px);
    background: white;
    border-left: 2px solid var(--tv-accent-color);
    z-index: 9999;
    transition: transform 0.3s ease;
    display: flex;
    flex-direction: column;
}

.tv-action-log.collapsed {
    transform: translateX(350px);
}

.tv-log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: var(--tv-primary-color);
    color: white;
    font-weight: 600;
    font-size: 1rem;
}

.tv-log-toggle {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
}

.tv-log-content {
    flex: 1;
    overflow-y: auto;
    padding: 0.5rem;
}

.tv-log-entry {
    padding: 0.5rem 0.75rem;
    margin-bottom: 0.5rem;
    border-radius: 4px;
    background: #f8f9fa;
    border-left: 3px solid var(--tv-accent-color);
    font-size: 0.875rem;
    color: var(--tv-text-color);
    line-height: 1.5;
}

/* Botón flotante simple */
.tv-log-float-toggle {
    position: fixed;
    top: 70px;
    right: 10px;
    width: 36px;
    height: 36px;
    background: var(--tv-accent-color);
    border: none;
    border-radius: 4px;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    z-index: 10000;
}

/* Result overlay minimalista */
.tv-result-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
}

.tv-result-container {
    background: white;
    border: 2px solid var(--tv-primary-color);
    border-radius: 8px;
    padding: 2rem 3rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    text-align: center;
    min-width: 350px;
}

.tv-result-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: var(--tv-text-color);
}

.tv-result-title.victory {
    color: #27ae60;
}

.tv-result-title.defeat {
    color: #e74c3c;
}

.tv-result-stats {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
}

.tv-result-stat {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    background: #f8f9fa;
    border-radius: 4px;
}

.tv-result-stat-label {
    color: #7f8c8d;
    font-weight: 500;
}

.tv-result-stat-value {
    color: var(--tv-text-color);
    font-weight: 600;
}

/* Responsive */
@media (max-width: 1280px) {
    .tv-header {
        height: 50px;
        padding: 0 1rem;
    }
    
    .tv-player-name {
        font-size: 1rem;
    }
}

@media (max-width: 768px) {
    .tv-header {
        height: auto;
        flex-direction: column;
        padding: 0.5rem;
        gap: 0.5rem;
    }
    
    .tv-player-info,
    .tv-opponent-info {
        width: 100%;
    }
}
`
        };
    }

    /**
     * Crea la plantilla Esports (broadcast profesional)
     */
    createEsportsTemplate() {
        return {
            metadata: {
                id: 'esports',
                name: 'Esports Broadcast',
                version: '1.0.0',
                author: 'JoanJuan10',
                description: 'Estilo de transmisión profesional con efectos dramáticos y colores corporativos',
                created: '2025-12-24',
                modified: '2025-12-24',
                tags: ['esports', 'professional', 'broadcast']
            },
            variables: {
                primaryColor: '#0a1929',
                secondaryColor: '#1a2332',
                accentColor: '#ffd700',
                backgroundColor: '#000814',
                textColor: '#ffffff'
            },
            customCSS: `
/* Ocultar historiales nativos */
#history,
#game-history {
    display: none !important;
}

.mainContent {
    margin-top: 120px !important;
}

/* Esports Base */
#uc-tournament-view {
    font-family: 'Roboto', 'Arial Black', sans-serif;
    color: var(--tv-text-color);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    pointer-events: none;
}

#uc-tournament-view * {
    box-sizing: border-box;
}

/* Header estilo broadcast */
.tv-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(180deg, var(--tv-primary-color) 0%, var(--tv-secondary-color) 100%);
    border-bottom: 4px solid var(--tv-accent-color);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.7), inset 0 -2px 0 rgba(255, 215, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem;
    pointer-events: auto;
}

.tv-player-info {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex: 1;
    position: relative;
}

.tv-player-info.active-turn::before {
    content: '';
    position: absolute;
    top: -12px;
    left: -12px;
    right: -12px;
    bottom: -12px;
    border: 4px solid var(--tv-accent-color);
    border-radius: 8px;
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.6), inset 0 0 20px rgba(255, 215, 0, 0.2);
    animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
    0%, 100% {
        opacity: 1;
        box-shadow: 0 0 30px rgba(255, 215, 0, 0.6), inset 0 0 20px rgba(255, 215, 0, 0.2);
    }
    50% {
        opacity: 0.8;
        box-shadow: 0 0 50px rgba(255, 215, 0, 0.8), inset 0 0 30px rgba(255, 215, 0, 0.3);
    }
}

.tv-player-name {
    font-size: 1.75rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 2px;
    background: linear-gradient(135deg, #ffffff 0%, var(--tv-accent-color) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
    filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8));
}

.tv-player-hp {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.3) 100%);
    padding: 0.75rem 1.25rem;
    border-radius: 6px;
    border: 2px solid rgba(255, 215, 0, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.tv-hp-bar {
    width: 140px;
    height: 14px;
    background: linear-gradient(90deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%);
    border-radius: 7px;
    overflow: hidden;
    border: 1px solid rgba(255, 215, 0, 0.2);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
}

.tv-hp-fill {
    height: 100%;
    background: linear-gradient(90deg, #ff0000 0%, #ff6b00 30%, #ffd700 100%);
    transition: width 0.3s ease;
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
    position: relative;
}

.tv-hp-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(0, 0, 0, 0.2) 100%);
}

.tv-hp-text {
    font-size: 1rem;
    font-weight: 900;
    color: var(--tv-accent-color);
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.7), 2px 2px 4px rgba(0, 0, 0, 0.8);
    min-width: 60px;
    letter-spacing: 1px;
}

.tv-player-gold {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%);
    padding: 0.75rem 1.25rem;
    border-radius: 6px;
    border: 2px solid var(--tv-accent-color);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.tv-gold-text {
    font-size: 1.25rem;
    font-weight: 900;
    color: var(--tv-accent-color);
    text-shadow: 0 0 15px rgba(255, 215, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.tv-player-soul {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 6px;
    border: 2px solid rgba(255, 215, 0, 0.2);
}

.tv-soul-image {
    width: 32px;
    height: 32px;
    filter: drop-shadow(0 0 8px currentColor);
}

.tv-player-artifacts {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.tv-artifact-image {
    width: 40px;
    height: 40px;
    border-radius: 6px;
    border: 2px solid var(--tv-accent-color);
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
    filter: brightness(1.1);
}

.tv-artifact-counter {
    position: absolute;
    top: -6px;
    right: -6px;
    background: linear-gradient(135deg, #ff0000 0%, #ff6b00 100%);
    color: white;
    border: 2px solid var(--tv-accent-color);
    border-radius: 50%;
    width: 22px;
    height: 22px;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.6);
}

.tv-player-cards {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(0, 0, 0, 0.3);
    padding: 0.5rem 1rem;
    border-radius: 6px;
    border: 1px solid rgba(255, 215, 0, 0.2);
}

.tv-card-counter {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.tv-card-counter-label {
    font-size: 0.625rem;
    color: rgba(255, 215, 0, 0.6);
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 1px;
}

.tv-card-counter-value {
    font-size: 1.125rem;
    font-weight: 900;
    color: var(--tv-accent-color);
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
}

/* Center Info */
.tv-center-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
}

.tv-turn-indicator {
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.5) 100%);
    padding: 0.75rem 2rem;
    border-radius: 8px;
    border: 3px solid var(--tv-accent-color);
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.1);
}

.tv-turn-label {
    font-size: 0.875rem;
    color: rgba(255, 215, 0, 0.7);
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 2px;
}

.tv-turn-number {
    font-size: 2rem;
    font-weight: 900;
    color: var(--tv-accent-color);
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 3px 3px 6px rgba(0, 0, 0, 0.8);
}

.tv-turn-timer {
    font-size: 1rem;
    color: var(--tv-accent-color);
    font-weight: 900;
    text-shadow: 0 0 15px rgba(255, 215, 0, 0.7);
    letter-spacing: 1px;
}

.tv-turn-timer.low {
    color: #ff0000;
    text-shadow: 0 0 20px rgba(255, 0, 0, 0.9);
    animation: pulse-urgent 0.5s infinite;
}

@keyframes pulse-urgent {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

/* Opponent Info */
.tv-opponent-info {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex: 1;
    justify-content: flex-end;
    flex-direction: row-reverse;
    position: relative;
}

.tv-opponent-info.active-turn::before {
    content: '';
    position: absolute;
    top: -12px;
    left: -12px;
    right: -12px;
    bottom: -12px;
    border: 4px solid var(--tv-accent-color);
    border-radius: 8px;
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.6), inset 0 0 20px rgba(255, 215, 0, 0.2);
    animation: pulse-glow 2s infinite;
}

/* Notificaciones dramáticas */
.tv-notification {
    position: fixed;
    top: 110px;
    right: 20px;
    padding: 1.25rem 1.75rem;
    border-radius: 8px;
    color: white;
    font-weight: 900;
    font-size: 1.125rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), 0 0 30px rgba(255, 215, 0, 0.3);
    z-index: 10001;
    border: 2px solid var(--tv-accent-color);
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(26, 35, 50, 0.9) 100%);
    max-width: 450px;
}

/* Panel de historial profesional */
.tv-action-log {
    position: fixed;
    top: 110px;
    right: 0;
    width: 500px;
    max-height: calc(100vh - 120px);
    background: linear-gradient(135deg, rgba(10, 25, 41, 0.98) 0%, rgba(0, 8, 20, 0.98) 100%);
    border-left: 4px solid var(--tv-accent-color);
    box-shadow: -8px 0 32px rgba(0, 0, 0, 0.7);
    z-index: 9999;
    transition: transform 0.3s ease;
    display: flex;
    flex-direction: column;
}

.tv-action-log.collapsed {
    transform: translateX(500px);
}

.tv-log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: linear-gradient(135deg, var(--tv-primary-color) 0%, var(--tv-secondary-color) 100%);
    border-bottom: 3px solid var(--tv-accent-color);
    color: var(--tv-accent-color);
    font-weight: 900;
    font-size: 1.25rem;
    text-transform: uppercase;
    letter-spacing: 2px;
}

.tv-log-toggle {
    background: rgba(255, 215, 0, 0.2);
    border: 2px solid var(--tv-accent-color);
    color: var(--tv-accent-color);
    width: 32px;
    height: 32px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1.125rem;
    font-weight: 900;
}

.tv-log-content {
    flex: 1;
    overflow-y: auto;
    padding: 0.75rem;
}

.tv-log-entry {
    padding: 0.875rem 1.25rem;
    margin-bottom: 0.75rem;
    border-radius: 6px;
    background: rgba(255, 215, 0, 0.05);
    border-left: 4px solid var(--tv-accent-color);
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1.6;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* Botón flotante profesional */
.tv-log-float-toggle {
    position: fixed;
    top: 110px;
    right: 10px;
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--tv-primary-color) 0%, var(--tv-secondary-color) 100%);
    border: 3px solid var(--tv-accent-color);
    border-radius: 8px;
    color: var(--tv-accent-color);
    font-size: 1.5rem;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3);
    z-index: 10000;
    font-weight: 900;
}

/* Result overlay dramático */
.tv-result-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(0, 8, 20, 0.95) 0%, rgba(10, 25, 41, 0.95) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
}

.tv-result-container {
    background: linear-gradient(135deg, var(--tv-primary-color) 0%, var(--tv-secondary-color) 100%);
    border: 4px solid var(--tv-accent-color);
    border-radius: 12px;
    padding: 3rem 4rem;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.7), 0 0 60px rgba(255, 215, 0, 0.3);
    text-align: center;
    min-width: 500px;
}

.tv-result-title {
    font-size: 4rem;
    font-weight: 900;
    margin-bottom: 2rem;
    text-transform: uppercase;
    letter-spacing: 4px;
}

.tv-result-title.victory {
    color: var(--tv-accent-color);
    text-shadow: 0 0 40px rgba(255, 215, 0, 0.9), 4px 4px 8px rgba(0, 0, 0, 0.8);
}

.tv-result-title.defeat {
    color: #ff0000;
    text-shadow: 0 0 40px rgba(255, 0, 0, 0.9), 4px 4px 8px rgba(0, 0, 0, 0.8);
}

.tv-result-stats {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 2rem;
}

.tv-result-stat {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 1.5rem;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 6px;
    border: 2px solid rgba(255, 215, 0, 0.3);
}

.tv-result-stat-label {
    color: rgba(255, 215, 0, 0.7);
    font-weight: 700;
    text-transform: uppercase;
}

.tv-result-stat-value {
    color: var(--tv-accent-color);
    font-weight: 900;
    font-size: 1.25rem;
}

/* Responsive */
@media (max-width: 1280px) {
    .tv-header {
        height: 80px;
        padding: 0 1rem;
    }
    
    .tv-player-name {
        font-size: 1.25rem;
    }
}

@media (max-width: 768px) {
    .tv-header {
        height: auto;
        flex-direction: column;
        padding: 0.75rem;
        gap: 0.75rem;
    }
    
    .tv-player-info,
    .tv-opponent-info {
        width: 100%;
    }
}
`
        };
    }
}

// Initialize TemplateManager
const templateManager = new TemplateManager();

// ============================================
// IMAGE HELPER FUNCTIONS
// ============================================

/**
 * Obtiene la URL de una imagen de soul
 * Intenta primero desde el DOM, luego construye la URL directamente
 */
function getSoulImageUrl(soulData) {
    // Si no hay datos, retornar null
    if (!soulData) return null;
    
    let soulName = null;
    
    // Si soulData es un string simple (como "DETERMINATION", "BRAVERY", etc.)
    if (typeof soulData === 'string') {
        try {
            // Intentar parsearlo como JSON por si viene serializado
            const parsed = JSON.parse(soulData);
            soulName = parsed.name || parsed.id || parsed;
        } catch (e) {
            // No es JSON, es un nombre de alma directamente
            soulName = soulData;
        }
    } else if (soulData && (soulData.name || soulData.id)) {
        soulName = soulData.name || soulData.id;
    }
    
    if (!soulName) return null;
    
    // Intentar buscar en el DOM primero - buscar todas las imágenes de almas
    const allSoulImages = document.querySelectorAll('img[src*="souls"]');
    console.log('[TournamentView] Buscando alma:', soulName, 'Imágenes encontradas:', allSoulImages.length);
    
    for (const img of allSoulImages) {
        console.log('[TournamentView] Imagen encontrada:', img.src);
        if (img.src.toLowerCase().includes(soulName.toLowerCase())) {
            console.log('[TournamentView] ¡Imagen coincide! Usando:', img.src);
            return img.src;
        }
    }
    
    // Si no encontramos en el DOM, las imágenes de Undercards están en images/souls/
    // Pero necesitamos la URL completa desde el servidor
    console.log('[TournamentView] No se encontró en DOM, construyendo URL');
    return `images/souls/${soulName.toLowerCase()}.png`;
}

/**
 * Obtiene la URL de una imagen de artefacto
 * Intenta primero desde el DOM, luego construye la URL directamente
 */
function getArtifactImageUrl(artifact) {
    if (!artifact) return null;
    
    // Si tiene campo image
    if (artifact.image) {
        return `https://undercards.net/images/artifacts/${artifact.image}.png`;
    }
    
    // Si tiene id, intentar encontrar en el DOM
    if (artifact.id) {
        const domImage = document.querySelector(`img[src*="artifacts"][src*="${artifact.id}"]`);
        if (domImage) {
            return domImage.src;
        }
        // Fallback: construir URL con el id
        return `https://undercards.net/images/artifacts/${artifact.id}.png`;
    }
    
    // Si tiene nombre, intentar con el nombre en minúsculas
    if (artifact.name) {
        return `https://undercards.net/images/artifacts/${artifact.name.toLowerCase().replace(/\s+/g, '_')}.png`;
    }
    
    return null;
}

/**
 * Captura el alma desde el DOM del juego
 */
function getSoulFromDOM(playerIndex) {
    try {
        // Intentar desde window.yourSoul o window.enemySoul primero
        if (playerIndex === 0 && window.yourSoul) {
            return window.yourSoul.name || window.yourSoul;
        } else if (playerIndex === 1 && window.enemySoul) {
            return window.enemySoul.name || window.enemySoul;
        }
        
        // Intentar capturar desde la imagen del alma en el DOM
        const soulImages = document.querySelectorAll('img[src*="souls"]');
        if (soulImages && soulImages[playerIndex]) {
            const src = soulImages[playerIndex].src;
            const match = src.match(/souls\/([^.]+)\.png/);
            if (match) {
                return match[1].toUpperCase();
            }
        }
    } catch (e) {
        console.error('[TournamentView] Error capturando alma del DOM:', e);
    }
    return null;
}

/**
 * Captura los artefactos desde el DOM con sus contadores
 */
function getArtifactsFromDOM(playerIndex) {
    try {
        // #yourArtifacts para player 0, #enemyArtifacts para player 1
        const artifactsId = playerIndex === 0 ? 'yourArtifacts' : 'enemyArtifacts';
        const artifactsContainer = document.getElementById(artifactsId);
        
        if (!artifactsContainer) {
            console.log('[TournamentView] getArtifactsFromDOM - No se encontró contenedor:', artifactsId);
            return [];
        }
        
        const artifactGroups = artifactsContainer.querySelectorAll('.artifact-group');
        console.log(`[TournamentView] getArtifactsFromDOM - Player ${playerIndex}: ${artifactGroups.length} artefactos encontrados`);
        
        const artifacts = [];
        artifactGroups.forEach((group, idx) => {
            const img = group.querySelector('.artifact-img');
            if (img) {
                const artifact = {
                    name: img.getAttribute('name') || '',
                    image: img.getAttribute('image') || '',
                    id: img.getAttribute('artifactid') || '',
                    legendary: img.getAttribute('legendary') === 'true'
                };
                
                // Buscar contador
                const counterElement = group.querySelector('.artifact-custom');
                if (counterElement) {
                    artifact.counter = parseInt(counterElement.textContent) || 0;
                    console.log(`  [${idx}] ${artifact.name}: counter=${artifact.counter}`);
                } else {
                    console.log(`  [${idx}] ${artifact.name}: sin contador`);
                }
                
                artifacts.push(artifact);
            }
        });
        
        return artifacts;
    } catch (e) {
        console.error('[TournamentView] Error capturando artefactos del DOM:', e);
    }
    return [];
}

/**
 * Captura el contador de cementerio desde el DOM
 */
function getGraveyardFromDOM(playerIndex) {
    try {
        // El cementerio usa la clase .dust-counter en el DOM de Undercards
        const dustCounters = document.querySelectorAll('.dust-counter');
        console.log('[TournamentView] getGraveyardFromDOM - playerIndex:', playerIndex, 'Dust counters encontrados:', dustCounters.length);
        
        // Log de todos los contadores para debug
        dustCounters.forEach((counter, idx) => {
            console.log(`  DustCounter[${idx}]:`, counter.textContent.trim());
        });
        
        // Los dust-counters están en orden inverso:
        // Player 0 (you/bottom) → índice 1 (segundo)
        // Player 1 (enemy/top) → índice 0 (primero)
        const actualIndex = playerIndex === 0 ? 1 : 0;
        
        if (dustCounters.length > actualIndex && dustCounters[actualIndex]) {
            const value = parseInt(dustCounters[actualIndex].textContent) || 0;
            console.log(`[TournamentView] Cementerio player ${playerIndex} (usando índice ${actualIndex}): ${value}`);
            return value;
        }
        
        // Fallback: buscar por selector más específico
        const tables = document.querySelectorAll('table tr');
        if (tables && tables[playerIndex]) {
            const dustCounter = tables[playerIndex].querySelector('.dust-counter');
            if (dustCounter) {
                const value = parseInt(dustCounter.textContent) || 0;
                console.log(`[TournamentView] Cementerio player ${playerIndex} (fallback): ${value}`);
                return value;
            }
        }
        
        console.log('[TournamentView] No se pudo encontrar cementerio en DOM');
    } catch (e) {
        console.error('[TournamentView] Error capturando cementerio del DOM:', e);
    }
    return 0;
}

/**
 * Obtiene el contador de un artefacto
 * Los artefactos con contadores pueden tener el valor en diferentes campos
 */
function getArtifactCounter(artifact) {
    if (!artifact) return null;
    
    // Intentar desde varios campos posibles
    if (artifact.count !== undefined) return artifact.count;
    if (artifact.counter !== undefined) return artifact.counter;
    if (artifact.value !== undefined) return artifact.value;
    
    // Intentar extraer del nombre si tiene formato "Name(X)"
    if (artifact.name) {
        const match = artifact.name.match(/\((\d+)\)/);
        if (match) {
            return parseInt(match[1]);
        }
    }
    
    return null;
}

// ============================================
// UI MANAGER
// ============================================

class UIManager {
    constructor() {
        this.container = null;
        this.elements = {};
    }

    initialize() {
        // Crear contenedor principal
        this.container = document.createElement('div');
        this.container.id = 'uc-tournament-view';
        document.body.appendChild(this.container);

        // Crear elementos de UI
        this.createHeader();
        this.createActionLog();
        
        console.log('[TournamentView] UI inicializada');
    }

    showFloatingNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `tv-notification tv-notification-${type}`;
        notification.textContent = message;
        
        // Calcular posición basada en notificaciones existentes
        const existingNotifications = document.querySelectorAll('.tv-notification');
        const offset = existingNotifications.length * 60; // 60px por notificación
        notification.style.top = `${90 + offset}px`;
        
        document.body.appendChild(notification);
        
        // Auto-remover después del duration
        setTimeout(() => {
            notification.classList.add('hiding');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    createActionLog() {
        // Botón flotante para toggle
        const floatToggle = document.createElement('button');
        floatToggle.className = 'tv-log-float-toggle';
        floatToggle.innerHTML = '📜';
        floatToggle.title = i18n.t('ui.toggleHistory');
        document.body.appendChild(floatToggle);
        this.elements.logFloatToggle = floatToggle;
        
        // Panel de historial
        const logPanel = document.createElement('div');
        logPanel.className = 'tv-action-log collapsed';
        logPanel.innerHTML = `
            <div class="tv-log-header">
                <span>${i18n.t('ui.historyTitle')}</span>
                <button class="tv-log-toggle">✕</button>
            </div>
            <div class="tv-log-content" data-log-content></div>
        `;
        
        document.body.appendChild(logPanel);
        this.elements.actionLog = logPanel;
        this.elements.logContent = logPanel.querySelector('[data-log-content]');
        this.elements.logToggle = logPanel.querySelector('.tv-log-toggle');
        
        // Event listeners para toggle
        floatToggle.addEventListener('click', () => this.toggleActionLog());
        this.elements.logToggle.addEventListener('click', () => this.toggleActionLog());
        
        // Actualizar historial inicialmente
        this.updateActionLog();
        
        // Observar cambios en el historial de Underscript
        this.setupLogObserver();
    }

    setupLogObserver() {
        // Buscar el elemento #log de Underscript
        const underscriptLog = document.querySelector('#history #log');
        
        if (underscriptLog) {
            // Crear MutationObserver para detectar cambios
            this.logObserver = new MutationObserver(() => {
                this.updateActionLog();
            });
            
            // Observar cambios en childList (nuevas entradas)
            this.logObserver.observe(underscriptLog, {
                childList: true,
                subtree: false
            });
            
            console.log('[TournamentView] Observando historial de Underscript');
        } else {
            console.warn('[TournamentView] No se encontró #history #log de Underscript');
            // Reintentar en 2 segundos
            setTimeout(() => this.setupLogObserver(), 2000);
        }
    }

    toggleActionLog() {
        this.elements.actionLog.classList.toggle('collapsed');
    }

    decodeHTMLEntities(text) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
    }

    translateLogHTML(html) {
        // Solo traducir si el idioma es español
        if (i18n.currentLanguage !== 'es') {
            return html;
        }

        // Primero decodificar entidades HTML
        const decodedHTML = this.decodeHTMLEntities(html);
        let translatedHTML = decodedHTML;

        // Primero, manejar el caso especial de "'s turn" - requiere reorganizar la frase
        // Buscar el patrón completo: <cualquier cosa>'s turn
        translatedHTML = translatedHTML.replace(
            /(<[^>]+>.*?<\/[^>]+>)'s turn/gi,
            (match, playerHTML) => `Es el turno de ${playerHTML}`
        );

        // Patrones de traducción (inglés → español)
        const translations = [
            // Turnos
            { pattern: />>> Turn (\d+)/g, replacement: '>>> Turno $1' },
            
            // Acciones de cartas
            { pattern: / played /g, replacement: ' jugó ' },
            { pattern: / used /g, replacement: ' usó ' },
            { pattern: / attacked /g, replacement: ' atacó a ' },
            { pattern: / was killed/g, replacement: ' fue eliminado' },
            
            // HP
            { pattern: / lost (\d+) hp/g, replacement: ' perdió $1 hp' },
            { pattern: / gained (\d+) hp/g, replacement: ' ganó $1 hp' },
            
            // Efectos y almas
            { pattern: /\'s effect activated/g, replacement: ': efecto activado' },
            { pattern: /\'s soul activated on /g, replacement: ': alma activada en ' },
            { pattern: /\'s soul activated/g, replacement: ': alma activada' },
            { pattern: / activated on /g, replacement: ' activado en ' },
            { pattern: / activated/g, replacement: ' activado' },
        ];

        for (const { pattern, replacement } of translations) {
            translatedHTML = translatedHTML.replace(pattern, replacement);
        }

        return translatedHTML;
    }

    parseLogEntry(entry) {
        const text = entry.textContent || '';
        // Usar outerHTML en lugar de innerHTML para obtener el contenido completo
        const html = entry.outerHTML || '';
        
        // Detectar tipo de entrada
        let type = 'info';
        if (text.includes('Turn')) type = 'turn';
        else if (text.includes('lost') && text.includes('hp')) type = 'hp';
        else if (text.includes('gained') && text.includes('hp')) type = 'heal';
        else if (text.includes('played')) type = 'card';
        else if (text.includes('used')) type = 'spell';
        else if (text.includes('activated')) type = 'artifact';
        else if (text.includes('attacked')) type = 'damage';
        else if (text.includes('killed')) type = 'damage';
        else if (text.includes('soul activated')) type = 'soul';
        
        return { html, text, type };
    }

    updateActionLog() {
        if (!this.elements.logContent) return;
        
        // Leer entradas del historial de Underscript
        const underscriptLog = document.querySelector('#history #log');
        
        if (!underscriptLog) {
            this.elements.logContent.innerHTML = `<div class="tv-log-entry tv-log-entry-info">${i18n.t('ui.waitingHistory')}</div>`;
            return;
        }
        
        // Obtener todas las entradas (divs directos de #log)
        const entries = Array.from(underscriptLog.children);
        
        // Mostrar las últimas 50 entradas (orden inverso, más recientes primero)
        const maxVisible = 50;
        const visibleEntries = entries.slice(-maxVisible).reverse();
        
        if (visibleEntries.length === 0) {
            this.elements.logContent.innerHTML = `<div class="tv-log-entry tv-log-entry-info">${i18n.t('ui.noActions')}</div>`;
            return;
        }
        
        // Limpiar contenido anterior
        this.elements.logContent.innerHTML = '';
        
        // Agregar cada entrada clonándola directamente del DOM
        visibleEntries.forEach(entry => {
            const parsed = this.parseLogEntry(entry);
            const typeClass = `tv-log-entry-${parsed.type}`;
            
            // Crear wrapper con nuestras clases
            const wrapper = document.createElement('div');
            wrapper.className = `tv-log-entry ${typeClass}`;
            
            // Si es español, traducir el contenido
            if (i18n.currentLanguage === 'es') {
                // Obtener el innerHTML (contenido interno sin el div padre)
                const translatedContent = this.translateLogHTML(entry.innerHTML);
                wrapper.innerHTML = translatedContent;
            } else {
                // Clonar el contenido interno directamente
                Array.from(entry.childNodes).forEach(child => {
                    wrapper.appendChild(child.cloneNode(true));
                });
            }
            
            this.elements.logContent.appendChild(wrapper);
        });
        
        // Scroll al final para mostrar siempre las más recientes
        setTimeout(() => {
            if (this.elements.logContent) {
                this.elements.logContent.scrollTop = this.elements.logContent.scrollHeight;
            }
        }, 0);
    }

    createHeader() {
        const header = document.createElement('div');
        header.className = 'tv-header';
        
        // Información del jugador (izquierda)
        const playerInfo = document.createElement('div');
        playerInfo.className = 'tv-player-info';
        playerInfo.innerHTML = `
            <div class="tv-player-name" data-player="player">Player</div>
            <div class="tv-player-soul">
                <div class="tv-soul-text" data-soul="player">-</div>
            </div>
            <div class="tv-player-hp">
                <div class="tv-hp-bar">
                    <div class="tv-hp-fill" data-hp-bar="player" style="width: 100%"></div>
                </div>
                <div class="tv-hp-text" data-hp-text="player">30/30</div>
            </div>
            <div class="tv-player-gold">
                <div class="tv-gold-text" data-gold="player">0 G</div>
            </div>
            <div class="tv-player-artifacts">
                <div class="tv-artifacts-text" data-artifacts="player">-</div>
            </div>
            <div class="tv-player-cards">
                <div class="tv-card-counter">
                    <div class="tv-card-counter-label">${i18n.t('ui.hand')}</div>
                    <div class="tv-card-counter-value" data-hand="player">0</div>
                </div>
                <div class="tv-card-counter">
                    <div class="tv-card-counter-label">${i18n.t('ui.deck')}</div>
                    <div class="tv-card-counter-value" data-deck="player">0</div>
                </div>
                <div class="tv-card-counter">
                    <div class="tv-card-counter-label">${i18n.t('ui.graveyard')}</div>
                    <div class="tv-card-counter-value" data-graveyard="player">0</div>
                </div>
            </div>
        `;
        
        // Información central (turno)
        const centerInfo = document.createElement('div');
        centerInfo.className = 'tv-center-info';
        centerInfo.innerHTML = `
            <div class="tv-turn-indicator">
                <div class="tv-turn-label">${i18n.t('ui.turn')}</div>
                <div class="tv-turn-number" data-turn>0</div>
                <div class="tv-turn-timer" data-timer>-</div>
            </div>
        `;
        
        // Información del oponente (derecha)
        const opponentInfo = document.createElement('div');
        opponentInfo.className = 'tv-opponent-info';
        opponentInfo.innerHTML = `
            <div class="tv-player-name" data-player="opponent">Opponent</div>
            <div class="tv-player-soul">
                <div class="tv-soul-text" data-soul="opponent">-</div>
            </div>
            <div class="tv-player-hp">
                <div class="tv-hp-bar">
                    <div class="tv-hp-fill" data-hp-bar="opponent" style="width: 100%"></div>
                </div>
                <div class="tv-hp-text" data-hp-text="opponent">30/30</div>
            </div>
            <div class="tv-player-gold">
                <div class="tv-gold-text" data-gold="opponent">0 G</div>
            </div>
            <div class="tv-player-artifacts">
                <div class="tv-artifacts-text" data-artifacts="opponent">-</div>
            </div>
            <div class="tv-player-cards">
                <div class="tv-card-counter">
                    <div class="tv-card-counter-label">${i18n.t('ui.hand')}</div>
                    <div class="tv-card-counter-value" data-hand="opponent">0</div>
                </div>
                <div class="tv-card-counter">
                    <div class="tv-card-counter-label">${i18n.t('ui.deck')}</div>
                    <div class="tv-card-counter-value" data-deck="opponent">0</div>
                </div>
                <div class="tv-card-counter">
                    <div class="tv-card-counter-label">${i18n.t('ui.graveyard')}</div>
                    <div class="tv-card-counter-value" data-graveyard="opponent">0</div>
                </div>
            </div>
        `;
        
        header.appendChild(playerInfo);
        header.appendChild(centerInfo);
        header.appendChild(opponentInfo);
        
        this.container.appendChild(header);
        
        // Guardar referencias
        this.elements.playerName = playerInfo.querySelector('[data-player="player"]');
        this.elements.opponentName = opponentInfo.querySelector('[data-player="opponent"]');
        this.elements.playerSoul = playerInfo.querySelector('[data-soul="player"]');
        this.elements.opponentSoul = opponentInfo.querySelector('[data-soul="opponent"]');
        this.elements.playerHpBar = playerInfo.querySelector('[data-hp-bar="player"]');
        this.elements.opponentHpBar = opponentInfo.querySelector('[data-hp-bar="opponent"]');
        this.elements.playerHpText = playerInfo.querySelector('[data-hp-text="player"]');
        this.elements.opponentHpText = opponentInfo.querySelector('[data-hp-text="opponent"]');
        this.elements.playerGold = playerInfo.querySelector('[data-gold="player"]');
        this.elements.opponentGold = opponentInfo.querySelector('[data-gold="opponent"]');
        this.elements.playerArtifacts = playerInfo.querySelector('[data-artifacts="player"]');
        this.elements.opponentArtifacts = opponentInfo.querySelector('[data-artifacts="opponent"]');
        this.elements.playerHand = playerInfo.querySelector('[data-hand="player"]');
        this.elements.opponentHand = opponentInfo.querySelector('[data-hand="opponent"]');
        this.elements.playerDeck = playerInfo.querySelector('[data-deck="player"]');
        this.elements.opponentDeck = opponentInfo.querySelector('[data-deck="opponent"]');
        this.elements.playerGraveyard = playerInfo.querySelector('[data-graveyard="player"]');
        this.elements.opponentGraveyard = opponentInfo.querySelector('[data-graveyard="opponent"]');
        this.elements.turnNumber = centerInfo.querySelector('[data-turn]');
        this.elements.turnTimer = centerInfo.querySelector('[data-timer]');
    }

    updatePlayerNames() {
        if (this.elements.playerName && gameState.player.username) {
            this.elements.playerName.textContent = gameState.player.username;
        }
        if (this.elements.opponentName && gameState.opponent.username) {
            this.elements.opponentName.textContent = gameState.opponent.username;
        }
    }

    updateHP(player = 'player') {
        const data = player === 'player' ? gameState.player : gameState.opponent;
        const hpBar = this.elements[`${player}HpBar`];
        const hpText = this.elements[`${player}HpText`];
        
        if (hpBar && hpText && data.maxHp > 0) {
            // Calcular porcentaje y cambio
            const percentage = (data.hp / data.maxHp) * 100;
            const oldWidth = parseFloat(hpBar.style.width) || 100;
            const hpChange = percentage - oldWidth;
            
            // Actualizar barra y texto
            hpBar.style.width = `${percentage}%`;
            hpText.textContent = `${data.hp}/${data.maxHp}`;
            
            // Agregar animación según el tipo de cambio
            if (hpChange < 0) {
                // Daño recibido
                hpBar.classList.add('hp-damage');
                setTimeout(() => hpBar.classList.remove('hp-damage'), 500);
                
                // Mostrar notificación
                const playerName = data.username || (player === 'player' ? i18n.t('player.default') : i18n.t('player.opponent'));
                const damage = Math.abs(Math.round(hpChange * data.maxHp / 100));
                this.showFloatingNotification(i18n.t('notif.receivedDamage', { player: playerName, damage }), 'damage', 2500);
            } else if (hpChange > 0) {
                // Curación recibida
                hpBar.classList.add('hp-heal');
                setTimeout(() => hpBar.classList.remove('hp-heal'), 500);
                
                // Mostrar notificación
                const playerName = data.username || (player === 'player' ? i18n.t('player.default') : i18n.t('player.opponent'));
                const heal = Math.round(hpChange * data.maxHp / 100);
                this.showFloatingNotification(i18n.t('notif.healed', { player: playerName, heal }), 'heal', 2500);
            }
        }
    }

    updateGold(player = 'player') {
        const data = player === 'player' ? gameState.player : gameState.opponent;
        const goldElement = this.elements[`${player}Gold`];
        
        if (goldElement) {
            goldElement.textContent = `${data.gold} G`;
        }
    }

    updateTurn() {
        if (this.elements.turnNumber) {
            this.elements.turnNumber.textContent = gameState.turn;
        }
    }

    updateSoul(playerType = 'player') {
        const player = playerType === 'player' ? gameState.player : gameState.opponent;
        const element = this.elements[playerType + 'Soul'];
        
        console.log(`[TournamentView] updateSoul(${playerType}) - Soul data:`, player.soul, 'Type:', typeof player.soul);
        
        if (element) {
            // Verificar si hay alma (no vacía)
            if (player.soul && player.soul !== '') {
                // Limpiar contenido anterior
                element.innerHTML = '';
                
                // Intentar obtener URL de imagen
                const imageUrl = getSoulImageUrl(player.soul);
                console.log(`[TournamentView] updateSoul(${playerType}) - Image URL:`, imageUrl);
                
                if (imageUrl) {
                    // Crear elemento de imagen
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.alt = typeof player.soul === 'string' ? player.soul : player.soul.name;
                    img.className = 'tv-soul-image';
                    img.style.width = '24px';
                    img.style.height = '24px';
                    img.style.objectFit = 'contain';
                    img.style.filter = 'drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.8))';
                    
                    // Agregar atributo data para poder identificarlo
                    img.setAttribute(`data-${playerType}-soul`, 'true');
                    
                    // Si la imagen falla, mostrar texto
                    img.onerror = () => {
                        console.error(`[TournamentView] Error cargando imagen de alma:`, imageUrl);
                        element.textContent = typeof player.soul === 'string' ? player.soul : player.soul.name;
                    };
                    
                    element.appendChild(img);
                    element.title = `Soul: ${typeof player.soul === 'string' ? player.soul : player.soul.name}`;
                } else {
                    // Fallback: mostrar solo texto
                    element.textContent = typeof player.soul === 'string' ? player.soul : player.soul.name;
                    element.title = `Soul: ${typeof player.soul === 'string' ? player.soul : player.soul.name}`;
                }
            } else {
                console.log(`[TournamentView] updateSoul(${playerType}) - No soul data, showing dash`);
                element.textContent = '-';
            }
        } else {
            console.error(`[TournamentView] updateSoul(${playerType}) - Element not found!`);
        }
    }

    updateArtifacts(playerType = 'player') {
        const player = playerType === 'player' ? gameState.player : gameState.opponent;
        const element = this.elements[playerType + 'Artifacts'];
        
        if (element) {
            if (player.artifacts && player.artifacts.length > 0) {
                // Limpiar contenido anterior
                element.innerHTML = '';
                element.style.display = 'flex';
                element.style.gap = '0.25rem';
                element.style.alignItems = 'center';
                
                // Crear elementos para cada artefacto
                player.artifacts.forEach((artifact, index) => {
                    const artifactContainer = document.createElement('div');
                    artifactContainer.style.position = 'relative';
                    artifactContainer.style.display = 'inline-block';
                    
                    const imageUrl = getArtifactImageUrl(artifact);
                    
                    if (imageUrl) {
                        // Crear imagen del artefacto - más grande para mejor visibilidad
                        const img = document.createElement('img');
                        img.src = imageUrl;
                        img.alt = artifact.name || 'Artifact';
                        img.className = 'tv-artifact-image';
                        img.style.width = '36px';
                        img.style.height = '36px';
                        img.style.objectFit = 'contain';
                        img.style.filter = 'drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.9))';
                        
                        // Agregar atributo data para identificarlo
                        if (artifact.id) {
                            img.setAttribute('data-artifact-id', artifact.id);
                        }
                        
                        // Si la imagen falla, mostrar texto
                        img.onerror = () => {
                            artifactContainer.innerHTML = '';
                            const text = document.createElement('span');
                            text.textContent = artifact.name + (artifact.counter ? `(${artifact.counter})` : '');
                            text.style.fontSize = '0.875rem';
                            text.style.color = '#a78bfa';
                            text.style.fontWeight = 'bold';
                            artifactContainer.appendChild(text);
                        };
                        
                        artifactContainer.appendChild(img);
                        
                        // Si tiene contador, mostrarlo sobre la imagen - más grande y visible
                        if (artifact.counter) {
                            const counter = document.createElement('div');
                            counter.textContent = artifact.counter;
                            counter.style.position = 'absolute';
                            counter.style.top = '-6px';
                            counter.style.right = '-6px';
                            counter.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                            counter.style.color = '#ffffff';
                            counter.style.borderRadius = '50%';
                            counter.style.width = '22px';
                            counter.style.height = '22px';
                            counter.style.display = 'flex';
                            counter.style.alignItems = 'center';
                            counter.style.justifyContent = 'center';
                            counter.style.fontSize = '0.75rem';
                            counter.style.fontWeight = 'bold';
                            counter.style.border = '2px solid #ffffff';
                            counter.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.3)';
                            counter.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.8)';
                            artifactContainer.appendChild(counter);
                        }
                        
                        artifactContainer.title = artifact.name + (artifact.counter ? ` (${artifact.counter})` : '');
                    } else {
                        // Fallback: mostrar texto
                        const text = document.createElement('span');
                        text.textContent = artifact.name + (artifact.counter ? `(${artifact.counter})` : '');
                        text.style.fontSize = '0.875rem';
                        text.style.color = '#a78bfa';
                        text.style.fontWeight = 'bold';
                        artifactContainer.appendChild(text);
                    }
                    
                    element.appendChild(artifactContainer);
                    
                    // Añadir separador si no es el último
                    if (index < player.artifacts.length - 1) {
                        const separator = document.createElement('span');
                        separator.textContent = ',';
                        separator.style.fontSize = '0.75rem';
                        separator.style.color = '#666';
                        separator.style.marginRight = '0.25rem';
                        element.appendChild(separator);
                    }
                });
                
                // Tooltip con todos los artefactos
                const tooltipText = player.artifacts
                    .map(a => a.name + (a.counter ? `(${a.counter})` : ''))
                    .join(', ');
                element.title = tooltipText;
            } else {
                element.textContent = '-';
                element.title = 'Sin artefactos';
            }
        }
    }

    updateCards(playerType = 'player') {
        const player = playerType === 'player' ? gameState.player : gameState.opponent;
        
        const handElement = this.elements[playerType + 'Hand'];
        const deckElement = this.elements[playerType + 'Deck'];
        const graveyardElement = this.elements[playerType + 'Graveyard'];
        
        if (handElement) handElement.textContent = player.handCount;
        if (deckElement) deckElement.textContent = player.deckCount;
        if (graveyardElement) graveyardElement.textContent = player.graveyardCount;
    }

    updateTimer(seconds) {
        if (this.elements.turnTimer) {
            if (seconds !== null && seconds !== undefined && seconds >= 0) {
                // Formato M:SS
                const minutes = Math.floor(seconds / 60);
                const secs = seconds % 60;
                const timeStr = `${minutes}:${secs.toString().padStart(2, '0')}`;
                this.elements.turnTimer.textContent = timeStr;
                // Resaltar si quedan menos de 10 segundos
                if (seconds <= 10) {
                    this.elements.turnTimer.classList.add('low');
                } else {
                    this.elements.turnTimer.classList.remove('low');
                }
            } else {
                this.elements.turnTimer.textContent = '-';
                this.elements.turnTimer.classList.remove('low');
            }
        }
    }

    updateActivePlayer() {
        const playerInfo = this.container.querySelector('.tv-player-info');
        const opponentInfo = this.container.querySelector('.tv-opponent-info');
        
        console.log('[TournamentView] updateActivePlayer - Player ID:', gameState.player.id, 'Opponent ID:', gameState.opponent.id, 'Current:', gameState.currentPlayer);
        
        if (playerInfo && opponentInfo) {
            // Remover clase active de ambos
            playerInfo.classList.remove('active-turn');
            opponentInfo.classList.remove('active-turn');
            
            // Añadir clase active al jugador activo
            if (gameState.currentPlayer === gameState.player.id) {
                console.log('[TournamentView] Marcando JUGADOR como activo');
                playerInfo.classList.add('active-turn');
            } else if (gameState.currentPlayer === gameState.opponent.id) {
                console.log('[TournamentView] Marcando OPONENTE como activo');
                opponentInfo.classList.add('active-turn');
            } else {
                console.log('[TournamentView] Advertencia: currentPlayer no coincide con ningún ID');
            }
        } else {
            console.error('[TournamentView] No se encontraron elementos playerInfo u opponentInfo');
        }
    }

    showResult(result) {
        const overlay = document.createElement('div');
        overlay.className = 'tv-result-overlay';
        
        const title = result === 'victory' ? i18n.t('result.victory') : i18n.t('result.defeat');
        const titleClass = result === 'victory' ? 'victory' : 'defeat';
        
        overlay.innerHTML = `
            <div class="tv-result-container">
                <div class="tv-result-title ${titleClass}">${title}</div>
                <div class="tv-result-stats">
                    <div class="tv-result-stat">
                        <span class="tv-result-stat-label">${i18n.t('ui.totalTurns')}</span>
                        <span class="tv-result-stat-value">${gameState.turn}</span>
                    </div>
                    <div class="tv-result-stat">
                        <span class="tv-result-stat-label">${i18n.t('ui.finalHP')}</span>
                        <span class="tv-result-stat-value">${gameState.player.hp}/${gameState.player.maxHp}</span>
                    </div>
                </div>
            </div>
        `;
        
        this.container.appendChild(overlay);
        
        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 500);
            }
        }, 5000);
    }

    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.remove();
        }
        this.container = null;
        
        // Desconectar observer del historial
        if (this.logObserver) {
            this.logObserver.disconnect();
            this.logObserver = null;
        }
        
        // Remover botón flotante y panel de historial
        if (this.elements.logFloatToggle) {
            this.elements.logFloatToggle.remove();
        }
        if (this.elements.actionLog) {
            this.elements.actionLog.remove();
        }
        
        this.elements = {};
    }
}

// Initialize UIManager
const uiManager = new UIManager();

// Timer watcher
let timerWatcher = null;

// Función helper para iniciar el observador del timer
function startTimerWatcher() {
    if (timerWatcher) clearInterval(timerWatcher);
    
    console.log('[TournamentView] Iniciando timer watcher...');
    
    timerWatcher = setInterval(() => {
        try {
            // Intentar obtener tiempo del global del juego
            const time = window.global ? window.global('time') : null;
            if (time !== null && time !== undefined) {
                uiManager.updateTimer(Math.max(0, time));
                return;
            }
            
            // Fallback: intentar leer del DOM
            // Buscar el timer (único elemento que cambia de ally/enemy según el turno)
            const timerElement = document.querySelector('.timer.active');
            if (timerElement) {
                const timeSpan = timerElement.querySelector('.white');
                if (timeSpan && timeSpan.textContent) {
                    const timeText = timeSpan.textContent.trim();
                    const timeParts = timeText.split(':');
                    if (timeParts.length === 2) {
                        const minutes = parseInt(timeParts[0]) || 0;
                        const seconds = parseInt(timeParts[1]) || 0;
                        const totalSeconds = minutes * 60 + seconds;
                        uiManager.updateTimer(totalSeconds);
                    }
                }
            } else {
                // Si no existe .timer.active, intentar con cualquier .timer
                const anyTimer = document.querySelector('.timer');
                if (anyTimer) {
                    const timeSpan = anyTimer.querySelector('.white');
                    if (timeSpan && timeSpan.textContent) {
                        const timeText = timeSpan.textContent.trim();
                        const timeParts = timeText.split(':');
                        if (timeParts.length === 2) {
                            const minutes = parseInt(timeParts[0]) || 0;
                            const seconds = parseInt(timeParts[1]) || 0;
                            const totalSeconds = minutes * 60 + seconds;
                            uiManager.updateTimer(totalSeconds);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('[TournamentView] Error leyendo timer:', error);
        }
    }, 500); // Actualizar cada 500ms
}

// ============================================
// SETTINGS
// ============================================

// Setting básico de activación
const isEnabled = plugin.settings().add({
    key: 'enabled',
    name: 'Activar Tournament View',
    type: 'boolean',
    default: false,
});

// Setting de idioma
const languageSetting = plugin.settings().add({
    key: 'language',
    name: 'Idioma / Language',
    description: 'Seleccionar idioma de la interfaz / Select interface language',
    type: 'select',
    default: 'es',
    data: ['es', 'en'],
    onChange: (newValue) => {
        console.log('[TournamentView] Cambiando idioma a:', newValue);
        i18n.setLanguage(newValue);
        
        // Si hay UI activa, regenerarla con el nuevo idioma
        if (uiManager.container) {
            console.log('[TournamentView] Regenerando UI con nuevo idioma');
            uiManager.destroy();
            uiManager.initialize();
            
            // Si hay una partida activa, actualizar todos los datos
            if (gameState.isActive) {
                uiManager.update();
            }
        }
    }
});

// ========================================
// Sistema de Gestión de Plantillas
// ========================================

// Clase base para settings personalizados
class FakeSetting extends underscript.utils.SettingType {
    value(val) {
        return val;
    }
    encode(value) {
        return value;
    }
    default() {
        return undefined;
    }
}

// Tipo personalizado para elementos de plantilla con botones
class TemplateElement extends FakeSetting {
    constructor(name = 'templateElement') {
        super(name);
    }
    element(value, update, { remove = false }) {
        const isActive = value && value.active;
        const canDelete = value && value.canDelete;
        
        console.log('[TemplateElement] Creando elemento con value:', value);
        
        // Crear spans con glyphicons como en uc_replays.js
        const activateIcon = $(`<span class="glyphicon ${isActive ? 'glyphicon-star' : 'glyphicon-star-empty'}" 
            style="cursor: pointer; padding-right: 8px; color: ${isActive ? '#5cb85c' : '#999'};" 
            title="${isActive ? 'Plantilla activa' : 'Activar plantilla'}"></span>`)
            .on('click', e => {
                e.preventDefault();
                console.log('[TemplateElement] Activar clicked');
                update('activate');
            });
        
        const exportIcon = $(`<span class="glyphicon glyphicon-download-alt" 
            style="cursor: pointer; padding-right: 8px; color: #337ab7;" 
            title="Exportar plantilla"></span>`)
            .on('click', e => {
                e.preventDefault();
                console.log('[TemplateElement] Exportar clicked');
                update('export');
            });
        
        // Usar .add() para concatenar como en uc_replays.js
        let result = activateIcon.add(exportIcon);
        
        if (canDelete) {
            const deleteIcon = $(`<span class="glyphicon glyphicon-trash" 
                style="cursor: pointer; padding-right: 8px; color: #d9534f;" 
                title="Eliminar plantilla"></span>`)
                .on('click', e => {
                    e.preventDefault();
                    console.log('[TemplateElement] Eliminar clicked');
                    update('delete');
                });
            
            result = result.add(deleteIcon);
        }
        
        return result;
    }
    labelFirst() {
        return false;  // Iconos a la derecha como en uc_replays.js
    }
}

// Registrar el tipo personalizado
plugin.settings().addType(new TemplateElement());

// Tipo personalizado para el input de archivo
class FileInputElement extends FakeSetting {
    constructor(name = 'fileInputElement') {
        super(name);
    }
    element(value, update, { remove = false }) {
        return $(`<input type="file" accept="application/json,.json" style="margin: 5px 0;"/>`)
            .change(e => {
                if (!e.target.files || !e.target.files[0]) return;
                
                const file = e.target.files[0];
                console.log('[TournamentView] Procesando archivo:', file.name);
                
                const reader = new FileReader();
                
                reader.onload = (readerEvent) => {
                    try {
                        const text = readerEvent.target.result;
                        const result = templateManager.importTemplate(text);
                        
                        if (result.success) {
                            console.log('[TournamentView] Plantilla importada exitosamente:', result.template.metadata.name);
                            
                            // Activar la nueva plantilla
                            activateTemplate(result.template.metadata.id);
                            
                            // Regenerar la lista de plantillas
                            refreshTemplateSettings();
                            
                            alert(`✅ Plantilla "${result.template.metadata.name}" importada y activada exitosamente`);
                        } else {
                            console.error('[TournamentView] Error al importar plantilla:', result.errors);
                            alert(`❌ Error al importar plantilla:\n\n${result.errors.join('\n')}`);
                        }
                    } catch (error) {
                        console.error('[TournamentView] Error al procesar archivo:', error);
                        alert(`❌ Error al procesar archivo: ${error.message}`);
                    }
                };
                
                reader.onerror = () => {
                    console.error('[TournamentView] Error al leer archivo');
                    alert('❌ Error al leer el archivo');
                };
                
                reader.readAsText(file);
                
                // Reset el input
                e.target.value = '';
            });
    }
    labelFirst() {
        return true;
    }
}

// Registrar el tipo personalizado
plugin.settings().addType(new FileInputElement());

// Función auxiliar para activar una plantilla
function activateTemplate(templateId) {
    console.log('[TournamentView] Activando plantilla:', templateId);
    
    const success = templateManager.setActiveTemplate(templateId);
    if (success) {
        console.log('[TournamentView] Plantilla activada exitosamente');
        
        // Inyectar CSS de la nueva plantilla
        templateManager.injectCSS();
        
        // Si hay UI activa, regenerarla con la nueva plantilla
        if (uiManager.container) {
            console.log('[TournamentView] Regenerando UI con nueva plantilla');
            uiManager.destroy();
            uiManager.initialize();
            
            // Si hay una partida activa, restaurar todos los datos visuales
            if (gameState.isActive) {
                console.log('[TournamentView] Restaurando datos visuales de la partida');
                
                // Actualizar nombres de jugadores
                uiManager.updatePlayerNames();
                
                // Actualizar souls
                if (gameState.player.soul) {
                    uiManager.updateSoul('player', gameState.player.soul);
                }
                if (gameState.opponent.soul) {
                    uiManager.updateSoul('opponent', gameState.opponent.soul);
                }
                
                // Actualizar jugador activo
                if (gameState.currentPlayer) {
                    uiManager.updateActivePlayer(gameState.currentPlayer);
                }
                
                // Actualizar estadísticas completas (HP, G, cartas, artefactos)
                const playerStats = getPlayersStats();
                uiManager.updatePlayerStats(
                    gameState.player.name,
                    playerStats.playerHp,
                    playerStats.playerMaxHp,
                    playerStats.playerGold,
                    playerStats.playerHand,
                    playerStats.playerDeck,
                    playerStats.playerGraveyard,
                    playerStats.playerArtifacts
                );
                
                uiManager.updateOpponentStats(
                    gameState.opponent.name,
                    playerStats.opponentHp,
                    playerStats.opponentMaxHp,
                    playerStats.opponentGold,
                    playerStats.opponentHand,
                    playerStats.opponentDeck,
                    playerStats.opponentGraveyard,
                    playerStats.opponentArtifacts
                );
                
                // Actualizar tablero
                const boardState = gameState.getBoardState();
                uiManager.updateBoard(boardState.playerBoard, boardState.opponentBoard);
                
                // Actualizar turno
                if (gameState.turn > 0) {
                    uiManager.updateTurn(gameState.turn);
                }
            }
        }
        
        // Refrescar la lista de plantillas para actualizar el botón "Activa"
        refreshTemplateSettings();
    } else {
        console.error('[TournamentView] Error al activar plantilla');
        alert('❌ Error al activar plantilla');
    }
}

// Storage para los settings de plantillas
const templateSettings = {};

// Función para crear/actualizar los settings de plantillas
function refreshTemplateSettings() {
    const templates = templateManager.templates; // Usar directamente el array de templates
    const activeTemplateId = templateManager.getActiveTemplateId();
    const predefinedTemplateIds = ['default', 'minimal', 'esports'];
    
    // Limpiar settings anteriores
    Object.keys(templateSettings).forEach(key => {
        const templateId = key.replace('template_', '');
        if (!templates.find(t => t.metadata.id === templateId)) {
            // La plantilla ya no existe, remover el setting
            const settingKey = 'TournamentView.' + key;
            $('#underscript\\.plugin\\.' + settingKey.replace(/\./g, '\\.')).parent().remove();
            delete templateSettings[key];
        }
    });
    
    // Crear/actualizar settings para cada plantilla
    templates.forEach(template => {
        const templateId = template.metadata.id;
        const settingKey = 'template_' + templateId;
        const isActive = templateId === activeTemplateId;
        const canDelete = !predefinedTemplateIds.includes(templateId);
        
        if (templateSettings[settingKey]) {
            // Actualizar el setting existente
            templateSettings[settingKey].set({ active: isActive, canDelete: canDelete });
        } else {
            // Crear nuevo setting
            templateSettings[settingKey] = plugin.settings().add({
                key: settingKey,
                name: template.metadata.name,
                description: template.metadata.description || `v${template.metadata.version} por ${template.metadata.author}`,
                type: 'TournamentView:templateElement',
                category: 'Plantillas',
                export: false,
                default: { active: isActive, canDelete: canDelete },
                onChange: (action, oldValue) => {
                    console.log('[TournamentView] onChange llamado con action:', action);
                    if (!action) return;
                    
                    // Resetear el valor inmediatamente como en uc_replays.js
                    templateSettings[settingKey].set(undefined);
                    
                    if (action === 'activate') {
                        activateTemplate(templateId);
                        
                    } else if (action === 'export') {
                        console.log('[TournamentView] Exportando plantilla:', templateId);
                        
                        const result = templateManager.exportTemplate(templateId);
                        if (result.success) {
                            const blob = new Blob([result.data], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `template_${templateId}_${Date.now()}.json`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            
                            console.log('[TournamentView] Plantilla exportada exitosamente');
                            alert(`✅ Plantilla "${template.metadata.name}" exportada exitosamente`);
                        } else {
                            console.error('[TournamentView] Error al exportar plantilla:', result.error);
                            alert(`❌ Error al exportar: ${result.error}`);
                        }
                        
                    } else if (action === 'delete') {
                        if (!canDelete) {
                            alert('❌ No se pueden eliminar las plantillas predefinidas');
                            return;
                        }
                        
                        if (confirm(`¿Seguro que deseas eliminar la plantilla "${template.metadata.name}"?`)) {
                            console.log('[TournamentView] Eliminando plantilla:', templateId);
                            
                            // Si es la plantilla activa, cambiar a default
                            if (isActive) {
                                activateTemplate('default');
                            }
                            
                            // Eliminar la plantilla
                            templateManager.deleteTemplate(templateId);
                            
                            // Remover el setting del DOM
                            const settingDomKey = 'underscript\\.plugin\\.TournamentView\\.' + settingKey;
                            $('#' + settingDomKey).parent().remove();
                            delete templateSettings[settingKey];
                            
                            alert(`✅ Plantilla "${template.metadata.name}" eliminada`);
                        }
                    }
                }
            });
        }
    });
}

// Setting para importar plantilla (al inicio de la categoría)
plugin.settings().add({
    key: 'importTemplate',
    name: 'Importar Plantilla',
    description: 'Selecciona un archivo JSON para importar una plantilla personalizada',
    type: 'TournamentView:fileInputElement',
    category: 'Plantillas',
    export: false,
});

// Inicializar la lista de plantillas
refreshTemplateSettings();

console.log('[TournamentView] Setting creado - isEnabled:', isEnabled);
console.log('[TournamentView] Setting creado - isEnabled.value():', isEnabled.value());
console.log('[TournamentView] Setting creado - typeof isEnabled.value():', typeof isEnabled.value());

// Listener para cambios en el setting
isEnabled.on('change', (newValue) => {
    console.log('[TournamentView] Setting cambiado a:', newValue);
    
    if (!newValue) {
        // Desactivado: destruir UI y limpiar estado
        console.log('[TournamentView] Desactivando plugin...');
        if (timerWatcher) {
            clearInterval(timerWatcher);
            timerWatcher = null;
        }
        uiManager.destroy();
        templateManager.removeCSS();
        gameState.reset();
        console.log('[TournamentView] Plugin desactivado');
    } else {
        // Activado: reinicializar si estamos en Spectate
        console.log('[TournamentView] Activando plugin...');
        if (underscript.onPage('Spectate')) {
            gameState.isSpectate = true;
            templateManager.injectCSS();
            uiManager.initialize();
            console.log('[TournamentView] Plugin activado');
        }
    }
});

// ============================================
// EVENT HANDLERS
// ============================================

// Evento principal de carga
plugin.events.on(':preload', () => {
    // Inicializar idioma desde configuración (antes de cualquier otra cosa)
    try {
        const savedLanguage = languageSetting.value();
        if (savedLanguage) {
            i18n.setLanguage(savedLanguage);
            console.log('[TournamentView] Idioma inicializado:', savedLanguage);
        } else {
            console.log('[TournamentView] No hay idioma guardado, usando default: es');
        }
    } catch (e) {
        console.error('[TournamentView] Error inicializando idioma:', e);
    }
    
    console.log('[TournamentView] :preload - isEnabled.value():', isEnabled.value());
    
    if (!isEnabled.value()) {
        console.log('[TournamentView] Plugin DESACTIVADO - No se iniciará');
        return;
    }
    
    // Solo ejecutar en página Spectate
    if (!underscript.onPage('Spectate')) {
        console.log('[TournamentView] No estamos en Spectate, plugin inactivo');
        return;
    }

    gameState.isSpectate = true;
    console.log('[TournamentView] Plugin cargado en modo Spectate');
    
    // Inyectar CSS
    templateManager.injectCSS();
    
    // Inicializar UI
    uiManager.initialize();
});

// Evento: Conexión inicial (datos de jugadores)
plugin.events.on('connect', (data) => {
    console.log('[TournamentView] connect - isEnabled.value():', isEnabled.value(), 'isSpectate:', gameState.isSpectate);
    
    if (!isEnabled.value() || !gameState.isSpectate) {
        console.log('[TournamentView] connect - Plugin desactivado o no en modo espectador, ignorando evento');
        return;
    }

    console.log('[TournamentView] Conexión establecida:', data);
    
    try {
        // Parsear datos de jugadores
        const you = data.you ? JSON.parse(data.you) : null;
        const enemy = data.enemy ? JSON.parse(data.enemy) : null;
        const golds = data.golds ? JSON.parse(data.golds) : {};
        
        // Capturar turno actual si ya está en curso
        if (data.turn !== undefined && data.turn !== null) {
            gameState.turn = parseInt(data.turn) || 0;
            console.log('[TournamentView] Turno inicial capturado:', gameState.turn);
        }
        
        // Capturar jugador activo
        if (data.userTurn !== undefined) {
            gameState.currentPlayer = data.userTurn;
            console.log('[TournamentView] Turno activo de:', data.userTurn);
        }
        
        // Inicializar datos del jugador principal
        if (you) {
            gameState.player.id = you.id;
            gameState.player.username = you.username || i18n.t('player.default');
            gameState.player.hp = you.hp || 30;
            gameState.player.maxHp = you.maxHp || 30;
            gameState.player.gold = golds[you.id] || 0;
            
            // Intentar capturar alma desde varias fuentes
            gameState.player.soul = data.yourSoul || getSoulFromDOM(0) || '';
            gameState.player.soulLives = 0; // Se actualizará con getUpdateSoul
            console.log('[TournamentView] Player soul captured:', gameState.player.soul, 'Type:', typeof gameState.player.soul);
            
            // Capturar artefactos iniciales si existen
            if (data.artifacts) {
                try {
                    const artifacts = JSON.parse(data.artifacts);
                    if (artifacts[you.id]) {
                        gameState.player.artifacts = artifacts[you.id];
                        console.log('[TournamentView] Artefactos del jugador:', gameState.player.artifacts);
                        gameState.player.artifacts.forEach(art => {
                            const counter = getArtifactCounter(art);
                            console.log(`  - ${art.name}:`, 'counter:', counter, 'image:', art.image, 'id:', art.id);
                            // Guardar el contador procesado en el objeto
                            if (counter !== null) art.counter = counter;
                        });
                    }
                } catch (e) {
                    console.error('[TournamentView] Error parseando artefactos del jugador:', e);
                }
            }
        }
        
        // Inicializar datos del oponente
        if (enemy) {
            gameState.opponent.id = enemy.id;
            gameState.opponent.username = enemy.username || i18n.t('player.opponent');
            gameState.opponent.hp = enemy.hp || 30;
            gameState.opponent.maxHp = enemy.maxHp || 30;
            gameState.opponent.gold = golds[enemy.id] || 0;
            
            // Intentar capturar alma desde varias fuentes
            gameState.opponent.soul = data.enemySoul || getSoulFromDOM(1) || '';
            gameState.opponent.soulLives = 0; // Se actualizará con getUpdateSoul
            console.log('[TournamentView] Opponent soul captured:', gameState.opponent.soul, 'Type:', typeof gameState.opponent.soul);
            
            // Capturar artefactos iniciales si existen
            if (data.artifacts) {
                try {
                    const artifacts = JSON.parse(data.artifacts);
                    if (artifacts[enemy.id]) {
                        gameState.opponent.artifacts = artifacts[enemy.id];
                        console.log('[TournamentView] Artefactos del oponente:', gameState.opponent.artifacts);
                        gameState.opponent.artifacts.forEach(art => {
                            const counter = getArtifactCounter(art);
                            console.log(`  - ${art.name}:`, 'counter:', counter, 'image:', art.image, 'id:', art.id);
                            // Guardar el contador procesado en el objeto
                            if (counter !== null) art.counter = counter;
                        });
                    }
                } catch (e) {
                    console.error('[TournamentView] Error parseando artefactos del oponente:', e);
                }
            }
        }
        
        // Capturar datos iniciales de cartas si están disponibles
        if (data.handsSize) {
            try {
                const handsSize = JSON.parse(data.handsSize);
                if (you && handsSize[you.id] !== undefined) {
                    gameState.player.handCount = handsSize[you.id];
                }
                if (enemy && handsSize[enemy.id] !== undefined) {
                    gameState.opponent.handCount = handsSize[enemy.id];
                }
            } catch (e) {
                console.error('[TournamentView] Error parseando handsSize inicial:', e);
            }
        }
        
        if (data.decksSize) {
            try {
                const decksSize = JSON.parse(data.decksSize);
                if (you && decksSize[you.id] !== undefined) {
                    gameState.player.deckCount = decksSize[you.id];
                }
                if (enemy && decksSize[enemy.id] !== undefined) {
                    gameState.opponent.deckCount = decksSize[enemy.id];
                }
            } catch (e) {
                console.error('[TournamentView] Error parseando decksSize inicial:', e);
            }
        }
        
        if (data.graveyardsSize) {
            try {
                const graveyardsSize = JSON.parse(data.graveyardsSize);
                if (you && graveyardsSize[you.id] !== undefined) {
                    gameState.player.graveyardCount = graveyardsSize[you.id];
                } else if (you) {
                    // Fallback: intentar capturar desde el DOM
                    gameState.player.graveyardCount = getGraveyardFromDOM(0);
                }
                if (enemy && graveyardsSize[enemy.id] !== undefined) {
                    gameState.opponent.graveyardCount = graveyardsSize[enemy.id];
                } else if (enemy) {
                    // Fallback: intentar capturar desde el DOM
                    gameState.opponent.graveyardCount = getGraveyardFromDOM(1);
                }
            } catch (e) {
                console.error('[TournamentView] Error parseando graveyardsSize inicial:', e);
                // Fallback completo: intentar desde el DOM
                if (you) gameState.player.graveyardCount = getGraveyardFromDOM(0);
                if (enemy) gameState.opponent.graveyardCount = getGraveyardFromDOM(1);
            }
        } else {
            // Si no hay datos, intentar desde el DOM
            if (you) gameState.player.graveyardCount = getGraveyardFromDOM(0);
            if (enemy) gameState.opponent.graveyardCount = getGraveyardFromDOM(1);
        }
        
        console.log('[TournamentView] Jugador:', gameState.player.username, 
                    `[${gameState.player.soul}]`,
                    `(${gameState.player.hp} HP, ${gameState.player.gold} G)`,
                    `Cartas: ${gameState.player.handCount}/${gameState.player.deckCount}/${gameState.player.graveyardCount}`,
                    gameState.player.artifacts.length > 0 ? `Artefactos: ${gameState.player.artifacts.length}` : '');
        console.log('[TournamentView] Oponente:', gameState.opponent.username, 
                    `[${gameState.opponent.soul}]`,
                    `(${gameState.opponent.hp} HP, ${gameState.opponent.gold} G)`,
                    `Cartas: ${gameState.opponent.handCount}/${gameState.opponent.deckCount}/${gameState.opponent.graveyardCount}`,
                    gameState.opponent.artifacts.length > 0 ? `Artefactos: ${gameState.opponent.artifacts.length}` : '');
        
        // Actualizar UI completa
        uiManager.updatePlayerNames();
        uiManager.updateHP('player');
        uiManager.updateHP('opponent');
        uiManager.updateGold('player');
        uiManager.updateGold('opponent');
        uiManager.updateSoul('player');
        uiManager.updateSoul('opponent');
        uiManager.updateArtifacts('player');
        uiManager.updateArtifacts('opponent');
        uiManager.updateCards('player');
        uiManager.updateCards('opponent');
        uiManager.updateTurn();
        uiManager.updateActivePlayer();
        
        // Iniciar observador del timer desde el principio
        startTimerWatcher();
    } catch (error) {
        console.error('[TournamentView] Error parseando datos de conexión:', error);
    }
});

// Evento: Inicio de partida
plugin.events.on('GameStart', (data) => {
    console.log('[TournamentView] GameStart - isEnabled.value():', isEnabled.value(), 'isSpectate:', gameState.isSpectate);
    if (!isEnabled.value() || !gameState.isSpectate) {
        console.log('[TournamentView] GameStart - Ignorando evento (desactivado o no espectador)');
        return;
    }

    console.log('[TournamentView] Partida iniciada:', data);
    gameState.isActive = true;
    gameState.turn = 0;
    
    uiManager.updateTurn();
});

// Evento: Inicio de turno
plugin.events.on('getTurnStart', (data) => {
    console.log('[TournamentView] getTurnStart - isEnabled.value():', isEnabled.value(), 'isActive:', gameState.isActive);
    if (!isEnabled.value() || !gameState.isActive) {
        console.log('[TournamentView] getTurnStart - Ignorando evento');
        return;
    }

    // Leer el turno desde el global del juego (más confiable que data.turn o incrementar)
    if (window.global && window.global('turn') !== undefined) {
        gameState.turn = window.global('turn');
    } else if (data.numTurn !== undefined) {
        gameState.turn = parseInt(data.numTurn);
    } else if (data.turn !== undefined) {
        gameState.turn = parseInt(data.turn);
    }
    // Si ninguno está disponible, mantenemos el turno actual sin incrementar
    
    // El evento getTurnStart proporciona data.idPlayer (no playerId) 
    // que indica el ID del jugador cuyo turno es
    if (data.idPlayer !== undefined) {
        gameState.currentPlayer = data.idPlayer;
    } else if (data.playerId !== undefined) {
        gameState.currentPlayer = data.playerId;
    }
    
    console.log(`[TournamentView] Turno ${gameState.turn} iniciado`);
    console.log(`[TournamentView] IDs - Player: ${gameState.player.id}, Opponent: ${gameState.opponent.id}, Current: ${gameState.currentPlayer}`);
    
    // Actualizar indicador de turno activo
    uiManager.updateActivePlayer();
    
    // Reiniciar observador del timer (ya debería estar corriendo, pero lo reiniciamos por seguridad)
    startTimerWatcher();
    
    uiManager.updateTurn();
});

// Evento: Actualización de HP del jugador
plugin.events.on('getUpdatePlayerHp', (data) => {
    if (!isEnabled.value() || !gameState.isActive) return;

    if (data.playerId === gameState.player.id) {
        gameState.updatePlayer({ hp: data.hp, maxHp: data.maxHp });
        uiManager.updateHP('player');
    } else if (data.playerId === gameState.opponent.id) {
        gameState.updateOpponent({ hp: data.hp, maxHp: data.maxHp });
        uiManager.updateHP('opponent');
    }
    
    console.log('[TournamentView] HP actualizado:', data);
});

// Evento: Actualización de estadísticas de jugadores (oro, cartas, etc.)
plugin.events.on('getPlayersStats', (data) => {
    if (!isEnabled.value() || !gameState.isActive) return;

    try {
        // Parsear oro
        if (data.golds) {
            const golds = JSON.parse(data.golds);
            if (gameState.player.id && golds[gameState.player.id] !== undefined) {
                gameState.player.gold = golds[gameState.player.id];
                uiManager.updateGold('player');
            }
            if (gameState.opponent.id && golds[gameState.opponent.id] !== undefined) {
                gameState.opponent.gold = golds[gameState.opponent.id];
                uiManager.updateGold('opponent');
            }
        }
        
        // Parsear cartas en mano
        if (data.handsSize) {
            const hands = JSON.parse(data.handsSize);
            if (gameState.player.id && hands[gameState.player.id] !== undefined) {
                gameState.player.handCount = hands[gameState.player.id];
                uiManager.updateCards('player');
            }
            if (gameState.opponent.id && hands[gameState.opponent.id] !== undefined) {
                gameState.opponent.handCount = hands[gameState.opponent.id];
                uiManager.updateCards('opponent');
            }
        }
        
        // Parsear cartas en el mazo
        if (data.decksSize) {
            const decks = JSON.parse(data.decksSize);
            if (gameState.player.id && decks[gameState.player.id] !== undefined) {
                gameState.player.deckCount = decks[gameState.player.id];
                uiManager.updateCards('player');
            }
            if (gameState.opponent.id && decks[gameState.opponent.id] !== undefined) {
                gameState.opponent.deckCount = decks[gameState.opponent.id];
                uiManager.updateCards('opponent');
            }
        }
        
        // Parsear cementerios
        if (data.graveyardsSize) {
            const graveyards = JSON.parse(data.graveyardsSize);
            console.log('[TournamentView] graveyardsSize recibido:', graveyards);
            if (gameState.player.id && graveyards[gameState.player.id] !== undefined) {
                gameState.player.graveyardCount = graveyards[gameState.player.id];
                console.log('[TournamentView] Cementerio player actualizado a:', gameState.player.graveyardCount);
                uiManager.updateCards('player');
            }
            if (gameState.opponent.id && graveyards[gameState.opponent.id] !== undefined) {
                gameState.opponent.graveyardCount = graveyards[gameState.opponent.id];
                console.log('[TournamentView] Cementerio opponent actualizado a:', gameState.opponent.graveyardCount);
                uiManager.updateCards('opponent');
            }
        } else {
            console.log('[TournamentView] No graveyardsSize en getPlayersStats, intentando leer del DOM');
            // Si no viene graveyardsSize, leer del DOM
            const playerGraveyardDOM = getGraveyardFromDOM(0);
            const opponentGraveyardDOM = getGraveyardFromDOM(1);
            
            if (playerGraveyardDOM !== gameState.player.graveyardCount) {
                gameState.player.graveyardCount = playerGraveyardDOM;
                console.log('[TournamentView] Cementerio player actualizado desde DOM a:', playerGraveyardDOM);
                uiManager.updateCards('player');
            }
            if (opponentGraveyardDOM !== gameState.opponent.graveyardCount) {
                gameState.opponent.graveyardCount = opponentGraveyardDOM;
                console.log('[TournamentView] Cementerio opponent actualizado desde DOM a:', opponentGraveyardDOM);
                uiManager.updateCards('opponent');
            }
        }
        
        // Parsear artefactos - SIEMPRE leer del DOM para tener contadores actualizados
        // El JSON no siempre incluye los contadores actualizados
        console.log('[TournamentView] Leyendo artefactos desde DOM...');
        const playerArtifactsDOM = getArtifactsFromDOM(0);
        const opponentArtifactsDOM = getArtifactsFromDOM(1);
        
        // Actualizar artefactos del jugador desde DOM
        const playerOldJSON = JSON.stringify(gameState.player.artifacts);
        const playerNewJSON = JSON.stringify(playerArtifactsDOM);
        if (playerOldJSON !== playerNewJSON && playerArtifactsDOM.length > 0) {
            gameState.player.artifacts = playerArtifactsDOM;
            console.log('[TournamentView] Artefactos del jugador actualizados desde DOM:', 
                playerArtifactsDOM.map(a => `${a.name}${a.counter ? `(${a.counter})` : ''}`).join(', '));
            uiManager.updateArtifacts('player');
        }
        
        // Actualizar artefactos del oponente desde DOM
        const opponentOldJSON = JSON.stringify(gameState.opponent.artifacts);
        const opponentNewJSON = JSON.stringify(opponentArtifactsDOM);
        if (opponentOldJSON !== opponentNewJSON && opponentArtifactsDOM.length > 0) {
            gameState.opponent.artifacts = opponentArtifactsDOM;
            console.log('[TournamentView] Artefactos del oponente actualizados desde DOM:', 
                opponentArtifactsDOM.map(a => `${a.name}${a.counter ? `(${a.counter})` : ''}`).join(', '));
            uiManager.updateArtifacts('opponent');
        }
        
        // Log simplificado de stats
        const pArts = gameState.player.artifacts.length > 0 ? ` | ${gameState.player.artifacts.length} artefactos` : '';
        const oArts = gameState.opponent.artifacts.length > 0 ? ` | ${gameState.opponent.artifacts.length} artefactos` : '';
        console.log(`[TournamentView] Stats - P: ${gameState.player.gold}G, ${gameState.player.handCount} cartas${pArts} | O: ${gameState.opponent.gold}G, ${gameState.opponent.handCount} cartas${oArts}`);
    } catch (error) {
        console.error('[TournamentView] Error parseando stats:', error);
    }
});

// Evento: Actualización del tablero
plugin.events.on('getUpdateBoard', (data) => {
    if (!isEnabled.value() || !gameState.isActive) return;

    try {
        const board = JSON.parse(data.board);
        
        // Contar cartas en el tablero de cada jugador
        // Slots 0-3: Jugador 1, Slots 4-7: Jugador 2
        let playerBoardCount = 0;
        let opponentBoardCount = 0;
        
        board.forEach((card, index) => {
            if (card) {
                if (card.ownerId === gameState.player.id) {
                    playerBoardCount++;
                } else if (card.ownerId === gameState.opponent.id) {
                    opponentBoardCount++;
                }
            }
        });
        
        gameState.player.boardCount = playerBoardCount;
        gameState.opponent.boardCount = opponentBoardCount;
        
        console.log('[TournamentView] Tablero actualizado - P:', playerBoardCount, 'cartas | O:', opponentBoardCount, 'cartas');
    } catch (error) {
        console.error('[TournamentView] Error parseando tablero:', error);
    }
});

// Evento: Victoria
plugin.events.on('getVictory', (data) => {
    if (!isEnabled.value() || !gameState.isActive) return;

    gameState.gameResult = 'victory';
    console.log('[TournamentView] Victoria detectada');
    
    uiManager.showResult('victory');
});

// Evento: Derrota
plugin.events.on('getDefeat', (data) => {
    if (!isEnabled.value() || !gameState.isActive) return;

    gameState.gameResult = 'defeat';
    console.log('[TournamentView] Derrota detectada');
    
    uiManager.showResult('defeat');
});

// Evento: Resultado (fin de partida genérico)
plugin.events.on('getResult', (data) => {
    if (!isEnabled.value() || !gameState.isActive) return;

    console.log('[TournamentView] Partida finalizada:', data);
    
    // Mostrar estado final
    setTimeout(() => {
        const state = gameState.getState();
        console.log('[TournamentView] Estado final:', state);
    }, 1000);
});

// Evento: Carta jugada en el tablero
plugin.events.on('getCardBoard', (data) => {
    if (!isEnabled.value() || !gameState.isActive) return;

    try {
        const card = JSON.parse(data.card);
        const playerName = data.idPlayer === gameState.player.id ? gameState.player.username : gameState.opponent.username;
        console.log(`[TournamentView] ${playerName} jugó: ${card.name}`);
        
        // Notificación
        uiManager.showFloatingNotification(`${playerName} jugó ${card.name}`, 'card', 3000);
    } catch (error) {
        console.error('[TournamentView] Error parseando carta:', error);
    }
});

// Evento: Hechizo usado
plugin.events.on('getSpellPlayed', (data) => {
    if (!isEnabled.value() || !gameState.isActive) return;

    try {
        const card = JSON.parse(data.card);
        const playerName = data.idPlayer === gameState.player.id ? gameState.player.username : gameState.opponent.username;
        console.log(`[TournamentView] ${playerName} usó hechizo: ${card.name}`);
        
        // Notificación
        uiManager.showFloatingNotification(`${playerName} usó ${card.name}`, 'spell', 3000);
    } catch (error) {
        console.error('[TournamentView] Error parseando hechizo:', error);
    }
});

// Evento: Monstruo destruido
plugin.events.on('getMonsterDestroyed', (data) => {
    if (!isEnabled.value() || !gameState.isActive) return;
    
    console.log('[TournamentView] Monstruo destruido, ID:', data.monsterId);
    
    // Notificación
    uiManager.showFloatingNotification('Monstruo destruido', 'damage', 2000);
});

// Evento: Actualización del alma
plugin.events.on('getUpdateSoul', (data) => {
    if (!isEnabled.value() || !gameState.isActive) return;

    try {
        const soul = JSON.parse(data.soul);
        
        if (data.idPlayer === gameState.player.id) {
            gameState.player.soulLives = soul.lives || 0;
            console.log(`[TournamentView] Alma del jugador actualizada: ${gameState.player.soul} (Vidas: ${soul.lives}, Esquiva: ${soul.dodge || 0})`);
            uiManager.updateSoul('player');
        } else if (data.idPlayer === gameState.opponent.id) {
            gameState.opponent.soulLives = soul.lives || 0;
            console.log(`[TournamentView] Alma del oponente actualizada: ${gameState.opponent.soul} (Vidas: ${soul.lives}, Esquiva: ${soul.dodge || 0})`);
            uiManager.updateSoul('opponent');
        }
    } catch (error) {
        console.error('[TournamentView] Error parseando actualización de alma:', error);
    }
});

// Evento: Efecto de artefacto
plugin.events.on('Log:ARTIFACT_EFFECT', (data) => {
    if (!isEnabled.value() || !gameState.isActive) return;

    try {
        const artifactName = (data.artifactActor && data.artifactActor.name) || 'Artefacto desconocido';
        const playerName = data.playerId === gameState.player.id ? gameState.player.username : gameState.opponent.username;
        
        console.log(`[TournamentView] ${playerName} activó artefacto: ${artifactName}`);
        
        // Notificación
        uiManager.showFloatingNotification(`${playerName} activó ${artifactName}`, 'artifact', 3000);
        
        // Agregar efecto glow al artefacto si se puede encontrar
        if (data.artifactActor && data.artifactActor.id) {
            const artifactImages = document.querySelectorAll(`.tv-artifact-image[data-artifact-id="${data.artifactActor.id}"]`);
            artifactImages.forEach(img => {
                img.classList.add('artifact-glow');
                setTimeout(() => img.classList.remove('artifact-glow'), 1200);
            });
        }
        
        if (data.targetCards && data.targetCards.length > 0) {
            console.log('[TournamentView] Afectó a cartas:', data.targetCards.length);
        }
        if (data.targetPlayers && data.targetPlayers.length > 0) {
            console.log('[TournamentView] Afectó a jugadores:', data.targetPlayers.length);
        }
    } catch (error) {
        console.error('[TournamentView] Error procesando efecto de artefacto:', error);
    }
});

// Evento: Efecto del alma
plugin.events.on('Log:SOUL_EFFECT', (data) => {
    if (!isEnabled.value() || !gameState.isActive) return;

    try {
        const isPlayer = data.playerId === gameState.player.id;
        const playerName = isPlayer ? gameState.player.username : gameState.opponent.username;
        const soulName = isPlayer ? gameState.player.soul : gameState.opponent.soul;
        
        console.log(`[TournamentView] ${playerName} activó efecto del alma: ${soulName}`);
        
        // Notificación
        uiManager.showFloatingNotification(`${playerName} activó efecto de alma`, 'info', 2500);
        
        // Agregar efecto glow al alma
        const soulSelector = isPlayer ? '[data-player-soul]' : '[data-opponent-soul]';
        const soulImage = document.querySelector(soulSelector);
        if (soulImage) {
            soulImage.classList.add('soul-glow');
            setTimeout(() => soulImage.classList.remove('soul-glow'), 1000);
        }
    } catch (error) {
        console.error('[TournamentView] Error procesando efecto del alma:', error);
    }
});

// Evento: Fin de turno (detener timer)
plugin.events.on('getTurnEnd', (data) => {
    if (!isEnabled.value() || !gameState.isActive) return;
    
    // Detener el watcher del timer
    if (timerWatcher) {
        clearInterval(timerWatcher);
        timerWatcher = null;
    }
    uiManager.updateTimer(null);
    
    console.log('[TournamentView] Turno finalizado');
});

// Evento: Actualización del timer (si está disponible)
plugin.events.on('refreshTimer', (data) => {
    if (!isEnabled.value() || !gameState.isActive) return;
    
    try {
        // Si el evento refreshTimer proporciona el tiempo, usarlo
        if (data.time !== undefined && data.time !== null) {
            const time = parseInt(data.time);
            uiManager.updateTimer(Math.max(0, time));
        }
    } catch (error) {
        console.error('[TournamentView] Error procesando timer:', error);
    }
});
