# 📖 Guía de Usuario - UC_TournamentView

## Tabla de Contenidos

- [Instalación](#instalación)
- [Configuración Básica](#configuración-básica)
- [Uso del Plugin](#uso-del-plugin)
- [Gestión de Plantillas](#gestión-de-plantillas)
- [Solución de Problemas](#solución-de-problemas)
- [Preguntas Frecuentes](#preguntas-frecuentes)

---

## Instalación

### Requisitos Previos

1. **Navegador Compatible**:
   - Google Chrome
   - Mozilla Firefox
   - Microsoft Edge
   - Opera
   - Brave

2. **Extensión Tampermonkey**:
   - Descarga desde [tampermonkey.net](https://www.tampermonkey.net/)
   - Instala la extensión en tu navegador
   - Acepta los permisos necesarios

3. **UnderScript**:
   - Descarga desde [GitHub Releases](https://github.com/UCProjects/UnderScript/releases/latest)
   - Instala `undercards.user.js` con Tampermonkey
   - Verifica que aparezca el icono de UnderScript en Undercards.net

### Instalar UC_TournamentView

1. **Descarga el Plugin**:
   ```
   https://github.com/JoanJuan10/UC_TournamentView/releases/latest/download/tournamentview.user.js
   ```

2. **Instalación Automática**:
   - Haz clic en el archivo descargado
   - Tampermonkey detectará el script y abrirá una ventana
   - Haz clic en el botón **"Instalar"**
   - Espera la confirmación

3. **Verificación**:
   - Ve a [Undercards.net](https://undercards.net)
   - Haz clic en el icono de UnderScript (esquina superior derecha)
   - Ve a **Settings → Plugins**
   - Deberías ver **TournamentView** en la lista

---

## Configuración Básica

### Acceder a los Settings

1. Visita [Undercards.net](https://undercards.net)
2. Haz clic en el icono de **UnderScript** (⚙️)
3. Selecciona **Settings**
4. Ve a la categoría **Plugins**
5. Busca **TournamentView**

### Opciones Disponibles

#### 1. Activar Tournament View

**Tipo**: Checkbox (On/Off)  
**Predeterminado**: ❌ Desactivado

Habilita o deshabilita completamente el plugin. Cuando está desactivado, no se mostrará ningún overlay en modo espectador.

#### 2. Idioma / Language

**Tipo**: Selector  
**Opciones**: Español (🇪🇸) | English (🇬🇧)  
**Predeterminado**: Español

Cambia el idioma de todos los textos de la interfaz. El cambio se aplica inmediatamente sin necesidad de recargar.

**Textos traducidos:**
- Labels de la interfaz (Turno, HP, Oro, etc.)
- Notificaciones de eventos
- Mensajes de victoria/derrota
- Panel de historial

#### 3. Plantilla Visual

**Tipo**: Selector con acciones  
**Opciones**: Default Tournament View | Classic Spectator | Dark Mode Pro | [Plantillas Personalizadas]

Selecciona la plantilla visual activa. Cada plantilla tiene su propio estilo de colores, fuentes y disposición.

---

## Uso del Plugin

### Modo Espectador

1. **Entra en una Partida**:
   - Ve a una partida cualquiera en Undercards
   - Cambia la URL para agregar `/Spectate`:
     ```
     https://undercards.net/Game?id=12345/Spectate
     ```
   - O usa el botón "Spectate" si estás en una partida como jugador

2. **Overlay Automático**:
   - Si el plugin está activado, el overlay aparecerá automáticamente
   - No necesitas hacer nada más, todo se actualiza en tiempo real

### Elementos de la Interfaz

#### Panel de Información del Oponente (Arriba)
- **Nombre del jugador**
- **Soul (Alma)** con imagen
- **HP (Puntos de Vida)** con barra visual
- **Oro actual**
- **Artefactos** con contadores
- **Contadores de cartas**: Mano | Mazo | Cementerio

#### Panel de Información del Jugador (Abajo)
- Mismos elementos que el panel del oponente
- Se ilumina con borde verde cuando es su turno

#### Indicador de Turno (Izquierda)
- **Número de turno** actual
- **Timer** en formato MM:SS
- Se actualiza en tiempo real

#### Historial de Acciones (Derecha)
- **Botón flotante** (📜) para abrir/cerrar
- **Panel desplegable** con registro de todas las acciones:
  - Cartas jugadas
  - Hechizos lanzados
  - Monstruos destruidos
  - Efectos de artefactos
  - Efectos de almas
  - Cambios de HP
- **Scroll automático** con las acciones más recientes arriba

#### Notificaciones Flotantes
- Aparecen en la parte superior central
- Se apilan automáticamente si hay varias
- Desaparecen después de 2-3 segundos
- Tipos:
  - 🎴 **Carta jugada** (azul)
  - ✨ **Hechizo lanzado** (morado)
  - 💥 **Daño recibido** (rojo)
  - 💚 **Curación** (verde)
  - 🔮 **Efecto de artefacto** (dorado)
  - 🌟 **Efecto de alma** (cyan)

---

## Gestión de Plantillas

### Plantillas Predefinidas

El plugin incluye 3 plantillas profesionales que no pueden ser eliminadas:

#### 1. Default Tournament View ⭐
- **Colores**: Morado/Azul con gradientes
- **Estilo**: Moderno y vibrante
- **Uso**: Torneos y transmisiones en vivo

#### 2. Classic Spectator
- **Colores**: Azul/Blanco limpio
- **Estilo**: Minimalista y elegante
- **Uso**: Visualización profesional y formal

#### 3. Dark Mode Pro
- **Colores**: Negro/Cyan/Naranja
- **Estilo**: Oscuro con acentos brillantes
- **Uso**: Sesiones largas y transmisiones nocturnas

### Exportar una Plantilla

1. **Selecciona la plantilla** que quieres exportar (debe estar activa ⭐)
2. En Settings → Plantillas, busca la plantilla
3. Haz clic en el icono de **descarga** (💾)
4. Se descargará un archivo JSON con el nombre de la plantilla
5. Guarda el archivo en tu computadora

**Archivo de ejemplo**: `default_tournament_view.json`

### Importar una Plantilla

1. Ve a Settings → Plantillas
2. Haz clic en **"Importar Plantilla"**
3. Selecciona un archivo JSON válido
4. El plugin validará la estructura
5. Si es válido, la plantilla se agregará a la lista
6. Ya puedes activarla haciendo clic en la estrella (⭐)

**Requisitos del archivo JSON**:
- Debe tener una estructura válida (ver [TEMPLATE_GUIDE.md](TEMPLATE_GUIDE.md))
- El `id` debe ser único
- Debe incluir `metadata` y `customCSS`

### Activar/Desactivar Plantillas

1. Ve a Settings → Plantillas
2. Encuentra la plantilla que quieres activar
3. Haz clic en el icono de **estrella** (⭐)
4. La plantilla anterior se desactivará automáticamente
5. El overlay se regenerará con la nueva plantilla

**Nota**: Solo puede haber una plantilla activa a la vez.

### Eliminar Plantillas

Solo puedes eliminar plantillas personalizadas (importadas). Las predefinidas están protegidas.

1. Ve a Settings → Plantillas
2. Encuentra la plantilla personalizada
3. Haz clic en el icono de **papelera** (🗑️)
4. Confirma la eliminación
5. Si la plantilla estaba activa, se cambiará automáticamente a "Default Tournament View"

---

## Solución de Problemas

### El overlay no aparece

**Problema**: El plugin está activado pero no veo el overlay en modo espectador.

**Soluciones**:

1. **Verifica que estás en modo Spectate**:
   - La URL debe terminar en `/Spectate`
   - Ejemplo: `https://undercards.net/Game?id=12345/Spectate`

2. **Verifica que el plugin está activado**:
   - UnderScript Settings → Plugins → TournamentView
   - Marca "✅ Activar Tournament View"

3. **Recarga la página**:
   - Presiona `Ctrl + F5` (o `Cmd + Shift + R` en Mac)
   - Esto fuerza una recarga completa

4. **Verifica la consola**:
   - Abre DevTools (`F12`)
   - Ve a la pestaña "Console"
   - Busca mensajes de `[TournamentView]`
   - Si hay errores, repórtalos en GitHub

### Los datos no se actualizan

**Problema**: El overlay aparece pero los HP, oro u otros datos no cambian.

**Soluciones**:

1. **Verifica los eventos del juego**:
   - Abre DevTools (`F12`) → Console
   - Deberías ver mensajes de `[TournamentView]` cuando suceden eventos

2. **Recarga UnderScript**:
   - Desactiva y vuelve a activar UnderScript en Tampermonkey
   - Recarga Undercards.net

3. **Limpia el caché**:
   - Borra el caché del navegador
   - Recarga la página

### La plantilla no se guarda

**Problema**: Cambio de plantilla pero al recargar vuelve a la anterior.

**Soluciones**:

1. **Verifica localStorage**:
   - Abre DevTools (`F12`) → Application → Local Storage
   - Busca `underscript.plugin.TournamentView.activeTemplateId`
   - Debería existir y tener un valor

2. **Prueba en modo incógnito**:
   - Si funciona en incógnito, puede ser una extensión interfiriendo
   - Deshabilita otras extensiones temporalmente

3. **Reinstala el plugin**:
   - Desinstala UC_TournamentView desde Tampermonkey
   - Reinstala desde el archivo `.user.js`

### Error al importar plantilla

**Problema**: "Error de validación" al importar un JSON.

**Soluciones**:

1. **Verifica la estructura**:
   - El archivo debe ser JSON válido
   - Usa un validador online (jsonlint.com)

2. **Verifica los campos requeridos**:
   ```json
   {
     "metadata": {
       "id": "unique-id",
       "name": "Template Name",
       "version": "1.0.0"
     },
     "customCSS": "/* CSS here */"
   }
   ```

3. **Verifica que el ID sea único**:
   - No puedes importar una plantilla con un `id` que ya existe
   - Cambia el `id` en el JSON antes de importar

---

## Preguntas Frecuentes

### ¿Puedo usar el plugin como jugador?

No, el plugin solo funciona en modo espectador (`/Spectate`). Si estás jugando, no verás el overlay.

### ¿Afecta al rendimiento del juego?

No. El plugin solo lee datos y muestra información visual. No interfiere con la lógica del juego ni genera lag.

### ¿Puedo compartir mis plantillas?

¡Sí! Exporta tu plantilla como JSON y compártela en:
- Discord de Undercards
- GitHub Issues
- Reddit de Undertale

### ¿El plugin funciona en móviles?

No oficialmente. Tampermonkey funciona en Firefox móvil, pero la interfaz no está optimizada para pantallas pequeñas.

### ¿Puedo ocultar el historial de acciones?

Sí, haz clic en el botón flotante (📜) o en la X del panel. Se ocultará pero seguirá registrando acciones.

### ¿Los otros espectadores ven mi overlay?

No. El overlay es completamente local en tu navegador. Cada espectador tiene su propia configuración.

### ¿Puedo modificar el código del plugin?

Sí, es código abierto bajo licencia MIT. Puedes modificarlo, pero:
- Respeta la licencia y los créditos
- Los cambios no afectan a otros usuarios
- Lee [DEVELOPMENT.md](DEVELOPMENT.md) para contribuir

### ¿Hay un modo oscuro?

Sí, usa la plantilla **"Dark Mode Pro"** en Settings → Plantillas.

---

## 🆘 Soporte

Si tienes problemas no resueltos aquí:

1. **Lee la documentación completa** en [`docs/`](../docs/)
2. **Busca en Issues** existentes: [GitHub Issues](https://github.com/JoanJuan10/UC_TournamentView/issues)
3. **Abre un nuevo Issue** con:
   - Descripción detallada del problema
   - Pasos para reproducirlo
   - Captura de pantalla
   - Versión del plugin y navegador
   - Mensajes de la consola (si aplica)

---

**¿Encontraste útil esta guía? ⭐ Dale una estrella al repositorio!**
