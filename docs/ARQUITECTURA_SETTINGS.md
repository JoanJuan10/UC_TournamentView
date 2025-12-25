# Arquitectura del Sistema de Settings

## Problema: Corrupción de Valores por UnderScript

### Contexto
UnderScript v0.63.9 tiene un comportamiento inesperado con los settings personalizados que usan objetos como valores:

**Comportamiento esperado:**
```javascript
settings.add({
    key: 'template_default',
    type: 'TournamentView:templateElement',
    default: { active: false, canDelete: false, templateId: 'default' }
});
// element() debería recibir: { active: false, canDelete: false, templateId: 'default' }
```

**Comportamiento real:**
```javascript
// element() recibe: 'activate' (string simple)
```

### Causa Raíz
1. UnderScript internamente llama `update(newValue)` en ciertos momentos
2. El método `update()` sobrescribe el valor del setting con lo que se le pasa
3. En nuestros event handlers, hacíamos `update('activate')` para marcar una plantilla como activa
4. Esto corrompe el objeto original, convirtiéndolo en un string
5. **Importante**: Incluso después de eliminar las llamadas a `update()`, el value inicial ya estaba corrupto en el sistema de UnderScript

### Impacto
- Los botones de acción (activate/export/delete) no se renderizaban correctamente
- El botón de eliminar nunca aparecía porque `canDelete` siempre era `undefined`
- `templateId` se perdía, causando errores en el rendering

---

## Solución: Almacenamiento Externo con Map

### Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│  UnderScript Settings System (NO CONFIABLE)             │
│  - Corrompe valores objeto → string                     │
│  - value: 'activate' en lugar de {...}                  │
└─────────────────────────────────────────────────────────┘
                          ↓
                    ❌ NO USAR ❌
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Map<settingKey, templateData> (FUENTE DE VERDAD)       │
│  templateDataBySettingKey                               │
│                                                          │
│  Key: 'underscript.plugin.TournamentView.template_xxx'  │
│  Value: {                                               │
│    templateId: string,                                  │
│    canDelete: boolean,                                  │
│    isActive: boolean                                    │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
                          ↓
                ✅ SIEMPRE CONFIABLE ✅
                          ↓
          ┌───────────────────────────────┐
          │  TemplateElement.element()     │
          │  Triple-Fallback Recovery      │
          └───────────────────────────────┘
```

### Implementación

#### 1. Declaración del Map Global
```javascript
// Mapa global para almacenar datos de plantilla por settingKey
// Esto nos permite recuperar templateId y canDelete incluso cuando UnderScript corrompe el value
const templateDataBySettingKey = new Map();
```

#### 2. Población del Map (en createTemplateSettings)
```javascript
templates.forEach(template => {
    const templateId = template.metadata.id;
    const settingKey = 'template_' + templateId;
    const canDelete = !template.metadata.isPredefined;
    const isActive = templateId === activeTemplateId;
    
    // Crear el setting
    templateSettings[settingKey] = plugin.settings().add({
        key: settingKey,
        default: { active: isActive, canDelete: canDelete, templateId: templateId },
        // ... otros campos
    });
    
    // CRÍTICO: Guardar en Map INMEDIATAMENTE
    const fullKey = `underscript.plugin.TournamentView.${settingKey}`;
    templateDataBySettingKey.set(fullKey, {
        templateId: templateId,
        canDelete: canDelete,
        isActive: isActive
    });
});
```

#### 3. Recuperación Triple-Fallback (en TemplateElement.element)
```javascript
element(value, update, { remove = false, key = '' }) {
    // === RECUPERACIÓN DE templateId ===
    let templateId = null;
    
    // Fallback 1: Desde value si es objeto válido (raramente funciona)
    if (value && typeof value === 'object' && value.templateId) {
        templateId = value.templateId;
    }
    
    // Fallback 2: Desde Map usando key (MÉTODO PRINCIPAL) ✅
    if (!templateId && key) {
        const fullKey = key.startsWith('underscript.plugin.TournamentView.') 
            ? key 
            : `underscript.plugin.TournamentView.${key}`;
        const data = templateDataBySettingKey.get(fullKey);
        if (data) {
            templateId = data.templateId;
        }
    }
    
    // Fallback 3: Extraer del patrón de key (backup)
    if (!templateId && key) {
        const match = key.match(/template_(.+)$/);
        if (match) {
            templateId = match[1];
        }
    }
    
    // === RECUPERACIÓN DE canDelete ===
    let canDelete = false;
    
    // Fallback 1: Desde value (raramente funciona)
    if (value && typeof value === 'object' && value.canDelete !== undefined) {
        canDelete = value.canDelete;
    }
    
    // Fallback 2: Desde Map (MÉTODO PRINCIPAL) ✅
    if (canDelete === false && templateId) {
        const fullKey = key.startsWith('underscript.plugin.TournamentView.') 
            ? key 
            : `underscript.plugin.TournamentView.${key}`;
        const data = templateDataBySettingKey.get(fullKey);
        if (data && data.canDelete !== undefined) {
            canDelete = data.canDelete;
        }
    }
    
    // Ahora podemos renderizar con datos confiables
    const container = $('<span></span>');
    
    // Botón activar (siempre visible)
    const activateIcon = $('<span class="template-action-icon" ...>⭐</span>');
    container.append(activateIcon);
    
    // Botón exportar (siempre visible)
    const exportIcon = $('<span class="template-action-icon" ...>💾</span>');
    container.append(exportIcon);
    
    // Botón eliminar (SOLO si canDelete === true)
    if (canDelete) {
        const deleteIcon = $('<span class="template-action-icon" ...>🗑️</span>');
        container.append(deleteIcon);
    }
    
    return container;
}
```

---

## Manejo de Eventos: jQuery Delegado

### ¿Por qué NO usar update()?
```javascript
// ❌ NUNCA HACER ESTO
activateIcon.on('click', () => {
    update('activate'); // Corrompe el value a string 'activate'
});
```

### Solución: Eventos Delegados con data-attributes
```javascript
// ✅ CORRECTO: Eventos delegados fuera del lifecycle de UnderScript
$(document).off('click', '.template-action-icon');
$(document).on('click', '.template-action-icon', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const templateId = $(this).data('template-id');
    const action = $(this).data('action');
    
    console.log('[TournamentView] Template action:', action, 'for template:', templateId);
    
    switch(action) {
        case 'activate':
            activateTemplate(templateId);
            break;
        case 'export':
            exportTemplate(templateId);
            break;
        case 'delete':
            deleteTemplate(templateId);
            break;
    }
});
```

**Ventajas:**
1. ✅ No llama a `update()` → No corrompe el value
2. ✅ Los data-attributes persisten en el DOM
3. ✅ Funciona incluso si UnderScript re-renderiza el setting
4. ✅ Event delegation eficiente (un solo listener para todos los botones)

---

## Lecciones Aprendidas

### 1. No confiar en el sistema de valores de UnderScript
- **Problema**: UnderScript modifica valores de formas inesperadas
- **Solución**: Mantener fuente de verdad externa (Map, localStorage, etc.)
- **Principio**: "Trust but verify" → En este caso, "Don't trust, use external storage"

### 2. El parámetro `key` es confiable
- UnderScript pasa el `key` correcto a `element(value, update, {key})`
- Este key puede usarse como identificador estable
- Formato: `underscript.plugin.TournamentView.template_{templateId}`

### 3. Triple-Fallback Pattern
Siempre implementar múltiples métodos de recuperación en orden de preferencia:
```javascript
// 1. Método ideal (si el sistema funcionara correctamente)
if (value && typeof value === 'object') { ... }

// 2. Método principal (fuente externa confiable)
if (externalStorage.get(key)) { ... }

