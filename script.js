/* TiendaTee — catálogo, filtros, carrusel y carrito (demo, sin pagos reales) */

const PRODUCTS = [
  {
    id: "andina",
    name: "Camiseta Andina 10",
    price: 89.9,
    oldPrice: 119.9,
    category: "hombres",
    image: "assets/prod-andina.jpg",
    bestseller: true,
    badge: "Oferta"
  },
  {
    id: "nocturna",
    name: "Camiseta Nocturna",
    price: 99.9,
    category: "hombres",
    image: "assets/prod-nocturna.jpg",
    bestseller: true,
    badge: "Destacado"
  },
  {
    id: "blanca",
    name: "Camiseta Blanca Clásica",
    price: 79.9,
    category: "hombres",
    image: "assets/prod-blanca.jpg",
    bestseller: true
  },
  {
    id: "costa",
    name: "Camiseta Costa Azul",
    price: 94.9,
    category: "estilos",
    image: "assets/prod-costa.jpg",
    bestseller: true
  },
  {
    id: "clasica",
    name: "Camiseta Rayas Urbanas",
    price: 109.9,
    category: "estilos",
    image: "assets/prod-clasica.jpg",
    bestseller: true,
    badge: "Destacado"
  },
  {
    id: "mujer",
    name: "Camiseta Celeste Dama",
    price: 89.9,
    category: "mujeres",
    image: "assets/prod-mujer.jpg",
    bestseller: true
  },
  {
    id: "nino",
    name: "Camiseta Junior Roja",
    price: 69.9,
    category: "ninos",
    image: "assets/prod-nino.jpg",
    bestseller: true
  },
  {
    id: "tematica",
    name: "Camiseta Crema Temática",
    price: 84.9,
    category: "tematicas",
    image: "assets/prod-tematica.jpg",
    bestseller: true
  },
  {
    id: "verde",
    name: "Camiseta Verde Bosque",
    price: 92.9,
    category: "mujeres",
    image: "assets/prod-verde.jpg"
  },
  {
    id: "negra",
    name: "Camiseta Negra Oro",
    price: 99.9,
    oldPrice: 129.9,
    category: "hombres",
    image: "assets/prod-negra.jpg",
    badge: "Oferta"
  }
];

const FALLBACK_IMG = "assets/cat-hombres.jpg";
const CART_KEY = "tiendatee-cart";
const DEMO_USER_KEY = "tiendatee-demo-user";

const state = {
  filter: "all",
  query: "",
  carouselIndex: 0,
  cart: loadCart()
};

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
}

function money(n) {
  return `S/ ${n.toFixed(2)}`;
}

function handleImgError(img) {
  img.onerror = null;
  img.src = FALLBACK_IMG;
}

function productCard(product, compact) {
  const badge = product.badge ? `<span class="badge">${product.badge}</span>` : "";
  const old = product.oldPrice ? `<s>${money(product.oldPrice)}</s>` : "";
  return `
    <article class="paper-card product-card" data-id="${product.id}">
      ${badge}
      <img src="${product.image}" alt="${product.name}" width="220" height="260" onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">
      <h3>${product.name}</h3>
      <p class="price">${old}${money(product.price)}</p>
      <button type="button" class="btn-add" data-add="${product.id}">Agregar al carrito</button>
    </article>
  `;
}

function filteredProducts() {
  return PRODUCTS.filter((p) => {
    const byCat = state.filter === "all" || p.category === state.filter;
    const q = state.query.trim().toLowerCase();
    const byQuery = !q || p.name.toLowerCase().includes(q);
    return byCat && byQuery;
  });
}

function renderShop() {
  const grid = document.getElementById("productGrid");
  const meta = document.getElementById("resultsMeta");
  const title = document.getElementById("shopTitle");
  const items = filteredProducts();
  const labels = {
    all: "Tienda",
    hombres: "Hombres",
    mujeres: "Mujeres",
    ninos: "Niños",
    estilos: "Estilos",
    tematicas: "Temáticas"
  };
  if (title) title.textContent = labels[state.filter] || "Tienda";
  if (meta) {
    if (state.query) {
      meta.textContent = items.length
        ? `${items.length} resultado(s) para “${state.query}”`
        : `No encontramos camisetas para “${state.query}”`;
    } else {
      meta.textContent = `${items.length} producto(s)`;
    }
  }
  grid.innerHTML = items.map((p) => productCard(p)).join("");
  document.querySelectorAll("#filters .chip").forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.filter === state.filter);
  });
}

function renderCarousel() {
  const track = document.getElementById("carouselTrack");
  const bestsellers = PRODUCTS.filter((p) => p.bestseller);
  track.innerHTML = bestsellers.map((p) => productCard(p, true)).join("");
  updateCarousel();
}

function visibleCount() {
  const w = window.innerWidth;
  if (w <= 420) return 1;
  if (w <= 640) return 2;
  if (w <= 1100) return 3;
  return 5;
}

