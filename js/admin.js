(function () {
  const PAGE_SIZE = 5;
  let currentPage = 1;
  let pendingImage = null; // data URL for the product being created/edited

  const navDashboard = document.getElementById('nav-dashboard');
  const navInventario = document.getElementById('nav-inventario');
  const viewDashboard = document.getElementById('view-dashboard');
  const viewInventario = document.getElementById('view-inventario');
  const headerTitle = document.getElementById('header-title');

  const tableBody = document.getElementById('product-table-body');
  const paginationLabel = document.getElementById('pagination-label');
  const pagePrev = document.getElementById('page-prev');
  const pageNext = document.getElementById('page-next');

  const modal = document.getElementById('product-modal');
  const modalTitle = document.getElementById('modal-title');
  const productForm = document.getElementById('product-form');
  const productIdInput = document.getElementById('product-id');
  const productNameInput = document.getElementById('product-name');
  const productDescriptionInput = document.getElementById('product-description');
  const productPriceInput = document.getElementById('product-price');
  const productStockInput = document.getElementById('product-stock');
  const imageDrop = document.getElementById('image-drop');
  const imageDropEmpty = document.getElementById('image-drop-empty');
  const imageInput = document.getElementById('image-input');
  const addProductBtn = document.getElementById('add-product-btn');
  const logoutLink = document.getElementById('logout-link');

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

  // ---- View switching ----
  function showView(view) {
    const isDashboard = view === 'dashboard';
    viewDashboard.classList.toggle('hidden', !isDashboard);
    viewInventario.classList.toggle('hidden', isDashboard);
    navDashboard.classList.toggle('bg-secondary-container', isDashboard);
    navDashboard.classList.toggle('text-on-secondary-container', isDashboard);
    navDashboard.classList.toggle('shadow-sm', isDashboard);
    navDashboard.classList.toggle('text-on-surface-variant', !isDashboard);
    navInventario.classList.toggle('bg-secondary-container', !isDashboard);
    navInventario.classList.toggle('text-on-secondary-container', !isDashboard);
    navInventario.classList.toggle('shadow-sm', !isDashboard);
    navInventario.classList.toggle('text-on-surface-variant', isDashboard);
    headerTitle.textContent = isDashboard ? 'Panel General' : 'Inventario';
    if (!isDashboard) renderTable();
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
    const products = getProducts();
    document.getElementById('stat-total').textContent = products.length;
    document.getElementById('stat-available').textContent = products.filter((p) => p.stock).length;
    document.getElementById('stat-out').textContent = products.filter((p) => !p.stock).length;
  }

  // ---- Table / Inventory ----
  function renderTable() {
    const products = getProducts();
    const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
    currentPage = Math.min(currentPage, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = products.slice(start, start + PAGE_SIZE);

    tableBody.innerHTML = pageItems.map(renderRow).join('') || `
      <tr><td colspan="6" class="p-10 text-center text-on-surface-variant">No hay productos cargados todavía.</td></tr>`;

    const shownFrom = products.length === 0 ? 0 : start + 1;
    const shownTo = Math.min(start + PAGE_SIZE, products.length);
    paginationLabel.textContent = `Mostrando ${shownFrom}-${shownTo} de ${products.length} productos`;
    pagePrev.disabled = currentPage <= 1;
    pageNext.disabled = currentPage >= totalPages;
  }

  function renderRow(product) {
    return `
    <tr class="border-b border-surface-variant hover:bg-surface-bright transition-colors group ${product.stock ? '' : 'bg-error-container/10'}">
      <td class="p-6">
        <img class="w-12 h-12 rounded-lg object-cover shadow-sm ${product.stock ? '' : 'opacity-50 grayscale-[50%]'}" src="${escapeHtml(product.image)}">
      </td>
      <td class="p-6 font-headline-lg-mobile text-headline-lg-mobile ${product.stock ? 'text-primary' : 'text-on-surface-variant'}">${escapeHtml(product.name)}</td>
      <td class="p-6 text-on-surface-variant hidden md:table-cell truncate max-w-[200px]">${escapeHtml(product.description)}</td>
      <td class="p-6 ${product.stock ? '' : 'text-on-surface-variant'}">${formatPrice(product.price)}</td>
      <td class="p-6 text-center">
        <label class="relative inline-flex items-center cursor-pointer">
          <input data-toggle-stock="${product.id}" class="sr-only peer" type="checkbox" ${product.stock ? 'checked' : ''}>
          <div class="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
        </label>
      </td>
      <td class="p-6 text-right">
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
    if (deleteBtn) deleteProduct(Number(deleteBtn.dataset.delete));
  });

  tableBody.addEventListener('change', (e) => {
    const toggle = e.target.closest('[data-toggle-stock]');
    if (!toggle) return;
    const products = getProducts();
    const product = products.find((p) => p.id === Number(toggle.dataset.toggleStock));
    if (!product) return;
    product.stock = toggle.checked;
    saveProducts(products);
    renderTable();
    toast(`${product.name}: ${product.stock ? 'marcado como disponible' : 'marcado sin stock'}`);
  });

  pagePrev.addEventListener('click', () => { currentPage -= 1; renderTable(); });
  pageNext.addEventListener('click', () => { currentPage += 1; renderTable(); });

  function deleteProduct(id) {
    const products = getProducts();
    const product = products.find((p) => p.id === id);
    if (!product) return;
    if (!confirm(`¿Eliminar "${product.name}" del catálogo?`)) return;
    saveProducts(products.filter((p) => p.id !== id));
    renderTable();
    renderDashboard();
    toast('Producto eliminado');
  }

  // ---- Modal (create / edit) ----
  function openModal(editId) {
    productForm.reset();
    pendingImage = null;
    imageDrop.style.backgroundImage = 'none';
    imageDropEmpty.classList.remove('hidden');
    productStockInput.checked = true;

    if (editId) {
      const product = getProducts().find((p) => p.id === editId);
      if (!product) return;
      modalTitle.textContent = 'Editar Producto';
      productIdInput.value = product.id;
      productNameInput.value = product.name;
      productDescriptionInput.value = product.description;
      productPriceInput.value = product.price;
      productStockInput.checked = !!product.stock;
      pendingImage = product.image;
      imageDrop.style.backgroundImage = `url('${product.image}')`;
      imageDropEmpty.classList.add('hidden');
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

  imageDrop.addEventListener('click', () => imageInput.click());
  imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      pendingImage = reader.result;
      imageDrop.style.backgroundImage = `url('${pendingImage}')`;
      imageDropEmpty.classList.add('hidden');
    };
    reader.readAsDataURL(file);
  });

  const FALLBACK_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5967Jh0NNog9TpcAQyt6mI1gmRqwWs7J5hn4A-DZg9mfLt1-1nxxh0MSvFzmXsrXaLXjXpdQJgdDu41m62gFmKz4KR7bfAB2R9rRB4sxP9pufqamVn9iDk388AxS3ectZG-Gv0uoC9GCRwrtINDbR9_h8U_5_7uTfwUsGI5TJC19aeNOHkRvNH8CTw_4e8fEf7qFMgAyiUdCCio_z4hbTFOZtFJRXBcs83TNffOF9-sofHmPaxlLqRLzTGM8iYJDODsY';

  productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = productNameInput.value.trim();
    const price = Number(productPriceInput.value);
    if (!name || !price || price < 0) {
      toast('Completá el nombre y un precio válido');
      return;
    }

    const products = getProducts();
    const editId = productIdInput.value ? Number(productIdInput.value) : null;

    if (editId) {
      const product = products.find((p) => p.id === editId);
      if (product) {
        product.name = name;
        product.description = productDescriptionInput.value.trim();
        product.price = price;
        product.stock = productStockInput.checked;
        product.image = pendingImage || product.image;
      }
    } else {
      products.push({
        id: nextProductId(products),
        name,
        description: productDescriptionInput.value.trim(),
        price,
        image: pendingImage || FALLBACK_IMAGE,
        stock: productStockInput.checked,
      });
    }

    saveProducts(products);
    closeModal();
    renderTable();
    renderDashboard();
    toast(editId ? 'Producto actualizado' : 'Producto agregado');
  });

  // ---- Init ----
  showView('dashboard');
})();
