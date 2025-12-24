# 10 - Fase 4: Gestión de Plantillas

> Plan de implementación del sistema de plantillas visuales

---

## 🎯 Objetivo

Implementar un sistema completo de gestión de plantillas visuales que permita:
- Múltiples plantillas predefinidas
- Selector de plantilla en configuración
- Importar plantillas personalizadas (JSON)
- Exportar plantillas existentes
- Validación de plantillas importadas
- Persistencia de plantillas custom

---

## 📐 Arquitectura del Sistema

### Estructura de una Plantilla

```javascript
{
  "metadata": {
    "id": "default",                    // ID único de la plantilla
    "name": "Default Tournament View",  // Nombre visible
    "version": "1.0.0",                 // Versión de la plantilla
    "author": "JoanJuan10",             // Autor
    "description": "Plantilla por defecto con diseño moderno",
    "thumbnail": "url_or_base64",       // Miniatura (opcional)
    "tags": ["default", "modern"],      // Tags para categorización
    "created": "2025-12-24",            // Fecha de creación
    "modified": "2025-12-24"            // Fecha de modificación
  },
  
  "variables": {
    // Variables CSS personalizables
    "primaryColor": "#667eea",
    "secondaryColor": "#764ba2",
    "accentColor": "#f093fb",
    "backgroundColor": "#0f0f23",
    "textColor": "#ffffff",
    
    // Dimensiones
    "headerHeight": "80px",
    "playerInfoWidth": "400px",
    "fontSize": "1rem",
    
    // Espaciado
    "padding": "1rem",
    "gap": "1rem"
  },
  
  "layout": {
    // Configuración de posicionamiento
    "header": {
      "position": "top",        // top, bottom, left, right
      "height": "80px",
      "alignment": "space-between"  // flex alignment
    },
    "playerInfo": {
      "showAvatars": true,
      "showSouls": true,
      "showArtifacts": true,
      "artifactsPosition": "below"  // below, inline, side
    },
    "turnInfo": {
      "position": "center",     // center, left, right
      "showTimer": true,
      "timerFormat": "M:SS"     // M:SS, SS, MM:SS
    }
  },
  
  "customCSS": "",              // CSS adicional específico de la plantilla
  
  "hooks": {
    // Hooks JavaScript opcionales para comportamiento custom
    "onLoad": null,             // Función al cargar plantilla
    "onUpdate": null,           // Función al actualizar datos
    "onTurnStart": null         // Función al iniciar turno
  }
}
```

---

## 🏗️ Implementación

### 1. Refactorización de TemplateManager

**Estado actual**: Maneja una única plantilla hardcodeada.

**Cambios necesarios**:

```javascript
class TemplateManager {
    constructor() {
        this.templates = [];              // Array de plantillas disponibles
        this.activeTemplate = null;        // Plantilla actualmente activa
        this.cssElement = null;
        this.customTemplates = [];         // Plantillas importadas por el usuario
    }
    
    // Métodos nuevos
    registerTemplate(template) { }         // Registrar plantilla
    loadTemplates() { }                    // Cargar plantillas predefinidas
    loadCustomTemplates() { }              // Cargar desde localStorage
    setActiveTemplate(templateId) { }      // Cambiar plantilla activa
    getTemplateById(id) { }                // Obtener plantilla por ID
    listTemplates() { }                    // Listar todas disponibles
    
    // Métodos de importar/exportar
    exportTemplate(templateId) { }         // Exportar a JSON
    importTemplate(jsonString) { }         // Importar desde JSON
    validateTemplate(template) { }         // Validar estructura
    
    // Métodos de persistencia
    saveCustomTemplate(template) { }       // Guardar en localStorage
    deleteCustomTemplate(templateId) { }   // Eliminar de localStorage
    
    // Métodos existentes (modificados)
    injectCSS() { }                        // Usa activeTemplate
    removeCSS() { }                        // Sin cambios
    generateCSSVariables() { }             // Usa activeTemplate.variables
    getBaseCSS() { }                       // Usa activeTemplate.customCSS
}
```

