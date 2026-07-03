const phone = '5521998454725';
const pix = 'luciana.barros19766@gmail.com';
const cartStorageKey = 'salgadosLuCart';

const products = [
  { id: 'bolinho-queijo', name: 'Bolinho de Queijo', category: 'Salgados', price: '', image: 'foto-10.jpg' },
  { id: 'risole-frango', name: 'Risole de Frango', category: 'Salgados', price: '', image: 'foto-07.jpg' },
  { id: 'coxinha', name: 'Coxinha', category: 'Salgados', price: '', image: 'foto-05.jpg' },
  { id: 'kibe-frito', name: 'Kibe Frito', category: 'Salgados', price: '', image: 'foto-11.jpg' },
  { id: 'kibe-forno', name: 'Kibe de Forno', category: 'Salgados', price: '', image: 'foto-16.jpg' },
  { id: 'empadinha', name: 'Empadinha', category: 'Salgados', price: '', image: 'foto-18.jpg' },
  { id: 'croquete-frango', name: 'Croquete de Frango', category: 'Salgados', price: '', image: 'foto-01.jpg' },
  { id: 'espetinho-frango', name: 'Espetinho de Frango', category: 'Salgados', price: '', image: 'foto-03.jpg' },
  { id: 'escondidinho-camarao', name: 'Escondidinho de Camarão', category: 'Salgados', price: '', image: 'foto-09.jpg' },
  { id: 'doce-aipim', name: 'Doce de Aipim', category: 'Doces', price: '', image: 'foto-17.jpg' },
  { id: 'bolo-pote', name: 'Bolo de Pote', category: 'Doces', price: '', image: 'foto-04.jpg' },
  { id: 'combo-festa', name: 'Combo para Festa', category: 'Encomendas', price: '', image: 'foto-15.jpg' }
];

const galleryPhotos = [
  { src: 'assets/fotos/foto-02.jpg', alt: 'Salgados preparados pela Lu' },
  { src: 'assets/fotos/foto-05.jpg', alt: 'Coxinhas da Salgados da Lu' },
  { src: 'assets/fotos/foto-08.jpg', alt: 'Encomenda de salgados pronta' },
  { src: 'assets/fotos/foto-13.jpg', alt: 'Salgados variados da Lu' },
  { src: 'assets/fotos/foto-16.jpg', alt: 'Kibe de forno preparado pela Lu' },
  { src: 'assets/fotos/foto-19.jpg', alt: 'Produção da Salgados da Lu' }
];

let cart = loadCart();
let selectedCategory = 'Todos';

function loadCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(cartStorageKey) || '{}');
    return savedCart && typeof savedCart === 'object' && !Array.isArray(savedCart) ? savedCart : {};
  } catch {
    return {};
  }
}

function saveCart() {
  try {
    localStorage.setItem(cartStorageKey, JSON.stringify(cart));
  } catch {
    // O pedido continua funcionando mesmo se o navegador bloquear o armazenamento local.
  }
}

function categories() {
  return ['Todos', ...new Set(products.map((product) => product.category))];
}

function moneyText(product) {
  return product.price.trim() || 'Consulte o valor';
}

function renderFilters() {
  const filters = document.getElementById('filters');
  filters.replaceChildren();

  categories().forEach((category) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `filter${category === selectedCategory ? ' active' : ''}`;
    button.textContent = category;
    button.setAttribute('aria-pressed', String(category === selectedCategory));
    button.addEventListener('click', () => {
      selectedCategory = category;
      render();
    });
    filters.appendChild(button);
  });
}

function createQuantityButton(symbol, label, disabled, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = symbol;
  button.setAttribute('aria-label', label);
  button.disabled = disabled;
  button.addEventListener('click', onClick);
  return button;
}

function setImageDimensions(image, fileName) {
  const isLandscape = fileName.endsWith('foto-16.jpg');
  image.width = isLandscape ? 1000 : 562;
  image.height = isLandscape ? 562 : 1000;
}

