import "./styles.css";
import { createApp } from "./app.js";

const root = document.querySelector("#app");
createApp(root);

if ("serviceWorker" in navigator) {
 window.addEventListener("load", async () => {
 try {
 const registration = await navigator.serviceWorker.register("./sw.js");

 registration.update();

 if (registration.waiting) {
 registration.waiting.postMessage({ type: "SKIP_WAITING" });
 }
 } catch (error) {
 console.warn("Service worker registration failed:", error);
 }
 });
}
