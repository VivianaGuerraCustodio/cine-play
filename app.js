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
    combos: "Combos",
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
        "reservation"
    );
});

const simulationModal = document.querySelector("#simulation-modal");
const reservationDetails = document.querySelector("#simulation-details");
const orderDetails = document.querySelector("#order-details");
const orderCustomer = document.querySelector("#order-customer");
const orderSummaryItems = document.querySelector("#order-summary-items");
const orderTotal = document.querySelector("#order-total");
let simulationTimer;
let simulationForm;
let simulationTrigger;
let clearCartAfterOrder = false;
let cart = [];

function openSimulation(
    form,
    title,
    message,
    detailsType = null,
    returnFocus = document.activeElement
) {
    clearTimeout(simulationTimer);
    simulationForm = form;
    simulationTrigger = returnFocus;
    document.querySelector("#simulation-title").textContent = title;
    document.querySelector("#simulation-message").textContent = message;
    reservationDetails.hidden = detailsType !== "reservation";
    orderDetails.hidden = detailsType !== "order";
    simulationModal.showModal();
    requestAnimationFrame(() => {
        if (simulationModal.open) simulationModal.classList.add("is-visible");
    });
    simulationTimer = setTimeout(() => simulationModal.close(), 10000);
}

document.querySelector("#simulation-close").addEventListener("click", () => {
    simulationModal.close();
});

// El evento close cubre el botón, Escape y el cierre automático.
simulationModal.addEventListener("close", () => {
    clearTimeout(simulationTimer);
    simulationModal.classList.remove("is-visible");
    simulationForm?.reset();
    simulationForm = null;
    document.querySelectorAll("#simulation-details dd").forEach((detail) => {
        detail.textContent = "";
    });
    orderCustomer.textContent = "";
    orderTotal.textContent = "";
    while (orderSummaryItems.firstChild) {
        orderSummaryItems.removeChild(orderSummaryItems.firstChild);
    }
    document.querySelector("#simulation-title").textContent = "";
    document.querySelector("#simulation-message").textContent = "";
    reservationDetails.hidden = true;
    orderDetails.hidden = true;
    if (clearCartAfterOrder) {
        clearCartAfterOrder = false;
        cart = [];
        renderCart();
        document.querySelector("#cart-message").textContent =
            "Pedido confirmado. Puedes preparar otro pedido cuando quieras.";
    }
    simulationTrigger?.focus();
    simulationTrigger = null;
});

