const phone = '5521998454725';
const pix = 'luciana.barros19766@gmail.com';
const adminPassword = 'lu2026';

const defaultProducts = [
  {
    "id": "bolinho-queijo",
    "name": "Bolinho de Queijo",
    "category": "Salgados",
    "price": "",
    "image": "foto-10.jpg"
  },
  {
    "id": "risole-frango",
    "name": "Risole de Frango",
    "category": "Salgados",
    "price": "",
    "image": "foto-07.jpg"
  },
  {
    "id": "coxinha",
    "name": "Coxinha",
    "category": "Salgados",
    "price": "",
    "image": "foto-05.jpg"
  },
  {
    "id": "kibe-frito",
    "name": "Kibe Frito",
    "category": "Salgados",
    "price": "",
    "image": "foto-11.jpg"
  },
  {
    "id": "kibe-forno",
    "name": "Kibe de Forno",
    "category": "Salgados",
    "price": "",
    "image": "foto-16.jpg"
  },
  {
    "id": "empadinha",
    "name": "Empadinha",
    "category": "Salgados",
    "price": "",
    "image": "foto-18.jpg"
  },
  {
    "id": "croquete-frango",
    "name": "Croquete de Frango",
    "category": "Salgados",
    "price": "",
    "image": "foto-01.jpg"
  },
  {
    "id": "espetinho-frango",
    "name": "Espetinho de Frango",
    "category": "Salgados",
    "price": "",
    "image": "foto-03.jpg"
  },
  {
    "id": "escondidinho-camarao",
    "name": "Escondidinho de Camarão",
    "category": "Salgados",
    "price": "",
    "image": "foto-09.jpg"
  },
  {
    "id": "doce-aipim",
    "name": "Doce de Aipim",
    "category": "Doces",
    "price": "",
    "image": "foto-17.jpg"
  },
  {
    "id": "bolo-pote",
    "name": "Bolo de Pote",
    "category": "Doces",
    "price": "",
    "image": "foto-04.jpg"
  },
  {
    "id": "combo-festa",
    "name": "Combo para Festa",
    "category": "Encomendas",
    "price": "",
    "image": "foto-15.jpg"
  }
];

const galleryPhotos = [
  "assets/fotos/foto-01.jpg",
  "assets/fotos/foto-02.jpg",
  "assets/fotos/foto-03.jpg",
  "assets/fotos/foto-04.jpg",
  "assets/fotos/foto-05.jpg",
  "assets/fotos/foto-06.jpg",
  "assets/fotos/foto-07.jpg",
  "assets/fotos/foto-08.jpg",
  "assets/fotos/foto-09.jpg",
  "assets/fotos/foto-10.jpg",
  "assets/fotos/foto-11.jpg",
  "assets/fotos/foto-12.jpg",
  "assets/fotos/foto-13.jpg",
  "assets/fotos/foto-14.jpg",
  "assets/fotos/foto-15.jpg",
  "assets/fotos/foto-16.jpg",
  "assets/fotos/foto-17.jpg",
  "assets/fotos/foto-18.jpg",
  "assets/fotos/foto-19.jpg"
];

let products = JSON.parse(localStorage.getItem('salgadosLuProducts') || 'null') || defaultProducts;
let cart = JSON.parse(localStorage.getItem('salgadosLuCart') || '{}');
let editing = false;
let selectedCategory = 'Todos';

function saveProducts() {
  localStorage.setItem('salgadosLuProducts', JSON.stringify(products));
}

function saveCart() {
  localStorage.setItem('salgadosLuCart', JSON.stringify(cart));
}

function moneyText(product) {
  return product.price && product.price.trim() ? product.price : 'Consulte o preço';
}

function categories() {
  return ['Todos', ...Array.from(new Set(products.map(p => p.category)))];
}

function renderFilters() {
  const filters = document.getElementById('filters');
  filters.innerHTML = '';
  categories().forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter' + (cat === selectedCategory ? ' active' : '');
    btn.textContent = cat;
    btn.onclick = () => {
      selectedCategory = cat;
      render();
    };
    filters.appendChild(btn);
  });
}

