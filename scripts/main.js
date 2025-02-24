import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCbT7x1VXAkmnk_mMiI14T1mH3Gw05xx3w",
  authDomain: "nove-b215b.firebaseapp.com",
  projectId: "nove-b215b",
  storageBucket: "nove-b215b.firebasestorage.app",
  messagingSenderId: "1071767128657",
  appId: "1:1071767128657:web:7d5d21b3bb425ff40cc670",
  measurementId: "G-DVC07P6FFE",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentDebtorId = null;
let actionType = "add";

function showToast(message, type = "success") {
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    backgroundColor: type === "success" ? "#4CAF50" : "#f44336",
  }).showToast();
}

window.openModal = function (type, id) {
  currentDebtorId = id;
  actionType = type;
  document.getElementById("modal").classList.remove("hidden");
};

window.closeModal = function () {
  document.getElementById("modal").classList.add("hidden");
};

window.confirmAction = async function () {
  const amountInput = document.getElementById("modalAmount");
  const amount = parseFloat(amountInput.value);

  if (isNaN(amount)) {
    showToast("Iltimos, to‘g‘ri summa kiriting!", "error");
    return;
  }

  const docRef = doc(db, "qarzdorlar", currentDebtorId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    let currentDebt = docSnap.data().qarz_summasi;
    currentDebt =
      actionType === "add"
        ? currentDebt + amount
        : Math.max(0, currentDebt - amount);

    await updateDoc(docRef, { qarz_summasi: currentDebt });

    showToast("Qarz miqdori yangilandi");
    loadDebtors();
    closeModal();

    // **Inputni tozalash**
    amountInput.value = "";
  }
};

window.addDebtor = async function () {
  const ism = document.getElementById("ism").value;
  const familiya = document.getElementById("familiya").value;
  const telefon = document.getElementById("telefon").value;
  const qarz_summasi = parseFloat(document.getElementById("qarz").value);
  const sana = document.getElementById("sana").value;

  if (!ism || !familiya || !telefon || isNaN(qarz_summasi) || !sana) {
    showToast("Barcha maydonlarni to‘ldiring!", "error");
    return;
  }

  await addDoc(collection(db, "qarzdorlar"), {
    ism,
    familiya,
    telefon,
    qarz_summasi,
    sana,
  });
  showToast("Qarzdor muvaffaqiyatli qo‘shildi");
  loadDebtors();
};

async function loadDebtors() {
  const querySnapshot = await getDocs(collection(db, "qarzdorlar"));
  const tableBody = document.getElementById("debtorsTable");
  tableBody.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const row = document.createElement("tr");
    row.classList.add(
      "hover:bg-gray-100",
      "transition",
      "duration-300",
      "ease-in-out"
    );
    row.innerHTML = `
        <td class='border px-4 py-2'>${data.ism}</td>
        <td class='border px-4 py-2'>${data.familiya}</td>
        <td class='border px-4 py-2'>${data.telefon}</td>
        <td class='border px-4 py-2'>${data.qarz_summasi}</td>
        <td class='border px-4 py-2'>${data.sana}</td>
        <td class='border px-4 py-2'>
          <button onclick='openModal("add", "${doc.id}")' class='bg-blue-500 text-white px-2 py-1 rounded transition hover:bg-blue-700'>+</button>
          <button onclick='openModal("reduce", "${doc.id}")' class='bg-yellow-500 text-white px-2 py-1 rounded transition hover:bg-yellow-700'>-</button>
          <button onclick='deleteDebtor("${doc.id}")' class='bg-red-500 text-white px-2 py-1 rounded transition hover:bg-red-700'>O'chirish</button>
        </td>
      `;
    tableBody.appendChild(row);
  });
}

window.deleteDebtor = async function (id) {
  await deleteDoc(doc(db, "qarzdorlar", id));
  showToast("Qarzdor o‘chirildi", "error");
  loadDebtors();
};

loadDebtors();