const underscript = window.underscript;
const plugin = underscript.plugin('TournamentView', GM_info.version);

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
        this.currentTemplate = null;
        this.cssElement = null;
    }

    loadDefaultTemplate() {
        // Plantilla básica por defecto
        this.currentTemplate = {
            metadata: {
                name: 'Basic',
                version: '1.0.0',
                author: 'TournamentView',
                description: 'Plantilla básica de Tournament View',
            },
            config: {
                enableAnimations: true,
                showPlayerStats: true,
                showActionLog: false,
                compactMode: false,
            },
            variables: {
                primaryColor: '#667eea',
                secondaryColor: '#764ba2',
                accentColor: '#f093fb',
                backgroundColor: '#0f0f23',
                textColor: '#ffffff',
            },
        };
    }

    injectCSS() {
        if (!this.currentTemplate) {
            this.loadDefaultTemplate();
        }

        // Generar CSS con variables
        const cssVariables = this.generateCSSVariables();
        const baseCSS = this.getBaseCSS();
        
        const fullCSS = `
${cssVariables}
${baseCSS}
`;

        // Inyectar CSS usando la API de UnderScript
        if (this.cssElement) {
            this.cssElement.textContent = fullCSS;
        } else {
            this.cssElement = plugin.addStyle(fullCSS);
        }

        console.log('[TournamentView] CSS inyectado');
    }

    removeCSS() {
        if (this.cssElement && this.cssElement.parentNode) {
            this.cssElement.remove();
        }
        this.cssElement = null;
        console.log('[TournamentView] CSS removido');
    }

    generateCSSVariables() {
        const vars = this.currentTemplate.variables || {};
        let cssVars = ':root {\n';
        
        for (const [key, value] of Object.entries(vars)) {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            cssVars += `  --tv-${cssKey}: ${value};\n`;
        }
        
        cssVars += '}\n';
        return cssVars;
    }

    getBaseCSS() {
        return `
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
    max-width: 200px;
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
`;
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
        
        console.log('[TournamentView] UI inicializada');
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
                    <div class="tv-card-counter-label">Mano</div>
                    <div class="tv-card-counter-value" data-hand="player">0</div>
                </div>
                <div class="tv-card-counter">
                    <div class="tv-card-counter-label">Mazo</div>
                    <div class="tv-card-counter-value" data-deck="player">0</div>
                </div>
                <div class="tv-card-counter">
                    <div class="tv-card-counter-label">Cementerio</div>
                    <div class="tv-card-counter-value" data-graveyard="player">0</div>
                </div>
            </div>
        `;
        
        // Información central (turno)
        const centerInfo = document.createElement('div');
        centerInfo.className = 'tv-center-info';
        centerInfo.innerHTML = `
            <div class="tv-turn-indicator">
                <div class="tv-turn-label">Turno</div>
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
                    <div class="tv-card-counter-label">Mano</div>
                    <div class="tv-card-counter-value" data-hand="opponent">0</div>
                </div>
                <div class="tv-card-counter">
                    <div class="tv-card-counter-label">Mazo</div>
                    <div class="tv-card-counter-value" data-deck="opponent">0</div>
                </div>
                <div class="tv-card-counter">
                    <div class="tv-card-counter-label">Cementerio</div>
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
            const percentage = (data.hp / data.maxHp) * 100;
            hpBar.style.width = `${percentage}%`;
            hpText.textContent = `${data.hp}/${data.maxHp}`;
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
                    img.style.width = '24px';
                    img.style.height = '24px';
                    img.style.objectFit = 'contain';
                    img.style.filter = 'drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.8))';
                    
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
                        img.style.width = '36px';
                        img.style.height = '36px';
                        img.style.objectFit = 'contain';
                        img.style.filter = 'drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.9))';
                        
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
        
        const title = result === 'victory' ? '¡VICTORIA!' : 'DERROTA';
        const titleClass = result === 'victory' ? 'victory' : 'defeat';
        
        overlay.innerHTML = `
            <div class="tv-result-container">
                <div class="tv-result-title ${titleClass}">${title}</div>
                <div class="tv-result-stats">
                    <div class="tv-result-stat">
                        <span class="tv-result-stat-label">Turnos totales:</span>
                        <span class="tv-result-stat-value">${gameState.turn}</span>
                    </div>
                    <div class="tv-result-stat">
                        <span class="tv-result-stat-label">HP Final:</span>
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
        this.elements = {};
    }
}

// Initialize UIManager
const uiManager = new UIManager();

// Timer watcher
let timerWatcher = null;

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
            gameState.player.username = you.username || 'Player';
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
            gameState.opponent.username = enemy.username || 'Opponent';
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
    
    // Iniciar observador del timer del DOM del juego
    if (timerWatcher) clearInterval(timerWatcher);
    
    timerWatcher = setInterval(() => {
        try {
            // Intentar obtener tiempo del global del juego
            const time = window.global ? window.global('time') : null;
            if (time !== null && time !== undefined) {
                uiManager.updateTimer(Math.max(0, time));
            } else {
                // Fallback: intentar leer del DOM
                const timerElement = document.querySelector('.timer');
                if (timerElement && timerElement.textContent) {
                    const timeText = timerElement.textContent.trim();
                    const timeParts = timeText.split(':');
                    if (timeParts.length === 2) {
                        const minutes = parseInt(timeParts[0]) || 0;
                        const seconds = parseInt(timeParts[1]) || 0;
                        const totalSeconds = minutes * 60 + seconds;
                        uiManager.updateTimer(totalSeconds);
                    }
                }
            }
        } catch (error) {
            console.error('[TournamentView] Error leyendo timer:', error);
        }
    }, 500); // Actualizar cada 500ms
    
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
    } catch (error) {
        console.error('[TournamentView] Error parseando hechizo:', error);
    }
});

// Evento: Monstruo destruido
plugin.events.on('getMonsterDestroyed', (data) => {
    if (!isEnabled.value() || !gameState.isActive) return;
    
    console.log('[TournamentView] Monstruo destruido, ID:', data.monsterId);
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
        const playerName = data.playerId === gameState.player.id ? gameState.player.username : gameState.opponent.username;
        const soulName = data.playerId === gameState.player.id ? gameState.player.soul : gameState.opponent.soul;
        
        console.log(`[TournamentView] ${playerName} activó efecto del alma: ${soulName}`);
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
