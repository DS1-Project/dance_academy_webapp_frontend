import { createRoot } from "react-dom/client";
import "@fontsource/syne/800.css";
// @ts-ignore
import "@fontsource-variable/plus-jakarta-sans";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