function updateCarousel() {
  const track = document.getElementById("carouselTrack");
  const cards = track.querySelectorAll(".product-card");
  const vis = visibleCount();
  const max = Math.max(0, cards.length - vis);
  state.carouselIndex = Math.min(state.carouselIndex, max);
  const gap = 18;
  const card = cards[0];
  if (!card) return;
  const step = card.getBoundingClientRect().width + gap;
  track.style.transform = `translateX(${-state.carouselIndex * step}px)`;
}

function cartCount() {
  return state.cart.reduce((sum, line) => sum + line.qty, 0);
}

function cartSubtotal() {
  return state.cart.reduce((sum, line) => {
    const p = PRODUCTS.find((x) => x.id === line.id);
    return sum + (p ? p.price * line.qty : 0);
  }, 0);
}

function renderCart() {
  document.getElementById("cartCount").textContent = String(cartCount());
  document.getElementById("cartSubtotal").textContent = money(cartSubtotal());
  const box = document.getElementById("cartItems");
  if (!state.cart.length) {
    box.innerHTML = `<p class="empty">Tu carrito está vacío.</p>`;
    return;
  }
  box.innerHTML = state.cart
    .map((line) => {
      const p = PRODUCTS.find((x) => x.id === line.id);
      if (!p) return "";
      return `
        <div class="cart-row">
          <img src="${p.image}" alt="" onerror="this.onerror=null;this.src='${FALLBACK_IMG}'">
          <div>
            <strong>${p.name}</strong>
            <div>${money(p.price)}</div>
            <div class="qty-ctrl">
              <button type="button" data-qty="${p.id}" data-delta="-1" aria-label="Quitar uno">−</button>
              <span>${line.qty}</span>
              <button type="button" data-qty="${p.id}" data-delta="1" aria-label="Agregar uno">+</button>
            </div>
          </div>
          <button type="button" class="remove-line" data-remove="${p.id}">Quitar</button>
        </div>
      `;
    })
    .join("");
}

function addToCart(id) {
  const line = state.cart.find((x) => x.id === id);
  if (line) line.qty += 1;
  else state.cart.push({ id, qty: 1 });
  saveCart();
  renderCart();
  const product = PRODUCTS.find((p) => p.id === id);
  showToast(`${product ? product.name : "Producto"} agregado al carrito`);
}

function changeQty(id, delta) {
  const line = state.cart.find((x) => x.id === id);
  if (!line) return;
  line.qty += delta;
  if (line.qty <= 0) state.cart = state.cart.filter((x) => x.id !== id);
  saveCart();
  renderCart();
}

function removeLine(id) {
  state.cart = state.cart.filter((x) => x.id !== id);
  saveCart();
  renderCart();
}

function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("is-on");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.remove("is-on"), 2200);
}

function openCart() {
  document.getElementById("overlay").hidden = false;
  const drawer = document.getElementById("cartDrawer");
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  document.getElementById("overlay").hidden = true;
  const drawer = document.getElementById("cartDrawer");
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
}

const VIEWS = ["inicio", "tienda", "nosotros", "contacto", "cuenta", "envios", "devoluciones", "terminos"];

function setView(name, options = {}) {
  const view = VIEWS.includes(name) ? name : "inicio";
  document.querySelectorAll("[data-view]").forEach((el) => {
    el.hidden = el.dataset.view !== view;
  });
  const navMap = {
    inicio: "inicio",
    tienda: "tienda",
    nosotros: "nosotros",
    contacto: "contacto",
    cuenta: "cuenta"
  };
  document.querySelectorAll(".nav-link").forEach((link) => {
    const key = link.dataset.nav;
    const active =
      key === navMap[view] ||
      (key === "categorias" && view === "inicio" && options.fromCategories);
    link.classList.toggle("is-active", key === (options.fromCategories ? "categorias" : navMap[view] || ""));
  });
  if (!options.fromCategories) {
    document.querySelectorAll(".nav-link").forEach((link) => {
      if (link.dataset.nav === "categorias") link.classList.remove("is-active");
    });
    const match = document.querySelector(`.nav-link[data-nav="${navMap[view] || ""}"]`);
    if (match) match.classList.add("is-active");
  }
  document.getElementById("mainNav").classList.remove("is-open");
  document.getElementById("menuToggle").setAttribute("aria-expanded", "false");
  if (!options.silentScroll) window.scrollTo({ top: 0, behavior: "smooth" });
}

function goShop(filter, query) {
  state.filter = filter || "all";
  if (typeof query === "string") state.query = query;
  renderShop();
  setView("tienda");
  history.replaceState(null, "", "#tienda");
}

