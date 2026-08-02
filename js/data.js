// Shared "database" for the cooperative site, backed by localStorage.
// Both index.html (catalog) and admin.html (control panel) read/write here,
// so changes made in the panel show up immediately in the client menu.

const STORAGE_KEYS = {
  PRODUCTS: 'anep_products',
  CART: 'anep_cart',
  ADMIN_AUTH: 'anep_admin_auth',
};

const ADMIN_PASSWORD = 'C0op3r4tiv4An3p';
const LOGO_CLICKS_TO_UNLOCK = 15;

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: 'Mermelada de Ciruela',
    description: 'Dulce tradicional elaborado con ciruelas seleccionadas de nuestra propia huerta escolar.',
    price: 3500,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5967Jh0NNog9TpcAQyt6mI1gmRqwWs7J5hn4A-DZg9mfLt1-1nxxh0MSvFzmXsrXaLXjXpdQJgdDu41m62gFmKz4KR7bfAB2R9rRB4sxP9pufqamVn9iDk388AxS3ectZG-Gv0uoC9GCRwrtINDbR9_h8U_5_7uTfwUsGI5TJC19aeNOHkRvNH8CTw_4e8fEf7qFMgAyiUdCCio_z4hbTFOZtFJRXBcs83TNffOF9-sofHmPaxlLqRLzTGM8iYJDODsY',
    stock: true,
  },
  {
    id: 2,
    name: 'Dulce de Durazno',
    description: 'Trozos de durazno confitados a fuego lento, con un toque sutil de vainilla natural.',
    price: 3800,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHYKQQKzGPA9kW_uQ8ZZ0qiVzX3yFJqVUcC655ARvYoeXk7HMZ5uM2h242TK6f4WAI1HfLV-H94gQMBJpkvo1_mJdiuo8Bb6zn354pFD0pIgELOSkvNkoOhuyw8M2QEaLGbYWFliNPxDUeClUlwBZqwGt_FMG_h9qUzoGCySPliN0q_fQK5n0PYGqHTjH_OxmxO-BMVkSNXmYBNR3d0wtwlJubxxBnIwPb8CWg6C0d2yiaLrLASW7W1ignyc_doPyfqVw',
    stock: true,
  },
  {
    id: 3,
    name: 'Jalea de Membrillo',
    description: 'Nuestra especialidad de invierno, de textura firme y color rubí intenso. Próxima cosecha en abril.',
    price: 4200,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADCDJ6-BIXtTWlNjrI8lUJ9PPR8_WlZ0MfWLFqTqjpSJhJsqK3TDl18LhUHD3ZrbXDqC_sqeVROtPU7UtCFySlvLKYuU_R5cb1aI_jbGqxNy_Zn_TbF4DRuhQgDAD76mhz9EVPT7VD1LVkXZ10f-UKOeIPgMnOEHtdhiSLZYtesirokqLqn67yGPQo6_6S91joNGuKSP_3ejGqjZJ0oEAZf752S02-OVrN_0TPCKy_bkfkfnBXz02Pd9rmOoXjn3M7JtM',
    stock: false,
  },
  {
    id: 4,
    name: 'Mermelada de Higo',
    description: 'Edición limitada elaborada con higos blancos y un toque de nuez, receta tradicional.',
    price: 4500,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVWA0Q-MumPkHL-6Q_EpT6C_hHJta0HCI0g5OZZhXXWTYxOjiVkRGXs8qw6etxj_40qsejNiatdI1-XNvIbS-x9Bhykpn5rqFuf6htUfXdt-OSazqsf6RMmXgTht7ELPjQX_PAAWHLP4trf9YGnc-GuTtka_QRgebhJy4RAzbqookrdq7CbG0N7f_JDExAi5twiIYarr9SL3OwVtFibHKtEE3nvJ3_uS4VS0ASeKd0AeVyWoPHLOhdmk_rBjZ2oJFIBLU',
    stock: true,
  },
  {
    id: 5,
    name: 'Mermelada de Frutilla',
    description: 'Elaborada con frutillas frescas de temporada y azúcar orgánica.',
    price: 4500,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-MN8mKAre7004OjbXFyfhEIfOesTbqoM5xHyQQinXFS-MFG_0BLURpchWJ-v0oKbdXPACF7Atmm8sN3Zx1Gb8lE7G6_CjIVurUzuDXHwDS0qIcnVpuVLtvcNjYzbRiZPd5dRrnt0gb-T7Cw3dmM4IrS4RC91aU8iqUog6ZxhIRhRx2dOfva8vw5sgiSsfUuSIVG-Pqv1-fBjJ5xAT4Z2-GwgoOR4u3oCA1NJmDaWgnnUqByR53wIO7g',
    stock: true,
  },
  {
    id: 6,
    name: 'Conservas de Durazno',
    description: 'Duraznos en mitades al natural, receta tradicional.',
    price: 5200,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBj5ecEXsbafvDMCsxrhiSOiVk0_PN-aOETmKtBsratYK_HxzHAoro2Ii20uBjZrlVknxAZvOs0SsS2zxG9GTvTZoACwcDPRUt25SjYhSrBdY022KHOm1Neww8FUvLOyEfOvWRJmvxHTKddtG7ENsUc-Z6OAr0k0fSLmn3zVROSnoDwxFRxHARs6x7U8Y4Wj83kwynW8wxMlkNITdsqZk_Rc8ko9LJU_HiLI35NL93whFPsrx1taeVuYA',
    stock: true,
  },
];

function getProducts() {
  const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (!raw) {
    saveProducts(DEFAULT_PRODUCTS);
    return DEFAULT_PRODUCTS.slice();
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_PRODUCTS.slice();
  } catch {
    return DEFAULT_PRODUCTS.slice();
  }
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

function nextProductId(products) {
  return products.reduce((max, p) => Math.max(max, p.id), 0) + 1;
}

function getCart() {
  const raw = localStorage.getItem(STORAGE_KEYS.CART);
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
}

function formatPrice(amount) {
  return '$' + Number(amount || 0).toLocaleString('es-AR');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}
