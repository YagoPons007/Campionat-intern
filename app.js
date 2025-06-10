/**
 * app.js
 *
 * Se encarga de:
 *  - Autenticación con Firebase Auth
 *  - Operaciones CRUD en Firestore (contacts)
 *  - Render dinámico de lista de contactos
 *  - Búsqueda en tiempo real
 *  - Edición y eliminación de contactos
 */

// -------------- 1) Importar Firebase v9 desde npm --------------
// Importa desde npm en lugar de CDN
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, addDoc, getDocs,
  deleteDoc, doc, updateDoc, query, orderBy
} from "firebase/firestore";
import {
  getAuth, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut,
  onAuthStateChanged
} from "firebase/auth";


// -------------- 2) Configuración de Firebase --------------
const firebaseConfig = {
  apiKey: "AIzaSyBGRO9ugiosMUF-8pLjljTUGf25pAUsNU0",
  authDomain: "tasca-6-digi-b13ef.firebaseapp.com",
  projectId: "tasca-6-digi-b13ef",
  storageBucket: "tasca-6-digi-b13ef.appspot.com",
  messagingSenderId: "763290051651",
  appId: "1:763290051651:web:60eb5788592038ae3220f6"
};

// -------------- 3) Inicializar Firebase (Auth y Firestore) --------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// -------------- 4) Capturar elementos del DOM --------------
const loginSection      = document.getElementById("login-section");
const registerSection   = document.getElementById("register-section");
const appSection        = document.getElementById("app-section");
const logoutBtn         = document.getElementById("logout-btn");

const loginForm         = document.getElementById("login-form");
const loginMensaje      = document.getElementById("login-mensaje");
const showRegisterLink  = document.getElementById("show-register");

const registerForm      = document.getElementById("register-form");
const registerMensaje   = document.getElementById("register-mensaje");
const showLoginLink     = document.getElementById("show-login");

const contactForm       = document.getElementById("contact-form");
const mensajeDiv        = document.getElementById("mensaje");
const submitContactBtn  = document.getElementById("submit-contact-btn");
const contactIdField    = document.getElementById("contactId");

const searchInput       = document.getElementById("search-input");
const contactListDiv    = document.getElementById("contact-list");

// -------------- 5) Funciones para mostrar/ocultar secciones --------------
function mostrarLogin() {
  loginSection.style.display    = "block";
  registerSection.style.display = "none";
  appSection.style.display      = "none";
  logoutBtn.style.display       = "none";
  loginMensaje.textContent = "";
  registerMensaje.textContent = "";
}

function mostrarRegister() {
  loginSection.style.display    = "none";
  registerSection.style.display = "block";
  appSection.style.display      = "none";
  logoutBtn.style.display       = "none";
  loginMensaje.textContent = "";
  registerMensaje.textContent = "";
}

function mostrarApp() {
  loginSection.style.display    = "none";
  registerSection.style.display = "none";
  appSection.style.display      = "block";
  logoutBtn.style.display       = "block";
  mensajeDiv.textContent = "";
  loadContacts(); // Carga la lista cada vez que entremos
}

// -------------- 6) Control de estado de autenticación --------------
onAuthStateChanged(auth, (user) => {
  if (user) {
    mostrarApp();
  } else {
    mostrarLogin();
  }
});

// -------------- 7) Manejar registro de usuario --------------
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email    = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value.trim();
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    registerMensaje.textContent = "Error: " + error.message;
    registerMensaje.classList.add("error");
    setTimeout(() => {
      registerMensaje.textContent = "";
      registerMensaje.classList.remove("error");
    }, 4000);
  }
});
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
  } catch (error) {
    loginMensaje.textContent = "Error: " + error.message;
    loginMensaje.classList.add("error");
    setTimeout(() => {
      loginMensaje.textContent = "";
      loginMensaje.classList.remove("error");
    }, 4000);
  }
});
showLoginLink.addEventListener("click", (e) => {
  e.preventDefault();
  mostrarLogin();
});

