document.documentElement.classList.add("js");

const toggle = document.querySelector(".menu-toggle");
const menu = document.querySelector("#menu-principal");
toggle.hidden = false;

function closeMenu() {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
}
toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
});
menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        closeMenu();
        toggle.focus();
    }
});
window.matchMedia("(min-width: 1024px)").addEventListener("change", closeMenu);

const navLinks = [...menu.querySelectorAll('a[href^="#"]')];
const views = [...document.querySelectorAll("main > section[id]")];
const sidebar = document.querySelector(".sidebar");
const viewNames = {
    inicio: "Inicio",
    cartelera: "Galería",
    horarios: "Horarios",
    reservas: "Reservas",
    experiencia: "Experiencia",
    contacto: "Contacto"
};

function updateCurrentSection(moveFocus = false) {
    const requested = window.location.hash.slice(1);
    const view = views.find((section) => section.id === requested) || views[0];
    views.forEach((section) => {
        section.hidden = section !== view;
    });
    const isHome = view.id === "inicio";
    sidebar.hidden = !isHome;
    document.body.classList.toggle("home-view", isHome);
    navLinks.forEach((link) => {
        if (link.getAttribute("href") === "#" + view.id) {
            link.setAttribute("aria-current", "location");
        } else {
            link.removeAttribute("aria-current");
        }
    });
    document.title = "CinePlay — " + viewNames[view.id];
    closeMenu();
    if (moveFocus) {
        const heading = view.querySelector("h1, h2");
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: "instant" });
    }
}
window.addEventListener("hashchange", () => updateCurrentSection(true));
updateCurrentSection();

document.querySelector("#reservation-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const quantity = Number(form.elements.cantidad.value);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) return;
    const selection = form.elements.funcion;
    document.querySelector("#summary-function").textContent = selection.selectedOptions[0].textContent;
    document.querySelector("#summary-name").textContent = form.elements.titular.value;
    document.querySelector("#summary-count").textContent = String(quantity);
    document.querySelector("#summary-total").textContent = "S/ " + (quantity * 15).toFixed(2);
    openSimulation(
        form,
        "Resumen de reserva exitoso 🎉",
        "¡Gracias por tu reserva! Te esperamos en la función seleccionada. 🎬",
        true
    );
});

const simulationModal = document.querySelector("#simulation-modal");
let simulationTimer;
let simulationForm;
let simulationTrigger;

function openSimulation(form, title, message, showDetails = false) {
    clearTimeout(simulationTimer);
    simulationForm = form;
    simulationTrigger = document.activeElement;
    document.querySelector("#simulation-title").textContent = title;
    document.querySelector("#simulation-message").textContent = message;
    document.querySelector("#simulation-details").hidden = !showDetails;
    simulationModal.showModal();
    simulationTimer = setTimeout(() => simulationModal.close(), 10000);
}

document.querySelector("#simulation-close").addEventListener("click", () => {
    simulationModal.close();
});

// El evento close cubre el botón, Escape y el cierre automático.
simulationModal.addEventListener("close", () => {
    clearTimeout(simulationTimer);
    simulationForm?.reset();
    simulationForm = null;
    simulationModal.querySelectorAll("dd").forEach((detail) => {
        detail.textContent = "";
    });
    document.querySelector("#simulation-title").textContent = "";
    document.querySelector("#simulation-message").textContent = "";
    simulationTrigger?.focus();
    simulationTrigger = null;
});

document.querySelector("#contact-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    openSimulation(
        form,
        "Envío de contacto completado ✅",
        "Espera pronto nuestra respuesta.🤗 "
    );
});
