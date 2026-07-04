const adminConfig = window.SALGADOS_ADMIN_CONFIG || {};
const isConfigured =
  adminConfig.supabaseUrl &&
  adminConfig.supabaseAnonKey &&
  !adminConfig.supabaseUrl.startsWith('COLE_') &&
  !adminConfig.supabaseAnonKey.startsWith('COLE_') &&
  window.supabase?.createClient;

const db = isConfigured
  ? window.supabase.createClient(adminConfig.supabaseUrl, adminConfig.supabaseAnonKey)
  : null;

const loginView = document.getElementById('loginView');
const adminView = document.getElementById('adminView');
const loginForm = document.getElementById('loginForm');
const loginStatus = document.getElementById('loginStatus');
const globalStatus = document.getElementById('globalStatus');
const productsList = document.getElementById('productsList');
const galleryList = document.getElementById('galleryList');
const newProductForm = document.getElementById('newProductForm');
const newPhotoForm = document.getElementById('newPhotoForm');

let products = [];
let galleryPhotos = [];
let statusTimer;

function setStatus(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle('error', isError);
}

function showGlobalStatus(message, isError = false) {
  clearTimeout(statusTimer);
  setStatus(globalStatus, message, isError);
  if (message && !isError) {
    statusTimer = setTimeout(() => setStatus(globalStatus, ''), 4500);
  }
}

function setButtonBusy(button, busy, busyText = 'Salvando...') {
  if (busy) {
    button.dataset.originalText = button.textContent;
    button.textContent = busyText;
    button.disabled = true;
    return;
  }
  button.textContent = button.dataset.originalText || button.textContent;
  button.disabled = false;
}

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function imageSource(value) {
  return value || 'assets/logo/logo-salgados-da-lu.png';
}

function validateImage(file) {
  if (!file) return;
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Use uma imagem JPG, PNG ou WebP.');
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('A imagem deve ter no máximo 8 MB.');
  }
}

async function uploadImage(file, folder) {
  validateImage(file);
  const extension = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const safeBaseName = slugify(file.name.replace(/\.[^.]+$/, '')) || 'foto';
  const uniquePart = typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const path = `${folder}/${uniquePart}-${safeBaseName}.${extension}`;

  const { error } = await db.storage
    .from(adminConfig.imageBucket)
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false
    });

  if (error) throw error;

  const { data } = db.storage
    .from(adminConfig.imageBucket)
    .getPublicUrl(path);

  return data.publicUrl;
}

async function loadData() {
  setStatus(globalStatus, 'Carregando informações...');

  const [productsResponse, galleryResponse] = await Promise.all([
    db.from('products').select('*').order('sort_order', { ascending: true }),
    db.from('gallery_photos').select('*').order('sort_order', { ascending: true })
  ]);

  if (productsResponse.error) throw productsResponse.error;
  if (galleryResponse.error) throw galleryResponse.error;

  products = productsResponse.data || [];
  galleryPhotos = galleryResponse.data || [];
  renderProducts();
  renderGallery();
  setStatus(globalStatus, '');
}

function makeInput(labelText, name, value, type = 'text') {
  const label = document.createElement('label');
  label.textContent = labelText;
  const input = document.createElement('input');
  input.name = name;
  input.type = type;
  input.value = value ?? '';
  label.appendChild(input);
  return { label, input };
}

