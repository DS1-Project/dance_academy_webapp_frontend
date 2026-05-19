# 🕺 DanceAcademyApp - Core Ecosystem 🚀

Welcome to the main repository of **DanceAcademyApp**! This unified workspace covers the secure REST API backend built with Python/Django and the interactive, highly responsive client-side interface built with React/Vite.

---

## 💻 SECTION 1: FRONTEND CLIENT

An interactive web layout built for dance administrators, instructors, and students to manage active database users, stream high-quality choreography video catalogs, handle persistent local storage shopping carts, and view dashboard statistics.

### 🛠️ Tech Stack
* **Core Framework:** React 18 (Vite) ⚡
* **Styling & UI Components:** Tailwind CSS + Shadcn/ui (Fully Responsive)
* **State Management:** Context API / Redux Toolkit (Persistent Cart Session)
* **Routing:** React Router Dom v6
* **HTTP Client:** Axios (Centralized instance with token interceptors)
* **Data Visualization:** ApexCharts / Recharts

### 📦 Frontend Project Structure
```text
frontend/
├── public/              # Static assets and multimedia files
├── src/
│   ├── assets/          # Global images and brand logos
│   ├── components/      # Reusable UI parts (Tables, Modals, Cards, Stars Rating)
│   ├── context/         # Global states (Auth Token & Shopping Cart session)
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Main views (Dashboard, Catalog, Login, Registration)
│   ├── services/        # Axios API endpoints routing handlers
│   ├── App.jsx          # Router configuration and global provider wrappers
│   └── main.jsx         # Vite application entry point
├── .env.example         # Template for client-side environment variables
├── tailwind.config.js   # Tailwind style customization file
└── vite.config.js       # Vite bundler configurations

###⚙️ Local Setup & Installation (Frontend)
Aquí tienes todo absolutamente unificado en un único archivo README.md. Este diseño de archivo centralizado es el estándar que se utiliza en proyectos tipo Monorepo (donde el Frontend y el Backend viven dentro del mismo repositorio de GitHub).

Incluye los stacks, las estructuras de carpetas, y todos los pasos secuenciales de instalación, configuración de variables, ejecución y pruebas en local tanto para la interfaz de React como para la API de Django.

Copia el siguiente bloque de código Markdown completo y pégalo en el archivo README.md de la raíz de tu repositorio:

Markdown
# 🕺 DanceAcademyApp - Core Ecosystem 🚀

Welcome to the main deployment and development repository for **DanceAcademyApp**! This unified workspace covers both the secure REST API backend built with Python/Django and the interactive, highly responsive client-side interface built with React/Vite.

---

## 💻 SECTION 1: FRONTEND CLIENT

An interactive web layout built for dance administrators, instructors, and students to manage active database users, stream high-quality choreography video catalogs, handle persistent local storage shopping carts, and view dashboard statistics.

### 🛠️ Tech Stack (Frontend)
* **Core Framework:** React 18 (Vite) ⚡
* **Styling & UI Components:** Tailwind CSS + Shadcn/ui (Fully Responsive)
* **State Management:** Context API / Redux Toolkit (Persistent Cart Session)
* **Routing:** React Router Dom v6
* **HTTP Client:** Axios (Centralized instance with token interceptors)
* **Data Visualization:** ApexCharts / Recharts

### 📦 Project Structure (Frontend)
```text
frontend/
├── public/              # Static assets and multimedia files
├── src/
│   ├── assets/          # Global images and brand logos
│   ├── components/      # Reusable UI parts (Tables, Modals, Cards, Stars Rating)
│   ├── context/         # Global states (Auth Token & Shopping Cart session)
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Main views (Dashboard, Catalog, Login, Registration)
│   ├── services/        # Axios API endpoints routing handlers
│   ├── App.jsx          # Router configuration and global provider wrappers
│   └── main.jsx         # Vite application entry point
├── .env.example         # Template for client-side environment variables
├── tailwind.config.js   # Tailwind style customization file
└── vite.config.js       # Vite bundler configurations


###⚙️ Local Setup, Installation & Execution (Frontend)
Follow these precise steps to spin up the local development frontend environment:

1. Navigate to the frontend project folder:

Bash
cd frontend
2. Install required Node modules and dependencies:
Ensure you have Node.js (v18+) installed on your machine, then run:

Bash
npm install
3. Configure Environment Variables:
Create a new file named .env in the root of the frontend/ directory and connect it to your local backend development API server URL:
VITE_API_URL=[http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)

4. Boot up the Vite local development server:
Bash
npm run dev

5.Once the server initializes, the web client application will be successfully accessible in your browser at: http://localhost:5173
🧪 Running UI Tests (Frontend)
To execute the automated unit and interface tests written with React Testing Library:

Bash
npm run test

👥 Frontend Team Contributors
Front-end Developers: 
CAMILO ANDRES RISCANEVO COTRINA
BRAYAN FERNANDO CRUZ PUERTA
FREDDY ALEXANDER MELO BUITRAGO 
VICTORIA YUAN CHEN
YISEIRI YANUA SATIZABAL ORTIZ