// -------------- 9) Cerrar sesión --------------
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    clearContactList();
    contactForm.reset();
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
});

// -------------- 10) CRUD: Guardar/Actualizar, Listar, Eliminar --------------

// Guardar o actualizar contacto
async function guardarOActualizarContacto(datosContacto, id = null) {
  if (id) {
    const docRef = doc(db, "contacts", id);
    await updateDoc(docRef, datosContacto);
    return id;
  } else {
    const docRef = await addDoc(collection(db, "contacts"), datosContacto);
    return docRef.id;
  }
}

// Cargar y renderizar contactos
async function loadContacts(filterText = "") {
  contactListDiv.innerHTML = "";
  const contactsQuery = query(
    collection(db, "contacts"),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(contactsQuery);
  const allContacts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  const toRender = filterText
    ? allContacts.filter(c => {
        const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
        return fullName.includes(filterText.toLowerCase());
      })
    : allContacts;
  toRender.forEach(renderContactCard);
}

// Eliminar contacto
async function eliminarContacto(id) {
  await deleteDoc(doc(db, "contacts", id));
  document.getElementById(`card-${id}`)?.remove();
}

// Render de cada tarjeta de contacto
function renderContactCard(contact) {
  const { id, firstName, lastName, phone, email, gender, age } = contact;
  let avatar = "👤";
  if (gender === "Masculino") avatar = "👨";
  else if (gender === "Femenino") avatar = "👩";
  else if (gender === "Otro") avatar = "🌈";

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
      <p>🎂 ${age}</p>
    </div>
    <div class="contact-actions">
      <button class="edit-btn">Editar</button>
      <button class="delete-btn">Eliminar</button>
    </div>
  `;

  card.querySelector(".delete-btn").onclick = () => {
    if (confirm(`Eliminar a ${firstName} ${lastName}?`)) eliminarContacto(id);
  };
  card.querySelector(".edit-btn").onclick = () => {
    contactIdField.value = id;
    document.getElementById("firstName").value = firstName;
    document.getElementById("lastName").value  = lastName;
    document.getElementById("phone").value     = phone;
    document.getElementById("email").value     = email;
    document.getElementById("gender").value    = gender;
    document.getElementById("age").value       = age;
    submitContactBtn.textContent = "Actualizar Contacto";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  contactListDiv.appendChild(card);
}

// -------------- 11) Enviar formulario de contactos --------------
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id        = contactIdField.value || null;
  const data      = {
    firstName: document.getElementById("firstName").value.trim(),
    lastName:  document.getElementById("lastName").value.trim(),
    phone:     document.getElementById("phone").value.trim(),
    email:     document.getElementById("email").value.trim(),
    gender:    document.getElementById("gender").value,
    age:       parseInt(document.getElementById("age").value, 10),
    createdAt: new Date()
  };

  try {
    const docId = await guardarOActualizarContacto(data, id);
    mensajeDiv.textContent = id
      ? "✅ Actualizado correctamente."
      : `✅ Guardado con ID: ${docId}.`;
    mensajeDiv.className = "message success";
    contactForm.reset();
    contactIdField.value = "";
    submitContactBtn.textContent = "Guardar Contacto";
    loadContacts(searchInput.value.trim());
  } catch {
    mensajeDiv.textContent = "❌ Error al guardar.";
    mensajeDiv.className = "message error";
  }

  setTimeout(() => {
    mensajeDiv.textContent = "";
    mensajeDiv.className = "message";
  }, 4000);
});

// -------------- 12) Búsqueda en tiempo real --------------
searchInput.addEventListener("input", () => {
  loadContacts(searchInput.value.trim());
});

// -------------- 13) Limpiar listado al cerrar sesión --------------
function clearContactList() {
  contactListDiv.innerHTML = "";
  searchInput.value = "";
}
