const phone = '5521998454725';
const pix = 'luciana.barros19766@gmail.com';
const cartStorageKey = 'salgadosLuCart';
const orderReferenceKey = 'salgadosLuOrderReference';
const pixOwner = 'Luciana de Barros Santos';

const fallbackProducts = [
  { id: 'bolinho-queijo', name: 'Bolinho de Queijo', category: 'Salgados', price: '', image_url: 'assets/fotos/foto-10.jpg' },
  { id: 'risole-frango', name: 'Risole de Frango', category: 'Salgados', price: '', image_url: 'assets/fotos/foto-07.jpg' },
  { id: 'coxinha', name: 'Coxinha', category: 'Salgados', price: '', image_url: 'assets/fotos/foto-05.jpg' },
  { id: 'kibe-frito', name: 'Kibe Frito', category: 'Salgados', price: '', image_url: 'assets/fotos/foto-11.jpg' },
  { id: 'kibe-forno', name: 'Kibe de Forno', category: 'Salgados', price: '', image_url: 'assets/fotos/foto-16.jpg' },
  { id: 'empadinha', name: 'Empadinha', category: 'Salgados', price: '', image_url: 'assets/fotos/foto-18.jpg' },
  { id: 'croquete-frango', name: 'Croquete de Frango', category: 'Salgados', price: '', image_url: 'assets/fotos/foto-01.jpg' },
  { id: 'espetinho-frango', name: 'Espetinho de Frango', category: 'Salgados', price: '', image_url: 'assets/fotos/foto-03.jpg' },
  { id: 'escondidinho-camarao', name: 'Escondidinho de Camarão', category: 'Salgados', price: '', image_url: 'assets/fotos/foto-09.jpg' },
  { id: 'doce-aipim', name: 'Doce de Aipim', category: 'Doces', price: '', image_url: 'assets/fotos/doce-de-aipim.jpg' },
  { id: 'bolo-pote', name: 'Bolo de Pote', category: 'Doces', price: '', image_url: 'assets/fotos/bolo-de-pote.jpg' },
  { id: 'combo-festa', name: 'Combo para Festa', category: 'Encomendas', price: '', image_url: 'assets/fotos/foto-15.jpg' }
];

const fallbackGalleryPhotos = [
  { image_url: 'assets/fotos/foto-02.jpg', alt: 'Salgados preparados pela Lu' },
  { image_url: 'assets/fotos/foto-05.jpg', alt: 'Coxinhas da Salgados da Lu' },
  { image_url: 'assets/fotos/foto-16.jpg', alt: 'Kibe de forno preparado pela Lu' },
  { image_url: 'assets/fotos/foto-19.jpg', alt: 'Produção da Salgados da Lu' }
];

const fallbackBusinessHours = [
  { day_of_week: 0, is_open: false, open_time: null, close_time: null },
  { day_of_week: 1, is_open: true, open_time: '08:00', close_time: '18:00' },
  { day_of_week: 2, is_open: true, open_time: '08:00', close_time: '18:00' },
  { day_of_week: 3, is_open: true, open_time: '08:00', close_time: '18:00' },
  { day_of_week: 4, is_open: true, open_time: '08:00', close_time: '18:00' },
  { day_of_week: 5, is_open: true, open_time: '08:00', close_time: '18:00' },
  { day_of_week: 6, is_open: false, open_time: null, close_time: null }
];

const dayLabels = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const dayDisplayOrder = [1, 2, 3, 4, 5, 6, 0];

let products = [...fallbackProducts];
let galleryPhotos = [...fallbackGalleryPhotos];
let businessHours = [...fallbackBusinessHours];
let specialDates = [];
let currentStoreStatus = {
  isOpen: false,
  closedAllDay: false,
  message: 'Estamos verificando o horário de funcionamento.'
};
let cart = loadCart();
let selectedCategory = 'Todos';

function catalogClient() {
  const config = window.SALGADOS_ADMIN_CONFIG || {};
  const configured =
    config.supabaseUrl &&
    config.supabaseAnonKey &&
    !config.supabaseUrl.startsWith('COLE_') &&
    !config.supabaseAnonKey.startsWith('COLE_') &&
    window.supabase?.createClient;

  return configured
    ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey)
    : null;
}

