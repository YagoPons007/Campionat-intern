/**
 * app.js
 *
 * Inicializa Firebase (Auth + Firestore), controla el flujo de login/registro
 * y, una vez autenticado, permite guardar contactos en Firestore.
 */

// -------------- 1) Importar Firebase v9 como módulos --------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// -------------- 2) Configuración de Firebase --------------
// Sustituye estos valores por los que te dio Firebase en la consola:
const firebaseConfig = {
    apiKey: "AIzaSyBGRO9ugiosMUF-8pLjljTUGf25pAUsNU0",
    authDomain: "tasca-6-digi-b13ef.firebaseapp.com",
    projectId: "tasca-6-digi-b13ef",
    storageBucket: "tasca-6-digi-b13ef.firebasestorage.app",
    messagingSenderId: "763290051651",
    appId: "1:763290051651:web:60eb5788592038ae3220f6",
  };
  

// -------------- 3) Inicializar Firebase (App, Auth y Firestore) --------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// -------------- 4) Capturar elementos del DOM --------------
const loginSection = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");
const appSection = document.getElementById("app-section");

const loginForm = document.getElementById("login-form");
const loginMensaje = document.getElementById("login-mensaje");
const showRegisterLink = document.getElementById("show-register");

const registerForm = document.getElementById("register-form");
const registerMensaje = document.getElementById("register-mensaje");
const showLoginLink = document.getElementById("show-login");

const logoutBtn = document.getElementById("logout-btn");

const contactForm = document.getElementById("contact-form");
const mensajeDiv = document.getElementById("mensaje");

// -------------- 5) Funciones para mostrar/ocultar secciones --------------
function mostrarLogin() {
  loginSection.style.display = "block";
  registerSection.style.display = "none";
  appSection.style.display = "none";
  loginMensaje.textContent = "";
  registerMensaje.textContent = "";
}

function mostrarRegister() {
  loginSection.style.display = "none";
  registerSection.style.display = "block";
  appSection.style.display = "none";
  loginMensaje.textContent = "";
  registerMensaje.textContent = "";
}

function mostrarApp() {
  loginSection.style.display = "none";
  registerSection.style.display = "none";
  appSection.style.display = "block";
  mensajeDiv.textContent = "";
}

// -------------- 6) Control de estado de autenticación --------------
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Si hay usuario autenticado, mostrar el formulario de contactos
    mostrarApp();
  } else {
    // Si no hay usuario, mostrar pantalla de login
    mostrarLogin();
  }
});

// -------------- 7) Manejar registro de usuario --------------
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email   = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value.trim();

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    // Al crear cuenta, onAuthStateChanged detectará que hay sesión
  } catch (error) {
    registerMensaje.textContent = "Error al registrar: " + error.message;
    registerMensaje.style.color = "red";
    setTimeout(() => {
      registerMensaje.textContent = "";
    }, 3000);
  }
});

// Enlace “Regístrate” → mostrar sección de registro
showRegisterLink.addEventListener("click", (e) => {
  e.preventDefault();
  mostrarRegister();
});

// -------------- 8) Manejar login de usuario --------------
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email    = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged detectará que hay sesión y mostrará el formulario
  } catch (error) {
    loginMensaje.textContent = "Error al iniciar sesión: " + error.message;
    loginMensaje.style.color = "red";
    setTimeout(() => {
      loginMensaje.textContent = "";
    }, 3000);
  }
});

// Enlace “Inicia Sesión” → mostrar sección de login
showLoginLink.addEventListener("click", (e) => {
  e.preventDefault();
  mostrarLogin();
});

// -------------- 9) Cerrar sesión --------------
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    // onAuthStateChanged detectará que NO hay sesión y mostrará el login
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
});

// -------------- 10) Función para guardar un contacto en Firestore --------------
async function guardarContacto(datosContacto) {
  try {
    const docRef = await addDoc(collection(db, "contacts"), datosContacto);
    return docRef.id;
  } catch (error) {
    console.error("Error al guardar contacto:", error);
    throw error;
  }
}

// -------------- 11) Manejar envío del formulario de contactos --------------
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Recoger datos del formulario
  const firstName = document.getElementById("firstName").value.trim();
  const lastName  = document.getElementById("lastName").value.trim();
  const phone     = document.getElementById("phone").value.trim();
  const email     = document.getElementById("email").value.trim();
  const gender    = document.getElementById("gender").value;
  const age       = parseInt(document.getElementById("age").value, 10);

  const nuevoContacto = {
    firstName,
    lastName,
    phone,
    email,
    gender,
    age,
    createdAt: new Date()
  };

  try {
    const idGenerado = await guardarContacto(nuevoContacto);
    mensajeDiv.textContent = `Contacto guardado correctamente (ID: ${idGenerado})`;
    mensajeDiv.style.color = "green";
    contactForm.reset();
  } catch (err) {
    mensajeDiv.textContent = "Ocurrió un error al guardar el contacto.";
    mensajeDiv.style.color = "red";
  }

  setTimeout(() => {
    mensajeDiv.textContent = "";
  }, 3000);
});
