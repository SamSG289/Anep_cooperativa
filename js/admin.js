(function () {
  const PAGE_SIZE = 5;
  const MAX_IMAGES = 4;
  let currentPage = 1;
  let pendingImages = []; // data URLs / URLs for the product being created/edited, index-aligned to the slots

  const navDashboard = document.getElementById('nav-dashboard');
  const navInventario = document.getElementById('nav-inventario');
  const viewDashboard = document.getElementById('view-dashboard');
  const viewInventario = document.getElementById('view-inventario');
  const headerTitle = document.getElementById('header-title');
  const navLinks = [navDashboard, navInventario];

  const tableBody = document.getElementById('product-table-body');
  const paginationLabel = document.getElementById('pagination-label');
  const pagePrev = document.getElementById('page-prev');
  const pageNext = document.getElementById('page-next');

  const modal = document.getElementById('product-modal');
  const modalTitle = document.getElementById('modal-title');
  const productForm = document.getElementById('product-form');
  const productIdInput = document.getElementById('product-id');
  const productNameInput = document.getElementById('product-name');
  const productCategoryInput = document.getElementById('product-category');
  const categoryList = document.getElementById('category-list');
  const productDescriptionInput = document.getElementById('product-description');
  const productPriceInput = document.getElementById('product-price');
  const productStockQtyInput = document.getElementById('product-stock-qty');
  const imageSlots = Array.from(document.querySelectorAll('.image-slot'));
  const addProductBtn = document.getElementById('add-product-btn');
  const logoutLink = document.getElementById('logout-link');

  const sidebar = document.getElementById('admin-sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const sidebarOpenBtn = document.getElementById('sidebar-open');
  const sidebarCloseBtn = document.getElementById('sidebar-close');

  let currentProducts = [];
  let currentView = 'dashboard';

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

  // ---- Mobile sidebar ----
  function openSidebar() {
    sidebar.classList.add('sidebar-open');
    sidebarOverlay.classList.add('sidebar-open');
  }
  function closeSidebar() {
    sidebar.classList.remove('sidebar-open');
    sidebarOverlay.classList.remove('sidebar-open');
  }
  sidebarOpenBtn.addEventListener('click', openSidebar);
  sidebarCloseBtn.addEventListener('click', closeSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  // ---- View switching ----
  const VIEW_TITLES = { dashboard: 'Panel General', inventario: 'Inventario' };
  const VIEW_SECTIONS = { dashboard: viewDashboard, inventario: viewInventario };
  const VIEW_NAVS = { dashboard: navDashboard, inventario: navInventario };

  function showView(view) {
    currentView = view;
    Object.keys(VIEW_SECTIONS).forEach((key) => VIEW_SECTIONS[key].classList.toggle('hidden', key !== view));
    navLinks.forEach((link) => {
      const active = link === VIEW_NAVS[view];
      link.classList.toggle('bg-secondary-container', active);
      link.classList.toggle('text-on-secondary-container', active);
      link.classList.toggle('shadow-sm', active);
      link.classList.toggle('text-on-surface-variant', !active);
    });
    headerTitle.textContent = VIEW_TITLES[view];
    closeSidebar();
    renderCurrentView();
  }

  function renderCurrentView() {
    if (currentView === 'inventario') renderTable();
    else renderDashboard();
  }

  navDashboard.addEventListener('click', (e) => { e.preventDefault(); showView('dashboard'); });
  navInventario.addEventListener('click', (e) => { e.preventDefault(); showView('inventario'); });
  document.querySelector('[data-goto-inventario]').addEventListener('click', () => showView('inventario'));

  logoutLink.addEventListener('click', () => {
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  });

  // ---- Dashboard ----
  function renderDashboard() {
    const products = currentProducts;
    document.getElementById('stat-total').textContent = products.length;
    document.getElementById('stat-available').textContent = products.filter((p) => p.stockQty > 0).length;
    document.getElementById('stat-out').textContent = products.filter((p) => p.stockQty <= 0).length;
  }

  // ---- Table / Inventory ----
  function renderTable() {
    const products = currentProducts;
    const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = products.slice(start, start + PAGE_SIZE);

    tableBody.innerHTML = pageItems.map(renderRow).join('') || `
      <tr><td colspan="7" class="p-10 text-center text-on-surface-variant">No hay productos cargados todavía.</td></tr>`;

    const shownFrom = products.length === 0 ? 0 : start + 1;
    const shownTo = Math.min(start + PAGE_SIZE, products.length);
    paginationLabel.textContent = `Mostrando ${shownFrom}-${shownTo} de ${products.length} productos`;
    pagePrev.disabled = currentPage <= 1;
    pageNext.disabled = currentPage >= totalPages;

    const categories = Array.from(new Set(currentProducts.map((p) => p.category).filter(Boolean)));
    categoryList.innerHTML = categories.map((c) => `<option value="${escapeHtml(c)}">`).join('');
  }

  function renderRow(product) {
    const available = product.stockQty > 0;
    return `
    <tr class="border-b border-surface-variant hover:bg-surface-bright transition-colors group ${available ? '' : 'bg-error-container/10'}">
      <td class="p-3 sm:p-6">
        <img class="w-12 h-12 rounded-lg object-cover shadow-sm ${available ? '' : 'opacity-50 grayscale-[50%]'}" src="${escapeHtml(product.images[0])}">
      </td>
      <td class="p-3 sm:p-6 font-headline-lg-mobile text-headline-lg-mobile ${available ? 'text-primary' : 'text-on-surface-variant'}">${escapeHtml(product.name)}</td>
      <td class="p-3 sm:p-6 text-on-surface-variant hidden lg:table-cell">${escapeHtml(product.category)}</td>
      <td class="p-3 sm:p-6 text-on-surface-variant hidden md:table-cell truncate max-w-[200px]">${escapeHtml(product.description)}</td>
      <td class="p-3 sm:p-6 whitespace-nowrap ${available ? '' : 'text-on-surface-variant'}">${formatPrice(product.price)}</td>
      <td class="p-3 sm:p-6 text-center">
        <span class="inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-full text-sm font-semibold ${available ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-variant text-on-surface-variant'}">${product.stockQty}</span>
      </td>
      <td class="p-3 sm:p-6 text-right whitespace-nowrap">
        <button data-edit="${product.id}" class="text-on-surface-variant hover:text-primary transition-colors p-2" title="Editar">
          <span class="material-symbols-outlined">edit</span>
        </button>
        <button data-delete="${product.id}" class="text-on-surface-variant hover:text-error transition-colors p-2" title="Eliminar">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </td>
    </tr>`;
  }

  tableBody.addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit]');
    const deleteBtn = e.target.closest('[data-delete]');
    if (editBtn) openModal(Number(editBtn.dataset.edit));
    if (deleteBtn) confirmAndDeleteProduct(Number(deleteBtn.dataset.delete));
  });

  pagePrev.addEventListener('click', () => { currentPage -= 1; renderTable(); });
  pageNext.addEventListener('click', () => { currentPage += 1; renderTable(); });

  function confirmAndDeleteProduct(id) {
    const product = currentProducts.find((p) => p.id === id);
    if (!product) return;
    if (!confirm(`¿Eliminar "${product.name}" del catálogo?`)) return;
    deleteProduct(id);
    toast('Producto eliminado');
  }

  // ---- Modal (create / edit) ----
  function setSlotImage(index, src) {
    pendingImages[index] = src || null;
    const slot = imageSlots[index];
    const empty = slot.querySelector('.image-slot-empty');
    const remove = slot.querySelector('.image-slot-remove');
    if (src) {
      slot.style.backgroundImage = `url('${src}')`;
      empty.classList.add('hidden');
      remove.classList.remove('hidden');
      remove.classList.add('flex');
    } else {
      slot.style.backgroundImage = 'none';
      empty.classList.remove('hidden');
      remove.classList.add('hidden');
      remove.classList.remove('flex');
    }
  }

  imageSlots.forEach((slot, index) => {
    const input = slot.querySelector('[data-slot-input]');
    slot.addEventListener('click', (e) => {
      if (e.target.closest('[data-remove-slot]')) return;
      input.click();
    });
    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setSlotImage(index, reader.result);
      reader.readAsDataURL(file);
    });
    slot.querySelector('[data-remove-slot]').addEventListener('click', (e) => {
      e.stopPropagation();
      setSlotImage(index, null);
      input.value = '';
    });
  });

  function openModal(editId) {
    productForm.reset();
    pendingImages = new Array(MAX_IMAGES).fill(null);
    imageSlots.forEach((_, index) => setSlotImage(index, null));
    productStockQtyInput.value = 0;

    if (editId) {
      const product = currentProducts.find((p) => p.id === editId);
      if (!product) return;
      modalTitle.textContent = 'Editar Producto';
      productIdInput.value = product.id;
      productNameInput.value = product.name;
      productCategoryInput.value = product.category;
      productDescriptionInput.value = product.description;
      productPriceInput.value = product.price;
      productStockQtyInput.value = product.stockQty;
      product.images.slice(0, MAX_IMAGES).forEach((img, index) => setSlotImage(index, img));
    } else {
      modalTitle.textContent = 'Nuevo Producto';
      productIdInput.value = '';
    }

    modal.classList.remove('hidden');
    requestAnimationFrame(() => modal.classList.add('drawer-open'));
  }

  function closeModal() {
    modal.classList.remove('drawer-open');
    setTimeout(() => modal.classList.add('hidden'), 300);
  }

  addProductBtn.addEventListener('click', () => openModal(null));
  modal.querySelectorAll('[data-close-modal]').forEach((el) => el.addEventListener('click', closeModal));

  const saveProductBtn = document.getElementById('save-product-btn');

  productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = productNameInput.value.trim();
    const price = Number(productPriceInput.value);
    const stockQty = Number(productStockQtyInput.value);
    if (!name || !price || price < 0) {
      toast('Completá el nombre y un precio válido');
      return;
    }
    if (Number.isNaN(stockQty) || stockQty < 0) {
      toast('La cantidad en stock tiene que ser 0 o más');
      return;
    }

    const images = pendingImages.filter(Boolean);
    const editId = productIdInput.value ? Number(productIdInput.value) : null;
    const payload = {
      name,
      description: productDescriptionInput.value.trim(),
      category: productCategoryInput.value.trim() || 'Otros',
      price,
      stockQty,
      images: images.length ? images : [FALLBACK_IMAGE],
    };

    saveProductBtn.disabled = true;
    saveProductBtn.textContent = 'GUARDANDO...';

    const request = editId ? updateProduct(editId, payload) : addProduct(payload);
    request
      .then(() => {
        closeModal();
        toast(editId ? 'Producto actualizado' : 'Producto agregado');
      })
      .catch(() => {
        toast('No se pudo guardar. Revisá tu conexión e intentá de nuevo.');
      })
      .finally(() => {
        saveProductBtn.disabled = false;
        saveProductBtn.textContent = 'GUARDAR';
      });
  });

  // ---- Init ----
  let initialized = false;
  subscribeToProducts((products) => {
    currentProducts = products;
    if (!initialized) {
      initialized = true;
      showView('dashboard');
    } else {
      renderCurrentView();
    }
  });
  seedProductsIfEmpty();
})();
