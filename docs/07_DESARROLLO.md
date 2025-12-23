# 07 - Guía de Desarrollo

> Actualizado: 24 de diciembre de 2025

Guía completa para desarrollar plugins de UnderScript usando el template oficial con webpack, basada en la experiencia real de desarrollar UC_TournamentView.

## 📋 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración Inicial](#configuración-inicial)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Flujo de Trabajo](#flujo-de-trabajo)
5. [Scripts Disponibles](#scripts-disponibles)
6. [Configuración de Webpack](#configuración-de-webpack)
7. [Desarrollo Local](#desarrollo-local)
8. [Debugging](#debugging)
9. [Build para Producción](#build-para-producción)
10. [Publicación de Releases](#publicación-de-releases)

---

## Requisitos Previos

### Software Necesario

| Software | Versión Mínima | Instalación |
|----------|---------------|-------------|
| **Node.js** | v12+ | [nodejs.org](https://nodejs.org/) |
| **npm** | v6+ | Incluido con Node.js |
| **Git** | v2.20+ | [git-scm.com](https://git-scm.com/) |
| **TamperMonkey** | Última | [tampermonkey.net](https://www.tampermonkey.net/) |

### Verificar Instalación

```bash
# Verificar Node.js
node --version
# Debería mostrar: v12.x.x o superior

# Verificar npm
npm --version
# Debería mostrar: 6.x.x o superior

# Verificar Git
git --version
# Debería mostrar: git version 2.x.x
```

---

## Configuración Inicial

### 1. Clonar el Repositorio

```bash
git clone https://github.com/JoanJuan10/UC_TournamentView.git
cd UC_TournamentView
```

O si usas el template oficial desde cero:

```bash
git clone https://github.com/UCProjects/plugin-template.git mi-plugin
cd mi-plugin
```

### 2. Instalar Dependencias

```bash
npm install
```

Esto instalará:
- **webpack** - Empaquetador de módulos
- **webpack-cli** - CLI para webpack
- **webpack-userscript** - Plugin para generar UserScripts
- **eslint** - Linter de código JavaScript
- Otras dependencias de desarrollo

### 3. Configurar package.json

Edita `package.json` con los datos de tu plugin:

```json
{
  "name": "mi-plugin",
  "scriptName": "Mi Plugin para UnderScript",
  "description": "Descripción corta del plugin",
  "repository": "usuario/mi-plugin",
  "version": "0.1.0",
  "license": "MIT",
  "author": "Tu Nombre"
}
```

**Propiedades importantes:**

- **`name`**: Identificador interno (sin espacios, minúsculas)
- **`scriptName`**: Nombre mostrado en TamperMonkey
- **`version`**: Versión semver (MAJOR.MINOR.PATCH)
- **`repository`**: `usuario/repo` para GitHub

### 4. Instalar UnderScript

Antes de desarrollar, asegúrate de tener instalado:

1. **TamperMonkey** en tu navegador
2. **UnderScript** desde [aquí](https://github.com/UCProjects/UnderScript/releases/latest/download/undercards.user.js)

---

## Estructura del Proyecto

```
mi-plugin/
├── .eslintrc.js              # Configuración de ESLint
├── .github/                  # GitHub Actions (CI/CD)
│   └── workflows/
│       └── ci.yml
├── .gitignore                # Archivos ignorados por Git
├── CHANGELOG.md              # Historial de cambios
├── LICENSE                   # Licencia del proyecto
├── README.md                 # Documentación principal
├── package.json              # Configuración npm
├── webpack.config.js         # Configuración de webpack
│
├── src/                      # 📁 Código fuente
│   └── index.js              # Punto de entrada del plugin
│
├── dist/                     # 📁 Archivos compilados (generados)
│   ├── mi-plugin.user.js     # UserScript compilado
│   └── mi-plugin.meta.js     # Metadatos para actualizaciones
│
└── docs/                     # 📁 Documentación adicional
    └── ...
```

### Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `src/index.js` | **Código fuente principal** del plugin |
| `dist/*.user.js` | UserScript compilado para TamperMonkey |
| `package.json` | Metadatos y dependencias |
| `webpack.config.js` | Configuración del build |

---

## Flujo de Trabajo

### Diagrama de Desarrollo

```
┌─────────────────────────────────────────────────────┐
│ 1. Editar código en src/index.js                   │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│ 2. Webpack compila automáticamente (npm start)     │
│    O compilar manualmente (npm run build)          │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│ 3. Se genera dist/mi-plugin.user.js                │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│ 4. TamperMonkey detecta cambios (si está abierto)  │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│ 5. Recargar Undercards.net para ver los cambios    │
└─────────────────────────────────────────────────────┘
```

---

## Scripts Disponibles

### npm start

**Desarrollo en modo watch:**

```bash
npm start
```

- ✅ Compila el código automáticamente al guardar
- ✅ Genera archivos en `dist/`
- ✅ Modo development (código legible)
- ✅ Deja el proceso corriendo

**Salida esperada:**

```
webpack is watching the files...

Built at: 23/12/2025 22:08:31
Asset                       Size
mi-plugin.user.js          1.9 KiB
mi-plugin.meta.js          775 bytes
```

### npm run build

**Compilación para producción:**

```bash
npm run build
```

- ✅ Compila una vez
- ✅ Modo production (código minificado)
- ✅ Optimizado para distribución

### npm run lint (si está configurado)

**Revisar código:**

```bash
npm run lint
```

- ✅ Verifica estilo de código
- ✅ Detecta errores comunes

---

## Configuración de Webpack

### webpack.config.js

El archivo `webpack.config.js` controla cómo se compila el plugin:

```javascript
const path = require('path');
const WebpackUserscript = require('webpack-userscript');
const { name, scriptName, description, repository } = require('./package.json');

const dev = process.argv.includes('--dev');

module.exports = {
  mode: dev ? 'development' : 'production',
  entry: path.resolve(__dirname, 'src', 'index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: `${name}.user.js`,
  },
  plugins: [
    new WebpackUserscript({
      headers: {
        name: scriptName,
        description,
        namespace: 'https://uc.feildmaster.com/',
        match: 'https://*.undercards.net/*',
        exclude: 'https://*.undercards.net/*/*',
        updateURL: `https://github.com/${repository}/releases/latest/download/${name}.meta.js`,
        downloadURL: `https://github.com/${repository}/releases/latest/download/${name}.user.js`,
        require: [
          'https://raw.githubusercontent.com/UCProjects/UnderScript/master/src/checkerV2.js',
        ],
        grant: 'none',
      },
      pretty: true,
    }),
  ],
};
```

### Modificaciones Comunes

#### Cambiar las URLs donde se ejecuta

```javascript
headers: {
  match: 'https://otra-web.com/*',
  exclude: 'https://otra-web.com/excluir/*',
}
```

#### Añadir más dependencias

```javascript
require: [
  'https://raw.githubusercontent.com/UCProjects/UnderScript/master/src/checkerV2.js',
  'https://unpkg.com/libreria@1.0.0/dist/libreria.min.js',
]
```

#### Cambiar el namespace

```javascript
namespace: 'https://mi-dominio.com/',
```

---

## Desarrollo Local

### 1. Instalar el Plugin en TamperMonkey

**Primera vez:**

```bash
# Compilar el plugin
npm run build

# El archivo estará en dist/mi-plugin.user.js
```

Luego:
1. Abre `dist/mi-plugin.user.js` en tu navegador
2. TamperMonkey detectará el UserScript
3. Click en **Instalar**

**Actualizaciones durante desarrollo:**

Con `npm start` corriendo, TamperMonkey puede detectar cambios automáticamente si tienes activado el modo "Track local file".

### 2. Modo Watch

```bash
npm start
```

Esto dejará webpack corriendo. Cada vez que guardes `src/index.js`, webpack recompilará automáticamente.

### 3. Ver Cambios

1. Guarda cambios en `src/index.js`
2. Webpack recompila (verás el mensaje en la terminal)
3. Recarga la página de Undercards.net (F5)
4. Los cambios deberían aplicarse

---

## Debugging

### Console.log

La forma más simple de debuggear:

```javascript
plugin.events.on(':preload', () => {
    console.log('Plugin cargado');
    console.log('Versión:', GM_info.version);
});
```

### DevTools del Navegador

1. Abre la página de Undercards
2. Presiona **F12** para abrir DevTools
3. Ve a la pestaña **Console**
4. Busca mensajes de tu plugin

### Verificar que el Plugin Está Cargado

```javascript
plugin.events.on(':preload', () => {
    plugin.toast({
        title: 'Mi Plugin',
        text: 'Cargado correctamente',
    });
});
```

### Logger de UnderScript

```javascript
const logger = plugin.logger();

logger.log('Mensaje normal');
logger.debug('Mensaje de debug');
logger.error('Mensaje de error');
logger.warn('Advertencia');
```

---

## Build para Producción

### 1. Incrementar la Versión

Edita `package.json`:

```json
{
  "version": "0.2.0"  // Era 0.1.0
}
```

O usa npm:

```bash
npm version patch   # 0.1.0 -> 0.1.1
npm version minor   # 0.1.0 -> 0.2.0
npm version major   # 0.1.0 -> 1.0.0
```

### 2. Compilar para Producción

```bash
npm run build
```

Esto generará:
- `dist/mi-plugin.user.js` - UserScript minificado
- `dist/mi-plugin.meta.js` - Metadatos para actualizaciones

### 3. Verificar el Build

Revisa que los archivos en `dist/` se generaron correctamente:

```bash
ls -la dist/
```

---

## Publicación de Releases

### 1. Commit y Push

```bash
git add .
git commit -m "Release v0.2.0: Nueva funcionalidad X"
git push origin main
```

### 2. Crear Tag

```bash
git tag v0.2.0
git push origin v0.2.0
```

### 3. Crear Release en GitHub

1. Ve a tu repositorio en GitHub
2. Click en **Releases** → **Create a new release**
3. Selecciona el tag `v0.2.0`
4. Título: `v0.2.0`
5. Descripción: Cambios incluidos
6. Adjunta los archivos de `dist/`:
   - `mi-plugin.user.js`
   - `mi-plugin.meta.js`
7. Click en **Publish release**

### 4. URLs de Actualización

Los usuarios podrán instalar/actualizar desde:

```
Instalación:
https://github.com/usuario/mi-plugin/releases/latest/download/mi-plugin.user.js

Actualizaciones (automáticas):
https://github.com/usuario/mi-plugin/releases/latest/download/mi-plugin.meta.js
```

---

## Solución de Problemas

### "webpack no se reconoce como comando"

**Problema:** No se instalaron las dependencias.

**Solución:**
```bash
npm install
```

### El plugin no aparece en UnderScript

**Problema:** Registro incorrecto del plugin.

**Verificar:**
1. Que usas `window.underscript`
2. Que el nombre tiene máx 20 caracteres
3. Que tienes el evento `:preload`

```javascript
const underscript = window.underscript;
const plugin = underscript.plugin('NombreCorto', GM_info.version);

plugin.events.on(':preload', () => {
    console.log('Cargado!');
});
```

### Los cambios no se reflejan

**Solución:**
1. Asegúrate de que `npm start` está corriendo
2. Verifica que webpack recompiló (mira la terminal)
3. Recarga la página con **Ctrl+Shift+R** (recarga forzada)
4. Verifica que TamperMonkey tiene el script activado

### Error: "Cannot find module..."

**Problema:** Falta alguna dependencia.

**Solución:**
```bash
rm -rf node_modules
npm install
```

---

## Próximos Pasos

1. ✅ Configuración básica completa
2. 📖 Lee [02_UNDERSCRIPT_PLUGIN_API.md](02_UNDERSCRIPT_PLUGIN_API.md) para entender la API
3. 🎮 Lee [03_EVENTOS_JUEGO.md](03_EVENTOS_JUEGO.md) para eventos del juego
4. 📚 Revisa [08_ESTADO_ACTUAL.md](08_ESTADO_ACTUAL.md) para ver el estado del proyecto
5. 💡 Lee [09_LECCIONES_APRENDIDAS.md](09_LECCIONES_APRENDIDAS.md) para tips y mejores prácticas
6. 🎨 Implementa tu primera funcionalidad
7. 🚀 Comparte tu plugin con la comunidad

---

## Recursos Adicionales

- [Template Oficial de UCProjects](https://github.com/UCProjects/plugin-template)
- [UnderScript GitHub](https://github.com/UCProjects/UnderScript)
- [Webpack Documentation](https://webpack.js.org/)
- [TamperMonkey Documentation](https://www.tampermonkey.net/documentation.php)
- [UC_TournamentView Source Code](https://github.com/JoanJuan10/UC_TournamentView) - Ejemplo completo

---

[← Volver al README](../README.md) | [Anterior: Especificación del Proyecto ←](06_ESPECIFICACION_PROYECTO.md)
