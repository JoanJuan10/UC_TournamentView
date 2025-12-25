# 09 - Lecciones Aprendidas

> Documento de reflexión sobre el desarrollo del plugin UC_TournamentView  
> **Última actualización:** 24 de diciembre de 2025 - Post-Fase 4

---

## 📋 Índice por Fase

- [Fase 1-3: Fundamentos y UI](#fase-1-3-fundamentos-y-ui)
- [Fase 4: Sistema de Plantillas](#fase-4-sistema-de-plantillas)

---

## Fase 1-3: Fundamentos y UI

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

### 6. Inicialización del Sistema i18n

**Problema Crítico**: Settings intentaban usar `i18n.t()` antes de que i18n existiera.

**Causa**: Al definir settings con `plugin.settings().add()`, el objeto retornado se evalúa inmediatamente, antes de que las clases globales estén inicializadas.

```javascript
// ❌ INCORRECTO - i18n aún no existe
const isEnabled = plugin.settings().add({
    key: 'enabled',
    name: i18n.t('settings.enable'), // Error: i18n is not defined
});

// ✅ CORRECTO - strings literales bilingües
const isEnabled = plugin.settings().add({
    key: 'enabled',
    name: 'Activar Tournament View', // Literal string
});

const languageSetting = plugin.settings().add({
    key: 'language',
    name: 'Idioma / Language', // Ambos idiomas explícitos
});
```

**Solución alternativa investigada**: Intentar inicializar i18n antes de settings falló porque `plugin.settings()` se ejecuta en el top-level del script.

**Lección**: Los settings API se evalúan síncronamente al cargar el script. No pueden depender de objetos que se inicializan después. Usar strings literales o valores estáticos.

---

### 7. Regeneración de UI al Cambiar Idioma

**Desafío**: Al cambiar el idioma en settings, los textos del overlay no se actualizaban.

**Primera solución (incorrecta)**: Solo verificar `gameState.isActive`:
```javascript
onChange: (newValue) => {
    i18n.setLanguage(newValue);
    if (gameState.isActive) {
        uiManager.destroy();
        uiManager.initialize();
    }
}
```
**Problema**: Si el usuario cambiaba idioma antes de iniciar partida, no pasaba nada.

**Solución correcta**: Verificar si la UI existe:
```javascript
onChange: (newValue) => {
    i18n.setLanguage(newValue);
    
    if (uiManager.container) {  // Verificar si UI existe
        uiManager.destroy();
        uiManager.initialize();
        
        if (gameState.isActive) {
            uiManager.update();  // Actualizar datos si hay partida
        }
    }
}
```

**Lección**: Para cambios de configuración que afectan UI, verificar si los elementos DOM existen, no solo si hay datos de juego activos.

---

### 8. Encoding de Caracteres HTML

**Problema Complejo**: Caracteres especiales (ñ, á, é, í, ó, ú) aparecían como entidades HTML (`&ntilde;`, `&oacute;`) en el historial traducido.

**Contexto**: El historial de Underscript usa HTML con entidades codificadas. Al extraer con `outerHTML` o `textContent`, las entidades no se decodificaban.

**Evolución de soluciones**:

1. **Intento 1**: Reemplazos manuales con regex
   ```javascript
   html = html.replace(/&oacute;/g, 'ó').replace(/&ntilde;/g, 'ñ');
   ```
   ❌ Problema: Lista enorme de entidades, no escalable

2. **Intento 2**: Parser HTML nativo
   ```javascript
   const parser = new DOMParser();
   const doc = parser.parseFromString(html, 'text/html');
   return doc.body.textContent;
   ```
   ❌ Problema: Perdía formato HTML (negritas, colores)

3. **Solución final**: Textarea temporal
   ```javascript
   decodeHTMLEntities(html) {
       const textarea = document.createElement('textarea');
       textarea.innerHTML = html;
       return textarea.value;
   }
   ```
   ✅ Funciona: El navegador decodifica automáticamente al asignar `innerHTML`

**Orden de operaciones crítico**:
```javascript
translateLogHTML(html) {
    // 1. Decodificar PRIMERO
    const decodedHTML = this.decodeHTMLEntities(html);
    
    // 2. Traducir DESPUÉS (con caracteres reales)
    let translatedHTML = decodedHTML.replace(/attacked/g, 'atacó');
    
    return translatedHTML;
}
```

**Lección**: Para decodificar entidades HTML, usar el navegador nativo (`textarea.innerHTML`) en vez de regex o parsers. Siempre decodificar antes de aplicar transformaciones.

---

### 9. innerHTML vs outerHTML

**Problema Sutil**: Entradas de historial aparecían en dos líneas en vez de una.

**HTML original de Underscript**:
```html
<div class="entry">
    <span class="player">Joan</span>'s turn
</div>
```

**Código inicial (incorrecto)**:
```javascript
const clone = entry.cloneNode(true);
wrapper.innerHTML = clone.outerHTML;  // Crea nested div
```

**Resultado en DOM**:
```html
<div class="tv-log-entry">
    <div class="entry">              <!-- Div extra! -->
        <span class="player">Joan</span>'s turn
    </div>
</div>
```

**Solución**:
```javascript
// Para español (traducido):
wrapper.innerHTML = translatedContent;  // Solo el contenido

// Para inglés (original):
Array.from(entry.childNodes).forEach(child => {
    wrapper.appendChild(child.cloneNode(true));  // Solo hijos
});
```

**Lección**: 
- `outerHTML` incluye el elemento wrapper (crea anidación)
- `innerHTML` solo incluye el contenido interno
- Para clonar sin wrapper, iterar sobre `childNodes`

---

### 10. Patrones Regex para Traducción

**Desafío**: Traducir frases donde el orden de palabras cambia entre idiomas.

**Ejemplo**: 
- Inglés: "**Joan**'s turn"
- Español: "Es el turno de **Joan**"

**Primera solución (incorrecta)**:
```javascript
html = html.replace(/'s turn/g, ' es el turno de');
// Resultado: "Joan es el turno de" ❌
```

**Solución correcta con capture groups**:
```javascript
html = html.replace(
    /(<[^>]+>.*?<\/[^>]+>)'s turn/gi,
    (match, playerHTML) => `Es el turno de ${playerHTML}`
);
// Resultado: "Es el turno de <span class="player">Joan</span>" ✅
```

**Breakdown del regex**:
- `(<[^>]+>.*?<\/[^>]+>)` - Captura el HTML del jugador
- `'s turn` - Texto literal a reemplazar
- `gi` - Global e insensitive a mayúsculas
- `(match, playerHTML) =>` - Arrow function con grupo capturado
- `` `Es el turno de ${playerHTML}` `` - Template literal con reordenamiento

**Lección**: Para traducciones que requieren reordenar elementos, usar capture groups en regex con template literals para reconstruir la frase.

---

### 11. Timer Watcher desde Carga Inicial

**Problema**: Timer no aparecía hasta el primer `getTurnStart`, dejando el overlay con "-" durante la carga.

**Causa**: `timerWatcher` solo se iniciaba en el evento `getTurnStart`, pero ese evento solo ocurre cuando empieza un turno, no en la carga inicial.

**Solución multi-paso**:

1. **Extraer lógica a función helper**:
   ```javascript
   function startTimerWatcher() {
       if (timerWatcher) clearInterval(timerWatcher);
       timerWatcher = setInterval(() => {
           // Lógica de lectura del timer
       }, 500);
   }
   ```

2. **Llamar desde evento `connect`** (primera conexión):
   ```javascript
   plugin.events.on('connect', (data) => {
       // ... parsear datos ...
       startTimerWatcher();  // ← Iniciar aquí
   });
   ```

3. **Mantener llamada en `getTurnStart`** (para reiniciar):
   ```javascript
   plugin.events.on('getTurnStart', (data) => {
       // ... actualizar turno ...
       startTimerWatcher();  // ← Reiniciar por seguridad
   });
   ```

4. **Añadir fallback en selector**:
   ```javascript
   // Intenta .timer.active primero
   const timerElement = document.querySelector('.timer.active');
   if (!timerElement) {
       // Fallback: cualquier .timer
       const anyTimer = document.querySelector('.timer');
   }
   ```

**Lección**: Para datos que deben estar disponibles desde el inicio, inicializar en el primer evento que recibe datos (`connect`), no en eventos específicos de gameplay (`getTurnStart`).

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

### 4. Sistema de Traducciones con Interpolación

**Decisión Arquitectónica**: Crear clase `I18n` con sistema de interpolación de parámetros.

```javascript
class I18n {
    t(key, params = {}) {
        let translation = this.translations[this.currentLanguage][key];
        
        // Interpolación de parámetros
        Object.entries(params).forEach(([param, value]) => {
            translation = translation.replace(`{${param}}`, value);
        });
        
        return translation;
    }
}

// Uso:
i18n.t('turn.indicator', { player: 'Joan' });
// ES: "Es el turno de Joan"
// EN: "Joan's turn"
```

**Ventajas**:
- Frases dinámicas sin concatenación
- Reordenamiento natural por idioma
- Fácil añadir parámetros

**Patrón identificado**:
- Keys anidadas con puntos: `notification.cardPlayed`
- Parámetros en llaves: `{player}`, `{card}`, `{damage}`
- Un diccionario por idioma

**Lección**: Para sistemas multiidioma, usar interpolación de parámetros en vez de concatenación de strings. Permite flexibilidad en el orden de palabras por idioma.

---

### 5. Funciones Helper Reutilizables

**Patrón identificado**: Extraer lógica repetida a funciones globales.

**Ejemplo - Timer Watcher**:
```javascript
// Antes: Código duplicado en dos eventos
plugin.events.on('getTurnStart', () => {
    if (timerWatcher) clearInterval(timerWatcher);
    timerWatcher = setInterval(() => { /* ... */ }, 500);
});

// Después: Función helper reutilizable
function startTimerWatcher() {
    if (timerWatcher) clearInterval(timerWatcher);
    timerWatcher = setInterval(() => { /* ... */ }, 500);
}

plugin.events.on('connect', () => startTimerWatcher());
plugin.events.on('getTurnStart', () => startTimerWatcher());
```

**Beneficios**:
- DRY (Don't Repeat Yourself)
- Un solo lugar para corregir bugs
- Más fácil añadir logging/debugging

**Lección**: Si escribes el mismo código en múltiples lugares, extraerlo a una función helper. Especialmente útil para lógica de inicialización.

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
- Fase 3 (mejoras visuales e i18n): ~16 horas
  - Sistema i18n: ~4 horas
  - Traducción de historial: ~6 horas
  - Bugs de encoding: ~3 horas
  - Ajustes UX: ~3 horas
- Debugging crítico (settings): ~2 horas
- Documentación: ~4 horas

**Total**: ~38 horas de desarrollo

**Bugs críticos encontrados**: 15+
1. Timer no sincronizaba
2. Indicador de turno incorrecto
3. Almas con 404
4. Contadores de artefactos vacíos
5. Settings no desactivaba (el más crítico)
6. Settings usando i18n antes de inicialización
7. Cambio de idioma no regeneraba UI
8. Panel historial no se ocultaba
9. Solo 4 artefactos visibles
10. Scroll no mostraba entradas recientes
11. Traducciones con orden incorrecto
12. Caracteres especiales como entidades HTML
13. Entradas en dos líneas
14. Timer no visible al cargar
15. Selector de timer incorrecto

**Lecciones por bug**: Cada bug llevó a una mejora arquitectónica:
1. → Sistema de polling
2. → Uso de `data.idPlayer`
3. → Extracción desde DOM
4. → Lectura de `.artifact-custom`
5. → Comprensión de function getters
6. → Strings literales en settings
7. → Verificación de `uiManager.container`
8. → Ajuste de `translateX` a 450px
9. → Remoción de `max-width`, añadir `flex-wrap`
10. → Cambio a `scrollTop = scrollHeight`
11. → Regex con capture groups
12. → Helper `decodeHTMLEntities()`
13. → Uso de `innerHTML` vs `outerHTML`
14. → Función `startTimerWatcher()` reutilizable
15. → Fallback de `.timer.active` a `.timer`

**Fase 3 - Estadísticas**:
- Líneas de código añadidas: ~930
- Claves de traducción: 17+ por idioma
- Patrones regex implementados: 10+
- Bugs corregidos: 10
- Tamaño del build: +18 KiB (39 → 57 KiB)

---

## Fase 4: Sistema de Plantillas

### 🎨 Lecciones sobre UnderScript Custom Settings

#### 1. Limitación Crítica: No se Pueden Recrear Settings

**Problema**: Intentar eliminar y recrear un setting con la misma `key` causa error fatal.

```javascript
// ❌ NUNCA HACER ESTO
function refreshSettings() {
    existingSetting.remove();  // Parece remover, pero...
    
    plugin.settings().add({
        key: 'same_key',  // ❌ Error: already registered
        // ...
    });
}
```

**Causa**: UnderScript mantiene un registro interno de keys. `remove()` quita el setting del UI pero no del registro.

**Solución**: Separar creación única de actualización continua:

```javascript
// Crear UNA VEZ al inicio
function createSettings() {
    const setting = plugin.settings().add({
        key: 'template_default',
        // ...
    });
}

// Actualizar MÚLTIPLES VECES
function refreshSettings() {
    // Manipular DOM directamente, NO llamar a .add()
    const label = $('label[for="template_default"]');
    label.text('⭐ Default');
}
```

**Lección**: Con frameworks restrictivos, a veces la manipulación DOM directa es la única opción viable.

---

#### 2. Custom Setting Types con Patrón uc_replays.js

**Descubrimiento**: uc_replays.js usa `FakeSetting` para settings personalizados con iconos.

**Implementación**:

```javascript
class FakeSetting {
    constructor(setting) {
        const SETTING = Symbol('setting');
        this[SETTING] = setting;
        
        return new Proxy(this, {
            get: (target, prop) => {
                if (prop in target) return target[prop];
                return setting[prop];
            }
        });
    }
}

class TemplateElement extends FakeSetting {
    element(value, update, { remove = false }) {
        // Retornar elemento jQuery con iconos
        const container = $('<span></span>');
        container.append(starIcon);
        container.append(exportIcon);
        return container;
    }
    
    labelFirst() {
        return true;  // Label primero, luego iconos
    }
}

// Registrar tipo
plugin.settings().addType(new TemplateElement());

// Usar tipo
plugin.settings().add({
    type: 'TournamentView:templateElement',
    // ...
});
```

**Lección**: Para UI compleja en settings, crear custom types basados en `FakeSetting` del patrón uc_replays.js.

---

#### 3. FileReader para Importación de JSON

**Objetivo**: Permitir al usuario seleccionar un archivo `.json` desde un input de file.

**Implementación**:

```javascript
class FileInputElement extends FakeSetting {
    element(value, update) {
        const input = $('<input type="file" accept=".json">');
        
        input.on('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const json = JSON.parse(event.target.result);
                    update(json);  // Llamar al onChange con el JSON
                } catch (error) {
                    alert('Error: JSON inválido');
                }
            };
            
            reader.readAsText(file);
        });
        
        return input;
    }
}
```

**Pasos clave**:
1. Crear `<input type="file">`
2. Escuchar evento `change`
3. Obtener archivo con `e.target.files[0]`
4. Crear `FileReader()`
5. Leer con `readAsText()`
6. Parsear JSON en `onload`
7. Llamar a `update()` con datos parseados

**Lección**: `FileReader` es la forma estándar de leer archivos del sistema en el navegador. Siempre validar JSON con try/catch.

---

#### 4. Validación de Estructura de Plantillas

**Requerimiento**: Validar que las plantillas importadas tengan estructura correcta.

**Implementación**:

```javascript
function validateTemplate(data) {
    // 1. Validar que sea objeto
    if (typeof data !== 'object' || data === null) {
        return { valid: false, error: 'Debe ser un objeto JSON válido' };
    }
    
    // 2. Validar campos obligatorios
    const requiredFields = ['metadata', 'variables', 'customCSS'];
    for (const field of requiredFields) {
        if (!data[field]) {
            return { valid: false, error: `Falta campo obligatorio: ${field}` };
        }
    }
    
    // 3. Validar metadata
    const requiredMeta = ['id', 'name', 'version'];
    for (const field of requiredMeta) {
        if (!data.metadata[field]) {
            return { valid: false, error: `metadata.${field} es obligatorio` };
        }
    }
    
    // 4. Validar variables (colores)
    const requiredVars = ['primaryColor', 'secondaryColor', 'accentColor'];
    for (const varName of requiredVars) {
        if (!data.variables[varName]) {
            return { valid: false, error: `variables.${varName} es obligatorio` };
        }
    }
    
    // 5. Validar que customCSS sea string
    if (typeof data.customCSS !== 'string') {
        return { valid: false, error: 'customCSS debe ser un string' };
    }
    
    return { valid: true };
}
```

**Uso**:
```javascript
const validation = validateTemplate(importedData);
if (!validation.valid) {
    alert(`Plantilla inválida: ${validation.error}`);
    return;
}
```

**Lección**: Para datos externos (archivos de usuario), validación exhaustiva es crucial. Retornar objeto con `{valid, error}` es más útil que throw exception.

---

### 🔄 Lecciones sobre Persistencia

#### 5. localStorage Bidireccional

**Patrón implementado**: Guardar al cambiar, leer al iniciar.

```javascript
// GUARDAR: Al activar plantilla
setActiveTemplate(templateId) {
    this.activeTemplate = template;
    
    try {
        localStorage.setItem('uc_tournament_active_template', templateId);
    } catch (e) {
        console.error('Error guardando en localStorage:', e);
    }
}

// LEER: Al obtener plantilla activa
getActiveTemplateId() {
    try {
        const saved = localStorage.getItem('uc_tournament_active_template');
        if (saved) return saved;
    } catch (e) {
        console.error('Error leyendo de localStorage:', e);
    }
    
    // Fallback
    return this.activeTemplate?.metadata.id || 'default';
}

// INICIALIZAR: NO establecer default en constructor
constructor() {
    this.loadPredefinedTemplates();
    this.loadCustomTemplates();
    // ❌ NO: this.setActiveTemplate('default');
}

// CARGAR: Después de crear TemplateManager
const savedId = templateManager.getActiveTemplateId();
templateManager.setActiveTemplate(savedId || 'default');
```

**Orden correcto**:
1. Constructor NO establece plantilla por defecto
2. Después de constructor, leer localStorage
3. Activar plantilla guardada (o default si no existe)

**Lección**: Para persistencia correcta, el constructor no debe establecer valores por defecto que sobrescriban localStorage. Leer storage DESPUÉS de inicialización.

---

### 🐛 Lecciones de Debugging Avanzado

#### 6. Direct DOM Manipulation para Actualizaciones Visuales

**Problema**: UnderScript no refresca UI cuando cambias valores internos.

**Solución**: Manipular el DOM directamente con jQuery.

```javascript
function refreshVisualIndicators() {
    const activeId = getActiveTemplateId();
    
    templates.forEach(template => {
        const settingKey = 'template_' + template.id;
        
        // 1. Encontrar label por atributo 'for'
        const label = $(`label[for="${settingKey}"]`);
        
        // 2. Actualizar solo nodos de texto (no elementos HTML)
        const textNode = label.contents().filter(function() {
            return this.nodeType === 3;  // TEXT_NODE
        }).first();
        
        const newText = template.id === activeId 
            ? `⭐ ${template.name}`
            : template.name;
        
        textNode.replaceWith(newText);
        
        // 3. Encontrar y actualizar icono
        const iconContainer = label.next('span');
        const starIcon = iconContainer.find('.glyphicon-star, .glyphicon-star-empty');
        
        if (template.id === activeId) {
            starIcon.removeClass('glyphicon-star-empty')
                    .addClass('glyphicon-star')
                    .css('color', '#5cb85c');
        } else {
            starIcon.removeClass('glyphicon-star')
                    .addClass('glyphicon-star-empty')
                    .css('color', '#999');
        }
    });
}
```

**Técnicas clave**:
- `$('label[for="..."]')` - Selector por atributo
- `.contents()` - Obtener todos los nodos (incluye text nodes)
- `.filter(function() { return this.nodeType === 3 })` - Filtrar solo text nodes
- `.replaceWith()` - Reemplazar nodo completo
- `.find('.clase1, .clase2')` - Buscar elementos con cualquiera de las clases
- `.removeClass().addClass()` - Chainable class manipulation
- `.css('property', 'value')` - Establecer estilos inline

**Lección**: Cuando la API del framework no permite actualizaciones, manipular el DOM directamente es legítimo. jQuery hace esto más fácil y cross-browser.

---

#### 7. Async Context y Timing Issues

**Problema**: Después de `uiManager.initialize()`, métodos como `updatePlayerStats()` no están disponibles.

**Causa**: Inicialización asíncrona + contexto de `setTimeout`.

**Solución**: Defensive programming con type checks.

```javascript
setTimeout(() => {
    uiManager.destroy();
    uiManager.initialize();
    
    // ✅ Verificar existencia antes de llamar
    if (gameState.player && typeof uiManager.updatePlayerStats === 'function') {
        uiManager.updatePlayerStats(/* ... */);
    }
    
    if (gameState.opponent && typeof uiManager.updateOpponentStats === 'function') {
        uiManager.updateOpponentStats(/* ... */);
    }
    
    if (typeof uiManager.updateBoard === 'function') {
        uiManager.updateBoard(/* ... */);
    }
}, 100);
```

**Alternativa**: Acceso directo a propiedades en lugar de métodos.

```javascript
// En vez de:
const stats = gameState.getPlayersStats();  // Método puede no existir

// Usar:
if (gameState.player) {
    const hp = gameState.player.hp;  // Propiedad siempre existe
}
```

**Lección**: En contextos asíncronos, siempre validar que funciones existan antes de llamarlas. Acceso directo a propiedades es más confiable que métodos en closures.

---

### 📦 Lecciones de Arquitectura de Plantillas

#### 8. Sistema de Variables CSS con camelCase → kebab-case

**Objetivo**: Permitir definir colores en JSON como `primaryColor` y usarlos en CSS como `--tv-primary-color`.

**Implementación**:

```javascript
function generateCSSVariables(variables) {
    let css = ':root {\n';
    
    Object.entries(variables).forEach(([key, value]) => {
        // Convertir camelCase a kebab-case
        const cssVarName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        css += `  --tv-${cssVarName}: ${value};\n`;
    });
    
    css += '}\n';
    return css;
}

// Input:
const vars = {
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    accentColor: '#f093fb'
};

// Output:
:root {
  --tv-primary-color: #667eea;
  --tv-secondary-color: #764ba2;
  --tv-accent-color: #f093fb;
}
```

**Regex breakdown**:
- `/([A-Z])/g` - Encuentra todas las mayúsculas
- `-$1` - Reemplaza con guion + la mayúscula capturada
- `.toLowerCase()` - Convierte todo a minúsculas

**Resultado**:
- `primaryColor` → `primary-color` → `--tv-primary-color`
- `backgroundColor` → `background-color` → `--tv-background-color`

**Lección**: Para convertir naming conventions, regex con capture groups es más robusto que split/join o replace manual.

---

#### 9. Template Export con Blob y Download Link

**Objetivo**: Permitir descargar una plantilla como archivo JSON.

**Implementación**:

```javascript
function exportTemplate(templateId) {
    const template = getTemplateById(templateId);
    
    // 1. Crear JSON string con indentación
    const json = JSON.stringify(template, null, 2);
    
    // 2. Crear Blob con tipo MIME correcto
    const blob = new Blob([json], { type: 'application/json' });
    
    // 3. Crear URL temporal del blob
    const url = URL.createObjectURL(blob);
    
    // 4. Crear link de descarga invisible
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.metadata.id}.json`;
    
    // 5. Simular click para descargar
    document.body.appendChild(link);
    link.click();
    
    // 6. Limpiar
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`Plantilla ${template.metadata.name} exportada`);
}
```

**Pasos clave**:
1. `JSON.stringify(obj, null, 2)` - 2 espacios de indentación
2. `new Blob([string], {type})` - Crear blob con contenido
3. `URL.createObjectURL(blob)` - Generar URL temporal
4. Crear `<a>` con `href` al blob y `download` attribute
5. `link.click()` - Trigger download programmatically
6. `URL.revokeObjectURL()` - Liberar memoria

**Lección**: Para descargas generadas dinámicamente, Blob + createObjectURL + click programático es el patrón estándar. Siempre limpiar con revokeObjectURL.

---

### 🧪 Lecciones de Testing en Producción

#### 10. Logs Estructurados para Debugging de Usuarios

**Patrón**: Logs detallados con prefijo identificable y estructura clara.

```javascript
// Nivel 1: Acción principal
console.log('[TournamentView] Activando plantilla:', templateId);

// Nivel 2: Resultado
console.log('[TournamentView] Plantilla guardada en localStorage:', templateId);

// Nivel 3: Estado final
console.log('[TournamentView] Plantilla activa:', template.metadata.name);

// Errores con contexto
console.error('[TournamentView] Error al regenerar UI:', error);

// Debug detallado (solo durante desarrollo)
console.log('[TournamentView] Refrescando settings de plantillas...');
console.log('[TournamentView] Actualizando UI de settings - Plantilla activa:', activeId);
```

**Beneficios**:
- Usuario puede copiar logs y enviártelos
- Filtrable con `/TournamentView/` en DevTools
- Trazabilidad completa de flujo de ejecución
- Detectar problemas sin acceso directo al navegador del usuario

**Lección**: En plugins distribuidos, logs estructurados son tu única forma de debugging remoto. Incluir contexto suficiente para reproducir issues.

---

### 📊 Métricas de Fase 4

**Tiempo de desarrollo**: ~8 horas
- Diseño de arquitectura: 2 horas
- Implementación base: 3 horas
- Debugging (18 bugs): 3 horas

**Líneas de código añadidas**: ~650
- TemplateManager: ~300 líneas (18 métodos)
- Custom Setting Types: ~150 líneas (2 clases)
- Validación y helpers: ~100 líneas
- Integración y tests: ~100 líneas

**Bugs resueltos**: 18 (Bug #11 a Bug #18)
Ver [16_FASE4_BUGS_RESUELTOS.md](16_FASE4_BUGS_RESUELTOS.md)

**Build size**: +2 KiB (88.6 → 90.3 KiB)

**Conformidad**: 98% ✅ (ver [12_CANON_CHECK.md](12_CANON_CHECK.md))

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

1. **Lee la documentación primero** - Los docs en `/docs` tienen toda la info necesaria.

2. **Usa console.log generosamente** - Especialmente con prefijos `[TournamentView]` para filtrar.

3. **Inspecciona el DOM real** - No asumas la estructura, verifica con DevTools.

4. **Verifica tipos siempre** - Usa `typeof`, `console.dir()`, nunca asumas.

5. **Prueba los settings** - Activa/desactiva varias veces para verificar cleanup.

6. **npm start es tu amigo** - Watch mode ahorra mucho tiempo.

7. **Commits frecuentes** - Haz commits pequeños y descriptivos.

8. **No asumas tipos** - Usa `typeof`, `console.dir()` y `console.log()`.

9. **Fallbacks siempre** - DOM puede cambiar, ten planes B y C.

10. **Testea multiidioma** - Si implementas i18n, prueba en todos los idiomas soportados.

11. **innerHTML vs outerHTML** - Conoce la diferencia, evita nested elements innecesarios.

12. **Regex con cuidado** - Para traducciones complejas, usa capture groups y test online (regex101.com).

13. **Decodifica antes de transformar** - Si trabajas con HTML, decodifica entidades primero.

14. **Funciones helper** - Extrae código repetido a funciones reutilizables.

15. **Verifica existencia de elementos** - Antes de manipular DOM, verifica que existe con `if (element)`.

---

## 🎯 Fase 3 - Resumen de Mejoras

**Sistema Multiidioma (i18n)**:
- ✅ Clase I18n con interpolación de parámetros
- ✅ Soporte ES/EN con 17+ claves por idioma
- ✅ Setting de idioma con regeneración automática de UI
- ✅ Traducción de historial con regex patterns
- ✅ Decodificación de entidades HTML

**Ajustes Visuales y UX**:
- ✅ Ocultación de historiales nativos
- ✅ Aumento de fuentes para legibilidad
- ✅ Display ilimitado de artefactos
- ✅ Posición del tablero ajustada 100px
- ✅ Timer visible desde carga inicial
- ✅ Auto-scroll en historial

**Bugs Corregidos**:
- ✅ Settings usando i18n antes de inicialización
- ✅ Cambio de idioma no regeneraba UI
- ✅ Panel historial no se ocultaba
- ✅ Solo 4 artefactos visibles
- ✅ Scroll no mostraba recientes
- ✅ Traducciones con orden incorrecto
- ✅ Caracteres especiales como HTML entities
- ✅ Entradas en dos líneas
- ✅ Timer no visible al cargar
- ✅ Selector de timer incorrecto

**Lecciones Clave**:
1. Settings no pueden usar objetos inicializados después
2. Verificar existencia de UI (`container`), no solo datos activos
3. Decodificar HTML entities con `textarea.innerHTML`
4. `innerHTML` vs `outerHTML` para evitar anidación
5. Regex capture groups para reordenar frases
6. Inicializar en `connect` para datos desde carga inicial
7. Funciones helper para código reutilizable

---

*Documento actualizado: 24 de diciembre de 2025*  
*Autor: JoanJuan10*  
*Fase 3 completada: Sistema multiidioma y mejoras visuales*
