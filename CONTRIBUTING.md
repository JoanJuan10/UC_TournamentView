# 🤝 Guía de Contribución - UC_TournamentView

¡Hola! Gracias por querer echar una mano con UC_TournamentView. Este doc te explica cómo puedes colaborar.

## 📋 Índice

- [Antes de nada](#antes-de-nada)
- [¿Cómo puedo ayudar?](#cómo-puedo-ayudar)
- [Preparar el entorno](#preparar-el-entorno)
- [Cómo desarrollar](#cómo-desarrollar)
- [Estilo de código](#estilo-de-código)
- [Commits y PRs](#commits-y-prs)

---

## Antes de nada

Solo pedimos que seas respetuoso con el resto de la comunidad. Estamos aquí porque nos gusta el juego y queremos hacer cosas molonas. Nada más.

---

## ¿Cómo puedo ayudar?

### Reportar bugs 🐛

Si algo no funciona:

1. Busca primero en [Issues](https://github.com/JoanJuan10/UC_TournamentView/issues) por si alguien ya lo reportó
2. Si no existe, crea uno nuevo con la plantilla de Bug Report
3. Cuanta más info des, mejor (pasos para reproducirlo, capturas, logs de consola...)

### Sugerir ideas ✨

¿Se te ocurre algo que mejoraría el plugin?

1. Mira en Issues si alguien ya lo sugirió
2. Si no, crea uno con la plantilla de Feature Request
3. Explica qué problema resolvería y por qué mola

### Escribir código 💻

Puedes ayudar con:
- **Bug fixes** - Arreglar cosas rotas
- **Features** - Añadir funcionalidades nuevas
- **Docs** - Mejorar la documentación
- **Templates** - Crear nuevas plantillas visuales
- **i18n** - Añadir más idiomas

---

## Preparar el entorno

### Necesitas

- **Node.js** v14+
- **npm** v6+
- **Git**
- Un editor (VS Code va genial)

### Instalación

```bash
# 1. Haz fork en GitHub

# 2. Clona tu fork
git clone https://github.com/TU_USUARIO/UC_TournamentView.git
cd UC_TournamentView

# 3. Añade el repo original como upstream
git remote add upstream https://github.com/JoanJuan10/UC_TournamentView.git

# 4. Instala dependencias
npm install

# 5. Crea tu rama
git checkout -b feature/mi-cosa-nueva
```

### Comandos útiles

```bash
npm run dev    # Modo watch (recarga automática)
npm run build  # Compilar para release
npm run lint   # Revisar el código
```

---

## Cómo desarrollar

# Compilar para producción
npm run build

# Linter
npm run lint

# Tests (si aplica)
npm test
```

---

## Proceso de Desarrollo

### 1. Crea una Rama

```bash
# Para features
git checkout -b feature/nombre-descriptivo

# Para bug fixes
git checkout -b fix/nombre-del-bug

# Para documentación
### Flujo básico

```bash
# 1. Crea tu rama
git checkout -b feature/mi-cosa

# 2. Desarrolla con npm run dev

# 3. Prueba en el juego
# - Instala dist/tournamentview.user.js en Tampermonkey
# - Ve a /Spectate en Undercards.net
# - Comprueba que funciona

# 4. Commit y push
git add .
git commit -m "feat: mi nueva funcionalidad"
git push origin feature/mi-cosa

# 5. Abre un PR en GitHub
```

### Nomenclatura de ramas

- `feature/` → Cosa nueva
- `fix/` → Arreglar algo
- `docs/` → Documentación

---

## Estilo de código

Nada del otro mundo, lo típico:

```javascript
// ✅ Bien
class MiClase {
  constructor() {
    this.miVariable = 'valor';
  }
  
  miMetodo() {
    const resultado = this.calcular();
    return resultado;
  }
}

// ❌ Mal
class miclase {
  constructor() {
    this.mi_variable = 'valor';  // snake_case no
  }
}
```

- **Clases**: PascalCase → `UIManager`
- **Variables/Métodos**: camelCase → `updatePlayerHP`
- **2 espacios** para indentar
- **Comillas simples** para strings

---

## Commits y PRs

Usamos commits tipo [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: nueva funcionalidad
fix: arreglo de bug
docs: cambios en documentación
refactor: mejora de código
```

Ejemplos:
```bash
git commit -m "feat: add custom notification sounds"
git commit -m "fix: HP bar not updating"
git commit -m "docs: improve template guide"
```

### Antes de abrir un PR

Comprueba que:
- [x] Funciona en modo espectador
- [x] Funciona con las 3 plantillas
- [x] Funciona en ES y EN
- [x] No hay `console.log()` olvidados
- [x] Compila sin errores (`npm run build`)

---

## Crear plantillas

¿Quieres crear una plantilla nueva? Mira la [Guía de Plantillas](docs/TEMPLATE_GUIDE.md).

Básicamente:
1. Crea el JSON en `templates/`
2. Prueba que se ve bien
3. Sube un PR con una captura

---

## Añadir idiomas

¿Quieres añadir otro idioma? Busca `translations` en `src/index.js` y añade el tuyo siguiendo el patrón de `es` y `en`.

---

## Preguntas

- **¿Cómo pruebo?** → `npm run build`, instala el `.user.js` en Tampermonkey, abre una partida en Spectate
- **¿Puedo trabajar en un Issue?** → Sí, solo comenta para que sepamos que estás en ello
- **¿Cuánto tarda la revisión?** → Intentamos en 2-3 días, pero somos amateurs así que paciencia 😅

---

**¡Gracias por querer ayudar! 🎉**