async function loadCatalog() {
  const client = catalogClient();
  if (!client) {
    renderBusinessInfo();
    setupLinks();
    renderGallery();
    render();
    return;
  }

  try {
    const [productsResponse, galleryResponse, hoursResponse, specialDatesResponse] = await Promise.all([
      client
        .from('products')
        .select('id,name,category,price,image_url,sort_order')
        .eq('active', true)
        .order('sort_order', { ascending: true }),
      client
        .from('gallery_photos')
        .select('id,image_url,alt,sort_order')
        .eq('active', true)
        .order('sort_order', { ascending: true }),
      client
        .from('business_hours')
        .select('day_of_week,is_open,open_time,close_time')
        .order('day_of_week', { ascending: true }),
      client
        .from('special_dates')
        .select('date,is_open,open_time,close_time,note')
        .order('date', { ascending: true })
    ]);

    if (productsResponse.error) throw productsResponse.error;
    if (galleryResponse.error) throw galleryResponse.error;
    if (hoursResponse.error) throw hoursResponse.error;
    if (specialDatesResponse.error) throw specialDatesResponse.error;

    products = productsResponse.data || [];
    galleryPhotos = galleryResponse.data || [];
    businessHours = hoursResponse.data?.length ? hoursResponse.data : [...fallbackBusinessHours];
    specialDates = specialDatesResponse.data || [];
  } catch (error) {
    console.warn('O cardápio online não pôde ser carregado. Usando a cópia local.', error);
  }

  renderBusinessInfo();
  setupLinks();
  renderGallery();
  render();
}

function storeNow() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    dayOfWeek: weekdayMap[values.weekday],
    minutes: Number(values.hour) * 60 + Number(values.minute)
  };
}

function timeText(value) {
  return String(value || '').slice(0, 5);
}

function timeMinutes(value) {
  const [hours, minutes] = timeText(value).split(':').map(Number);
  return hours * 60 + minutes;
}

function dateWithOffset(baseDate, offset) {
  const [year, month, day] = baseDate.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + offset)).toISOString().slice(0, 10);
}

function dayOfWeekForDate(date) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function scheduleForDate(date, dayOfWeek = dayOfWeekForDate(date)) {
  const specialDate = specialDates.find((item) => item.date === date);
  if (specialDate) {
    return {
      isOpen: specialDate.is_open,
      openTime: specialDate.open_time,
      closeTime: specialDate.close_time,
      note: specialDate.note || '',
      special: true
    };
  }

  const regular = businessHours.find((item) => Number(item.day_of_week) === dayOfWeek);
  return {
    isOpen: regular?.is_open || false,
    openTime: regular?.open_time || null,
    closeTime: regular?.close_time || null,
    note: '',
    special: false
  };
}

function nextOpeningText(now) {
  for (let offset = 0; offset <= 14; offset += 1) {
    const date = dateWithOffset(now.date, offset);
    const dayOfWeek = dayOfWeekForDate(date);
    const schedule = scheduleForDate(date, dayOfWeek);
    if (!schedule.isOpen || !schedule.openTime) continue;

    if (offset === 0 && now.minutes >= timeMinutes(schedule.openTime)) continue;
    const dayText = offset === 0 ? 'hoje' : offset === 1 ? 'amanhã' : dayLabels[dayOfWeek].toLowerCase();
    return `Próxima abertura: ${dayText}, às ${timeText(schedule.openTime)}.`;
  }
  return 'Envie uma mensagem para consultar o próximo atendimento.';
}

