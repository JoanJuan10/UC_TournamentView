# UC_TournamentView

Plugin para [UnderScript](https://github.com/UCProjects/UnderScript) que moderniza la vista de espectador de [Undercards.net](https://undercards.net) con un sistema de plantillas visuales estilo torneo profesional.

## 📋 Descripción

**UC_TournamentView** es un plugin para [UnderScript](https://github.com/UCProjects/UnderScript) que transforma la página de espectador (`/Spectate`) de Undercards en una experiencia visual moderna inspirada en transmisiones de esports.

### Estado actual: Beta funcional 🎮

El plugin cuenta con un overlay completo y funcional que muestra toda la información relevante de las partidas en tiempo real. El sistema básico está implementado y operativo.

### Características implementadas:

- ✅ **Overlay de información en tiempo real**
  - Nombres de jugadores
  - HP con barras visuales dinámicas
  - Oro actual
  - Almas (con imágenes)
  - Artefactos (con imágenes y contadores)
  - Cartas en mano, mazo y cementerio
  - Turno actual y timer en formato M:SS
  - Indicador visual de jugador activo

- ✅ **Sistema multiidioma**
  - Soporte para Español e Inglés
  - Configuración de idioma en settings
  - Traducciones completas de UI y notificaciones
  - Cambio de idioma en tiempo real

- ✅ **Sistema de plantillas completo** - Múltiples estilos visuales intercambiables
  - 3 plantillas predefinidas (Default, Minimal, Esports)
  - Importación/Exportación de plantillas personalizadas
  - Selector en settings para cambiar entre plantillas
  - Sistema de validación para plantillas importadas
- ✅ **Extracción de datos del DOM** - Lectura robusta de almas, artefactos y contadores
- ✅ **Overlay de resultados** - Pantalla de victoria/derrota con estadísticas
- ✅ **Settings funcional** - Activar/desactivar el plugin correctamente

### Características planeadas:

- 🎬 **Animaciones mejoradas** - Transiciones y efectos visuales
- ⚙️ **Configuración avanzada** - Personalización granular de elementos
- 🎨 **Más plantillas** - Compact, Classic, y otros estilos

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
2. Busca la sección **TournamentView**
3. En el selector **"Plantilla Visual"**, elige la plantilla deseada
4. La interfaz se regenerará automáticamente con el nuevo estilo

### Exportar Plantilla

Para guardar una plantilla y compartirla:

1. Selecciona la plantilla que deseas exportar
2. Haz clic en **"Exportar Plantilla"**
3. Se descargará un archivo JSON con toda la configuración
4. Comparte este archivo con otros usuarios

### Importar Plantilla

Para usar una plantilla personalizada:

1. Haz clic en **"Importar Plantilla"**
2. Selecciona un archivo `.json` de plantilla
3. El sistema validará la plantilla automáticamente
4. Si es válida, aparecerá en el selector como "(Custom)"
5. Las plantillas importadas se guardan en localStorage

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

| Documento | Descripción |
|-----------|-------------|
| [01_TAMPERMONKEY.md](docs/01_TAMPERMONKEY.md) | Estructura de UserScripts, headers y webpack |
| [02_UNDERSCRIPT_PLUGIN_API.md](docs/02_UNDERSCRIPT_PLUGIN_API.md) | API de plugins de UnderScript |
| [03_EVENTOS_JUEGO.md](docs/03_EVENTOS_JUEGO.md) | Eventos del juego para Spectate |
| [04_VARIABLES_GLOBALES.md](docs/04_VARIABLES_GLOBALES.md) | Variables globales accesibles |
| [05_LIBRERIAS_INCLUIDAS.md](docs/05_LIBRERIAS_INCLUIDAS.md) | Librerías disponibles en UnderScript |
| [06_ESPECIFICACION_PROYECTO.md](docs/06_ESPECIFICACION_PROYECTO.md) | Especificación técnica del proyecto |
| [07_DESARROLLO.md](docs/07_DESARROLLO.md) | **Guía de desarrollo con webpack** |

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

### Fase 4 - Gestión de Plantillas (Pendiente)
- [ ] Importar/Exportar plantillas personalizadas
- [ ] Editor visual de plantillas en settings
- [ ] Múltiples plantillas predefinidas
- [ ] Galería de plantillas comunitarias
- [ ] Validación y preview de plantillas

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
