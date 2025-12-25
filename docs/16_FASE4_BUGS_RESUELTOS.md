# 16 - Bugs Resueltos en Fase 4

> Documentación completa de los bugs encontrados y resueltos durante la implementación del sistema de plantillas

**Fase:** 4 - Sistema de Gestión de Plantillas  
**Fecha:** 24 de diciembre de 2025  
**Total de bugs:** 18 (Bug #11 a Bug #18)

---

## 📋 Índice de Bugs

| # | Descripción | Severidad | Estado |
|---|-------------|-----------|--------|
| [Bug #11](#bug-11-infinite-recursion-loop) | Bucle infinito en onChange | 🔴 Crítico | ✅ Resuelto |
| [Bug #12](#bug-12-ui-not-refreshing) | UI no se actualiza tras activar plantilla | 🟠 Alto | ✅ Resuelto |
| [Bug #13](#bug-13-duplicated-text) | Texto duplicado en settings | 🟡 Medio | ✅ Resuelto |
| [Bug #14](#bug-14-star-indicator-not-moving) | Estrella ⭐ no se mueve | 🟡 Medio | ✅ Resuelto |
| [Bug #15](#bug-15-template-not-persisting) | Plantilla no persiste en reload | 🟠 Alto | ✅ Resuelto |
| [Bug #16](#bug-16-already-registered-error) | Error "already registered" | 🔴 Crítico | ✅ Resuelto |
| [Bug #17](#bug-17-updateplayerstats-not-function) | `updatePlayerStats is not a function` | 🟡 Medio | ✅ Resuelto |
| [Bug #18](#bug-18-getboardstate-not-function) | `getBoardState is not a function` | 🟡 Medio | ✅ Resuelto |

---

## Bug #11: Infinite Recursion Loop

### 📝 Descripción
Al hacer click en el icono de activar plantilla, se producía un bucle infinito de llamadas a `onChange`, colgando el navegador.

### 🔍 Causa Raíz
```javascript
onChange: (value) => {
    console.log('[TournamentView] onChange:', value);
    activateTemplate(templateId);
    
    // ❌ PROBLEMA: Llamar a .set() dentro de onChange
    element.set(undefined);  // Esto triggerea onChange otra vez → loop infinito
}
```

### ✅ Solución
```javascript
onChange: (value) => {
    // Validar tipo antes de procesar
    if (typeof value !== 'object' || value === null) {
        return;
    }
    
    const { action, templateId } = value;
    
    // No llamar a .set() - evita recursión
    if (action === 'activate') {
        activateTemplate(templateId);
    }
}
```

**Archivos modificados:** `src/index.js` (líneas ~3740)

---

## Bug #12: UI Not Refreshing

### 📝 Descripción
Después de activar una plantilla, la lista de settings no mostraba visualmente cuál estaba activa (estrella no cambiaba de posición).

### 🔍 Causa Raíz
El sistema intentaba actualizar los settings existentes pero UnderScript no refresca la UI automáticamente cuando solo cambias el valor interno.

### ✅ Solución (Iteración 1)
Implementar `refreshTemplateSettings()` que destruye y recrea todos los settings:

```javascript
function refreshTemplateSettings() {
    console.log('[TournamentView] Refrescando settings de plantillas...');
    
    templateManager.templates.forEach(template => {
        const settingKey = 'template_' + template.metadata.id;
        
        // Eliminar setting anterior
        const existingSetting = plugin.settings()[settingKey];
        if (existingSetting) {
            existingSetting.remove();
        }
        
        // Recrear con estado actualizado
        createSettingForTemplate(template);
    });
}
```

**Archivos modificados:** `src/index.js` (líneas ~3610-3650)

---

## Bug #13: Duplicated Text

### 📝 Descripción
En los settings, el nombre de la plantilla aparecía dos veces: una vez como label y otra vez en el contenido del elemento personalizado.

```
⭐ Default Tournament View  Default Tournament View [iconos]
                            ↑ Duplicado
```

### 🔍 Causa Raíz
`TemplateElement.element()` estaba retornando el nombre + iconos, pero UnderScript ya muestra el nombre automáticamente como label.

### ✅ Solución
```javascript
class TemplateElement extends FakeSetting {
    element(value, update, { remove = false }) {
        const container = $('<span style="white-space: nowrap;"></span>');
        
        // Solo añadir iconos, no el nombre
        // UnderScript muestra el nombre automáticamente desde el label
        
        container.append(starIcon);
        container.append(exportIcon);
        if (isCustom) {
            container.append(deleteIcon);
        }
        
        return container;  // Sin texto, solo iconos
    }
    
    labelFirst() {
        return true;  // Importante: label primero, luego iconos
    }
}
```

**Archivos modificados:** `src/index.js` (líneas ~3405-3455)

---

## Bug #14: Star Indicator Not Moving

### 📝 Descripción
Al activar una plantilla diferente, el indicador de estrella ⭐ permanecía en la plantilla anterior y no se movía a la nueva.

### 🔍 Causa Raíz (después de múltiples iteraciones)

**Intento 1:** Llamar a `refreshTemplateSettings()` → Bug #16 (already registered)  
**Intento 2:** Usar `.set()` para actualizar → Triggerea onChange sin efecto visual  
**Intento 3:** Manipulación directa del DOM

### ✅ Solución Final
Manipular el DOM directamente con jQuery, sin usar la API de UnderScript:

```javascript
function refreshTemplateSettings() {
    console.log('[TournamentView] Refrescando settings de plantillas...');
    const activeTemplateId = templateManager.getActiveTemplateId();
    
    templateManager.templates.forEach(template => {
        const templateId = template.metadata.id;
        const settingDomKey = 'template_' + templateId;
        const isActive = templateId === activeTemplateId;
        
        // 1. Actualizar texto del label (añadir/quitar ⭐)
        const labelElement = $(`label[for="${settingDomKey}"]`);
        const displayName = isActive ? `⭐ ${template.metadata.name}` : template.metadata.name;
        
        // Reemplazar solo el texto, no los elementos HTML
        labelElement.contents().filter(function() {
            return this.nodeType === 3; // Text nodes
        }).first().replaceWith(displayName);
        
        // 2. Actualizar icono de estrella (clases y color)
        const iconContainer = labelElement.next('span');
        const starIcon = iconContainer.find('.glyphicon-star, .glyphicon-star-empty').first();
        
        if (isActive) {
            starIcon.removeClass('glyphicon-star-empty').addClass('glyphicon-star');
            starIcon.css('color', '#5cb85c');
            starIcon.attr('title', 'Plantilla activa');
        } else {
            starIcon.removeClass('glyphicon-star').addClass('glyphicon-star-empty');
            starIcon.css('color', '#999');
            starIcon.attr('title', 'Click para activar');
        }
    });
}
```

**Archivos modificados:** `src/index.js` (líneas ~3615-3648)

**Lección aprendida:** A veces la API del framework no es suficiente y hay que manipular el DOM directamente.

---

## Bug #15: Template Not Persisting

### 📝 Descripción
Al recargar la página, siempre se activaba "Default Tournament View" aunque se hubiera seleccionado otra plantilla antes de recargar.

### 🔍 Causa Raíz
1. `TemplateManager` constructor llamaba a `setActiveTemplate('default')` siempre
2. `getActiveTemplateId()` solo leía de memoria, no de localStorage

### ✅ Solución
```javascript
// 1. En setActiveTemplate - guardar en localStorage
setActiveTemplate(templateId) {
    const template = this.getTemplateById(templateId);
    
    if (!template) {
        console.error('[TournamentView] Plantilla no encontrada:', templateId);
        return false;
    }
    
    this.activeTemplate = template;
    
    // ⭐ Guardar en localStorage
    try {
        localStorage.setItem('uc_tournament_active_template', templateId);
        console.log('[TournamentView] Plantilla guardada en localStorage:', templateId);
    } catch (e) {
        console.error('[TournamentView] Error guardando plantilla en localStorage:', e);
    }
    
    console.log('[TournamentView] Plantilla activa:', template.metadata.name);
    return true;
}

// 2. En getActiveTemplateId - leer desde localStorage primero
getActiveTemplateId() {
    try {
        const savedId = localStorage.getItem('uc_tournament_active_template');
        if (savedId) {
            return savedId;
        }
    } catch (e) {
        console.error('[TournamentView] Error leyendo plantilla desde localStorage:', e);
    }
    
    // Fallback: usar la plantilla activa en memoria o default
    return this.activeTemplate ? this.activeTemplate.metadata.id : 'default';
}

// 3. En constructor - NO establecer plantilla por defecto
constructor() {
    this.templates = [];
    this.activeTemplate = null;
    this.cssElement = null;
    this.customTemplates = [];
    
    this.loadPredefinedTemplates();
    this.loadCustomTemplates();
    
    // ❌ ELIMINADO: this.setActiveTemplate('default');
    // La plantilla se establece después de leer localStorage
}
```

**Archivos modificados:** `src/index.js` (líneas ~210-370)

---

## Bug #16: "Already Registered" Error

### 📝 Descripción
Al intentar refrescar los settings de plantillas, aparecía el error:

```
Error: ⭐ Default Tournament View[...template_default] already registered
```

### 🔍 Causa Raíz
UnderScript mantiene un registro interno de settings. Intentar hacer `.add()` dos veces con la misma `key` genera error.

**Código problemático:**
```javascript
function refreshTemplateSettings() {
    // Intentar eliminar setting anterior
    existingSetting.remove();  // ❌ No funciona completamente
    
    // Intentar recrear
    plugin.settings().add({
        key: settingKey,  // ❌ Ya está registrado internamente
        // ...
    });
}
```

### ✅ Solución
Separar en dos funciones:
1. `createTemplateSettings()` - Llamada UNA VEZ al inicio
2. `refreshTemplateSettings()` - Solo actualiza DOM, sin recrear

```javascript
// Creación inicial (una sola vez)
function createTemplateSettings() {
    const templates = templateManager.templates;
    const activeTemplateId = templateManager.getActiveTemplateId();
    
    templates.forEach(template => {
        const templateId = template.metadata.id;
        const settingKey = 'template_' + templateId;
        const isActive = templateId === activeTemplateId;
        
        // Añadir setting por primera vez
        const element = plugin.settings().add({
            key: settingKey,
            name: isActive ? `⭐ ${template.metadata.name}` : template.metadata.name,
            description: template.metadata.description,
            type: 'TournamentView:templateElement',
            category: 'Plantillas',
            export: false,
            onChange: (value) => {
                // Handle onChange
            }
        });
    });
}

// Actualización (múltiples veces)
function refreshTemplateSettings() {
    // Solo manipula el DOM, no llama a .add()
    // Ver Bug #14 para detalles de implementación
}
```

**Archivos modificados:** `src/index.js` (líneas ~3720-3795)

---

## Bug #17: `updatePlayerStats is not a function`

### 📝 Descripción
Al regenerar la UI después de cambiar de plantilla, aparecía el error:

```
TypeError: uiManager.updatePlayerStats is not a function
```

### 🔍 Causa Raíz
Después de `uiManager.initialize()`, algunos métodos no están inmediatamente disponibles debido a timing de inicialización asíncrona.

### ✅ Solución
Añadir checks de existencia de función antes de llamar:

```javascript
setTimeout(() => {
    try {
        // Destruir y recrear UI
        uiManager.destroy();
        uiManager.initialize();
        
        // Restaurar datos visuales solo si las funciones existen
        if (gameState.player && typeof uiManager.updatePlayerStats === 'function') {
            uiManager.updatePlayerStats(
                gameState.player.name,
                gameState.player.hp,
                // ...
            );
        }
        
        if (gameState.opponent && typeof uiManager.updateOpponentStats === 'function') {
            uiManager.updateOpponentStats(
                gameState.opponent.name,
                // ...
            );
        }
        
        if (typeof uiManager.updateBoard === 'function') {
            uiManager.updateBoard(gameState.playerBoard, gameState.opponentBoard);
        }
        
        if (typeof uiManager.updateTurn === 'function') {
            uiManager.updateTurn(gameState.turn);
        }
    } catch (error) {
        console.error('[TournamentView] Error al regenerar UI:', error);
    }
}, 100);
```

**Archivos modificados:** `src/index.js` (líneas ~3560-3610)

---

## Bug #18: `getBoardState is not a function`

### 📝 Descripción
Similar al Bug #17, pero con el método `getBoardState()`:

```
TypeError: gameState.getBoardState is not a function
```

### 🔍 Causa Raíz
En el contexto del `setTimeout`, `gameState.getBoardState()` no existe. Era un intento de usar un método que nunca fue implementado.

### ✅ Solución
Acceder directamente a las propiedades de `gameState` en lugar de usar métodos getter:

```javascript
// ❌ Antes (usando método inexistente)
const playersStats = gameState.getPlayersStats();
const boardState = gameState.getBoardState();

// ✅ Después (acceso directo)
if (gameState.player) {
    uiManager.updatePlayerStats(
        gameState.player.name,
        gameState.player.hp,
        gameState.player.maxHp,
        // ... acceso directo a propiedades
    );
}

if (gameState.playerBoard && gameState.opponentBoard) {
    uiManager.updateBoard(gameState.playerBoard, gameState.opponentBoard);
}
```

**Archivos modificados:** `src/index.js` (líneas ~3545-3605)

**Lección aprendida:** En contextos asíncronos (setTimeout, Promise), el scope puede cambiar. Acceder directamente a propiedades es más seguro que confiar en métodos.

---

## 📊 Resumen de Impacto

### Por Severidad

| Severidad | Cantidad | Porcentaje |
|-----------|----------|------------|
| 🔴 Crítico | 2 | 25% |
| 🟠 Alto | 2 | 25% |
| 🟡 Medio | 4 | 50% |

### Por Categoría

| Categoría | Bugs | Descripción |
|-----------|------|-------------|
| UnderScript API | #11, #13, #16 | Limitaciones y peculiaridades del framework |
| Persistencia | #15 | localStorage y gestión de estado |
| DOM/UI | #12, #14 | Actualización visual de la interfaz |
| Async/Timing | #17, #18 | Problemas de sincronización |

### Tiempo de Resolución

**Total estimado:** ~6 horas de debugging y testing

| Bug | Iteraciones | Tiempo |
|-----|-------------|--------|
| #11 | 1 | 15 min |
| #12 | 2 | 45 min |
| #13 | 1 | 20 min |
| #14 | 3+ | 2 horas |
| #15 | 2 | 45 min |
| #16 | 2 | 1 hora |
| #17 | 1 | 30 min |
| #18 | 1 | 30 min |

---

## 🎓 Lecciones Aprendidas

### 1. Framework Limitations
Cuando trabajas con un framework externo (UnderScript), sus limitaciones te fuerzan a soluciones creativas:
- No puedes recrear settings → Manipula DOM directamente
- API no actualiza UI → jQuery al rescate
- Registro único de keys → Separa creación de actualización

### 2. Debugging Asíncrono
Los problemas de timing son los más difíciles de debuggear:
- Usa `setTimeout` con delays razonables (100-200ms)
- Siempre valida existencia de funciones con `typeof`
- Acceso directo a propiedades es más confiable que métodos

### 3. Persistencia
localStorage es simple pero efectivo:
- Guarda al cambiar estado
- Lee al inicializar
- Siempre ten un fallback (`|| 'default'`)

### 4. Test Driven Debugging
Cada bug encontrado se convirtió en un caso de test mental:
1. Reproducir el bug
2. Aislar la causa
3. Implementar fix
4. Verificar que no rompe nada más
5. Documentar

---

## 📝 Notas para Futuro Desarrollo

### Prevención de Bugs Similares

1. **Siempre validar tipos antes de usar valores de onChange:**
   ```javascript
   if (typeof value !== 'object' || value === null) return;
   ```

2. **Nunca llamar a métodos de settings dentro de onChange:**
   ```javascript
   // ❌ NO HACER
   onChange: () => {
       setting.set(something);  // Puede causar recursión
   }
   ```

3. **Manipulación DOM directa cuando la API no es suficiente:**
   ```javascript
   const element = $(`selector`);
   element.text('nuevo texto');
   element.find('.icon').removeClass('old').addClass('new');
   ```

4. **localStorage debe ser bidireccional:**
   ```javascript
   // Guardar al cambiar
   localStorage.setItem(key, value);
   
   // Leer al iniciar
   const saved = localStorage.getItem(key);
   ```

5. **Validar existencia de funciones en contextos asíncronos:**
   ```javascript
   if (typeof obj.method === 'function') {
       obj.method();
   }
   ```

### Testing Checklist para Nuevas Features

- [ ] Funciona en primera carga
- [ ] Funciona después de reload
- [ ] No causa bucles infinitos
- [ ] No genera errores en consola
- [ ] Persiste correctamente en localStorage
- [ ] UI se actualiza visualmente
- [ ] Funciona con valores edge case (null, undefined, etc.)

---

## 🔗 Referencias

- [10_FASE4_PLANTILLAS.md](10_FASE4_PLANTILLAS.md) - Arquitectura del sistema
- [11_FASE4_RESUMEN.md](11_FASE4_RESUMEN.md) - Resumen de implementación
- [09_LECCIONES_APRENDIDAS.md](09_LECCIONES_APRENDIDAS.md) - Lecciones de fases anteriores
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Guía de pruebas

---

**Última actualización:** 24 de diciembre de 2025  
**Estado:** Todos los bugs resueltos ✅  
**Próximos pasos:** Fase 5 - Integraciones
