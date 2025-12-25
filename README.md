# UC_TournamentView

Plugin para [UnderScript](https://github.com/UCProjects/UnderScript) que moderniza la vista de espectador de [Undercards.net](https://undercards.net) con un sistema de plantillas visuales estilo torneo profesional.

## 📋 Descripción

**UC_TournamentView** es un plugin para [UnderScript](https://github.com/UCProjects/UnderScript) que transforma la página de espectador (`/Spectate`) de Undercards en una experiencia visual moderna inspirada en transmisiones de esports.

### Estado actual: ✅ Beta funcional - Producción lista

El plugin está en **beta funcional completa** con todas las funcionalidades core implementadas y 0 bugs conocidos. El sistema de plantillas (Fase 4) está completado y la persistencia funciona correctamente.

**Build:** 90.3 KiB (compilado) | 150 KiB (fuente)  
**Conformidad:** 98% ✅ | **Bugs:** 0 conocidos | **Fase actual:** Post-Fase 4

### Características implementadas:

- ✅ **Overlay de información en tiempo real**
  - Nombres de jugadores
  - HP con barras visuales dinámicas y gradientes de color
  - Oro actual
  - Almas (con imágenes extraídas del DOM)
  - Artefactos (con imágenes y contadores actualizados)
  - Cartas en mano, mazo y cementerio
  - Turno actual y timer sincronizado (formato M:SS)
  - Indicador visual de jugador activo con animación

- ✅ **Sistema multiidioma (i18n)**
  - Soporte para Español e Inglés
  - Configuración de idioma en settings
  - 17 claves de traducción por idioma
  - Cambio de idioma en tiempo real sin recargar
  - Sistema de interpolación de parámetros

- ✅ **Sistema de plantillas completo** (Fase 4)
  - **3 plantillas predefinidas:**
    1. Default Tournament View (morado/azul gradiente)
    2. Classic Spectator (azul/blanco limpio)
    3. Dark Mode Pro (negro/cyan/naranja)
  - **Import/Export** de plantillas personalizadas (JSON)
  - **Persistencia completa** con localStorage
  - **Indicador visual** (⭐) en plantilla activa
  - **Validación** de estructura JSON en importación
  - **Gestión avanzada** con iconos por plantilla (activar/exportar/eliminar)
  - **Regeneración automática** de UI al cambiar plantilla
  - **18 métodos** en TemplateManager

- ✅ **Extracción de datos del DOM**
  - Almas desde `window.yourSoul`/`window.enemySoul` y fallback a `<img>`
  - Artefactos con contadores desde `.artifact-group` y `.artifact-custom`
  - Cementerio desde `.dust-counter` (índices invertidos corregidos)
  - Imágenes URL construidas con fallbacks múltiples

- ✅ **Overlay de resultados**
  - Pantalla de victoria/derrota con animaciones
  - Color verde (#10b981) para victoria, rojo (#ef4444) para derrota
  - Estadísticas: turnos totales, HP final
  - Auto-ocultado después de 5 segundos

- ✅ **Settings funcional**
  - Toggle activar/desactivar plugin
  - Selector de idioma
  - Gestión de plantillas con iconos interactivos
  - Importador de archivos JSON

### Próximos pasos (Fase 5):

- 🎨 **Editor Visual de Plantillas** - Color picker para variables CSS
- 🎬 **Animaciones avanzadas** - Transiciones personalizables
- 📊 **Estadísticas históricas** - Guardar datos de partidas
- 🌐 **Galería comunitaria** - Compartir plantillas online

## 🎨 Sistema de Plantillas

### Plantillas Predefinidas

El plugin incluye 3 plantillas visuales predefinidas:

1. **Default** - Diseño moderno con gradientes y animaciones suaves
   - Colores: Púrpura (#667eea) y magenta (#764ba2)
   - Estilo: Moderno con efectos glassmorphism
   - Ideal para: Transmisiones casuales y streaming general

2. **Minimal** - Diseño minimalista y limpio
   - Colores: Grises y azul plano (#3498db)
   - Estilo: Flat design sin efectos complejos
   - Ideal para: Pantallas pequeñas y bajo consumo de recursos

3. **Esports** - Estilo broadcast profesional
   - Colores: Azul marino (#0a1929) y dorado (#ffd700)
   - Estilo: Efectos de brillo, animaciones dramáticas
   - Ideal para: Torneos profesionales y eventos competitivos

### Cambiar Plantilla

1. Abre los **Settings de UnderScript**
2. Ve a la categoría **"Plantillas"**
3. Haz clic en el **icono de estrella** (⭐) de la plantilla que deseas activar
4. La interfaz se regenerará automáticamente con el nuevo estilo

**Iconos disponibles:**
- ⭐ **Estrella llena (verde)**: Plantilla actualmente activa
- ☆ **Estrella vacía (gris)**: Click para activar esta plantilla
- 💾 **Descarga (azul)**: Exportar plantilla como JSON
- 🗑️ **Papelera (rojo)**: Eliminar plantilla custom (solo plantillas importadas)

### Exportar Plantilla

Para guardar una plantilla y compartirla:

1. En la categoría **"Plantillas"** de los settings
2. Haz clic en el **icono de descarga** (💾) de la plantilla que deseas exportar
3. Se descargará un archivo JSON con toda la configuración
4. Comparte este archivo con otros usuarios

### Importar Plantilla

Para usar una plantilla personalizada:

1. En la categoría **"Plantillas"** de los settings
2. Usa el **selector de archivo** al inicio de la lista
3. Selecciona un archivo `.json` de plantilla
4. El sistema validará la plantilla automáticamente
5. Si es válida, se añadirá a la lista y se activará automáticamente
6. Las plantillas importadas se guardan en localStorage

**Nota:** Las plantillas predefinidas (Default, Minimal, Esports) no se pueden eliminar.

### Crear Plantilla Personalizada

Las plantillas son archivos JSON con esta estructura:

```json
{
  "metadata": {
    "id": "mi-plantilla",
    "name": "Mi Plantilla Épica",
    "version": "1.0.0",
    "author": "Tu Nombre",
    "description": "Descripción de tu plantilla",
    "created": "2025-12-24",
    "modified": "2025-12-24",
    "tags": ["custom", "epic"]
  },
  "variables": {
    "primaryColor": "#ff0000",
    "secondaryColor": "#00ff00",
    "accentColor": "#0000ff",
    "backgroundColor": "#ffffff",
    "textColor": "#000000"
  },
  "customCSS": "/* Tu CSS personalizado aquí */"
}
```

**Campos obligatorios:**
- `metadata.id`: Identificador único (sin espacios)
- `metadata.name`: Nombre visible de la plantilla
- `metadata.version`: Versión (formato semver)
- `variables`: Objeto con colores base (primaryColor, secondaryColor, etc.)
- `customCSS`: String con todo el CSS de la plantilla

**Variables CSS disponibles:**
- Todas las variables se inyectan en `:root` con prefijo `--tv-`
- Ejemplo: `primaryColor` → `var(--tv-primary-color)`
- Convierte camelCase automáticamente a kebab-case

Para más detalles técnicos, consulta [docs/10_FASE4_PLANTILLAS.md](docs/10_FASE4_PLANTILLAS.md)

## 🔧 Requisitos

1. **Navegador compatible** con extensiones de UserScripts:
   - Chrome, Firefox, Edge, Opera, Safari, etc.

2. **TamperMonkey** (o gestor de UserScripts compatible):
   - [Instalar TamperMonkey](https://www.tampermonkey.net/)

3. **UnderScript** (UserScript base requerido):
   - [Instalar UnderScript](https://github.com/UCProjects/UnderScript/releases/latest/download/undercards.user.js)

## 📥 Instalación

### Para Usuarios Finales

El plugin está en beta funcional y puede usarse para ver partidas en Spectate:

1. Instala [TamperMonkey](https://www.tampermonkey.net/)
2. Instala [UnderScript](https://github.com/UCProjects/UnderScript/releases/latest/download/undercards.user.js)
3. Descarga el plugin desde [Releases](https://github.com/JoanJuan10/UC_TournamentView/releases) (o usa `dist/tournamentview.user.js`)
4. TamperMonkey detectará el archivo `.user.js` automáticamente
5. Navega a una partida en modo Spectate en Undercards.net
6. Verás el overlay automáticamente (si está activado en settings)

### Para Desarrolladores

Este plugin usa el [template oficial de UCProjects](https://github.com/UCProjects/plugin-template) con webpack para el build.

#### Requisitos

- [Node.js](https://nodejs.org/) (v12 o superior)
- [Git](https://git-scm.com/)
- [TamperMonkey](https://www.tampermonkey.net/)
- [UnderScript](https://github.com/UCProjects/UnderScript/releases/latest/download/undercards.user.js)

#### Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/JoanJuan10/UC_TournamentView.git
cd UC_TournamentView
```

2. Instala las dependencias:
```bash
npm install
```

3. Compila el plugin:
```bash
npm run build
```

4. El archivo compilado estará en `dist/tournamentview.user.js`
5. Instálalo en TamperMonkey arrastrando el archivo al navegador

#### Desarrollo en Tiempo Real

Para desarrollo activo con recompilación automática:

```bash
npm start
```

Esto ejecutará webpack en modo watch. Cada vez que guardes cambios en `src/index.js`, el plugin se recompilará automáticamente en `dist/tournamentview.user.js`.

## ⚙️ Configuración

El plugin incluye un sistema de configuración funcional accesible desde el menú de UnderScript.

Accede a la configuración del plugin desde:
- **Menú de UnderScript** → Plugins → TournamentView

### Opciones disponibles:
- ✅ **Activar/Desactivar Tournament View** - Control completo del plugin
  - Al desactivar se remueve completamente el overlay y CSS
  - Al activar se inicializa automáticamente en páginas de Spectate
  - El estado persiste entre recargas de página

### Próximamente:
- Seleccionar plantilla activa
- Importar plantilla (JSON)
- Exportar plantilla actual
- Personalizar colores y posiciones
- Activar/desactivar elementos individuales del overlay
- Ajustar tamaños de fuentes y elementos

## 🛠️ Desarrollo

### Estructura del Proyecto

```
UC_TournamentView/
├── src/
│   └── index.js              # Código fuente principal
├── dist/
│   ├── tournamentview.user.js  # Script compilado
│   └── tournamentview.meta.js  # Metadatos para actualizaciones
├── docs/                      # Documentación técnica
├── templates/                 # Plantillas de diseño
├── package.json              # Configuración npm
├── webpack.config.js         # Configuración webpack
└── README.md
```

### Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm install` | Instala las dependencias del proyecto |
| `npm start` | Inicia webpack en modo watch (desarrollo) |
| `npm run build` | Compila el plugin para producción |

### Flujo de Trabajo

1. Edita el código en `src/index.js`
2. Ejecuta `npm start` para modo watch
3. Los cambios se recompilan automáticamente en `dist/`
4. Recarga la página de Undercards para ver los cambios
5. Para producción, usa `npm run build`

### Basado en el Template Oficial

Este proyecto sigue el [template oficial de UCProjects](https://github.com/UCProjects/plugin-template), que incluye:
- Webpack para bundling y minificación
- `checkerV2.js` para compatibilidad con UnderScript
- Gestión automática de versiones desde `package.json`
- Generación de archivos `.meta.js` para actualizaciones

## 📚 Documentación

### 📖 Documentación Completa

Para acceder a toda la documentación del proyecto, consulta:

**→ [Índice de Documentación](docs/00_INDICE.md)** ← Punto de entrada principal

### 🚀 Guías Rápidas

| Documento | Descripción |
|-----------|-------------|
| [00_INDICE.md](docs/00_INDICE.md) | **Índice completo de toda la documentación** |
| [06_ESPECIFICACION_PROYECTO.md](docs/06_ESPECIFICACION_PROYECTO.md) | Especificación técnica del proyecto |
| [11_FASE4_RESUMEN.md](docs/11_FASE4_RESUMEN.md) | Implementación completa del sistema de plantillas |
| [12_CANON_CHECK.md](docs/12_CANON_CHECK.md) | Validación de conformidad del código (98% ✅) |
| [TESTING_GUIDE.md](docs/TESTING_GUIDE.md) | Guía completa de pruebas del sistema |
| [07_DESARROLLO.md](docs/07_DESARROLLO.md) | Guía de desarrollo con webpack |

### 📋 Documentación Técnica Base

| Documento | Descripción |
|-----------|-------------|
| [01_TAMPERMONKEY.md](docs/01_TAMPERMONKEY.md) | Estructura de UserScripts, headers y webpack |
| [02_UNDERSCRIPT_PLUGIN_API.md](docs/02_UNDERSCRIPT_PLUGIN_API.md) | API de plugins de UnderScript |
| [03_EVENTOS_JUEGO.md](docs/03_EVENTOS_JUEGO.md) | Eventos del juego para Spectate |
| [04_VARIABLES_GLOBALES.md](docs/04_VARIABLES_GLOBALES.md) | Variables globales accesibles |
| [05_LIBRERIAS_INCLUIDAS.md](docs/05_LIBRERIAS_INCLUIDAS.md) | Librerías disponibles en UnderScript |

### 🏗️ Fases de Desarrollo

| Documento | Descripción |
|-----------|-------------|
| [09_FASE_3_DETALLES_IMPLEMENTACION.md](docs/09_FASE_3_DETALLES_IMPLEMENTACION.md) | Fase 3: Sistema i18n completo |
| [10_FASE4_PLANTILLAS.md](docs/10_FASE4_PLANTILLAS.md) | Fase 4: Arquitectura del sistema de plantillas |
| [11_FASE4_RESUMEN.md](docs/11_FASE4_RESUMEN.md) | Fase 4: Resumen de implementación (650+ líneas) |

### 📁 Ejemplos

| Archivo | Descripción |
|---------|-------------|
| [example_template.json](templates/example_template.json) | Plantilla de ejemplo con comentarios |

## 🗺️ Roadmap

### Fase 1 - Fundamentos ✅ (Completado)
- [x] Documentación técnica completa
- [x] Configuración Git y CI/CD
- [x] Migración al template oficial de UCProjects
- [x] Configuración de webpack y build system
- [x] Registro básico del plugin en UnderScript

### Fase 2 - Sistema de Plantillas y UI ✅ (Completado)
- [x] Sistema de plantillas (JSON + CSS con variables)
- [x] Módulo de estado del juego (GameState)
- [x] Manejadores de eventos completos
- [x] Inyección y remoción de CSS dinámico
- [x] UI Manager con overlay funcional:
  - [x] Header con información de jugadores
  - [x] HP con barras visuales
  - [x] Oro, almas y artefactos
  - [x] Contador de cartas (mano, mazo, cementerio)
  - [x] Turno actual y timer (M:SS)
  - [x] Indicador visual de jugador activo
  - [x] Overlay de resultados (victoria/derrota)
- [x] Extracción de datos del DOM:
  - [x] Almas desde elementos `<img>`
  - [x] Artefactos con contadores desde `.artifact-custom`
  - [x] Cementerio desde `.dust-counter` (índices invertidos)
- [x] Settings funcional con activar/desactivar
- [x] Timer sincronizado con `window.global('time')`

### Fase 3 - Mejoras Visuales ✅ (Completado)
- [x] Animaciones de HP con efectos visuales (shake en daño, pulse en curación)
- [x] Sistema de notificaciones flotantes
- [x] Efectos visuales en eventos importantes:
  - [x] Cartas jugadas (notificación verde)
  - [x] Hechizos usados (notificación púrpura)
  - [x] Monstruos destruidos (notificación roja)
  - [x] Efectos de artefactos (notificación dorada + glow en icono)
  - [x] Efectos de almas (notificación azul + glow en icono)
- [x] Panel de historial colapsable
  - [x] Muestra últimas 30 acciones
  - [x] Botón flotante para toggle
  - [x] Categorización por tipo de evento
  - [x] Auto-scroll a nuevas entradas
  - [x] Integración con historial nativo de Underscript
- [x] Responsive design con 3 breakpoints
  - [x] 1280px: Layout compacto
  - [x] 768px: Layout vertical
  - [x] 480px: Optimizado para móviles
- [x] Sistema multiidioma (i18n)
  - [x] Soporte para Español e Inglés
  - [x] Configuración de idioma en settings
  - [x] 17 claves de traducción por idioma
  - [x] Sistema de interpolación de parámetros
  - [x] Regeneración automática de UI al cambiar idioma

### Fase 4 - Gestión de Plantillas ✅ (Completado)
- [x] Sistema multi-plantilla completo
- [x] 3 plantillas predefinidas (Default, Classic Spectator, Dark Mode Pro)
- [x] Importar/Exportar plantillas personalizadas con FileReader y Blob APIs
- [x] Gestión avanzada con custom settings (patrón FakeSetting de uc_replays.js)
  - [x] Iconos por plantilla: activar (⭐), exportar (💾), eliminar (🗑️)
  - [x] Protección de plantillas predefinidas (no se pueden eliminar)
  - [x] Actualización dinámica de lista sin recrear settings
  - [x] Indicador visual de plantilla activa
- [x] Validación completa de estructura de plantillas (metadata + variables + customCSS)
- [x] Persistencia bidireccional con localStorage
  - [x] `localStorage.setItem()` en `setActiveTemplate()`
  - [x] `localStorage.getItem()` en `getActiveTemplateId()`
  - [x] Sin forzar template default en constructor
- [x] 18 métodos en TemplateManager
- [x] 18 bugs resueltos durante implementación (Bug #11 a #18)
- [x] Documentación completa (650+ líneas en docs/)
- [x] Conformidad validada: 98% ✅

**Estado**: Completamente funcional y en producción  
**Build**: 90.3 KiB (compilado) | 150 KiB (fuente)  
**Bugs conocidos**: 0  
**Documentación**:
- [10_FASE4_PLANTILLAS.md](docs/10_FASE4_PLANTILLAS.md) - Arquitectura del sistema
- [11_FASE4_RESUMEN.md](docs/11_FASE4_RESUMEN.md) - Resumen de implementación
- [16_FASE4_BUGS_RESUELTOS.md](docs/16_FASE4_BUGS_RESUELTOS.md) - 18 bugs documentados
- [09_LECCIONES_APRENDIDAS.md](docs/09_LECCIONES_APRENDIDAS.md) - Lecciones técnicas completas

### Fase 5 - Integraciones (Futuro)
- [ ] Soporte para Challonge
- [ ] Integración con sistemas de torneo
- [ ] Exportación de datos de partida
- [ ] API para extensiones de terceros

## 🤝 Contribuir

¿Quieres contribuir al proyecto? ¡Genial!

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-plantilla`)
3. Realiza tus cambios y haz commit
4. Envía un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia especificada en [LICENSE](LICENSE).

## 🔗 Enlaces Útiles

- [Undercards.net](https://undercards.net) - Juego original
- [UnderScript GitHub](https://github.com/UCProjects/UnderScript) - UserScript base
- [TamperMonkey](https://www.tampermonkey.net/) - Gestor de UserScripts
- [Documentación TamperMonkey (ES)](https://www.tampermonkey.net/documentation.php?locale=es)

---

*Desarrollado con ❤️ para la comunidad de Undercards*