function calculateStoreStatus() {
  const now = storeNow();
  const schedule = scheduleForDate(now.date, now.dayOfWeek);

  if (!schedule.isOpen || !schedule.openTime || !schedule.closeTime) {
    return {
      isOpen: false,
      closedAllDay: true,
      title: 'Estamos fechados hoje',
      detail: [schedule.note, nextOpeningText(now)].filter(Boolean).join(' — '),
      message: 'Sei que a loja está fechada hoje. Gostaria de deixar esta mensagem para o próximo horário.',
      now,
      schedule
    };
  }

  const openMinutes = timeMinutes(schedule.openTime);
  const closeMinutes = timeMinutes(schedule.closeTime);
  const isOpen = now.minutes >= openMinutes && now.minutes < closeMinutes;

  if (isOpen) {
    return {
      isOpen: true,
      closedAllDay: false,
      title: 'Estamos abertos agora',
      detail: `Atendimento hoje até ${timeText(schedule.closeTime)}.${schedule.note ? ` ${schedule.note}` : ''}`,
      message: '',
      now,
      schedule
    };
  }

  const beforeOpening = now.minutes < openMinutes;
  return {
    isOpen: false,
    closedAllDay: false,
    title: 'Estamos fechados agora',
    detail: beforeOpening
      ? `Abrimos hoje às ${timeText(schedule.openTime)}.${schedule.note ? ` ${schedule.note}` : ''}`
      : nextOpeningText(now),
    message: 'Sei que a loja está fechada agora. Gostaria de deixar esta mensagem para o próximo horário.',
    now,
    schedule
  };
}

function renderWeeklySchedule() {
  const container = document.getElementById('weeklySchedule');
  container.replaceChildren();

  dayDisplayOrder.forEach((dayOfWeek) => {
    const schedule = businessHours.find((item) => Number(item.day_of_week) === dayOfWeek);
    const row = document.createElement('div');
    row.className = 'weekly-row';
    const day = document.createElement('span');
    day.className = 'weekly-day';
    day.textContent = dayLabels[dayOfWeek];
    const time = document.createElement('span');
    const isOpen = schedule?.is_open && schedule.open_time && schedule.close_time;
    time.className = `weekly-time${isOpen ? '' : ' closed'}`;
    time.textContent = isOpen
      ? `${timeText(schedule.open_time)} às ${timeText(schedule.close_time)}`
      : 'Fechada';
    row.append(day, time);
    container.appendChild(row);
  });
}