function renderProducts() {
  productsList.replaceChildren();

  if (!products.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'Nenhum produto cadastrado.';
    productsList.appendChild(empty);
    return;
  }

  products.forEach((product) => {
    const card = document.createElement('form');
    card.className = 'editor-card';
    card.dataset.productId = product.id;

    const heading = document.createElement('div');
    heading.className = 'editor-heading';

    const productHeading = document.createElement('div');
    productHeading.className = 'product-heading';

    const image = document.createElement('img');
    image.className = 'product-thumb';
    image.src = imageSource(product.image_url);
    image.alt = '';

    const titleWrap = document.createElement('div');
    const kicker = document.createElement('span');
    kicker.className = 'card-kicker';
    kicker.textContent = product.category;
    const title = document.createElement('h3');
    title.textContent = product.name;
    titleWrap.append(kicker, title);
    productHeading.append(image, titleWrap);
    heading.appendChild(productHeading);

    const grid = document.createElement('div');
    grid.className = 'form-grid';

    const nameField = makeInput('Nome', 'name', product.name);
    nameField.input.required = true;
    const categoryField = makeInput('Categoria', 'category', product.category);
    categoryField.input.required = true;
    const priceField = makeInput('Preço', 'price', product.price);
    priceField.input.placeholder = 'Ex.: R$ 8,00';
    const orderField = makeInput('Posição', 'sortOrder', product.sort_order, 'number');
    orderField.input.min = '0';
    orderField.input.step = '1';

    const fileLabel = document.createElement('label');
    fileLabel.className = 'file-label';
    fileLabel.textContent = 'Trocar foto';
    const fileInput = document.createElement('input');
    fileInput.name = 'image';
    fileInput.type = 'file';
    fileInput.accept = 'image/jpeg,image/png,image/webp';
    fileLabel.appendChild(fileInput);

    const activeLabel = document.createElement('label');
    activeLabel.className = 'toggle-label';
    const activeInput = document.createElement('input');
    activeInput.name = 'active';
    activeInput.type = 'checkbox';
    activeInput.checked = product.active;
    activeLabel.append(activeInput, document.createTextNode('Mostrar no site'));

    grid.append(
      nameField.label,
      categoryField.label,
      priceField.label,
      orderField.label,
      fileLabel,
      activeLabel
    );

    const actions = document.createElement('div');
    actions.className = 'card-actions';
    const removeButton = document.createElement('button');
    removeButton.className = 'admin-btn danger';
    removeButton.type = 'button';
    removeButton.textContent = 'Excluir';
    removeButton.addEventListener('click', () => deleteProduct(product));

    const saveButton = document.createElement('button');
    saveButton.className = 'admin-btn primary';
    saveButton.type = 'submit';
    saveButton.textContent = 'Salvar alterações';
    actions.append(removeButton, saveButton);

    card.addEventListener('submit', (event) => saveProduct(event, product, saveButton));
    card.append(heading, grid, actions);
    productsList.appendChild(card);
  });
}

async function saveProduct(event, product, button) {
  event.preventDefault();
  setButtonBusy(button, true);

  try {
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get('image');
    let imageUrl = product.image_url;

    if (file instanceof File && file.size) {
      imageUrl = await uploadImage(file, 'produtos');
    }

    const changes = {
      name: String(formData.get('name')).trim(),
      category: String(formData.get('category')).trim(),
      price: String(formData.get('price')).trim(),
      sort_order: Number(formData.get('sortOrder')) || 0,
      active: formData.get('active') === 'on',
      image_url: imageUrl,
      updated_at: new Date().toISOString()
    };

    if (!changes.name || !changes.category) {
      throw new Error('Preencha o nome e a categoria.');
    }

    const { error } = await db
      .from('products')
      .update(changes)
      .eq('id', product.id);

    if (error) throw error;
    await loadData();
    showGlobalStatus(`${changes.name} foi atualizado.`);
  } catch (error) {
    showGlobalStatus(error.message || 'Não foi possível salvar o produto.', true);
  } finally {
    setButtonBusy(button, false);
  }
}

async function deleteProduct(product) {
  if (!window.confirm(`Excluir "${product.name}" do cardápio?`)) return;

  try {
    const { error } = await db
      .from('products')
      .delete()
      .eq('id', product.id);
    if (error) throw error;
    await loadData();
    showGlobalStatus(`${product.name} foi excluído.`);
  } catch (error) {
    showGlobalStatus(error.message || 'Não foi possível excluir o produto.', true);
  }
}

