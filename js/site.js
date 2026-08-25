(function () {
  const grid = document.getElementById('product-grid');
  const categoryFiltersEl = document.getElementById('category-filters');
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
  let activeCategory = 'Todos';

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

  // ---- Category filters ----
  function renderCategoryFilters() {
    const categories = Array.from(new Set(currentProducts.map((p) => p.category).filter(Boolean)));
    if (categories.length <= 1) {
      categoryFiltersEl.innerHTML = '';
      return;
    }
    const all = ['Todos', ...categories];
    categoryFiltersEl.innerHTML = all.map((cat) => `
      <button type="button" data-category="${escapeHtml(cat)}" class="px-4 py-2 rounded-full font-label-sm text-label-sm transition-colors ${cat === activeCategory ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}">${escapeHtml(cat)}</button>
    `).join('');
  }

  categoryFiltersEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-category]');
    if (!btn) return;
    activeCategory = btn.dataset.category;
    renderCategoryFilters();
    renderProducts();
  });

  // ---- Catalog ----
  function renderProducts() {
    renderCategoryFilters();
    const filtered = activeCategory === 'Todos' ? currentProducts : currentProducts.filter((p) => p.category === activeCategory);
    grid.innerHTML = filtered.map(renderCard).join('') || `<p class="col-span-full text-center text-on-surface-variant py-12">No hay productos en esta categoría todavía.</p>`;
    // Tailwind's CDN build generates the CSS for these classes
    // asynchronously (it watches the page and injects styles as they show
    // up), so the 2-line clamp isn't actually active yet on this same tick.
    // Wait a couple of frames for it to catch up before measuring.
    requestAnimationFrame(() => requestAnimationFrame(revealTruncatedDescriptions));
  }

  // Shows the "Ver más" toggle only for descriptions that actually get cut
  // off by the 2-line clamp, so short ones don't get a pointless link.
  function revealTruncatedDescriptions() {
    grid.querySelectorAll('[data-desc]').forEach((el) => {
      if (el.scrollHeight > el.clientHeight + 1) {
        const toggle = grid.querySelector(`[data-toggle-desc="${el.dataset.desc}"]`);
        if (toggle) toggle.classList.remove('hidden');
      }
    });
  }

  function renderCard(product) {
    const stockQty = product.stockQty || 0;
    const available = stockQty > 0;
    const lowStock = available && stockQty <= 3;
    const images = product.images && product.images.length ? product.images : [];

    const badge = available
      ? `<div class="absolute top-4 left-4 z-10 bg-secondary/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
           <div class="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></div>
           <span class="text-xs font-semibold text-on-primary tracking-wider uppercase">${lowStock ? `Quedan ${stockQty}` : 'Disponible'}</span>
         </div>`
      : `<div class="absolute top-4 left-4 z-10 bg-surface-variant/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
           <div class="w-2 h-2 rounded-full bg-on-surface-variant"></div>
           <span class="text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Sin Stock</span>
         </div>`;

    const gallery = images.length > 1 ? `
      <button type="button" aria-label="Foto anterior" data-img-prev="${product.id}" class="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-surface/80 hover:bg-surface flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span class="material-symbols-outlined text-[18px]">chevron_left</span>
      </button>
      <button type="button" aria-label="Foto siguiente" data-img-next="${product.id}" class="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-surface/80 hover:bg-surface flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span class="material-symbols-outlined text-[18px]">chevron_right</span>
      </button>
      <div class="absolute bottom-2 inset-x-0 flex justify-center gap-1.5 z-10">
        ${images.map((_, i) => `<span data-img-dot="${product.id}" data-dot-index="${i}" class="w-1.5 h-1.5 rounded-full transition-colors ${i === 0 ? 'bg-white' : 'bg-white/50'}"></span>`).join('')}
      </div>` : '';

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
        <img data-card-image="${product.id}" data-image-index="0" data-images="${escapeAttr(JSON.stringify(images))}" alt="${escapeHtml(product.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out ${available ? '' : 'grayscale opacity-70'}" src="${escapeHtml(images[0])}">
        ${gallery}
      </div>
      <div class="p-6 flex flex-col flex-grow">
        ${product.category ? `<span class="font-label-sm text-label-sm text-secondary uppercase tracking-wider mb-1">${escapeHtml(product.category)}</span>` : ''}
        <h2 class="text-headline-lg-mobile font-headline-lg-mobile text-on-surface mb-2 ${available ? '' : 'opacity-60'}">${escapeHtml(product.name)}</h2>
        <div class="mb-6">
          <p data-desc="${product.id}" class="text-body-md font-body-md text-on-surface-variant line-clamp-2 ${available ? '' : 'opacity-60'}">${escapeHtml(product.description)}</p>
          <button type="button" data-toggle-desc="${product.id}" class="hidden text-secondary text-sm font-semibold hover:underline mt-1">Ver más</button>
        </div>
        <div class="mt-auto flex items-center justify-between">
          <span class="text-headline-lg-mobile font-headline-lg-mobile text-primary">${formatPrice(product.price)}</span>
          ${button}
        </div>
      </div>
    </article>`;
  }

  function setCardImage(productId, index) {
    const img = grid.querySelector(`[data-card-image="${productId}"]`);
    if (!img) return;
    const images = JSON.parse(img.dataset.images || '[]');
    if (!images.length) return;
    const wrapped = ((index % images.length) + images.length) % images.length;
    img.src = images[wrapped];
    img.dataset.imageIndex = String(wrapped);
    grid.querySelectorAll(`[data-img-dot="${productId}"]`).forEach((dot) => {
      const active = Number(dot.dataset.dotIndex) === wrapped;
      dot.classList.toggle('bg-white', active);
      dot.classList.toggle('bg-white/50', !active);
    });
  }

  grid.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-add-to-cart]');
    if (addBtn) addToCart(Number(addBtn.dataset.addToCart));

    const descToggle = e.target.closest('[data-toggle-desc]');
    if (descToggle) {
      const desc = grid.querySelector(`[data-desc="${descToggle.dataset.toggleDesc}"]`);
      const expanded = desc.classList.toggle('line-clamp-2') === false;
      descToggle.textContent = expanded ? 'Ver menos' : 'Ver más';
    }

    const prevBtn = e.target.closest('[data-img-prev]');
    const nextBtn = e.target.closest('[data-img-next]');
    const dot = e.target.closest('[data-img-dot]');
    if (prevBtn) {
      const img = grid.querySelector(`[data-card-image="${prevBtn.dataset.imgPrev}"]`);
      setCardImage(prevBtn.dataset.imgPrev, Number(img.dataset.imageIndex) - 1);
    }
    if (nextBtn) {
      const img = grid.querySelector(`[data-card-image="${nextBtn.dataset.imgNext}"]`);
      setCardImage(nextBtn.dataset.imgNext, Number(img.dataset.imageIndex) + 1);
    }
    if (dot) setCardImage(dot.dataset.imgDot, Number(dot.dataset.dotIndex));
  });

  // ---- Cart ----
  function addToCart(productId) {
    const product = currentProducts.find((p) => p.id === productId);
    if (!product) return;
    const cart = getCart();
    const existing = cart.find((i) => i.id === productId);
    const currentQty = existing ? existing.qty : 0;
    if (currentQty >= product.stockQty) {
      toast('No hay más stock disponible');
      return;
    }
    if (existing) existing.qty += 1;
    else cart.push({ id: productId, qty: 1 });
    saveCart(cart);
    renderCartBadge();
    toast(`${product.name} agregado al carrito`);
  }

  function updateQty(productId, delta) {
    let cart = getCart();
    const item = cart.find((i) => i.id === productId);
    if (!item) return;
    if (delta > 0) {
      const product = currentProducts.find((p) => p.id === productId);
      if (product && item.qty >= product.stockQty) {
        toast('No hay más stock disponible');
        return;
      }
    }
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
        <img src="${escapeHtml(product.images[0])}" alt="${escapeHtml(product.name)}" class="w-16 h-16 rounded-lg object-cover shadow-sm">
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
    const items = cart.map((item) => {
      const product = currentProducts.find((p) => p.id === item.id);
      return product ? { id: product.id, name: product.name, price: product.price, qty: item.qty } : null;
    }).filter(Boolean);
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const message = `¡Hola! Quiero hacer este pedido a la Cooperativa Escolar Escuela Funes:\n${items.map((i) => `- ${i.name} x${i.qty} (${formatPrice(i.price * i.qty)})`).join('\n')}\nTotal: ${formatPrice(total)}`;

    if (WHATSAPP_NUMBER) {
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      toast('¡Gracias por tu pedido! Nos pondremos en contacto para coordinar la entrega.');
    }
    items.forEach((i) => decrementStock(i.id, i.qty));
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
  // Re-check truncation once the web fonts finish loading: text wraps
  // differently with the fallback font than with the final one, so a
  // description measured too early could wrongly get skipped.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(revealTruncatedDescriptions);
  }
  renderCartBadge();
  seedProductsIfEmpty();
  subscribeToProducts((products) => {
    currentProducts = products;
    renderProducts();
    if (!cartDrawer.classList.contains('hidden')) renderCart();
  });
})();
