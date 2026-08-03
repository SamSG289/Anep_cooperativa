(function () {
  const grid = document.getElementById('product-grid');
  const cartBtn = document.getElementById('cart-btn');
  const cartCount = document.getElementById('cart-count');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartItemsEl = document.getElementById('cart-items');
  const cartTotalEl = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');
  const logoBtn = document.getElementById('site-logo');
  const passwordModal = document.getElementById('password-modal');
  const passwordForm = document.getElementById('password-form');
  const passwordInput = document.getElementById('password-input');
  const togglePasswordBtn = document.getElementById('toggle-password-visibility');

  let currentProducts = [];

  // Fill in your cooperative's WhatsApp number (country code + number, no
  // spaces or symbols, e.g. "59899123456") to send orders straight there.
  // Leave empty to just show a confirmation message instead.
  const WHATSAPP_NUMBER = '';

  function toast(message) {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    container.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 300);
    }, 2200);
  }

  // ---- Catalog ----
  function renderProducts() {
    grid.innerHTML = currentProducts.map(renderCard).join('');
  }

  function renderCard(product) {
    const available = !!product.stock;
    const badge = available
      ? `<div class="absolute top-4 left-4 z-10 bg-secondary/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
           <div class="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></div>
           <span class="text-xs font-semibold text-on-primary tracking-wider uppercase">Disponible</span>
         </div>`
      : `<div class="absolute top-4 left-4 z-10 bg-surface-variant/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
           <div class="w-2 h-2 rounded-full bg-on-surface-variant"></div>
           <span class="text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Sin Stock</span>
         </div>`;

    const button = available
      ? `<button aria-label="Añadir al carrito" data-add-to-cart="${product.id}" class="bg-primary hover:bg-primary-container text-on-primary w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm">
           <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">shopping_bag</span>
         </button>`
      : `<button aria-label="Agotado" class="bg-surface-variant text-on-surface-variant w-12 h-12 rounded-full flex items-center justify-center cursor-not-allowed" disabled>
           <span class="material-symbols-outlined">event_busy</span>
         </button>`;

    return `
    <article class="flex flex-col bg-surface-container-lowest rounded-xl shadow-[0_8px_24px_rgba(128,0,32,0.04)] overflow-hidden hover:shadow-[0_16px_40px_rgba(128,0,32,0.08)] hover:-translate-y-1 transition-all duration-300 border border-surface-variant/50 relative group">
      ${badge}
      <div class="w-full aspect-[4/5] relative overflow-hidden bg-surface-container">
        <img alt="${escapeHtml(product.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out ${available ? '' : 'grayscale opacity-70'}" src="${escapeHtml(product.image)}">
      </div>
      <div class="p-6 flex flex-col flex-grow">
        <h2 class="text-headline-lg-mobile font-headline-lg-mobile text-on-surface mb-2 ${available ? '' : 'opacity-60'}">${escapeHtml(product.name)}</h2>
        <p class="text-body-md font-body-md text-on-surface-variant mb-6 line-clamp-2 ${available ? '' : 'opacity-60'}">${escapeHtml(product.description)}</p>
        <div class="mt-auto flex items-center justify-between">
          <span class="text-headline-lg-mobile font-headline-lg-mobile text-primary">${formatPrice(product.price)}</span>
          ${button}
        </div>
      </div>
    </article>`;
  }

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add-to-cart]');
    if (!btn) return;
    addToCart(Number(btn.dataset.addToCart));
  });

  // ---- Cart ----
  function addToCart(productId) {
    const cart = getCart();
    const existing = cart.find((i) => i.id === productId);
    if (existing) existing.qty += 1;
    else cart.push({ id: productId, qty: 1 });
    saveCart(cart);
    renderCartBadge();
    const product = currentProducts.find((p) => p.id === productId);
    toast(`${product ? product.name : 'Producto'} agregado al carrito`);
  }

  function updateQty(productId, delta) {
    let cart = getCart();
    const item = cart.find((i) => i.id === productId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter((i) => i.id !== productId);
    saveCart(cart);
    renderCart();
  }

  function removeFromCart(productId) {
    const cart = getCart().filter((i) => i.id !== productId);
    saveCart(cart);
    renderCart();
  }

  function cartTotalCount() {
    return getCart().reduce((sum, i) => sum + i.qty, 0);
  }

  function renderCartBadge() {
    const count = cartTotalCount();
    cartCount.textContent = String(count);
    cartCount.classList.toggle('hidden', count === 0);
  }

  function renderCart() {
    const cart = getCart();
    const products = currentProducts;
    renderCartBadge();

    if (cart.length === 0) {
      cartItemsEl.innerHTML = `<p class="text-on-surface-variant text-center py-12">Tu carrito está vacío.</p>`;
      cartTotalEl.textContent = formatPrice(0);
      return;
    }

    let total = 0;
    cartItemsEl.innerHTML = cart.map((item) => {
      const product = products.find((p) => p.id === item.id);
      if (!product) return '';
      const subtotal = product.price * item.qty;
      total += subtotal;
      return `
      <div class="flex gap-4 items-center">
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="w-16 h-16 rounded-lg object-cover shadow-sm">
        <div class="flex-1">
          <p class="font-headline-lg-mobile font-headline-lg-mobile text-on-surface text-[16px]">${escapeHtml(product.name)}</p>
          <p class="text-on-surface-variant text-sm">${formatPrice(product.price)} c/u</p>
          <div class="flex items-center gap-3 mt-2">
            <button class="qty-btn bg-surface-container hover:bg-surface-variant" data-qty-minus="${product.id}">
              <span class="material-symbols-outlined text-[16px]">remove</span>
            </button>
            <span class="w-4 text-center">${item.qty}</span>
            <button class="qty-btn bg-surface-container hover:bg-surface-variant" data-qty-plus="${product.id}">
              <span class="material-symbols-outlined text-[16px]">add</span>
            </button>
            <button class="ml-2 text-on-surface-variant hover:text-error transition-colors" data-remove="${product.id}" aria-label="Eliminar">
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>
        <span class="font-headline-lg-mobile font-headline-lg-mobile text-primary text-[16px]">${formatPrice(subtotal)}</span>
      </div>`;
    }).join('');

    cartTotalEl.textContent = formatPrice(total);
  }

  cartItemsEl.addEventListener('click', (e) => {
    const plus = e.target.closest('[data-qty-plus]');
    const minus = e.target.closest('[data-qty-minus]');
    const remove = e.target.closest('[data-remove]');
    if (plus) updateQty(Number(plus.dataset.qtyPlus), 1);
    if (minus) updateQty(Number(minus.dataset.qtyMinus), -1);
    if (remove) removeFromCart(Number(remove.dataset.remove));
  });

  function openCart() {
    renderCart();
    cartDrawer.classList.remove('hidden');
    requestAnimationFrame(() => cartDrawer.classList.add('drawer-open'));
  }
  function closeCart() {
    cartDrawer.classList.remove('drawer-open');
    setTimeout(() => cartDrawer.classList.add('hidden'), 300);
  }

  cartBtn.addEventListener('click', openCart);
  cartDrawer.querySelectorAll('[data-close-cart]').forEach((el) => el.addEventListener('click', closeCart));

  checkoutBtn.addEventListener('click', () => {
    const cart = getCart();
    if (cart.length === 0) {
      toast('Tu carrito está vacío');
      return;
    }
    const products = currentProducts;
    const lines = cart.map((item) => {
      const product = products.find((p) => p.id === item.id);
      return product ? `- ${product.name} x${item.qty} (${formatPrice(product.price * item.qty)})` : '';
    }).filter(Boolean);
    const total = cart.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.id);
      return sum + (product ? product.price * item.qty : 0);
    }, 0);
    const message = `¡Hola! Quiero hacer este pedido a la Cooperativa Escolar Escuela Funes:\n${lines.join('\n')}\nTotal: ${formatPrice(total)}`;

    if (WHATSAPP_NUMBER) {
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      toast('¡Gracias por tu pedido! Nos pondremos en contacto para coordinar la entrega.');
    }
    saveCart([]);
    renderCart();
    closeCart();
  });

  // ---- Navigation ----
  document.getElementById('nav-catalogo').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('nav-inicio').addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---- Secret admin access: click the logo 15 times ----
  let logoClicks = 0;
  let logoClickTimer = null;

  logoBtn.addEventListener('click', () => {
    logoClicks += 1;
    clearTimeout(logoClickTimer);
    logoClickTimer = setTimeout(() => { logoClicks = 0; }, 2000);
    if (logoClicks >= LOGO_CLICKS_TO_UNLOCK) {
      logoClicks = 0;
      openPasswordModal();
    }
  });

  function openPasswordModal() {
    passwordModal.classList.remove('hidden');
    passwordModal.classList.add('flex');
    requestAnimationFrame(() => passwordModal.classList.add('modal-open'));
    passwordInput.value = '';
    passwordInput.type = 'text';
    togglePasswordBtn.textContent = 'Ocultar';
    passwordInput.focus();
  }
  function closePasswordModal() {
    passwordModal.classList.remove('modal-open');
    setTimeout(() => {
      passwordModal.classList.add('hidden');
      passwordModal.classList.remove('flex');
    }, 200);
  }
  // Only the X button closes this modal — clicking outside it does nothing,
  // so it can't be dismissed by accident and always requires 15 fresh clicks
  // on the logo to reopen.
  passwordModal.querySelectorAll('[data-close-password]').forEach((el) => el.addEventListener('click', closePasswordModal));

  togglePasswordBtn.addEventListener('click', () => {
    const showing = passwordInput.type === 'text';
    passwordInput.type = showing ? 'password' : 'text';
    togglePasswordBtn.textContent = showing ? 'Mostrar' : 'Ocultar';
    passwordInput.focus();
  });

  passwordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (passwordInput.value === ADMIN_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, '1');
      window.location.href = 'admin.html';
    } else {
      const modalBox = passwordModal.querySelector('.modal-scale');
      modalBox.classList.remove('shake');
      void modalBox.offsetWidth;
      modalBox.classList.add('shake');
      passwordInput.value = '';
      toast('Contraseña incorrecta');
    }
  });

  // ---- Init ----
  renderCartBadge();
  seedProductsIfEmpty();
  subscribeToProducts((products) => {
    currentProducts = products;
    renderProducts();
    if (!cartDrawer.classList.contains('hidden')) renderCart();
  });
})();
