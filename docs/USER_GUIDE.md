# 📖 Guía de Usuario

Cómo usar UC_TournamentView sin complicarte la vida.

## Instalación

### Lo que necesitas

1. Un navegador moderno (Chrome, Firefox, Edge...)
2. [Tampermonkey](https://www.tampermonkey.net/) instalado
3. [UnderScript](https://github.com/UCProjects/UnderScript/releases/latest) funcionando

### Cómo instalarlo

1. Descarga el plugin: [última versión](https://github.com/JoanJuan10/UC_TournamentView/releases/latest/download/tournamentview.user.js)
2. Tampermonkey aparecerá → dale a "Instalar"
3. Ve a Undercards.net → menú UnderScript → Settings → Plugins
4. Activa TournamentView ✅

---

## Cómo usarlo

### Entrar en modo espectador

El plugin solo funciona cuando estás viendo una partida como espectador. La URL tiene que acabar en `/Spectate`:

```
https://undercards.net/Game?id=12345/Spectate
```

Si el plugin está activado, el overlay aparece solo.

### Qué ves en pantalla

- **Arriba**: Info del oponente (HP, oro, cartas, artefactos...)
- **Abajo**: Tu info del jugador
- **Izquierda**: Turno actual y timer
- **Derecha**: Botón 📜 para ver el historial de acciones

El panel de cada jugador se ilumina cuando es su turno.

### Notificaciones

Cuando pasa algo importante aparecen notificaciones flotantes arriba:
- 🎴 Carta jugada
- ✨ Hechizo lanzado
- 💥 Daño
- 💚 Curación

Desaparecen solas después de unos segundos.

---

## Ajustes

Encuéntralos en: **Menú UnderScript → Settings → Plugins → TournamentView**

| Opción | Qué hace |
|--------|----------|
| Activar | Enciende/apaga el overlay |
| Idioma | Español o Inglés |
| Plantilla | Elige el estilo visual |

---

## Plantillas

### Las que vienen incluidas

| Plantilla | Estilo |
|-----------|--------|
| **Default** | Morado/azul con degradados |
| **Classic** | Azul/blanco, limpio |
| **Dark Mode** | Oscuro con cyan/naranja |

Estas no se pueden borrar.

### Usar otra plantilla

1. Ve a Settings → Plantillas
2. Haz clic en la ⭐ de la que quieras usar
3. Listo, el overlay cambia al momento

### Exportar una plantilla

1. Haz clic en 💾 junto a la plantilla
2. Se descarga un archivo JSON
3. Guárdalo donde quieras

### Importar una plantilla

1. Haz clic en "Importar Plantilla"
2. Elige el archivo JSON
3. Si está bien, aparecerá en la lista

### Borrar plantillas

Solo puedes borrar las que hayas importado (las custom). Haz clic en 🗑️.

---

## Problemas típicos

### No veo el overlay

1. ¿Estás en `/Spectate`? La URL tiene que acabar así
2. ¿Tienes el plugin activado? Revisa en Settings
3. Prueba a recargar con `Ctrl + F5`
4. Mira la consola (F12) por si hay errores

### Los datos no se actualizan

1. Recarga la página
2. Desactiva/activa UnderScript en Tampermonkey
3. Limpia el caché del navegador

### Error al importar plantilla

1. Verifica que el JSON es válido (usa jsonlint.com)
2. Asegúrate de que tiene `metadata.id`, `metadata.name` y `customCSS`
3. El `id` tiene que ser único (no puede repetirse)

---

## FAQ

**¿Funciona si estoy jugando?**  
No, solo en modo espectador.

**¿Los demás ven mi overlay?**  
No, es completamente local en tu navegador.

**¿Funciona en móvil?**  
Técnicamente sí (Firefox + Tampermonkey), pero no está pensado para pantallas pequeñas.

**¿Afecta al rendimiento?**  
No, solo lee y muestra datos, no toca la lógica del juego.

**¿Puedo modificar el código?**  
Sí, es MIT. Mira [DEVELOPMENT.md](DEVELOPMENT.md) si quieres contribuir.

---

## ¿Sigues con problemas?

1. Busca en [Issues de GitHub](https://github.com/JoanJuan10/UC_TournamentView/issues)
2. Si no encuentras nada, abre un issue nuevo con:
   - Qué pasa
   - Pasos para reproducirlo
   - Captura de pantalla si ayuda
   - Lo que dice la consola (F12)
