// Shared "database" for the cooperative site.
// Products live in Firebase Realtime Database, so a change made in the
// admin panel (on any device) pushes live to every open index.html/admin.html
// tab. The cart stays in localStorage since it's specific to each visitor.

const STORAGE_KEYS = {
  CART: 'anep_cart',
  ADMIN_AUTH: 'anep_admin_auth',
};

const ADMIN_PASSWORD = 'C0op3r4tiv4An3p';
const LOGO_CLICKS_TO_UNLOCK = 15;

const firebaseConfig = {
  apiKey: 'AIzaSyADcmtv6mWS9864OKFOEv0SesS-Rkmm8jA',
  authDomain: 'ancep-cooperativa.firebaseapp.com',
  databaseURL: 'https://ancep-cooperativa-default-rtdb.firebaseio.com',
  projectId: 'ancep-cooperativa',
  storageBucket: 'ancep-cooperativa.firebasestorage.app',
  messagingSenderId: '723684943892',
  appId: '1:723684943892:web:5fbbb1f08eb9faf149df01',
};

firebase.initializeApp(firebaseConfig);
const productsRef = firebase.database().ref('products');

const FALLBACK_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5967Jh0NNog9TpcAQyt6mI1gmRqwWs7J5hn4A-DZg9mfLt1-1nxxh0MSvFzmXsrXaLXjXpdQJgdDu41m62gFmKz4KR7bfAB2R9rRB4sxP9pufqamVn9iDk388AxS3ectZG-Gv0uoC9GCRwrtINDbR9_h8U_5_7uTfwUsGI5TJC19aeNOHkRvNH8CTw_4e8fEf7qFMgAyiUdCCio_z4hbTFOZtFJRXBcs83TNffOF9-sofHmPaxlLqRLzTGM8iYJDODsY';

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: 'Mermelada de Ciruela',
    description: 'Dulce tradicional elaborado con ciruelas seleccionadas de nuestra propia huerta escolar.',
    price: 3500,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuD5967Jh0NNog9TpcAQyt6mI1gmRqwWs7J5hn4A-DZg9mfLt1-1nxxh0MSvFzmXsrXaLXjXpdQJgdDu41m62gFmKz4KR7bfAB2R9rRB4sxP9pufqamVn9iDk388AxS3ectZG-Gv0uoC9GCRwrtINDbR9_h8U_5_7uTfwUsGI5TJC19aeNOHkRvNH8CTw_4e8fEf7qFMgAyiUdCCio_z4hbTFOZtFJRXBcs83TNffOF9-sofHmPaxlLqRLzTGM8iYJDODsY'],
    category: 'Mermeladas',
    stockQty: 14,
  },
  {
    id: 2,
    name: 'Dulce de Durazno',
    description: 'Trozos de durazno confitados a fuego lento, con un toque sutil de vainilla natural.',
    price: 3800,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCHYKQQKzGPA9kW_uQ8ZZ0qiVzX3yFJqVUcC655ARvYoeXk7HMZ5uM2h242TK6f4WAI1HfLV-H94gQMBJpkvo1_mJdiuo8Bb6zn354pFD0pIgELOSkvNkoOhuyw8M2QEaLGbYWFliNPxDUeClUlwBZqwGt_FMG_h9qUzoGCySPliN0q_fQK5n0PYGqHTjH_OxmxO-BMVkSNXmYBNR3d0wtwlJubxxBnIwPb8CWg6C0d2yiaLrLASW7W1ignyc_doPyfqVw'],
    category: 'Dulces',
    stockQty: 9,
  },
  {
    id: 3,
    name: 'Jalea de Membrillo',
    description: 'Nuestra especialidad de invierno, de textura firme y color rubí intenso. Próxima cosecha en abril.',
    price: 4200,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuADCDJ6-BIXtTWlNjrI8lUJ9PPR8_WlZ0MfWLFqTqjpSJhJsqK3TDl18LhUHD3ZrbXDqC_sqeVROtPU7UtCFySlvLKYuU_R5cb1aI_jbGqxNy_Zn_TbF4DRuhQgDAD76mhz9EVPT7VD1LVkXZ10f-UKOeIPgMnOEHtdhiSLZYtesirokqLqn67yGPQo6_6S91joNGuKSP_3ejGqjZJ0oEAZf752S02-OVrN_0TPCKy_bkfkfnBXz02Pd9rmOoXjn3M7JtM'],
    category: 'Dulces',
    stockQty: 0,
  },
  {
    id: 4,
    name: 'Mermelada de Higo',
    description: 'Edición limitada elaborada con higos blancos y un toque de nuez, receta tradicional.',
    price: 4500,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBVWA0Q-MumPkHL-6Q_EpT6C_hHJta0HCI0g5OZZhXXWTYxOjiVkRGXs8qw6etxj_40qsejNiatdI1-XNvIbS-x9Bhykpn5rqFuf6htUfXdt-OSazqsf6RMmXgTht7ELPjQX_PAAWHLP4trf9YGnc-GuTtka_QRgebhJy4RAzbqookrdq7CbG0N7f_JDExAi5twiIYarr9SL3OwVtFibHKtEE3nvJ3_uS4VS0ASeKd0AeVyWoPHLOhdmk_rBjZ2oJFIBLU'],
    category: 'Mermeladas',
    stockQty: 6,
  },
  {
    id: 5,
    name: 'Mermelada de Frutilla',
    description: 'Elaborada con frutillas frescas de temporada y azúcar orgánica.',
    price: 4500,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuD-MN8mKAre7004OjbXFyfhEIfOesTbqoM5xHyQQinXFS-MFG_0BLURpchWJ-v0oKbdXPACF7Atmm8sN3Zx1Gb8lE7G6_CjIVurUzuDXHwDS0qIcnVpuVLtvcNjYzbRiZPd5dRrnt0gb-T7Cw3dmM4IrS4RC91aU8iqUog6ZxhIRhRx2dOfva8vw5sgiSsfUuSIVG-Pqv1-fBjJ5xAT4Z2-GwgoOR4u3oCA1NJmDaWgnnUqByR53wIO7g'],
    category: 'Mermeladas',
    stockQty: 20,
  },
  {
    id: 6,
    name: 'Conservas de Durazno',
    description: 'Duraznos en mitades al natural, receta tradicional.',
    price: 5200,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBj5ecEXsbafvDMCsxrhiSOiVk0_PN-aOETmKtBsratYK_HxzHAoro2Ii20uBjZrlVknxAZvOs0SsS2zxG9GTvTZoACwcDPRUt25SjYhSrBdY022KHOm1Neww8FUvLOyEfOvWRJmvxHTKddtG7ENsUc-Z6OAr0k0fSLmn3zVROSnoDwxFRxHARs6x7U8Y4Wj83kwynW8wxMlkNITdsqZk_Rc8ko9LJU_HiLI35NL93whFPsrx1taeVuYA'],
    category: 'Conservas',
    stockQty: 11,
  },
];

