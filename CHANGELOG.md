# 📝 CHANGELOG - TournamentView

> Historial de cambios y versiones del proyecto

**Formato basado en:** [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)  
**Versionado:** [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [Unreleased]

### Planificado para próximas versiones
- Editor visual de plantillas
- Galería comunitaria de plantillas
- Tests automáticos
- Animaciones avanzadas

---

## [0.1.0] - 2025-12-24

### 🎉 Fase 4 Completada - Sistema de Gestión de Plantillas

**Build:** 88.6 KiB  
**Source:** 145 KiB  
**Conformidad:** 98% ✅

### Added
- ✅ **Sistema multi-plantilla completo**
  - 3 plantillas predefinidas (Default, Minimal, Esports)
  - Plantilla Default: 16 KB CSS con gradientes y glassmorphism
  - Plantilla Minimal: 7 KB CSS flat design
  - Plantilla Esports: 12 KB CSS estilo profesional
- ✅ **TemplateManager con 18 métodos**
  - `registerTemplate()` - Registro de plantillas
  - `setActiveTemplate()` - Cambio de plantilla activa
  - `getTemplateById()` - Búsqueda por ID
  - `getAllTemplateIds()` - Lista de IDs
  - `getActiveTemplateId()` - ID de plantilla activa
  - `deleteTemplate()` - Eliminación de custom templates
  - `loadCustomTemplates()` - Carga desde localStorage
  - `saveCustomTemplates()` - Guardado en localStorage
  - `saveCustomTemplate()` - Guardado individual
  - `exportTemplate()` - Exportar a JSON
  - `importTemplate()` - Importar desde JSON
  - `validateTemplate()` - Validación de estructura
  - `injectCSS()` - Inyección de CSS
  - `removeCSS()` - Remoción de CSS
  - `generateCSSVariables()` - Generación de custom properties
- ✅ **Sistema de Import/Export**
  - FileReader para importar JSON
  - Descarga automática de JSON al exportar
  - Validación completa de estructura
- ✅ **Sistema de Settings Avanzado**
  - Custom setting types (FakeSetting base class)
  - TemplateElement con iconos de gestión
  - FileInputElement para importar
  - Patrón de uc_replays.js (spans, no buttons)
  - `.add()` para concatenación jQuery
  - `update(string)` para actions
  - `labelFirst() = false` para alineación derecha
- ✅ **Protección de plantillas predefinidas**
  - Array `predefinedTemplateIds`
  - No se pueden eliminar plantillas base
  - UI oculta botón de eliminar para predefinidas
- ✅ **Persistencia en localStorage**
  - Key: `'uc_tournament_custom_templates'`
  - JSON stringified para almacenar
  - Carga automática al iniciar
- ✅ **Documentación completa**
  - [10_FASE4_PLANTILLAS.md](docs/10_FASE4_PLANTILLAS.md) - Arquitectura
  - [11_FASE4_RESUMEN.md](docs/11_FASE4_RESUMEN.md) - 652 líneas de implementación
  - [12_CANON_CHECK.md](docs/12_CANON_CHECK.md) - Validación de conformidad
  - [13_MANTENIMIENTO_DIC_2025.md](docs/13_MANTENIMIENTO_DIC_2025.md) - Reporte
  - [14_MAPA_VISUAL.md](docs/14_MAPA_VISUAL.md) - Mapa del proyecto
  - [15_RESUMEN_EJECUTIVO.md](docs/15_RESUMEN_EJECUTIVO.md) - Resumen 1 página
  - [00_INDICE.md](docs/00_INDICE.md) - Índice completo
  - [TESTING_GUIDE.md](docs/TESTING_GUIDE.md) - Guía de pruebas
  - [example_template.json](templates/example_template.json) - Ejemplo

### Fixed
1. ✅ Selector mostrando "[object Object]"
   - **Causa:** Selector intentando convertir objeto a string
   - **Solución:** TemplateElement retorna spans, no objetos
2. ✅ onChange no ejecutándose
   - **Causa:** Evento no conectado correctamente
   - **Solución:** update(action) en clicks, onChange(action) recibe strings
3. ✅ CSS no aplicándose visualmente
   - **Causa:** `.textContent` en lugar de `.replace()`
   - **Solución:** Usar `plugin.addStyle()` y `.replace()` para updates
4. ✅ Imágenes desapareciendo al cambiar plantilla
   - **Causa:** No restaurar data de game state
   - **Solución:** `updateSouls()` y `updateArtifacts()` en `activateTemplate()`
5. ✅ Nombres desapareciendo al cambiar plantilla
   - **Causa:** No actualizar nombres de jugadores
   - **Solución:** `updatePlayerNames()` en `activateTemplate()`
6. ✅ Error "e.text is not a function"
   - **Causa:** Incompatibilidad jQuery .text()
   - **Solución:** FileReader con `readAsText()`
7. ✅ Botones de gestión no funcionando
   - **Causa:** Patrón incorrecto (buttons vs spans)
   - **Solución:** Migrar a patrón uc_replays.js con spans y glyphicons
8. ✅ Plantillas importadas sin botón de eliminar
   - **Causa:** Detección incorrecta de predefinidas
   - **Solución:** Verificar contra `predefinedTemplateIds` array
9. ✅ Error "Cannot read properties of undefined"
   - **Causa:** `listTemplates()` no existe
   - **Solución:** Usar `templateManager.templates` directamente
10. ✅ Iconos no alineados verticalmente
    - **Causa:** `labelFirst()` no implementado
    - **Solución:** `labelFirst() { return false; }` en TemplateElement

### Changed
- 🔄 Build size: 60.8 KiB → 88.6 KiB (+27.8 KiB)
- 🔄 Métodos TemplateManager: 15 → 18 (+3)
- 🔄 Sistema de Settings: Básico → Avanzado con custom types
- 🔄 Documentación: 155 KB → 240 KB (+85 KB)

---

## [0.0.3] - 2025-12-22

### 🌐 Fase 3 Completada - Sistema i18n

### Added
- ✅ **Sistema de internacionalización completo**
  - Clase `I18nManager`
  - Diccionarios ES/EN con 17 claves cada uno
  - Método `t(key, params)` con interpolación
  - Cambio de idioma en tiempo real
- ✅ **Setting de idioma en UI**
  - Selector Español/English
  - Regeneración automática de overlay
  - Persistencia de preferencia
- ✅ **Traducciones completas**
  - UI del overlay
  - Notificaciones
  - Mensajes de sistema
  - Settings

### Changed
- 🔄 Todas las strings hardcoded convertidas a i18n.t()

---

## [0.0.2] - 2025-12-20

### 🎨 Fase 2 Completada - UI Funcional

### Added
- ✅ **Overlay completo funcional**
  - Header con información de jugadores
  - Barras de HP con animaciones (shake, pulse)
  - Display de oro, almas, artefactos
  - Contadores de cartas (mano, mazo, cementerio)
  - Timer en formato M:SS
  - Indicador de turno activo
- ✅ **Sistema de notificaciones**
  - Notificaciones flotantes por tipo de evento
  - Colores por categoría (verde, púrpura, rojo, dorado, azul)
  - Auto-desaparición después de 3 segundos
- ✅ **Panel de historial**
  - Últimas 30 acciones
  - Botón flotante para toggle
  - Auto-scroll a nuevas entradas
  - Integración con historial nativo
- ✅ **Overlay de resultados**
  - Pantalla de victoria/derrota
  - Estadísticas finales
  - Botón para reiniciar
- ✅ **Responsive design**
  - 3 breakpoints (1280px, 768px, 480px)
  - Layout adaptativo
- ✅ **Extracción de datos del DOM**
  - Almas desde `<img>` elements
  - Artefactos con contadores desde `.artifact-custom`
  - Cementerio desde `.dust-counter`

### Changed
- 🔄 GameState refactorizado para datos completos
- 🔄 GameEventHandler con todos los eventos
- 🔄 UIManager construye overlay completo

---

## [0.0.1] - 2025-12-18

### 🏗️ Fase 1 Completada - Fundamentos

### Added
- ✅ **Configuración inicial del proyecto**
  - Migración a template oficial UCProjects
  - Webpack 4 configurado
  - Package.json con scripts
- ✅ **Registro básico del plugin**
  - `underscript.plugin('TournamentView')`
  - Hooks `:preload` y `:load`
  - Exports básicos
- ✅ **Sistema de plantillas base**
  - Clase TemplateManager
  - Plantilla Default inicial
  - Inyección de CSS
- ✅ **Documentación técnica completa**
  - 7 documentos base (01-07)
  - Especificación del proyecto (06)
  - Guía de desarrollo (07)
- ✅ **Settings funcional**
  - Activar/Desactivar plugin
  - Integración con UnderScript menu

### Technical
- Build system con webpack
- UserScript headers configurados
- Git repository inicializado

---

## Tipos de Cambios

- `Added` - Nuevas características
- `Changed` - Cambios en funcionalidad existente
- `Deprecated` - Características que serán removidas
- `Removed` - Características removidas
- `Fixed` - Correcciones de bugs
- `Security` - Correcciones de seguridad

---

## Nomenclatura de Versiones

Formato: `MAJOR.MINOR.PATCH`

- **MAJOR** - Cambios incompatibles de API
- **MINOR** - Nueva funcionalidad compatible
- **PATCH** - Correcciones de bugs compatibles

**Estado actual:** 0.1.0 (Beta funcional)

---

*Última actualización: 24 de diciembre de 2025*  
*Ver más en: [00_INDICE.md](00_INDICE.md)*