simulationModal.addEventListener("click", (event) => {
    if (event.target !== simulationModal) return;
    const bounds = simulationModal.getBoundingClientRect();
    const clickedOutside =
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom;
    if (clickedOutside) simulationModal.close();
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

const combos = [
    {
        id: "clasico",
        name: "Combo Clásico",
        description: "Pop corn mediano + gaseosa mediana.",
        priceCents: 1800,
        image: "img/combo-clasico.svg",
        imageAlt: "Pop corn mediano y una gaseosa",
        available: true
    },
    {
        id: "duo",
        name: "Combo Dúo",
        description: "Pop corn grande + dos gaseosas para compartir.",
        priceCents: 2800,
        image: "img/combo-duo.svg",
        imageAlt: "Pop corn grande acompañado de dos gaseosas",
        available: true
    },
    {
        id: "nachero",
        name: "Combo Nachero",
        description: "Nachos con queso + gaseosa.",
        priceCents: 2000,
        image: "img/combo-nachero.svg",
        imageAlt: "Nachos con queso y una gaseosa",
        available: true
    },
    {
        id: "fan",
        name: "Combo Fan",
        description: "Hot dog + pop corn + gaseosa.",
        priceCents: 2500,
        image: "img/combo-fan.svg",
        imageAlt: "Hot dog con pop corn y una gaseosa",
        available: true
    }
];

const comboCatalog = document.getElementById("combo-catalog");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartItemCount = document.getElementById("cart-item-count");
const cartSubtotal = document.getElementById("cart-subtotal");
const cartTotal = document.getElementById("cart-total");
const cartMessage = document.getElementById("cart-message");
const cartJumpButton = document.getElementById("cart-jump-button");
const cartPanel = document.getElementById("cart-panel");
const clearCartButton = document.getElementById("clear-cart-button");
const checkoutButton = document.getElementById("checkout-button");

function formatCurrency(priceCents) {
    return "S/ " + (priceCents / 100).toFixed(2);
}

function findCombo(comboId) {
    let foundCombo = null;
    for (let index = 0; index < combos.length; index += 1) {
        if (combos[index].id === comboId) {
            foundCombo = combos[index];
            break;
        }
    }
    return foundCombo;
}

function renderComboCatalog() {
    for (let index = 0; index < combos.length; index += 1) {
        const combo = combos[index];
        if (!combo.available) continue;

        const card = document.createElement("article");
        card.className = "combo-card";
        card.dataset.comboId = combo.id;

        const image = document.createElement("img");
        image.src = combo.image;
        image.alt = combo.imageAlt;
        image.width = 640;
        image.height = 360;
        image.loading = "lazy";

        const content = document.createElement("div");
        content.className = "combo-card-content";
        const title = document.createElement("h3");
        title.textContent = combo.name;
        const description = document.createElement("p");
        description.textContent = combo.description;
        const price = document.createElement("p");
        price.className = "combo-price";
        price.textContent = formatCurrency(combo.priceCents);

        const controls = document.createElement("div");
        controls.className = "combo-card-controls";
        const quantityLabel = document.createElement("label");
        const quantityInput = document.createElement("input");
        quantityInput.type = "number";
        quantityInput.id = "combo-quantity-" + combo.id;
        quantityInput.min = "1";
        quantityInput.step = "1";
        quantityInput.value = "1";
        quantityInput.inputMode = "numeric";
        quantityInput.setAttribute("aria-label", "Cantidad de " + combo.name);
        quantityLabel.htmlFor = quantityInput.id;
        quantityLabel.textContent = "Cantidad";

        const addButton = document.createElement("button");
        addButton.className = "button";
        addButton.type = "button";
        addButton.textContent = "Agregar al carrito";
        addButton.onclick = () => addComboToCart(combo, quantityInput);

        controls.appendChild(quantityLabel);
        controls.appendChild(quantityInput);
        content.appendChild(title);
        content.appendChild(description);
        content.appendChild(price);
        controls.appendChild(addButton);
        content.appendChild(controls);
        card.appendChild(image);
        card.appendChild(content);
        comboCatalog.appendChild(card);
    }

    document.querySelectorAll(".combo-card").forEach((card) => {
        card.onmouseover = () => {
            card.style.transform = "translateY(-4px)";
            card.style.boxShadow = "0 1rem 2rem #0008";
        };
        card.onmouseout = () => {
            card.style.transform = "";
            card.style.boxShadow = "";
        };
    });
}

function calculateCart() {
    let index = 0;
    let subtotalCents = 0;
    let productCount = 0;

    while (index < cart.length) {
        const item = cart[index];
        index += 1;
        if (!item || !Number.isSafeInteger(item.quantity) || item.quantity < 1) continue;

        const combo = findCombo(item.comboId);
        if (!combo || !combo.available) continue;

        const lineTotalCents = combo.priceCents * item.quantity;
        if (!Number.isSafeInteger(lineTotalCents) ||
            !Number.isSafeInteger(subtotalCents + lineTotalCents)) continue;
        subtotalCents += lineTotalCents;
        productCount += item.quantity;
    }

    return { subtotalCents, productCount };
}

function createCartItemElement(item, combo) {
    const row = document.createElement("article");
    row.className = "cart-item";
    const info = document.createElement("div");
    info.className = "cart-item-info";
    const title = document.createElement("h4");
    title.textContent = combo.name;
    const price = document.createElement("p");
    price.textContent = formatCurrency(combo.priceCents) + " c/u";
    info.appendChild(title);
    info.appendChild(price);

    const controls = document.createElement("div");
    controls.className = "cart-item-controls";
    const quantityLabel = document.createElement("label");
    const quantityInput = document.createElement("input");
    quantityInput.type = "number";
    quantityInput.min = "1";
    quantityInput.step = "1";
    quantityInput.value = String(item.quantity);
    quantityInput.id = "cart-quantity-" + combo.id;
    quantityInput.setAttribute("aria-label", "Cantidad de " + combo.name + " en el carrito");
    quantityLabel.htmlFor = quantityInput.id;
    quantityLabel.textContent = "Cantidad";
    quantityInput.onchange = () => {
        const quantity = Number(quantityInput.value);
        const proposedSubtotal =
            calculateCart().subtotalCents -
            combo.priceCents * item.quantity +
            combo.priceCents * quantity;
        const isValid = quantityInput.value.trim() !== "" &&
            Number.isSafeInteger(quantity) &&
            quantity >= 1 &&
            Number.isSafeInteger(combo.priceCents * quantity) &&
            Number.isSafeInteger(proposedSubtotal);
        if (!isValid) {
            quantityInput.setAttribute("aria-invalid", "true");
            quantityInput.value = String(item.quantity);
            cartMessage.textContent = "Ingresa una cantidad entera mayor que cero.";
            return;
        }

        quantityInput.removeAttribute("aria-invalid");
        item.quantity = quantity;
        lineTotal.textContent = formatCurrency(combo.priceCents * item.quantity);
        updateCartTotals();
        cartMessage.innerText = "Cantidad actualizada.";
    };

    const lineTotal = document.createElement("strong");
    lineTotal.className = "cart-line-total";
    lineTotal.textContent = formatCurrency(combo.priceCents * item.quantity);
    const removeButton = document.createElement("button");
    removeButton.className = "cart-remove-button";
    removeButton.type = "button";
    removeButton.textContent = "Eliminar";
    removeButton.setAttribute("aria-label", "Eliminar " + combo.name + " del carrito");
    removeButton.onclick = () => {
        cart = cart.filter((cartItem) => cartItem.comboId !== combo.id);
        row.remove();
        renderCart();
        cartMessage.innerText = combo.name + " se eliminó del carrito.";
    };

    controls.appendChild(quantityLabel);
    controls.appendChild(quantityInput);
    controls.appendChild(lineTotal);
    controls.appendChild(removeButton);
    row.appendChild(info);
    row.appendChild(controls);
    return row;
}

function updateCartTotals() {
    const totals = calculateCart();
    cartCount.textContent = String(totals.productCount);
    cartItemCount.textContent =
        totals.productCount + (totals.productCount === 1 ? " producto" : " productos");
    cartSubtotal.textContent = formatCurrency(totals.subtotalCents);
    cartTotal.textContent = formatCurrency(totals.subtotalCents);
    cartJumpButton.setAttribute(
        "aria-label",
        "Ir al carrito de compras, " + totals.productCount + " productos"
    );

    const isEmpty = totals.productCount === 0;
    clearCartButton.disabled = isEmpty;
    checkoutButton.disabled = isEmpty;
}

function renderCart() {
    while (cartItems.firstChild) {
        cartItems.removeChild(cartItems.firstChild);
    }

    const totals = calculateCart();

    if (totals.productCount === 0) {
        cartItems.innerHTML =
            "<p class=\"cart-empty\">Tu carrito está vacío. Elige un combo para comenzar.</p>";
    } else {
        for (let index = 0; index < cart.length; index += 1) {
            const item = cart[index];
            const combo = findCombo(item.comboId);
            if (!combo || !combo.available ||
                !Number.isSafeInteger(item.quantity) || item.quantity < 1) continue;
            cartItems.appendChild(createCartItemElement(item, combo));
        }
    }
    updateCartTotals();
}

function addComboToCart(combo, quantityInput) {
    const quantity = Number(quantityInput.value);
    const isValid = quantityInput.value.trim() !== "" &&
        Number.isSafeInteger(quantity) &&
        quantity >= 1 &&
        Number.isSafeInteger(combo.priceCents * quantity);

    if (!isValid) {
        quantityInput.setAttribute("aria-invalid", "true");
        window.alert("Ingresa una cantidad entera mayor que cero.");
    } else if (!combo.available) {
        window.alert("Este combo no está disponible por el momento.");
    } else {
        quantityInput.removeAttribute("aria-invalid");
        let cartItem = null;
        for (let index = 0; index < cart.length; index += 1) {
            if (cart[index].comboId === combo.id) {
                cartItem = cart[index];
                break;
            }
        }

        const nextQuantity = (cartItem ? cartItem.quantity : 0) + quantity;
        if (!Number.isSafeInteger(nextQuantity) ||
            !Number.isSafeInteger(combo.priceCents * nextQuantity)) {
            window.alert("La cantidad ingresada supera el límite permitido.");
            return;
        }

        if (cartItem) {
            cartItem.quantity = nextQuantity;
        } else {
            cart.push({ comboId: combo.id, quantity });
        }
        quantityInput.value = "1";
        renderCart();
        cartMessage.textContent =
            quantity + (quantity === 1 ? " combo agregado." : " combos agregados.");
        console.log("Combo agregado:", combo.name, "Cantidad:", quantity);
    }
}

function buildOrderItems() {
    const orderItems = [];
    for (let index = 0; index < cart.length; index += 1) {
        const item = cart[index];
        const combo = findCombo(item.comboId);
        if (!combo || !combo.available ||
            !Number.isSafeInteger(item.quantity) || item.quantity < 1) continue;
        orderItems.push({
            name: combo.name,
            quantity: item.quantity,
            unitPriceCents: combo.priceCents,
            lineTotalCents: combo.priceCents * item.quantity
        });
    }
    return orderItems;
}

function confirmOrder() {
    const totals = calculateCart();
    if (totals.productCount === 0) {
        window.alert("Agrega al menos un combo antes de confirmar el pedido.");
        return;
    }

    const customerName = window.prompt("¿A nombre de quién registramos el pedido?");
    if (customerName === null) return;
    const normalizedName = customerName.trim();
    if (normalizedName === "") {
        window.alert("Escribe el nombre del cliente para continuar.");
        return;
    }

    const orderItems = buildOrderItems();
    if (orderItems.length === 0) {
        window.alert("No hay productos disponibles para confirmar el pedido.");
        return;
    }

    const confirmed = window.confirm(
        "¿Confirmas tu pedido por " + formatCurrency(totals.subtotalCents) + "?"
    );
    if (!confirmed) return;

    orderCustomer.textContent = normalizedName;
    orderTotal.textContent = formatCurrency(totals.subtotalCents);
    while (orderSummaryItems.firstChild) {
        orderSummaryItems.removeChild(orderSummaryItems.firstChild);
    }
    for (let index = 0; index < orderItems.length; index += 1) {
        const item = orderItems[index];
        const summaryItem = document.createElement("li");
        summaryItem.textContent =
            item.name + " — " + item.quantity + " × " +
            formatCurrency(item.unitPriceCents) + " = " +
            formatCurrency(item.lineTotalCents);
        orderSummaryItems.appendChild(summaryItem);
    }

    clearCartAfterOrder = true;
    cartMessage.textContent = "";
    console.log("Pedido confirmado:", {
        productCount: totals.productCount,
        total: formatCurrency(totals.subtotalCents)
    });
    window.alert("¡Pedido confirmado! Revisa el resumen de tu compra.");
    openSimulation(
        null,
        "Resumen de tu pedido",
        "Tu compra simulada quedó confirmada. ¡Disfruta tu función!",
        "order",
        cartJumpButton
    );
}

cartJumpButton.onclick = () => {
    cartPanel.scrollIntoView({ behavior: "smooth", block: "start" });
};
clearCartButton.onclick = () => {
    if (cart.length === 0) {
        window.alert("Tu carrito ya está vacío.");
        return;
    }
    const confirmed = window.confirm("¿Quieres quitar todos los productos del carrito?");
    if (!confirmed) return;
    cart = [];
    renderCart();
    cartMessage.textContent = "El carrito se vació.";
};
checkoutButton.onclick = confirmOrder;

renderComboCatalog();
renderCart();
