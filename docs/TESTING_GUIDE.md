# Guía de Pruebas - Sistema de Plantillas

## ✅ Checklist de Pruebas

### Fase 1: Configuración Inicial
- [ ] Plugin instalado correctamente en TamperMonkey
- [ ] UnderScript funcionando en Undercards.net
- [ ] Navegar a una partida en modo Spectate
- [ ] Activar "TournamentView" en settings de UnderScript
- [ ] Verificar que aparece el overlay con plantilla Default

### Fase 2: Cambio de Plantillas
- [ ] Abrir Settings de UnderScript → TournamentView
- [ ] Verificar selector "Plantilla Visual / Visual Template"
- [ ] Selector muestra 3 opciones:
  - [ ] Default Tournament View
  - [ ] Minimal Clean
  - [ ] Esports Broadcast
- [ ] Cambiar a "Minimal Clean"
  - [ ] UI se regenera automáticamente
  - [ ] Verificar estilo minimalista (colores planos, sin gradientes)
  - [ ] Verificar que toda la información se muestra correctamente
- [ ] Cambiar a "Esports Broadcast"
  - [ ] UI se regenera automáticamente
  - [ ] Verificar efectos de brillo y colores dorados
  - [ ] Verificar animaciones en turno activo
- [ ] Volver a "Default"
  - [ ] UI vuelve al estilo original

### Fase 3: Exportación de Plantillas
- [ ] Seleccionar plantilla "Default"
- [ ] Hacer clic en botón "Exportar Plantilla / Export Template"
- [ ] Verificar descarga de archivo `template_default_[timestamp].json`
- [ ] Abrir archivo JSON y verificar:
  - [ ] Campo `metadata` con id, name, version, author
  - [ ] Campo `variables` con colores
  - [ ] Campo `customCSS` con todo el CSS
- [ ] Repetir para plantillas "Minimal" y "Esports"

### Fase 4: Importación de Plantillas
- [ ] Hacer clic en botón "Importar Plantilla / Import Template"
- [ ] Seleccionar archivo `example_template.json` desde `docs/`
- [ ] Verificar mensaje: "Plantilla 'Custom Example Template' importada exitosamente"
- [ ] Selector ahora muestra 4 plantillas (nueva con "(Custom)")
- [ ] Cambiar a la plantilla importada
  - [ ] UI se regenera con colores verdes/naranja del ejemplo
  - [ ] Verificar que todos los elementos funcionan

### Fase 5: Validación de Plantillas
- [ ] Intentar importar JSON inválido (crear archivo de prueba)
- [ ] Plantilla sin campo `metadata.id`:
  - [ ] Verificar mensaje de error
  - [ ] No debe importarse
- [ ] Plantilla sin `variables.primaryColor`:
  - [ ] Verificar mensaje de error
  - [ ] No debe importarse
- [ ] Plantilla con `customCSS` no string:
  - [ ] Verificar mensaje de error
  - [ ] No debe importarse

### Fase 6: Persistencia
- [ ] Importar plantilla personalizada
- [ ] Seleccionar la plantilla importada
- [ ] Cerrar y reabrir el navegador
- [ ] Navegar de nuevo a Spectate
- [ ] Verificar que la plantilla personalizada:
  - [ ] Sigue en el selector
  - [ ] Sigue activa si estaba seleccionada

### Fase 7: Funcionalidad Durante Partida
Con cada plantilla, verificar que se muestra correctamente:
- [ ] Nombres de jugadores (ambos lados)
- [ ] HP con barras dinámicas
- [ ] Oro actual
- [ ] Almas (imágenes)
- [ ] Artefactos (imágenes + contadores)
- [ ] Cartas en mano/mazo/cementerio
- [ ] Turno actual
- [ ] Timer del turno (formato M:SS)
- [ ] Indicador de turno activo (borde o efecto visual)
- [ ] Historial de acciones
- [ ] Notificaciones de eventos
- [ ] Pantalla de victoria/derrota

### Fase 8: Responsive
- [ ] Reducir ventana a 1280px width
  - [ ] Verificar que UI se ajusta
- [ ] Reducir ventana a 768px width
  - [ ] Verificar que UI se ajusta (modo móvil)
- [ ] Probar cada plantilla en diferentes resoluciones

### Fase 9: Console Logs
Abrir DevTools (F12) y verificar en Console:
- [ ] `[TournamentView] Plantillas predefinidas cargadas: 3`
- [ ] Sin errores de JavaScript
- [ ] Al cambiar plantilla: `[TournamentView] Cambiando plantilla a: [id]`
- [ ] Al exportar: `[TournamentView] Plantilla exportada exitosamente`
- [ ] Al importar: `[TournamentView] Plantilla importada exitosamente: [name]`

### Fase 10: Idiomas
- [ ] Cambiar idioma a Inglés
  - [ ] Etiquetas de settings cambian a inglés
  - [ ] Nombres de botones cambian
- [ ] Cambiar idioma a Español
  - [ ] Todo vuelve a español

## 🐛 Bugs Conocidos a Verificar

- [ ] ¿Las plantillas personalizadas se pierden al limpiar localStorage?
- [ ] ¿El selector se actualiza correctamente después de importar?
- [ ] ¿Hay fugas de memoria al cambiar plantillas repetidamente?
- [ ] ¿Los CSS custom properties se aplican correctamente?
- [ ] ¿Las variables en camelCase se convierten bien a kebab-case?

## 📊 Resultados de Pruebas

**Fecha:** _________

**Versión:** 0.1.0

**Navegador:** _________

**Bugs encontrados:**
- 

**Funcionalidades OK:**
- 

**Funcionalidades con problemas:**
- 

**Notas adicionales:**
- 

## 🔧 Troubleshooting

### La UI no se regenera al cambiar plantilla
1. Verificar console logs para errores
2. Probar desactivar/activar el plugin
3. Recargar la página

### La plantilla importada no aparece en el selector
1. Verificar que el JSON es válido
2. Verificar mensajes de error en console
3. Verificar que el `metadata.id` es único

### Los colores no se aplican correctamente
1. Verificar que `variables` tiene todos los colores requeridos
2. Verificar que el CSS usa `var(--tv-nombre-variable)`
3. Verificar nomenclatura kebab-case en CSS

### Error al exportar plantilla
1. Verificar que hay una plantilla activa
2. Verificar permisos de descarga en el navegador
3. Revisar console logs