// Brings an older record (single `image` string + boolean `stock`) up to the
// current shape (`images` array + numeric `stockQty`) without needing a
// one-off migration script — it just upgrades itself the next time it's read,
// and any admin edit persists the new shape going forward.
function normalizeProduct(id, raw) {
  const images = Array.isArray(raw.images) && raw.images.length
    ? raw.images
    : (raw.image ? [raw.image] : [FALLBACK_IMAGE]);
  const stockQty = typeof raw.stockQty === 'number'
    ? raw.stockQty
    : (raw.stock ? 10 : 0);
  return {
    id,
    name: raw.name,
    description: raw.description,
    price: raw.price,
    category: raw.category || 'Otros',
    images,
    stockQty,
  };
}

// Populates the database with the starter catalog the very first time it's
// ever empty (e.g. brand new Firebase project). Safe to call on every page
// load — it's a no-op once there's real data.
function seedProductsIfEmpty() {
  productsRef.once('value').then((snapshot) => {
    if (snapshot.exists()) return;
    const seed = {};
    DEFAULT_PRODUCTS.forEach((p) => {
      seed[p.id] = { name: p.name, description: p.description, price: p.price, images: p.images, category: p.category, stockQty: p.stockQty };
    });
    productsRef.set(seed);
  });
}

// Calls callback(productsArray) once immediately and again every time the
// data changes on the server — from this tab or from anyone else's.
function subscribeToProducts(callback) {
  productsRef.on('value', (snapshot) => {
    const val = snapshot.val();
    const products = val
      ? Object.keys(val).map((key) => normalizeProduct(Number(key), val[key])).sort((a, b) => a.id - b.id)
      : [];
    callback(products);
  });
}

function addProduct(product) {
  return productsRef.once('value').then((snapshot) => {
    const val = snapshot.val() || {};
    const nextId = Object.keys(val).reduce((max, key) => Math.max(max, Number(key)), 0) + 1;
    return productsRef.child(String(nextId)).set(product);
  });
}

function updateProduct(id, changes) {
  return productsRef.child(String(id)).update(changes);
}

function deleteProduct(id) {
  return productsRef.child(String(id)).remove();
}

// Atomically takes `qty` units off a product's stock without going negative,
// even if two people check out at nearly the same time.
function decrementStock(id, qty) {
  return productsRef.child(String(id)).child('stockQty').transaction((current) => {
    const cur = typeof current === 'number' ? current : 0;
    return Math.max(0, cur - qty);
  });
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

// escapeHtml only escapes &, < and > — safe inside element text content, but
// not enough for a value placed inside a double-quoted HTML attribute (like
// a JSON string, which contains its own double quotes). Use this instead
// whenever the value goes inside an attribute="...".
function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
