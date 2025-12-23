# 09 - Lecciones Aprendidas

> Documento de reflexión sobre el desarrollo del plugin UC_TournamentView

---

## 🎓 Lecciones Técnicas

### 1. UnderScript Settings API - Función Getter

**Problema Crítico**: Los settings no funcionaban correctamente.

**Causa**: `plugin.settings().add()` retorna un objeto donde `.value` es una **función getter**, no una propiedad directa.

```javascript
const isEnabled = plugin.settings().add({
    key: 'enabled',
    name: 'Activar Tournament View',
    type: 'boolean',
    default: false,
});

// ❌ INCORRECTO - siempre es truthy porque es una función
if (!isEnabled.value) { /* ... */ }

// ✅ CORRECTO - debe llamarse como función
if (!isEnabled.value()) { /* ... */ }
```

**Impacto**: Sin los paréntesis `()`, todas las comprobaciones evaluaban a `true` (la función existe), por lo que el plugin nunca se desactivaba.

**Solución**: Reemplazar TODAS las referencias de `isEnabled.value` a `isEnabled.value()` con un regex en PowerShell:

```powershell
(Get-Content src/index.js) -replace 'isEnabled\.value(?!\()', 'isEnabled.value()' | Set-Content src/index.js
```

**Lección**: Con APIs externas, siempre verificar qué retorna cada método. Los getters en JavaScript pueden parecer propiedades pero son funciones.

---

### 2. Datos del DOM vs Eventos

**Descubrimiento**: No todos los datos vienen en los eventos de UnderScript.

**Casos específicos**:

1. **Contadores de artefactos** - Los eventos de `getPlayersStats` incluyen artefactos pero **sin los contadores actualizados**.
   
2. **Cementerio** - No hay evento específico para cambios en cementerio.

3. **Almas** - Las imágenes no se envían en los datos, solo nombres.

**Solución**: Leer directamente del DOM:

```javascript
// Artefactos con contadores
function getArtifactsFromDOM(playerIndex) {
    const selector = playerIndex === 0 ? '#yourArtifacts' : '#enemyArtifacts';
    const container = document.querySelector(selector);
    const groups = container.querySelectorAll('.artifact-group');
    
    return Array.from(groups).map(group => ({
        name: group.getAttribute('name'),
        counter: parseInt(group.querySelector('.artifact-custom')?.textContent || '0')
    }));
}

// Cementerio
function getGraveyardFromDOM(playerIndex) {
    const counters = document.querySelectorAll('.dust-counter');
    // IMPORTANTE: índices invertidos
    const counterIndex = playerIndex === 0 ? 1 : 0;
    return parseInt(counters[counterIndex]?.textContent || '0');
}
```

**Lección**: Los eventos de una API pueden no contener todos los datos actualizados. Complementar con lecturas del DOM cuando sea necesario.

---

### 3. Índices Invertidos en el DOM

**Problema Sorpresivo**: Los `.dust-counter` están en orden invertido respecto a los jugadores.

```
HTML real:
┌────────────────┐
│ .dust-counter  │ ← Cementerio del oponente (índice 0)
│ .dust-counter  │ ← Cementerio del jugador (índice 1)
└────────────────┘

Esperado:
┌────────────────┐
│ .dust-counter  │ ← Cementerio del jugador (índice 0)
│ .dust-counter  │ ← Cementerio del oponente (índice 1)
└────────────────┘
```

**Detección**: Valores incorrectos llevaron a inspección detallada del HTML.

**Solución**: Invertir los índices al leer:

```javascript
const counterIndex = playerIndex === 0 ? 1 : 0;
```

**Lección**: No asumir el orden de elementos en el DOM. Siempre verificar con inspección manual.

---

### 4. Timer Sincronización

**Evolución del sistema de timer**:

1. **Intento 1**: Leer desde eventos `refreshTimer`
   - **Problema**: Eventos no llegan consistentemente
   
2. **Intento 2**: Leer desde variable global `window.time`
   - **Problema**: Variable no existe
   
3. **Solución Final**: Polling de `window.global('time')` cada 500ms
   - ✅ Funciona consistentemente
   - ✅ Se sincroniza con el timer del juego

```javascript
let timerWatcher = null;

function startTimerWatcher() {
    if (timerWatcher) clearInterval(timerWatcher);
    
    timerWatcher = setInterval(() => {
        const time = window.global('time');
        if (time !== undefined) {
            updateTimerDisplay(time);
        }
    }, 500);
}
```

**Lección**: Para datos críticos que cambian frecuentemente, considerar polling como alternativa a eventos.

---

### 5. CSS Cleanup