async function createProduct(event) {
  event.preventDefault();
  const button = newProductForm.querySelector('button[type="submit"]');
  setButtonBusy(button, true);

  try {
    const formData = new FormData(newProductForm);
    const name = String(formData.get('name')).trim();
    const category = String(formData.get('category')).trim();
    const file = formData.get('image');

    if (!name || !category) {
      throw new Error('Preencha o nome e a categoria.');
    }

    let imageUrl = '';
    if (file instanceof File && file.size) {
      imageUrl = await uploadImage(file, 'produtos');
    }

    const baseId = slugify(name) || 'produto';
    const id = products.some((product) => product.id === baseId)
      ? `${baseId}-${Date.now().toString(36)}`
      : baseId;

    const { error } = await db.from('products').insert({
      id,
      name,
      category,
      price: String(formData.get('price')).trim(),
      image_url: imageUrl,
      sort_order: Number(formData.get('sortOrder')) || 0,
      active: formData.get('active') === 'on'
    });

    if (error) throw error;
    newProductForm.reset();
    newProductForm.elements.category.value = 'Salgados';
    newProductForm.elements.sortOrder.value = '10';
    newProductForm.elements.active.checked = true;
    newProductForm.classList.add('hidden');
    await loadData();
    showGlobalStatus(`${name} foi adicionado ao cardápio.`);
  } catch (error) {
    showGlobalStatus(error.message || 'Não foi possível criar o produto.', true);
  } finally {
    setButtonBusy(button, false);
  }
}

function renderGallery() {
  galleryList.replaceChildren();

  if (!galleryPhotos.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'Nenhuma foto cadastrada na galeria.';
    galleryList.appendChild(empty);
    return;
  }

  galleryPhotos.forEach((photo) => {
    const card = document.createElement('form');
    card.className = 'editor-card gallery-editor-card';
    card.dataset.photoId = photo.id;

    const image = document.createElement('img');
    image.src = imageSource(photo.image_url);
    image.alt = photo.alt;

    const body = document.createElement('div');
    body.className = 'gallery-editor-body';

    const altField = makeInput('Descrição', 'alt', photo.alt);
    altField.input.required = true;
    const orderField = makeInput('Posição', 'sortOrder', photo.sort_order, 'number');
    orderField.input.min = '0';
    orderField.input.step = '1';

    const activeLabel = document.createElement('label');
    activeLabel.className = 'toggle-label';
    const activeInput = document.createElement('input');
    activeInput.name = 'active';
    activeInput.type = 'checkbox';
    activeInput.checked = photo.active;
    activeLabel.append(activeInput, document.createTextNode('Mostrar no site'));

    const actions = document.createElement('div');
    actions.className = 'gallery-card-actions';
    const removeButton = document.createElement('button');
    removeButton.className = 'admin-btn danger';
    removeButton.type = 'button';
    removeButton.textContent = 'Excluir';
    removeButton.addEventListener('click', () => deletePhoto(photo));
    const saveButton = document.createElement('button');
    saveButton.className = 'admin-btn primary';
    saveButton.type = 'submit';
    saveButton.textContent = 'Salvar';
    actions.append(removeButton, saveButton);

    card.addEventListener('submit', (event) => savePhoto(event, photo, saveButton));
    body.append(altField.label, orderField.label, activeLabel, actions);
    card.append(image, body);
    galleryList.appendChild(card);
  });
}

async function savePhoto(event, photo, button) {
  event.preventDefault();
  setButtonBusy(button, true);

  try {
    const formData = new FormData(event.currentTarget);
    const changes = {
      alt: String(formData.get('alt')).trim(),
      sort_order: Number(formData.get('sortOrder')) || 0,
      active: formData.get('active') === 'on',
      updated_at: new Date().toISOString()
    };

    if (!changes.alt) throw new Error('Preencha a descrição da foto.');

    const { error } = await db
      .from('gallery_photos')
      .update(changes)
      .eq('id', photo.id);

    if (error) throw error;
    await loadData();
    showGlobalStatus('Foto atualizada.');
  } catch (error) {
    showGlobalStatus(error.message || 'Não foi possível atualizar a foto.', true);
  } finally {
    setButtonBusy(button, false);
  }
}