// 3. Método de emergencia (parsing, heurística)
if (key.match(/pattern/)) { ... }
```

### 4. Separación de Concerns
- **Rendering** (element): Solo lectura desde Map
- **State Management** (event handlers): Actualiza Map + localStorage + UI
- **UnderScript Integration**: Mínima, solo para mostrar el diálogo

### 5. Logging Estratégico
```javascript
console.log('[TemplateElement] 🗺️ Guardado en Map:', { fullKey, templateId, canDelete });
console.log('[TemplateElement] 🎨 Creando elemento visual:', { value, canDelete, templateId });
```
Los emojis ayudan a filtrar visualmente en consolas largas.

---

## Diagrama de Flujo Completo

```
Usuario abre Settings
         ↓
UnderScript llama element() para cada setting
         ↓
element() recibe: value='activate' (corrupto), key='template_xxx'
         ↓
Recuperar de Map usando key ✅
         ↓
templateDataBySettingKey.get(fullKey) → {templateId, canDelete, isActive}
         ↓
Renderizar UI con datos correctos:
  - Botón ⭐ (siempre)
  - Botón 💾 (siempre)
  - Botón 🗑️ (solo si canDelete=true)
         ↓
Usuario hace click en botón
         ↓
jQuery delegated event handler captura click
         ↓
Extrae templateId y action desde data-attributes
         ↓
Ejecuta acción (activate/export/delete)
         ↓
Actualiza: Map + localStorage + UI
         ↓
Llama refreshTemplateSettings() para re-renderizar
         ↓
[El ciclo se repite]
```

---

## Código de Referencia Completo

### Estructura del Setting
```javascript
{
    key: 'template_default',                    // Identificador único
    name: 'Default Tournament View',            // Nombre mostrado
    description: 'v1.0.0 por Roshio',          // Descripción mostrada
    type: 'TournamentView:templateElement',     // Tipo personalizado
    category: 'Plantillas',                     // Categoría en el diálogo
    export: false,                              // No exportar en config
    default: {                                  // Valor inicial (se corrompe)
        active: false,
        canDelete: false,
        templateId: 'default'
    }
}
```

### Map Entry
```javascript
Key:   'underscript.plugin.TournamentView.template_default'
Value: {
    templateId: 'default',
    canDelete: false,
    isActive: false
}
```

### DOM Output
```html
<span style="white-space: nowrap;">
    <span class="template-action-icon" 
          data-template-id="default" 
          data-action="activate" 
          style="cursor: pointer; margin: 0 4px;"
          title="Activar plantilla">
        ⭐
    </span>
    <span class="template-action-icon" 
          data-template-id="default" 
          data-action="export"
          style="cursor: pointer; margin: 0 4px;"
          title="Exportar plantilla">
        💾
    </span>
    <!-- Botón 🗑️ NO aparece porque canDelete=false -->
</span>
```

---

## Testing Manual

### Verificar que funciona:

1. **Plantillas predefinidas (default, minimal, esports)**
   - ✅ Deben mostrar ⭐ y 💾
   - ❌ NO deben mostrar 🗑️

2. **Plantillas importadas (defaultv2, etc.)**
   - ✅ Deben mostrar ⭐, 💾 y 🗑️

3. **Logs en consola al abrir Settings:**
```
[TemplateElement] 🗺️ Guardado en Map: {fullKey: "...", templateId: "default", canDelete: false}
[TemplateElement] 🎨 Creando elemento visual: {value: "activate", canDelete: false, templateId: "default"}
[TemplateElement] NO se añade botón eliminar - canDelete: false
```

4. **Eliminar plantilla importada:**
   - Click en 🗑️ → Confirmación → Plantilla desaparece
   - Refrescar página → Plantilla sigue sin aparecer (persistencia OK)

---

## Conclusión

La arquitectura final es robusta ante las limitaciones de UnderScript porque:
1. ✅ No depende del sistema de valores de UnderScript
2. ✅ Usa el `key` como identificador estable
3. ✅ Mantiene estado en Map + localStorage
4. ✅ Eventos delegados evitan corrupción del value
5. ✅ Triple-fallback asegura recuperación de datos

Este patrón puede reutilizarse para cualquier otro setting personalizado que necesite manejar objetos complejos con UnderScript.