**Problema**: Al desactivar el plugin, el CSS permanecía inyectado.

**Causa**: Solo se removía el contenedor DOM (`#uc-tournament-view`) pero no el elemento `<style>`.

**Solución**: Trackear el elemento CSS y removerlo explícitamente:

```javascript
class TemplateManager {
    constructor() {
        this.cssElement = null;
    }
    
    injectCSS() {
        this.cssElement = plugin.addStyle(this.generateCSS());
    }
    
    removeCSS() {
        if (this.cssElement && this.cssElement.parentNode) {
            this.cssElement.remove();
        }
        this.cssElement = null;
    }
}
```

**Lección**: Rastrear referencias a elementos dinámicos para poder limpiarlos correctamente.

---

## 🏗️ Lecciones de Arquitectura

### 1. Separación de Responsabilidades

**Decisión Acertada**: Dividir el código en 3 clases principales:

- **GameState** - Solo maneja datos
- **TemplateManager** - Solo maneja CSS
- **UIManager** - Solo maneja DOM

**Beneficios**:
- Debugging más sencillo (buscar bugs por capa)
- Modificaciones localizadas
- Testing más claro

**Ejemplo de Interacción**:
```javascript
// Evento recibido
plugin.events.on('getUpdatePlayerHp', (data) => {
    gameState.updatePlayer(data);        // Capa de datos
    uiManager.updateHPBar('player');     // Capa de UI
});
```

---

### 2. Estado Centralizado

**Patrón implementado**: Single source of truth en `GameState`.

```javascript
class GameState {
    constructor() {
        this.player = { /* ... */ };
        this.opponent = { /* ... */ };
        this.turn = 0;
        this.currentPlayer = null;
    }
    
    getState() {
        return { ...this };
    }
}
```

**Beneficios**:
- No hay conflictos entre múltiples fuentes de datos
- Debug fácil con `console.log(gameState.getState())`
- Reseteo limpio con `gameState.reset()`

---

### 3. Helpers para Extracción de DOM

**Patrón**: Funciones helper dedicadas para cada tipo de dato.

```javascript
getSoulFromDOM(playerIndex)
getArtifactsFromDOM(playerIndex)
getGraveyardFromDOM(playerIndex)
getSoulImageUrl(soulData)
getArtifactImageUrl(artifact)
```

**Ventajas**:
- Reutilizables desde múltiples eventos
- Fácil agregar fallbacks
- Testing individual de cada extractor

---

## 🐛 Lecciones de Debugging

### 1. Console.log Estratégico

**Técnica efectiva**: Logs con prefijo identificable.

```javascript
console.log('[TournamentView] CSS inyectado');
console.log('[TournamentView] Evento getTurnStart:', data);
```

**Beneficios**:
- Filtrar fácilmente en DevTools: `/TournamentView/`
- Identificar rápidamente origen de logs
- Diferenciar de logs de otros scripts

---

### 2. Verificación de Tipos

**Error común**: Asumir tipos de datos.

```javascript
// Usuario reporta: "typeof isEnabled.value: function"

// Verificación recomendada:
console.log('isEnabled:', isEnabled);
console.log('isEnabled.value:', isEnabled.value);
console.log('typeof isEnabled.value:', typeof isEnabled.value);
console.log('isEnabled.value():', isEnabled.value());
```

**Lección**: Ante problemas inesperados, verificar tipos con `typeof` y `console.dir()`.

---

### 3. Grep para Búsquedas Globales

**Técnica**: Usar regex con `grep_search` para encontrar patrones.

```javascript
// Buscar todas las referencias sin paréntesis
grep_search: 'isEnabled\.value[^()]'
```

**Reemplazo masivo con PowerShell**:
```powershell
(Get-Content src/index.js) -replace 'isEnabled\.value(?!\()', 'isEnabled.value()' | Set-Content src/index.js
```

**Lección**: Para bugs repetidos en múltiples lugares, usar herramientas de búsqueda/reemplazo masivo.

---

## 📐 Lecciones de Diseño

### 1. Variables CSS

**Decisión**: Usar CSS custom properties para temas.

```css
:root {
    --tv-primary-color: #667eea;
    --tv-secondary-color: #764ba2;
    --tv-accent-color: #f093fb;
}

.tv-header {
    background: linear-gradient(135deg, var(--tv-primary-color), var(--tv-secondary-color));
}
```

**Ventajas**:
- Cambiar tema fácilmente desde JavaScript
- Preview instantáneo de colores
- Preparado para múltiples plantillas

---

### 2. Flexbox para Layouts

**Patrón**: Layout simétrico con flexbox.