### 2. Plantillas Predefinidas

**Default** (actual):
- Diseño moderno con gradientes
- Header superior
- Información simétrica
- Colores vibrantes (púrpura/azul)

**Minimal**:
- Diseño minimalista
- Solo información esencial
- Colores planos (blanco/negro/gris)
- Fuentes más pequeñas
- Sin efectos visuales complejos

**Esports**:
- Estilo broadcast profesional
- Colores corporativos (azul oscuro/dorado)
- Tipografía bold
- Efectos de glow
- Animaciones más dramáticas

**Compact**:
- Para pantallas pequeñas
- Información comprimida
- Layout vertical
- Iconos en vez de texto donde sea posible

### 3. Settings para Plantillas

```javascript
// Setting para seleccionar plantilla
const templateSetting = plugin.settings().add({
    key: 'selectedTemplate',
    name: 'Plantilla Visual / Visual Template',
    description: 'Seleccionar estilo del overlay / Select overlay style',
    type: 'select',
    default: 'default',
    data: () => templateManager.listTemplates().map(t => ({
        value: t.metadata.id,
        label: t.metadata.name
    })),
    onChange: (newValue) => {
        templateManager.setActiveTemplate(newValue);
        
        if (uiManager.container) {
            uiManager.destroy();
            templateManager.injectCSS();
            uiManager.initialize();
            
            if (gameState.isActive) {
                uiManager.update();
            }
        }
    }
});

// Botón para exportar plantilla actual
const exportButton = plugin.settings().addButton({
    key: 'exportTemplate',
    name: 'Exportar Plantilla Actual / Export Current Template',
    description: 'Descarga la plantilla activa como JSON',
    label: 'Exportar / Export',
    onClick: () => {
        const json = templateManager.exportTemplate(templateSetting.value());
        downloadJSON(json, `template_${templateSetting.value()}.json`);
    }
});

// Input para importar plantilla
const importButton = plugin.settings().addButton({
    key: 'importTemplate',
    name: 'Importar Plantilla / Import Template',
    description: 'Cargar plantilla desde archivo JSON',
    label: 'Seleccionar archivo / Select file',
    onClick: () => {
        // Crear input file temporal
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            const text = await file.text();
            
            try {
                const result = templateManager.importTemplate(text);
                if (result.success) {
                    showNotification('Plantilla importada correctamente', 'success');
                    // Actualizar opciones del selector
                    templateSetting.updateOptions();
                } else {
                    showNotification(`Error: ${result.error}`, 'error');
                }
            } catch (error) {
                showNotification('Error al leer archivo', 'error');
            }
        };
        input.click();
    }
});
```

### 4. Sistema de Validación

```javascript
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
    
    // Validar layout
    if (!template.layout) {
        errors.push('Falta sección "layout"');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}
```

### 5. Persistencia en localStorage

```javascript
// Guardar plantillas custom
saveCustomTemplate(template) {
    const customs = this.loadCustomTemplatesFromStorage();
    
    // Evitar duplicados por ID
    const index = customs.findIndex(t => t.metadata.id === template.metadata.id);
    if (index >= 0) {
        customs[index] = template;
    } else {
        customs.push(template);
    }
    
    localStorage.setItem('uc_tournament_custom_templates', JSON.stringify(customs));
}

// Cargar plantillas custom
loadCustomTemplatesFromStorage() {
    try {
        const stored = localStorage.getItem('uc_tournament_custom_templates');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('[TournamentView] Error cargando plantillas custom:', error);
        return [];
    }
}

// Eliminar plantilla custom
deleteCustomTemplate(templateId) {
    let customs = this.loadCustomTemplatesFromStorage();
    customs = customs.filter(t => t.metadata.id !== templateId);
    localStorage.setItem('uc_tournament_custom_templates', JSON.stringify(customs));
}
```

---

## 📋 Plan de Implementación

### Tareas Fase 4