async function deletePhoto(photo) {
  if (!window.confirm('Excluir esta foto da galeria?')) return;

  try {
    const { error } = await db
      .from('gallery_photos')
      .delete()
      .eq('id', photo.id);
    if (error) throw error;
    await loadData();
    showGlobalStatus('Foto excluída da galeria.');
  } catch (error) {
    showGlobalStatus(error.message || 'Não foi possível excluir a foto.', true);
  }
}

async function createPhoto(event) {
  event.preventDefault();
  const button = newPhotoForm.querySelector('button[type="submit"]');
  setButtonBusy(button, true, 'Enviando...');

  try {
    const formData = new FormData(newPhotoForm);
    const file = formData.get('image');
    const alt = String(formData.get('alt')).trim();
    if (!(file instanceof File) || !file.size) throw new Error('Escolha uma foto.');
    if (!alt) throw new Error('Preencha a descrição da foto.');

    const imageUrl = await uploadImage(file, 'galeria');
    const { error } = await db.from('gallery_photos').insert({
      image_url: imageUrl,
      alt,
      sort_order: Number(formData.get('sortOrder')) || 0,
      active: true
    });

    if (error) throw error;
    newPhotoForm.reset();
    newPhotoForm.elements.sortOrder.value = '10';
    await loadData();
    showGlobalStatus('Nova foto adicionada à galeria.');
  } catch (error) {
    showGlobalStatus(error.message || 'Não foi possível enviar a foto.', true);
  } finally {
    setButtonBusy(button, false);
  }
}

async function showAdmin() {
  loginView.classList.add('hidden');
  adminView.classList.remove('hidden');
  try {
    await loadData();
  } catch (error) {
    showGlobalStatus(
      error.message || 'Não foi possível carregar os dados do painel.',
      true
    );
  }
}

function showLogin() {
  adminView.classList.add('hidden');
  loginView.classList.remove('hidden');
}

async function login(event) {
  event.preventDefault();
  const submitButton = loginForm.querySelector('button[type="submit"]');
  setStatus(loginStatus, '');

  if (!db) {
    setStatus(
      loginStatus,
      'O painel ainda precisa ser conectado ao banco de dados.',
      true
    );
    return;
  }

  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (username !== adminConfig.loginUsername) {
    setStatus(loginStatus, 'Usuário ou senha incorretos.', true);
    return;
  }

  setButtonBusy(submitButton, true, 'Entrando...');

  try {
    const { error } = await db.auth.signInWithPassword({
      email: adminConfig.authEmail,
      password
    });
    if (error) throw error;
    loginForm.reset();
    setStatus(loginStatus, '');
    await showAdmin();
  } catch {
    setStatus(loginStatus, 'Usuário ou senha incorretos.', true);
  } finally {
    setButtonBusy(submitButton, false);
  }
}

async function logout() {
  if (db) await db.auth.signOut();
  showLogin();
}

async function initialize() {
  loginForm.addEventListener('submit', login);
  newProductForm.addEventListener('submit', createProduct);
  newPhotoForm.addEventListener('submit', createPhoto);
  document.getElementById('logoutBtn').addEventListener('click', logout);

  document.getElementById('showNewProductBtn').addEventListener('click', () => {
    newProductForm.classList.remove('hidden');
    newProductForm.elements.name.focus();
  });

  document.getElementById('cancelNewProductBtn').addEventListener('click', () => {
    newProductForm.classList.add('hidden');
    newProductForm.reset();
  });

  if (!db) {
    setStatus(
      loginStatus,
      'O painel está pronto, mas ainda precisa da configuração do Supabase.',
      true
    );
    return;
  }

  const { data } = await db.auth.getSession();
  if (data.session) {
    await showAdmin();
  } else {
    showLogin();
  }

  db.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || !session) showLogin();
  });
}

initialize();