```css
.tv-header {
    display: flex;
    justify-content: space-between;
}

.tv-player-left {
    flex: 1;
    text-align: left;
}

.tv-player-right {
    flex: 1;
    text-align: right;
}
```

**Beneficio**: Responsive automático sin media queries para casos simples.

---

### 3. Badges Visuales para Contadores

**Diseño**: Contadores como badges circulares sobre imágenes.

```css
.tv-artifact-counter {
    position: absolute;
    top: -8px;
    right: -8px;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    border: 2px solid white;
    border-radius: 50%;
    width: 22px;
    height: 22px;
}
```

**Lección**: Usar `position: absolute` con `position: relative` en el padre para overlay preciso.

---

## 🚀 Mejores Prácticas Identificadas

### 1. Validaciones Tempranas

```javascript
plugin.events.on(':preload', () => {
    if (!isEnabled.value()) return;
    if (!underscript.onPage('Spectate')) return;
    
    // Continuar con inicialización...
});
```

**Razón**: Evitar procesamiento innecesario en páginas incorrectas.

---

### 2. Cleanup Explícito

```javascript
isEnabled.on('change', (newValue) => {
    if (!newValue) {
        // Limpieza completa
        if (timerWatcher) {
            clearInterval(timerWatcher);
            timerWatcher = null;
        }
        uiManager.destroy();
        templateManager.removeCSS();
        gameState.reset();
    }
});
```

**Importancia**: Prevenir memory leaks y comportamientos inesperados.

---

### 3. Fallbacks en Extracción

```javascript
function getArtifactsFromDOM(playerIndex) {
    try {
        const selector = playerIndex === 0 ? '#yourArtifacts' : '#enemyArtifacts';
        const container = document.querySelector(selector);
        
        if (!container) {
            console.warn('[TournamentView] Contenedor de artefactos no encontrado');
            return [];
        }
        
        // Continuar extracción...
    } catch (error) {
        console.error('[TournamentView] Error al leer artefactos:', error);
        return [];
    }
}
```

**Lección**: Siempre tener fallbacks para lecturas del DOM.

---

## 📊 Métricas de Desarrollo

**Tiempo estimado por fase**:
- Fase 1 (setup): ~4 horas
- Fase 2 (implementación): ~12 horas
- Debugging crítico (settings): ~2 horas
- Documentación: ~3 horas

**Total**: ~21 horas de desarrollo

**Bugs críticos encontrados**: 5
1. Timer no sincronizaba
2. Indicador de turno incorrecto
3. Almas con 404
4. Contadores de artefactos vacíos
5. Settings no desactivaba (el más crítico)

**Lecciones por bug**: Cada bug llevó a una mejora arquitectónica:
1. → Sistema de polling
2. → Uso de `data.idPlayer`
3. → Extracción desde DOM
4. → Lectura de `.artifact-custom`
5. → Comprensión de function getters

---

## 🔮 Recomendaciones Futuras

### Para Próximas Features

1. **Importar/Exportar Plantillas**
   - Usar `FileReader` API para leer JSON
   - Validar estructura con JSON Schema
   - Preview antes de aplicar

2. **Animaciones**
   - Usar CSS animations para transiciones
   - `@keyframes` para efectos complejos
   - `transition` para cambios simples

3. **Panel de Historial**
   - Array limitado (últimas 50 acciones)
   - Scroll automático con `scrollIntoView()`
   - Filtros por tipo de evento

### Para Mantenimiento

1. **Testing**
   - Considerar Jest para unit tests
   - Mock de `underscript` para testing
   - Tests de extracción de DOM

2. **CI/CD**
   - GitHub Actions para build automático
   - Releases automáticas en tags
   - Linting con ESLint

3. **Documentación**
   - Mantener docs sincronizados con código
   - Screenshots de nuevas features
   - Video tutorial para usuarios

---

## 💡 Consejos para Nuevos Desarrolladores

1. **Lee la documentación primero** - Los 7 docs de `/docs` tienen toda la info necesaria.

2. **Usa console.log generosamente** - Especialmente con prefijos para filtrar.

3. **Inspecciona el DOM real** - No asumas la estructura, verifica con DevTools.

4. **Prueba los settings** - Activa/desactiva varias veces para verificar cleanup.

5. **npm start es tu amigo** - Watch mode ahorra mucho tiempo.

6. **Commits frecuentes** - Haz commits pequeños y descriptivos.

7. **No asumas tipos** - Usa `typeof`, `console.dir()` y `console.log()`.

8. **Fallbacks siempre** - DOM puede cambiar, ten planes B y C.

---

*Documento compilado: 24 de diciembre de 2025*  
*Autor: JoanJuan10*