function renderCalendar(now) {
  const calendar = document.getElementById('monthCalendar');
  const monthTitle = document.getElementById('calendarMonth');
  calendar.replaceChildren();

  monthTitle.textContent = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
    month: 'long',
    year: 'numeric'
  }).format(new Date(Date.UTC(now.year, now.month - 1, 1)));

  const firstDay = new Date(Date.UTC(now.year, now.month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(now.year, now.month, 0)).getUTCDate();

  for (let index = 0; index < firstDay; index += 1) {
    const spacer = document.createElement('span');
    spacer.className = 'calendar-spacer';
    spacer.setAttribute('aria-hidden', 'true');
    calendar.appendChild(spacer);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${now.year}-${String(now.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const schedule = scheduleForDate(date);
    const cell = document.createElement('span');
    cell.className = [
      'calendar-day',
      schedule.isOpen ? '' : 'closed',
      date === now.date ? 'today' : '',
      schedule.special ? 'special' : ''
    ].filter(Boolean).join(' ');
    cell.textContent = day;
    cell.dataset.note = schedule.note || (schedule.special ? (schedule.isOpen ? 'Especial' : 'Fechada') : '');
    const status = schedule.isOpen
      ? `aberta das ${timeText(schedule.openTime)} às ${timeText(schedule.closeTime)}`
      : 'fechada';
    cell.setAttribute('aria-label', `${day} de ${monthTitle.textContent}: ${status}${schedule.note ? `. ${schedule.note}` : ''}`);
    calendar.appendChild(cell);
  }
}

function renderBusinessInfo() {
  currentStoreStatus = calculateStoreStatus();
  const statusCard = document.getElementById('storeStatus');
  const statusBadge = document.getElementById('storeStatusBadge');
  const statusTitle = document.getElementById('storeStatusTitle');
  const statusDetail = document.getElementById('storeStatusDetail');
  const closedNotice = document.getElementById('closedNotice');

  statusCard.className = `store-status${currentStoreStatus.isOpen ? '' : ' closed'}`;
  statusBadge.textContent = currentStoreStatus.isOpen ? 'Aberta agora' : 'Fechada agora';
  statusTitle.textContent = currentStoreStatus.title;
  statusDetail.textContent = currentStoreStatus.detail;
  closedNotice.classList.toggle('hidden', currentStoreStatus.isOpen);
  closedNotice.querySelector('strong').textContent = currentStoreStatus.closedAllDay
    ? 'Estamos fechados hoje.'
    : 'Estamos fechados agora.';

  renderWeeklySchedule();
  renderCalendar(currentStoreStatus.now);
}

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
  return String(product.price || '').trim() || 'Consulte o valor';
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
  const dimensions = {
    'foto-16.jpg': [1000, 562],
    'bolo-de-pote.jpg': [515, 313],
    'doce-de-aipim.jpg': [1200, 800]
  };
  const name = fileName.split('/').pop();
  const [width, height] = dimensions[name] || [562, 1000];
  image.width = width;
  image.height = height;
}

function createProductCard(product) {
  const quantity = Number(cart[product.id]) || 0;
  const card = document.createElement('article');
  card.className = 'item';

  const image = document.createElement('img');
  image.className = 'item-img';
  image.src = product.image_url || 'assets/logo/logo-salgados-da-lu.png';
  image.alt = product.name;
  setImageDimensions(image, product.image_url);
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
    image.src = photo.image_url;
    image.alt = photo.alt;
    setImageDimensions(image, photo.image_url);
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
  try {
    localStorage.removeItem(orderReferenceKey);
  } catch {
    // A limpeza do pedido continua mesmo se o armazenamento estiver bloqueado.
  }
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

function orderReference() {
  try {
    const savedReference = localStorage.getItem(orderReferenceKey);
    if (savedReference) return savedReference;

    const date = storeNow().date.replaceAll('-', '');
    const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
    const reference = `SL-${date}-${randomPart}`;
    localStorage.setItem(orderReferenceKey, reference);
    return reference;
  } catch {
    return `SL-${Date.now().toString(36).toUpperCase()}`;
  }
}

function selectedItemLines() {
  return selectedItems().map(({ product, quantity }) => (
    `• ${quantity}x ${product.name}${product.price ? ` — ${product.price}` : ''}`
  ));
}

function buildOrderMessage() {
  const items = selectedItems();
  const reference = orderReference();
  const lines = [
    'Olá! Gostaria de fazer um pedido na Salgados da Lu.',
    `Pedido: ${reference}`,
    ''
  ];

  if (!currentStoreStatus.isOpen) {
    lines.push(currentStoreStatus.message, '');
  }

  if (!items.length) {
    lines.push('Pode me enviar o cardápio, os valores e a disponibilidade?');
    return lines.join('\n');
  }

  lines.push(
    'Meu pedido:',
    ...selectedItemLines(),
    '',
    'Pagamento via Pix:',
    `Chave Pix: ${pix}`,
    `Titular: ${pixOwner}`,
    '',
    'Depois do pagamento, vou tocar em "Já paguei" no site para confirmar.',
    '',
    'Entrega ou retirada:',
    'Bairro/endereço:'
  );

  return lines.join('\n');
}

function buildPaymentConfirmationMessage() {
  return [
    'Olá! Já fiz o pagamento via Pix.',
    `Pedido: ${orderReference()}`,
    '',
    'Itens pagos:',
    ...selectedItemLines(),
    '',
    'Por favor, confirme o recebimento do pagamento.'
  ].join('\n');
}

function updateOrderBar() {
  const orderBar = document.getElementById('orderBar');
  const orderCount = document.getElementById('orderCount');
  const orderPreview = document.getElementById('orderPreview');
  const finishOrder = document.getElementById('finishOrder');
  const confirmPayment = document.getElementById('confirmPayment');
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
  confirmPayment.href = buildWhatsAppLink(buildPaymentConfirmationMessage());
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
  const greeting = [
    'Olá! Gostaria de falar com a Salgados da Lu.',
    currentStoreStatus.isOpen ? '' : currentStoreStatus.message
  ].filter(Boolean).join('\n\n');
  const directLink = buildWhatsAppLink(greeting);
  document.getElementById('whatsHero').href = directLink;
  document.getElementById('whatsContact').href = directLink;
}

document.getElementById('resetBtn').addEventListener('click', clearCart);
document.getElementById('copyPixBtn').addEventListener('click', copyPix);

setupLinks();
loadCatalog();

setInterval(() => {
  renderBusinessInfo();
  setupLinks();
  updateOrderBar();
}, 60000);