function createProductCard(product) {
  const quantity = Number(cart[product.id]) || 0;
  const card = document.createElement('article');
  card.className = 'item';

  const image = document.createElement('img');
  image.className = 'item-img';
  image.src = `assets/fotos/${product.image}`;
  image.alt = product.name;
  setImageDimensions(image, product.image);
  image.loading = 'lazy';

  const body = document.createElement('div');
  body.className = 'item-body';

  const title = document.createElement('h3');
  title.textContent = product.name;

  const category = document.createElement('div');
  category.className = 'cat';
  category.textContent = product.category;

  const price = document.createElement('div');
  price.className = 'price';
  price.textContent = moneyText(product);

  const priceNote = document.createElement('span');
  priceNote.className = 'price-note';
  priceNote.textContent = 'Confirmação pelo WhatsApp';
  price.appendChild(priceNote);

  const quantityControl = document.createElement('div');
  quantityControl.className = 'qty';

  const decreaseButton = createQuantityButton(
    '−',
    `Diminuir quantidade de ${product.name}`,
    quantity === 0,
    () => changeQuantity(product.id, -1)
  );

  const quantityValue = document.createElement('span');
  quantityValue.className = 'qty-value';
  quantityValue.textContent = quantity;
  quantityValue.setAttribute('aria-label', `${quantity} de ${product.name} no pedido`);
  quantityValue.setAttribute('aria-live', 'polite');

  const increaseButton = createQuantityButton(
    '+',
    `Adicionar ${product.name}`,
    false,
    () => changeQuantity(product.id, 1)
  );

  quantityControl.append(decreaseButton, quantityValue, increaseButton);
  body.append(title, category, price, quantityControl);
  card.append(image, body);
  return card;
}

function render() {
  renderFilters();
  const menu = document.getElementById('menu');
  const visibleProducts = products.filter(
    (product) => selectedCategory === 'Todos' || product.category === selectedCategory
  );

  menu.replaceChildren(...visibleProducts.map(createProductCard));
  updateOrderBar();
}

function renderGallery() {
  const gallery = document.getElementById('gallery');
  const figures = galleryPhotos.map((photo) => {
    const figure = document.createElement('figure');
    const image = document.createElement('img');
    image.src = photo.src;
    image.alt = photo.alt;
    setImageDimensions(image, photo.src);
    image.loading = 'lazy';
    figure.appendChild(image);
    return figure;
  });
  gallery.replaceChildren(...figures);
}

function changeQuantity(id, amount) {
  const currentQuantity = Number(cart[id]) || 0;
  const nextQuantity = Math.max(currentQuantity + amount, 0);

  if (nextQuantity === 0) {
    delete cart[id];
  } else {
    cart[id] = nextQuantity;
  }

  saveCart();
  render();
}

function clearCart() {
  cart = {};
  saveCart();
  render();
}

function selectedItems() {
  return Object.entries(cart)
    .filter(([, quantity]) => Number(quantity) > 0)
    .map(([id, quantity]) => ({
      product: products.find((product) => product.id === id),
      quantity: Number(quantity)
    }))
    .filter((item) => item.product);
}

function buildWhatsAppLink(message) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function buildOrderMessage() {
  const items = selectedItems();
  const lines = ['Olá! Gostaria de fazer um pedido na Salgados da Lu.', ''];

  if (!items.length) {
    lines.push('Pode me enviar o cardápio, os valores e a disponibilidade?');
    return lines.join('\n');
  }

  lines.push('Meu pedido:');
  items.forEach(({ product, quantity }) => {
    lines.push(`• ${quantity}x ${product.name}${product.price ? ` — ${product.price}` : ''}`);
  });
  lines.push('', 'Forma de pagamento:', 'Entrega ou retirada:', 'Bairro/endereço:');
  return lines.join('\n');
}

function updateOrderBar() {
  const orderBar = document.getElementById('orderBar');
  const orderCount = document.getElementById('orderCount');
  const orderPreview = document.getElementById('orderPreview');
  const finishOrder = document.getElementById('finishOrder');
  const items = selectedItems();

  if (!items.length) {
    orderBar.classList.add('hidden');
    document.body.classList.remove('has-order-bar');
    return;
  }

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const preview = items
    .slice(0, 3)
    .map((item) => `${item.quantity}x ${item.product.name}`)
    .join(', ');

  orderCount.textContent = `${totalQuantity} ${totalQuantity === 1 ? 'item' : 'itens'} no pedido`;
  orderPreview.textContent = preview + (items.length > 3 ? '…' : '');
  finishOrder.href = buildWhatsAppLink(buildOrderMessage());
  orderBar.classList.remove('hidden');
  document.body.classList.add('has-order-bar');
}

async function copyPix() {
  const status = document.getElementById('pixStatus');

  try {
    await navigator.clipboard.writeText(pix);
    status.textContent = 'Chave Pix copiada.';
  } catch {
    status.textContent = 'Não foi possível copiar automaticamente. Selecione a chave acima.';
  }
}

function setupLinks() {
  const greeting = 'Olá! Gostaria de fazer um pedido na Salgados da Lu.';
  const directLink = buildWhatsAppLink(greeting);
  document.getElementById('whatsHero').href = directLink;
  document.getElementById('whatsContact').href = directLink;
}

document.getElementById('resetBtn').addEventListener('click', clearCart);
document.getElementById('copyPixBtn').addEventListener('click', copyPix);

setupLinks();
renderGallery();
render();