function render() {
  renderFilters();
  const menu = document.getElementById('menu');
  menu.innerHTML = '';
  const filtered = products.filter(p => selectedCategory === 'Todos' || p.category === selectedCategory);

  filtered.forEach(product => {
    const index = products.findIndex(p => p.id === product.id);
    const qty = cart[product.id] || 0;
    const card = document.createElement('article');
    card.className = 'item';
    card.innerHTML = `
      <img class="item-img" src="assets/fotos/${product.image}" alt="${product.name}">
      <div class="item-body">
        <h3>${product.name}</h3>
        <div class="cat">${product.category}</div>
        ${editing ? `
          <div class="edit-row">
            <label>Preço</label>
            <input value="${product.price || ''}" placeholder="Ex: R$ 8,00 ou 100 un. R$ 85,00" oninput="updatePrice(${index}, this.value)">
          </div>
        ` : `<div class="price">${moneyText(product)}</div>`}
        <div class="qty">
          <button aria-label="Diminuir" onclick="dec('${product.id}')">−</button>
          <span>${qty}</span>
          <button aria-label="Aumentar" onclick="inc('${product.id}')">+</button>
        </div>
      </div>
    `;
    menu.appendChild(card);
  });
  updateOrderBar();
}

function renderGallery() {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';
  galleryPhotos.forEach((src, idx) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = `Foto dos salgados ${idx + 1}`;
    img.loading = 'lazy';
    gallery.appendChild(img);
  });
}

function updatePrice(index, value) {
  products[index].price = value;
  saveProducts();
  updateOrderBar();
}

function inc(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  render();
}

function dec(id) {
  cart[id] = Math.max((cart[id] || 0) - 1, 0);
  if (cart[id] === 0) delete cart[id];
  saveCart();
  render();
}

function clearCart() {
  cart = {};
  saveCart();
  render();
}

function selectedItems() {
  return Object.keys(cart)
    .filter(id => cart[id] > 0)
    .map(id => ({ product: products.find(p => p.id === id), qty: cart[id] }))
    .filter(item => item.product);
}

function whatsLink(customMessage) {
  const message = customMessage || buildOrderMessage();
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function buildOrderMessage() {
  const items = selectedItems();
  let msg = 'Olá! Gostaria de fazer um pedido na Salgados da Lu.\n\n';
  if (!items.length) {
    msg += 'Pode me enviar o cardápio e valores?';
    return msg;
  }
  items.forEach(({ product, qty }) => {
    msg += `• ${qty}x ${product.name}${product.price ? ' - ' + product.price : ''}\n`;
  });
  msg += '\nForma de pagamento: ';
  msg += '\nEntrega ou retirada: ';
  msg += '\nEndereço/bairro: ';
  return msg;
}

function updateOrderBar() {
  const bar = document.getElementById('orderBar');
  const count = document.getElementById('orderCount');
  const preview = document.getElementById('orderPreview');
  const finish = document.getElementById('finishOrder');
  const items = selectedItems();
  if (!items.length) {
    bar.classList.add('hidden');
    return;
  }
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  count.textContent = `${totalQty} item(ns) no pedido`;
  preview.textContent = items.slice(0, 3).map(item => `${item.qty}x ${item.product.name}`).join(', ') + (items.length > 3 ? '...' : '');
  finish.href = whatsLink();
  bar.classList.remove('hidden');
}

function copyPix() {
  navigator.clipboard.writeText(pix).then(() => {
    alert('Chave Pix copiada!');
  }).catch(() => {
    alert('Chave Pix: ' + pix);
  });
}

document.getElementById('whatsHero').href = whatsLink('Olá! Gostaria de fazer um pedido na Salgados da Lu.');
document.getElementById('whatsContact').href = whatsLink('Olá! Gostaria de fazer um pedido na Salgados da Lu.');
document.getElementById('resetBtn').onclick = clearCart;
document.getElementById('adminBtn').onclick = () => {
  if (!editing) {
    const pass = prompt('Digite a senha para editar os preços:');
    if (pass !== adminPassword) {
      if (pass !== null) alert('Senha incorreta.');
      return;
    }
  }
  editing = !editing;
  document.getElementById('adminBtn').textContent = editing ? 'Fechar edição' : 'Editar preços';
  render();
  if (editing) alert('Modo edição ativado. Altere os preços nos campos dos produtos.');
};

renderGallery();
render();
