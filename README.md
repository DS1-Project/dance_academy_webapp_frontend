# 🗿 DanceAcademyApp - Frontend 👁️

## Descripción

DanceAcademyApp - Frontend es la interfaz gráfica de la plataforma DanceAcademyApp, desarrollada con React, Vite, TypeScript y Tailwind CSS. Su objetivo es proporcionar una experiencia de usuario moderna, rápida e intuitiva para la gestión y uso de los servicios de la academia de danza.

---

## Tecnologías Utilizadas

- React
- Vite
- TypeScript
- Tailwind CSS
- ESLint
- Vitest
- Playwright

---

## Estructura del Proyecto

```text
dance_academy_webapp_frontend
├── bun.lock
├── bun.lockb
├── components.json
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── playwright.config.ts
├── playwright-fixture.ts
├── postcss.config.js
├── public
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── icons.svg
│   ├── placeholder.svg
│   └── robots.txt
├── README.md
├── src
│   ├── App.css
│   ├── App.tsx
│   ├── components
│   ├── contexts
│   ├── hooks
│   ├── index.css
│   ├── lib
│   ├── main.tsx
│   ├── pages
│   ├── services
│   ├── test
│   ├── types
│   └── vite-env.d.ts
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.js
├── vite.config.ts
└── vitest.config.ts
```

---

## Instalación y Ejecución Local

Siga los pasos descritos a continuación para ejecutar la aplicación en un entorno local.

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
```

### 2. Ingresar al directorio del proyecto

```bash
cd dance_academy_webapp_frontend
```

### 3. Instalar las dependencias

Utilizando npm:

```bash
npm install
```

O utilizando Bun:

```bash
bun install
```

### 4. Ejecutar la aplicación en modo desarrollo

Con npm:

```bash
npm run dev
```

Con Bun:

```bash
bun run dev
```

### 5. Acceder a la aplicación

Una vez iniciado el servidor de desarrollo, abra el navegador y acceda a:

```text
http://localhost:5173
```
### Usuarios de prueba:
admin1@gmail.com
password:12345678

cliente21@gmail.com
password:12345678

teacher1@gmail.com
password:12345678

---

## Ejecución de Pruebas

### Pruebas Unitarias

```bash
npm run test
```

### Pruebas End-to-End

```bash
npx playwright test
```

---

## Organización del Código

- `components/`: Componentes reutilizables de la interfaz de usuario.
- `pages/`: Vistas principales de la aplicación.
- `services/`: Comunicación con APIs y servicios externos.
- `contexts/`: Gestión de estado global mediante React Context.
- `hooks/`: Hooks personalizados.
- `types/`: Definiciones de tipos e interfaces TypeScript.
- `lib/`: Funciones utilitarias y configuraciones compartidas.
- `test/`: Pruebas unitarias e integrales.

---

## Equipo de Desarrollo Frontend

- Camilo Andrés Riscanevo Cotrina
- Brayan Fernando Cruz Puerta
- Freddy Alexander Melo Buitrago
- Victoria Yuan Chen
- Yiseiri Yanua Satizábal Ortiz

---

## Licencia

Este proyecto forma parte de DanceAcademyApp y su uso está sujeto a las políticas y condiciones definidas por el equipo de desarrollo y la organización propietaria del software.