1. **Diseñar arquitectura del sistema de plantillas** ⏳
   - Definir estructura JSON completa
   - Crear esquema de validación
   - Documentar formato

2. **Refactorizar TemplateManager** ⏳
   - Convertir de plantilla única a multi-plantilla
   - Implementar métodos de gestión
   - Mantener compatibilidad con código existente

3. **Crear plantillas predefinidas** ⏳
   - Default (convertir la actual)
   - Minimal
   - Esports
   - (Opcional) Compact

4. **Implementar selector en settings** ⏳
   - Setting con dropdown de plantillas
   - Regeneración de UI al cambiar
   - Persistencia de selección

5. **Implementar exportación** ⏳
   - Serializar plantilla a JSON
   - Trigger de descarga
   - Incluir metadata completa

6. **Implementar importación** ⏳
   - Input de archivo
   - Parser JSON
   - Validación de estructura
   - Mensajes de error claros

7. **Sistema de validación** ⏳
   - Validar metadata obligatoria
   - Validar variables CSS requeridas
   - Validar estructura de layout
   - Reportar errores específicos

8. **Persistencia** ⏳
   - Guardar plantillas custom en localStorage
   - Cargar al inicializar
   - Permitir eliminar

9. **Testing** ⏳
   - Probar cambio entre plantillas
   - Probar importar/exportar
   - Verificar validación
   - Probar persistencia

10. **Documentación** ⏳
    - Actualizar docs con sistema de plantillas
    - Guía para crear plantillas custom
    - Ejemplos de plantillas
    - API de hooks

---

## 🎨 Consideraciones de Diseño

### Variables CSS Mínimas Requeridas

Toda plantilla debe definir al menos:
- `primaryColor`
- `secondaryColor`
- `backgroundColor`
- `textColor`
- `accentColor`

### Layout Positions

Posiciones soportadas para elementos:
- Header: `top`, `bottom`, `left`, `right`
- Player Info: `left`, `right`, `center`
- Turn Info: `center`, `top-left`, `top-right`, `bottom-left`, `bottom-right`

### Hooks JavaScript (Opcional)

Permiten comportamiento personalizado:
```javascript
{
  "hooks": {
    "onLoad": "() => { console.log('Plantilla cargada'); }",
    "onUpdate": "(data) => { /* custom logic */ }",
    "onTurnStart": "(turn) => { /* custom animations */ }"
  }
}
```

⚠️ **Seguridad**: Evaluar con cuidado, validar origen de plantillas.

---

## 🔒 Seguridad

### Validación de Plantillas Importadas

- Verificar estructura JSON válida
- Sanitizar CSS custom (evitar `<script>`, `javascript:`)
- Límite de tamaño de archivo (max 1MB)
- No ejecutar hooks de fuentes no confiables sin confirmación
- Mostrar advertencia al importar plantillas de terceros

### Sandbox para CSS Custom

```javascript
sanitizeCSS(css) {
    // Remover scripts embebidos
    css = css.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remover javascript: URLs
    css = css.replace(/javascript:/gi, '');
    
    // Remover @import (potencial XSS)
    css = css.replace(/@import/gi, '');
    
    return css;
}
```

---

## 📊 Métricas Esperadas

**Código adicional estimado**:
- TemplateManager: +400 líneas
- Plantillas predefinidas: +300 líneas
- Settings UI: +150 líneas
- Validación: +100 líneas
- **Total**: ~950 líneas adicionales

**Build size**: +15-20 KiB (57 KiB → ~75 KiB)

**Plantillas predefinidas**: 3-4 plantillas incluidas

**Formato de archivo**: JSON (fácil de compartir y editar)

---

## 🚀 Siguientes Pasos

1. Comenzar con refactorización de TemplateManager
2. Convertir plantilla actual a formato JSON
3. Implementar sistema de carga multi-plantilla
4. Crear 2-3 plantillas de ejemplo
5. Implementar selector en settings
6. Añadir importar/exportar
7. Testing exhaustivo
8. Documentar API de plantillas

---

*Plan creado: 24 de diciembre de 2025*