function routeFromHash() {
  const hash = (location.hash || "#inicio").slice(1);
  if (hash === "categorias") {
    setView("inicio", { fromCategories: true, silentScroll: true });
    const el = document.getElementById("categorias");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  setView(hash);
}

function validateForm(form, errorEl) {
  errorEl.hidden = true;
  errorEl.textContent = "";
  if (!form.checkValidity()) {
    const first = form.querySelector(":invalid");
    if (first && first.validationMessage) {
      errorEl.textContent = first.validationMessage;
    } else {
      errorEl.textContent = "Revisa los campos e inténtalo de nuevo.";
    }
    errorEl.hidden = false;
    first && first.focus();
    return false;
  }
  return true;
}

function bindEvents() {
  document.getElementById("carouselPrev").addEventListener("click", () => {
    state.carouselIndex = Math.max(0, state.carouselIndex - 1);
    updateCarousel();
  });
  document.getElementById("carouselNext").addEventListener("click", () => {
    const vis = visibleCount();
    const total = document.querySelectorAll("#carouselTrack .product-card").length;
    state.carouselIndex = Math.min(Math.max(0, total - vis), state.carouselIndex + 1);
    updateCarousel();
  });

  document.body.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) {
      addToCart(add.dataset.add);
      return;
    }
    const qty = e.target.closest("[data-qty]");
    if (qty) {
      changeQty(qty.dataset.qty, Number(qty.dataset.delta));
      return;
    }
    const rm = e.target.closest("[data-remove]");
    if (rm) {
      removeLine(rm.dataset.remove);
      return;
    }
    const cat = e.target.closest("[data-filter]");
    if (cat && cat.classList.contains("category-card")) {
      goShop(cat.dataset.filter, "");
      return;
    }
  });

  document.getElementById("filters").addEventListener("click", (e) => {
    const chip = e.target.closest("[data-filter]");
    if (!chip) return;
    goShop(chip.dataset.filter, state.query);
  });

  document.getElementById("searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const q = document.getElementById("searchInput").value.trim();
    goShop("all", q);
  });

  document.querySelectorAll("[data-nav]").forEach((el) => {
    el.addEventListener("click", () => {
      /* hashchange se encarga de la vista */
    });
  });

  document.getElementById("cartOpen").addEventListener("click", openCart);
  document.getElementById("cartClose").addEventListener("click", closeCart);
  document.getElementById("overlay").addEventListener("click", closeCart);
  document.getElementById("checkoutBtn").addEventListener("click", () => {
    if (!state.cart.length) {
      showToast("Agrega productos antes de continuar");
      return;
    }
    showToast("Demostración: no se procesan pagos reales");
  });

  document.getElementById("menuToggle").addEventListener("click", () => {
    const nav = document.getElementById("mainNav");
    const open = nav.classList.toggle("is-open");
    document.getElementById("menuToggle").setAttribute("aria-expanded", String(open));
  });

  document.getElementById("contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const err = document.getElementById("contactError");
    if (!validateForm(form, err)) return;
    showToast("Mensaje enviado (demo). No se envió a un servidor.");
    form.reset();
  });

  document.getElementById("tabLogin").addEventListener("click", () => {
    document.getElementById("loginForm").hidden = false;
    document.getElementById("registerForm").hidden = true;
    document.getElementById("tabLogin").classList.add("is-active");
    document.getElementById("tabRegister").classList.remove("is-active");
  });
  document.getElementById("tabRegister").addEventListener("click", () => {
    document.getElementById("loginForm").hidden = true;
    document.getElementById("registerForm").hidden = false;
    document.getElementById("tabRegister").classList.add("is-active");
    document.getElementById("tabLogin").classList.remove("is-active");
  });

  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const err = document.getElementById("loginError");
    if (!validateForm(form, err)) return;
    const email = form.email.value;
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify({ email }));
    showDemoUser();
    showToast("Sesión de demostración iniciada");
  });

  document.getElementById("registerForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const err = document.getElementById("registerError");
    if (!validateForm(form, err)) return;
    localStorage.setItem(
      DEMO_USER_KEY,
      JSON.stringify({ email: form.email.value, nombre: form.nombre.value })
    );
    showDemoUser();
    showToast("Cuenta de demostración creada");
  });

  window.addEventListener("hashchange", routeFromHash);
  window.addEventListener("resize", updateCarousel);

  let startX = 0;
  const viewport = document.getElementById("carouselViewport");
  viewport.addEventListener("touchstart", (e) => {
    startX = e.changedTouches[0].clientX;
  });
  viewport.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (dx > 40) document.getElementById("carouselPrev").click();
    if (dx < -40) document.getElementById("carouselNext").click();
  });
}

function showDemoUser() {
  const raw = localStorage.getItem(DEMO_USER_KEY);
  const box = document.getElementById("demoUser");
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    box.hidden = false;
    box.textContent = `Demo activa: ${data.nombre ? data.nombre + " · " : ""}${data.email}`;
  } catch {
    box.hidden = true;
  }
}

function init() {
  renderCarousel();
  renderShop();
  renderCart();
  bindEvents();
  showDemoUser();
  routeFromHash();
}

document.addEventListener("DOMContentLoaded", init);
