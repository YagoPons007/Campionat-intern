/**
 * app.js
 *
 * Autenticación con Firebase Auth + CRUD en Firestore
 * + navegación entre Formulario y Lista de Contactos
 */

// 1) Importar Firebase desde npm
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

// 2) Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBGRO9ugiosMUF-8pLjljTUGf25pAUsNU0",
  authDomain: "tasca-6-digi-b13ef.firebaseapp.com",
  projectId: "tasca-6-digi-b13ef",
  storageBucket: "tasca-6-digi-b13ef.appspot.com",
  messagingSenderId: "763290051651",
  appId: "1:763290051651:web:60eb5788592038ae3220f6"
};

// 3) Inicializar Firebase
const app     = initializeApp(firebaseConfig);
const auth    = getAuth(app);
const db      = getFirestore(app);

// 4) Capturar elementos del DOM
const loginSection    = document.getElementById("login-section");
const registerSection = document.getElementById("register-section");
const appSection      = document.getElementById("app-section");
const logoutBtn       = document.getElementById("logout-btn");

const showRegisterLink = document.getElementById("show-register");
const showLoginLink    = document.getElementById("show-login");
const loginForm        = document.getElementById("login-form");
const registerForm     = document.getElementById("register-form");
const loginMensaje     = document.getElementById("login-mensaje");
const registerMensaje  = document.getElementById("register-mensaje");

const btnForm      = document.getElementById("btn-form");
const btnList      = document.getElementById("btn-list");
const formSec      = document.getElementById("form-section");
const listSec      = document.getElementById("list-section");
const emptyDiv     = document.getElementById("empty-list");

const contactForm      = document.getElementById("contact-form");
const submitContactBtn = document.getElementById("submit-contact-btn");
const contactIdField   = document.getElementById("contactId");
const mensajeDiv       = document.getElementById("mensaje");
const searchInput      = document.getElementById("search-input");
const contactListDiv   = document.getElementById("contact-list");

// 5) Funciones de vista
function mostrarLogin() {
  loginSection.style.display    = "block";
  registerSection.style.display = "none";
  appSection.style.display      = "none";
  logoutBtn.style.display       = "none";
  document.querySelector(".app-nav").style.display = "none";
}
function mostrarRegister() {
  loginSection.style.display    = "none";
  registerSection.style.display = "block";
  appSection.style.display      = "none";
  logoutBtn.style.display       = "none";
  document.querySelector(".app-nav").style.display = "none";
}
function mostrarApp() {
  loginSection.style.display    = "none";
  registerSection.style.display = "none";
  appSection.style.display      = "block";
  logoutBtn.style.display       = "block";
  document.querySelector(".app-nav").style.display = "flex";
  showForm();
  loadContacts();
}
function showForm() {
  formSec.style.display = "block";
  listSec.style.display = "none";
}
function showList() {
  formSec.style.display = "none";
  listSec.style.display = "block";
}

// 6) Estado de autenticación
onAuthStateChanged(auth, user => {
  if (user) mostrarApp();
  else      mostrarLogin();
});

// 7) Registro
registerForm.addEventListener("submit", async e => {
  e.preventDefault();
  const email    = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value.trim();
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (err) {
    registerMensaje.textContent = "Error: " + err.message;
    registerMensaje.className   = "message error";
    setTimeout(() => registerMensaje.textContent = "", 4000);
  }
});
showRegisterLink.addEventListener("click", e => {
  e.preventDefault();
  mostrarRegister();
});

// 8) Login
loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  const email    = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    loginMensaje.textContent = "Error: " + err.message;
    loginMensaje.className   = "message error";
    setTimeout(() => loginMensaje.textContent = "", 4000);
  }
});
showLoginLink.addEventListener("click", e => {
  e.preventDefault();
  mostrarLogin();
});

// 9) Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  contactForm.reset();
  contactListDiv.innerHTML = "";
});

// 10) Navegación interna
btnForm.addEventListener("click", showForm);
btnList.addEventListener("click", () => {
  showList();
  loadContacts(searchInput.value.trim());
});

// 11) CRUD: Guardar/Actualizar
async function guardarOActualizarContacto(data, id = null) {
  if (id) {
    await updateDoc(doc(db, "contacts", id), data);
    return id;
  } else {
    const docRef = await addDoc(collection(db, "contacts"), data);
    return docRef.id;
  }
}

// 12) Listar y filtrar
async function loadContacts(filter = "") {
  contactListDiv.innerHTML = "";
  emptyDiv.style.display   = "none";
  const q = query(collection(db, "contacts"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const toRender = filter
    ? all.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(filter.toLowerCase())
      )
    : all;
  if (toRender.length === 0) {
    emptyDiv.style.display = "block";
  } else {
    toRender.forEach(renderContactCard);
  }
}

// 13) Eliminar
async function eliminarContacto(id) {
  await deleteDoc(doc(db, "contacts", id));
  document.getElementById(`card-${id}`)?.remove();
}

// 14) Render de tarjeta
function renderContactCard(c) {
  const { id, firstName, lastName, phone, email, gender, age } = c;
  const avatar = gender === "Masculino" ? "👨"
               : gender === "Femenino" ? "👩"
               : "🌈";
  const card = document.createElement("div");
  card.className = "contact-card";
  card.id = `card-${id}`;
  card.innerHTML = `
    <div class="contact-header">
      <span class="avatar">${avatar}</span>
      <span class="contact-name">${firstName} ${lastName}</span>
    </div>
    <div class="contact-details">
      <p>📱 ${phone}</p>
      <p>✉️ ${email}</p>
      <p>🎂 ${age} años</p>
    </div>
    <div class="contact-actions">
      <button class="edit-btn">Editar</button>
      <button class="delete-btn">Eliminar</button>
    </div>`;
  card.querySelector(".delete-btn").onclick = () =>
    confirm(`Eliminar a ${firstName}?`) && eliminarContacto(id);
  card.querySelector(".edit-btn").onclick = () => {
    contactIdField.value = id;
    document.getElementById("firstName").value = firstName;
    document.getElementById("lastName").value  = lastName;
    document.getElementById("phone").value     = phone;
    document.getElementById("email").value     = email;
    document.getElementById("gender").value    = gender;
    document.getElementById("age").value       = age;
    submitContactBtn.textContent = "Actualizar Contacto";
    showForm();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  contactListDiv.appendChild(card);
}

// 15) Envío de formulario
contactForm.addEventListener("submit", async e => {
  e.preventDefault();
  const id = contactIdField.value || null;
  const data = {
    firstName: document.getElementById("firstName").value.trim(),
    lastName:  document.getElementById("lastName").value.trim(),
    phone:     document.getElementById("phone").value.trim(),
    email:     document.getElementById("email").value.trim(),
    gender:    document.getElementById("gender").value,
    age:       parseInt(document.getElementById("age").value, 10),
    createdAt: new Date()
  };
  try {
    const savedId = await guardarOActualizarContacto(data, id);
    mensajeDiv.textContent = id
      ? "✅ Contacto actualizado."
      : `✅ Contacto guardado (ID: ${savedId}).`;
    mensajeDiv.className = "message success";
    contactForm.reset();
    contactIdField.value = "";
    submitContactBtn.textContent = "Guardar Contacto";
    loadContacts(searchInput.value.trim());
  } catch {
    mensajeDiv.textContent = "❌ Error al guardar.";
    mensajeDiv.className = "message error";
  }
  setTimeout(() => mensajeDiv.textContent = "", 4000);
});

// 16) Búsqueda en tiempo real
searchInput.addEventListener("input", () =>
  loadContacts(searchInput.value.trim())
);
