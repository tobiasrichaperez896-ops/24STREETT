/* 24 STREET — shared storefront interactions */
(() => {
  const root = document.body.dataset.root || '';
  const view = document.body.dataset.view || 'catalog';
  const category = document.body.dataset.category || 'all';
  const brand = document.body.dataset.brand || '';
  const products = catalogData.products;
  const $ = (selector, scope = document) => scope?.querySelector(selector) || null;
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const path = file => `${root}${file}`;
  const brandmark = () => `<svg class="wordmark-art" viewBox="0 0 340 84" aria-hidden="true" focusable="false"><text x="0" y="70" fill="currentColor" font-family="Arial Narrow,Arial,sans-serif" font-size="82" font-stretch="condensed" font-weight="800" letter-spacing="-8">24</text><path d="M101 13v58" stroke="var(--accent)" stroke-width="4"/><text x="120" y="59" fill="currentColor" font-family="Arial,sans-serif" font-size="36" font-weight="700" letter-spacing="5">STREET</text></svg>`;
  const loadingMarkup = () => `<div class="loading-mark">${brandmark()}<div class="loading-line"><i></i></div></div>`;
  const slug = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const money = value => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value).replace('ARS', '').trim();
  const categoryLabel = value => ({ remeras: 'Ropa', buzos: 'Ropa', pantalones: 'Ropa', camperas: 'Ropa', relojes: 'Relojes', zapatillas: 'Zapatillas', accesorios: 'Accesorios' })[value] || value;
  const brandFile = value => ({ Casio: 'casio', 'G-Shock': 'gshock', Seiko: 'seiko', Citizen: 'citizen', Tissot: 'tissot', Nike: 'nike', Adidas: 'adidas', Puma: 'puma', 'Levi’s': 'levis', 'New Balance': 'newbalance', Vans: 'vans', Converse: 'converse', 'Carhartt WIP': 'carhartt', 'The North Face': 'thenorthface', 'Ralph Lauren': 'ralphlauren' })[value] || slug(value);
  const brandCategory = value => ['Casio', 'G-Shock', 'Seiko', 'Citizen', 'Tissot'].includes(value) ? 'relojes' : ['Nike', 'Adidas', 'Puma', 'Levi’s', 'Ralph Lauren', 'Carhartt WIP', 'The North Face'].includes(value) ? 'ropa' : 'zapatillas';
  const productLink = product => `${path('producto.html')}?id=${encodeURIComponent(product.id)}`;
  const brandLink = value => path(`marcas/${brandCategory(value)}/${brandFile(value)}.html`);
  const categoryProducts = filter => products.filter(product => filter === 'all' ? true : filter === 'ropa' ? ['remeras', 'buzos', 'pantalones', 'camperas'].includes(product.category) : product.category === filter);
  const safeReadCart = () => {
    try {
      const value = JSON.parse(localStorage.getItem('24street-cart') || '[]');
      return Array.isArray(value) ? value.filter(line => line && typeof line.id === 'string' && Number(line.quantity) > 0).map(line => ({ ...line, quantity: Number(line.quantity) })) : [];
    } catch (_) { return []; }
  };
  let items = safeReadCart();
  const inSelection = id => items.some(item => item.id === id);

  const selectionButton = (product, className = 'quick-add shared-add', id = '') => {
    const selected = inSelection(product.id);
    return `<button${id ? ` id="${id}"` : ''} class="${className}${selected ? ' is-added' : ''}" type="button" data-add="${product.id}" aria-pressed="${selected}" aria-label="${selected ? `Quitar ${product.name} de tu selección` : `Agregar ${product.name} a la selección`}">${selected ? '<span class="selection-check" aria-hidden="true">✓</span> En tu selección <span class="selection-remove" aria-hidden="true">Quitar</span>' : 'Agregar a selección <span aria-hidden="true">+</span>'}</button>`;
  };

  function card(product) {
    const fallback = catalogData.imagePool[product.category]?.[0] || catalogData.imagePool.zapatillas[0];
    return `<article class="product-card shared-card">
      <a class="product-image" href="${productLink(product)}" aria-label="Ver ${product.brand} ${product.name}">
        ${product.ofertaActiva ? `<span class="product-tag">${product.discount || 'Oferta'}</span>` : ''}
        <img src="${product.image}" alt="${product.brand} ${product.name}" loading="lazy" onerror="this.onerror=null;this.src='${fallback}'">
      </a>
      <a class="product-brand" href="${brandLink(product.brand)}">${product.brand}</a>
      <h3 class="product-name"><a href="${productLink(product)}">${product.name}</a></h3>
      <div class="product-price">${money(product.price)} ${product.oldPrice ? `<span class="old-price">${money(product.oldPrice)}</span>` : ''}</div>
      ${selectionButton(product)}
    </article>`;
  }

  function header() {
    const target = $('header.site-header');
    if (!target || target.children.length) return;
    target.innerHTML = `<div class="shared-header">
      <a class="wordmark" href="${path('index.html')}" aria-label="24 STREET, inicio">${brandmark()}</a>
      <nav class="desktop-nav" aria-label="Navegación principal"><a href="${path('index.html')}">Inicio</a><a href="${path('catalogo.html')}">Catálogo</a><a href="${path('ropa.html')}">Ropa</a><a href="${path('zapatillas.html')}">Zapatillas</a><a href="${path('relojes.html')}">Relojes</a><a href="${path('accesorios.html')}">Accesorios</a><a href="${path('marcas.html')}">Marcas</a><a href="${path('ofertas.html')}">Ofertas</a></nav>
      <div class="header-actions">
        <a class="icon-action" href="${path('buscar.html')}" aria-label="Buscar"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.4"></circle><path d="m16 16 5 5"></path></svg></a>
        <a class="icon-action cart-icon" href="${path('carrito.html')}" aria-label="Carrito, 0 productos"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 5h2l1.7 10.2a2 2 0 0 0 2 1.7h8.6a2 2 0 0 0 1.9-1.5L21 8H7"></path><path d="M9 20.5h.01M18 20.5h.01"></path></svg><span id="sharedCartCount">0</span></a>
        <a class="icon-action settings-link" href="${path('ajustes.html')}" aria-label="Ajustes"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="m19.4 15 .1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 0 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 0 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 0 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 0 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V2a1.7 1.7 0 0 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 0 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 0 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2 2.9Z"></path></svg></a>
        <button class="menu-toggle" id="sharedMenu" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="sharedMobile"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg></button>
      </div>
    </div>
    <nav class="mobile-nav" id="sharedMobile" aria-label="Navegación móvil"><a href="${path('index.html')}">Inicio</a><a href="${path('catalogo.html')}">Catálogo</a><a href="${path('ropa.html')}">Ropa</a><a href="${path('zapatillas.html')}">Zapatillas</a><a href="${path('relojes.html')}">Relojes</a><a href="${path('accesorios.html')}">Accesorios</a><a href="${path('marcas.html')}">Marcas</a><a href="${path('ofertas.html')}">Ofertas</a><a href="${path('contacto.html')}">Contacto</a><a href="${path('ajustes.html')}">Ajustes</a></nav>`;
    const toggle = $('#sharedMenu');
    const menu = $('#sharedMobile');
    toggle?.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      document.body.classList.toggle('locked', open);
    });
    $$('#sharedMobile a').forEach(link => link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('locked');
    }));
  }

  function footer() {
    const target = $('footer');
    if (!target || target.children.length) return;
    target.innerHTML = `<a class="wordmark" href="${path('index.html')}" aria-label="24 STREET, inicio">${brandmark()}</a><nav class="footer-links" aria-label="Navegación del pie de página"><a href="${path('catalogo.html')}">Catálogo</a><a href="${path('marcas.html')}">Marcas</a><a href="${path('ofertas.html')}">Ofertas</a><a href="${path('contacto.html')}">Contacto</a><a href="${path('ajustes.html')}">Ajustes</a></nav><p>© 2026 24 STREET · Experiencia de demostración</p>`;
  }

  function loading() {
    let seen = false;
    try { seen = sessionStorage.getItem('24street-seen') === '1'; } catch (_) {}
    let screen = $('#loadingScreen');
    if (seen) { screen?.remove(); return; }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { screen?.remove(); return; }
    if (!screen) {
      screen = document.createElement('div');
      screen.id = 'loadingScreen';
      screen.className = 'loading-screen';
      screen.setAttribute('aria-hidden', 'true');
      screen.innerHTML = loadingMarkup();
      document.body.prepend(screen);
    }
    try { sessionStorage.setItem('24street-seen', '1'); } catch (_) {}
    const started = performance.now();
    const reveal = () => window.setTimeout(() => {
      screen.classList.add('is-done');
      window.setTimeout(() => screen.remove(), 820);
    }, Math.max(0, 1100 - (performance.now() - started)));
    if (document.readyState === 'complete') reveal();
    else window.addEventListener('load', reveal, { once: true });
    window.setTimeout(() => { if (document.body.contains(screen)) screen.classList.add('is-done'); }, 1500);
  }

  function theme() {
    let stored = null;
    try { stored = localStorage.getItem('24street-theme'); } catch (_) {}
    const next = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', next);
    document.body.classList.toggle('dark-mode', next === 'dark');
  }

  function accent() {
    let value = 'gold';
    try { value = localStorage.getItem('24street-accent') || 'gold'; } catch (_) {}
    document.documentElement.setAttribute('data-accent', value);
    $$('[data-accent-choice]').forEach(button => {
      const active = button.dataset.accentChoice === value;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function settings() {
    const choice = $('#themeChoice');
    if (choice) {
      choice.checked = document.documentElement.dataset.theme === 'dark';
      choice.addEventListener('change', () => {
        const next = choice.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        document.body.classList.toggle('dark-mode', next === 'dark');
        try { localStorage.setItem('24street-theme', next); } catch (_) {}
      });
    }
    $$('[data-accent-choice]').forEach(button => button.addEventListener('click', () => {
      const value = button.dataset.accentChoice;
      document.documentElement.setAttribute('data-accent', value);
      try { localStorage.setItem('24street-accent', value); } catch (_) {}
      $$('[data-accent-choice]').forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
    }));
  }

  function cart() {
    let notice = $('#cartNotice');
    if (!notice) {
      notice = document.createElement('div');
      notice.id = 'cartNotice';
      notice.className = 'cart-notice';
      notice.setAttribute('aria-live', 'polite');
      notice.setAttribute('role', 'status');
      document.body.append(notice);
    }
    const clearNotice = () => {
      if (!notice) return;
      notice.classList.remove('show');
      notice._previousCart = null;
      window.clearTimeout(notice._timer);
    };
    const showNotice = (message, previous) => {
      if (!notice) return;
      notice.innerHTML = `<span>${message}</span><button type="button" class="cart-notice-undo" data-cart-undo>Deshacer</button>`;
      notice._previousCart = previous;
      notice.classList.add('show');
      window.clearTimeout(notice._timer);
      notice._timer = window.setTimeout(() => notice.classList.remove('show'), 7000);
    };
    const count = () => items.reduce((sum, item) => sum + item.quantity, 0);
    const updateSelectionButtons = () => {
      $$('[data-add]').forEach(button => {
        const product = products.find(item => item.id === button.dataset.add);
        if (!product) return;
        const selected = inSelection(product.id);
        button.classList.toggle('is-added', selected);
        button.setAttribute('aria-pressed', String(selected));
        button.setAttribute('aria-label', selected ? `Quitar ${product.name} de tu selección` : `Agregar ${product.name} a la selección`);
        button.innerHTML = selected
          ? '<span class="selection-check" aria-hidden="true">✓</span> En tu selección <span class="selection-remove" aria-hidden="true">Quitar</span>'
          : 'Agregar a selección <span aria-hidden="true">+</span>';
      });
    };
    const persist = () => {
      clearNotice();
      try { localStorage.setItem('24street-cart', JSON.stringify(items)); } catch (_) {}
      updateCount();
      render();
    };
    const updateCount = () => {
      const total = count();
      $$('#sharedCartCount, #cartCount').forEach(node => { node.textContent = total; });
      $$('.cart-icon').forEach(node => node.setAttribute('aria-label', `Carrito, ${total} ${total === 1 ? 'producto' : 'productos'}`));
      const head = $('#cartHeadCount');
      if (head) head.textContent = `(${total})`;
    };
    const add = (id, variant = {}) => {
      const previous = items.map(item => ({ ...item }));
      const size = variant.size || '';
      const color = variant.color || '';
      let line = items.find(item => item.id === id && (item.size || '') === size && (item.color || '') === color);
      if (line) line.quantity += 1;
      else items.push({ id, quantity: 1, ...(size ? { size } : {}), ...(color ? { color } : {}) });
      persist();
      showNotice('Pieza agregada a tu selección', previous);
    };
    const remove = index => {
      const previous = items.map(item => ({ ...item }));
      if (!items[index]) return;
      items.splice(index, 1);
      persist();
      showNotice('Pieza quitada de tu selección', previous);
    };
    const removeProduct = id => {
      if (!inSelection(id)) return;
      const previous = items.map(item => ({ ...item }));
      items = items.filter(item => item.id !== id);
      persist();
      showNotice('Pieza quitada de tu selección', previous);
    };
    const change = (index, delta) => {
      const line = items[index];
      if (!line) return;
      line.quantity += delta;
      if (line.quantity < 1) remove(index); else persist();
    };
    const render = () => {
      const containers = ['#cartItems', '#cartPageItems'].map(selector => $(selector)).filter(Boolean);
      const knownItems = items.map((line, index) => ({ ...line, index, product: products.find(product => product.id === line.id) })).filter(line => line.product);
      if (knownItems.length !== items.length) {
        items = knownItems.map(({ index, product, ...line }) => ({ id: line.id, quantity: line.quantity, ...(line.size ? { size: line.size } : {}), ...(line.color ? { color: line.color } : {}) }));
        try { localStorage.setItem('24street-cart', JSON.stringify(items)); } catch (_) {}
      }
      const subtotal = items.reduce((sum, line) => { const product = products.find(item => item.id === line.id); return sum + (product ? product.price * line.quantity : 0); }, 0);
      const displayItems = items.map((line, index) => ({ ...line, index, product: products.find(product => product.id === line.id) })).filter(line => line.product);
      containers.forEach(holder => {
        holder.innerHTML = displayItems.length ? displayItems.map(({ product, quantity, size, color, index }) => `<div class="cart-line">
          <img src="${product.image}" alt="${product.brand} ${product.name}" loading="lazy">
          <div><p>${product.brand}</p><h4>${product.name}</h4>${(size || color) ? `<p class="cart-variant">${[size && `Talle ${size}`, color && `Color ${color}`].filter(Boolean).join(' · ')}</p>` : ''}<div class="qty"><button type="button" data-cart-change="-1" data-index="${index}" aria-label="Restar una unidad de ${product.name}">−</button><span>${quantity}</span><button type="button" data-cart-change="1" data-index="${index}" aria-label="Sumar una unidad de ${product.name}">+</button></div></div>
          <div><strong>${money(product.price * quantity)}</strong><button type="button" class="remove" data-cart-remove="${index}" aria-label="Quitar ${product.name} del carrito">Quitar</button></div>
        </div>`).join('') : `<div class="cart-empty"><span>24</span><p>Tu selección está vacía.</p><a href="${path('catalogo.html')}">Explorar catálogo</a></div>`;
        $$('[data-cart-change]', holder).forEach(button => button.addEventListener('click', () => change(Number(button.dataset.index), Number(button.dataset.cartChange))));
        $$('[data-cart-remove]', holder).forEach(button => button.addEventListener('click', () => remove(Number(button.dataset.cartRemove))));
      });
      updateSelectionButtons();
      const homeTotal = $('#cartTotal');
      const pageTotal = $('#cartPageTotal');
      if (homeTotal) homeTotal.textContent = money(subtotal);
      if (pageTotal) pageTotal.textContent = money(subtotal);
      const checkout = $('#checkoutBtn');
      if (checkout) checkout.disabled = !displayItems.length;
      const checkoutLink = $('#cartCheckoutLink');
      if (checkoutLink) {
        const summary = displayItems.map(({ product, quantity, size, color }) => `${quantity}x ${product.name}${size ? ` (talle ${size})` : ''}${color ? ` (${color})` : ''}`).join(', ');
        checkoutLink.href = `https://wa.me/5493814195683?text=${encodeURIComponent(`Hola 24 STREET, quiero consultar por: ${summary}.`)}`;
        checkoutLink.setAttribute('aria-disabled', String(!displayItems.length));
      }
    };
    window.sharedCart = { add, remove, removeProduct, change, items: () => [...items] };
    updateCount();
    render();
    document.addEventListener('click', event => {
      if (!event.target.closest('[data-cart-undo]') || !notice?._previousCart) return;
      items = notice._previousCart.map(item => ({ ...item }));
      persist();
    });
    document.addEventListener('click', event => {
      const addButton = event.target.closest('[data-add]');
      if (!addButton) return;
      const id = addButton.dataset.add;
      if (inSelection(id)) { removeProduct(id); return; }
      const detail = $('#productMount');
      const size = $('.variant-choice[aria-pressed="true"][data-variant="size"]', detail)?.dataset.value || '';
      const color = $('.variant-choice[aria-pressed="true"][data-variant="color"]', detail)?.dataset.value || '';
      add(id, { size, color });
    });
    window.addEventListener('storage', event => {
      if (event.key !== '24street-cart') return;
      items = safeReadCart();
      updateCount();
      render();
    });
    $('#checkoutBtn')?.addEventListener('click', () => {
      if (!items.length) return;
      const summary = items.map(line => { const product = products.find(item => item.id === line.id); return `${line.quantity}x ${product.name}${line.size ? ` (talle ${line.size})` : ''}${line.color ? ` (${line.color})` : ''}`; }).join(', ');
      window.open(`https://wa.me/5493814195683?text=${encodeURIComponent(`Hola 24 STREET, quiero consultar por: ${summary}.`)}`, '_blank', 'noopener,noreferrer');
    });
  }

  function renderCatalog() {
    const mount = $('#catalogMount');
    if (!mount) return;
    mount.innerHTML = `<div class="route-toolbar"><span id="resultCount" aria-live="polite"></span><a href="${path('ofertas.html')}">Ver ofertas ↗</a></div>
      <button class="filter-toggle" id="catalogFiltersToggle" type="button" aria-expanded="false" aria-controls="catalogFilters">Filtrar y ordenar <span aria-hidden="true">+</span></button>
      <div class="shared-filters" id="catalogFilters" role="group" aria-label="Filtros del catálogo">
        <label>Buscar<input id="catalogSearch" type="search" placeholder="Marca o producto"></label>
        <label>Marca<select id="catalogBrand"><option value="all">Todas</option></select></label>
        <label>Estado<select id="catalogOffer"><option value="all">Todos</option><option value="offers">En oferta</option><option value="regular">Precio regular</option></select></label>
        <label>Precio desde<input id="catalogMin" type="number" min="0" inputmode="numeric" placeholder="$"></label>
        <label>Precio hasta<input id="catalogMax" type="number" min="0" inputmode="numeric" placeholder="$"></label>
        <label>Ordenar<select id="catalogSort"><option value="featured">Destacados</option><option value="low">Precio menor</option><option value="high">Precio mayor</option></select></label>
        <button class="filter-reset" id="catalogReset" type="button">Limpiar filtros</button>
      </div><div class="route-grid" id="catalogGrid" aria-live="polite"></div><p class="empty-state" id="catalogEmpty" role="status">No encontramos piezas con esos filtros.</p>`;
    const base = categoryProducts(category);
    const brandSelect = $('#catalogBrand');
    [...new Set(base.map(product => product.brand))].sort().forEach(value => brandSelect.insertAdjacentHTML('beforeend', `<option value="${value}">${value}</option>`));
    const apply = () => {
      const query = $('#catalogSearch').value.trim().toLocaleLowerCase('es-AR');
      const brandFilter = brandSelect.value;
      const offer = $('#catalogOffer').value;
      const min = Number($('#catalogMin').value) || 0;
      const max = Number($('#catalogMax').value) || Infinity;
      const sort = $('#catalogSort').value;
      let list = base.filter(product => `${product.name} ${product.brand} ${product.category} ${categoryLabel(product.category)}`.toLocaleLowerCase('es-AR').includes(query)
        && (brandFilter === 'all' || product.brand === brandFilter)
        && (offer === 'all' || (offer === 'offers' && product.ofertaActiva) || (offer === 'regular' && !product.ofertaActiva))
        && product.price >= min && product.price <= max);
      if (sort === 'low') list.sort((a, b) => a.price - b.price);
      if (sort === 'high') list.sort((a, b) => b.price - a.price);
      $('#catalogGrid').innerHTML = list.map(card).join('');
      $('#resultCount').textContent = `${list.length} ${list.length === 1 ? 'pieza' : 'piezas'} · catálogo demo`;
      $('#catalogEmpty').classList.toggle('show', !list.length);
      const activeCount = [query, brandFilter !== 'all', offer !== 'all', min > 0, max < Infinity, sort !== 'featured'].filter(Boolean).length;
      $('#catalogFiltersToggle').innerHTML = `Filtrar y ordenar${activeCount ? ` · ${activeCount} activos` : ''} <span aria-hidden="true">${$('#catalogFiltersToggle').getAttribute('aria-expanded') === 'true' ? '−' : '+'}</span>`;
    };
    $('#catalogFiltersToggle').addEventListener('click', event => {
      const button = event.currentTarget;
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      $('#catalogFilters').classList.toggle('filters-open', open);
      const activeCount = [$('#catalogSearch').value.trim(), brandSelect.value !== 'all', $('#catalogOffer').value !== 'all', Number($('#catalogMin').value) > 0, Number($('#catalogMax').value) > 0, $('#catalogSort').value !== 'featured'].filter(Boolean).length;
      button.innerHTML = `Filtrar y ordenar${activeCount ? ` · ${activeCount} activos` : ''} <span aria-hidden="true">${open ? '−' : '+'}</span>`;
    });
    $('#catalogReset').addEventListener('click', () => {
      $('#catalogSearch').value = '';
      brandSelect.value = 'all';
      $('#catalogOffer').value = 'all';
      $('#catalogMin').value = '';
      $('#catalogMax').value = '';
      $('#catalogSort').value = 'featured';
      apply();
    });
    ['catalogSearch', 'catalogBrand', 'catalogOffer', 'catalogMin', 'catalogMax', 'catalogSort'].forEach(id => {
      const node = $(`#${id}`);
      node.addEventListener(node.tagName === 'INPUT' && node.type === 'search' ? 'input' : 'change', apply);
      if (node.type === 'number') node.addEventListener('input', apply);
    });
    apply();
  }

  function renderOffers() {
    const mount = $('#offersMount');
    if (mount) mount.innerHTML = products.filter(product => product.ofertaActiva).map(card).join('') || '<p class="empty-state show">No hay ofertas para mostrar.</p>';
  }

  const logoSlugs = { Casio: 'casio', 'G-Shock': 'gshock', Seiko: 'seiko', Citizen: 'citizen', Tissot: 'tissot', Nike: 'nike', Adidas: 'adidas', Puma: 'puma', 'Levi’s': 'levis', 'New Balance': 'newbalance', Vans: 'vans', Converse: 'converse', 'Carhartt WIP': 'carhartt', 'The North Face': 'thenorthface', 'Ralph Lauren': 'ralphlauren' };
  const logoFallbacks = { Casio: 'casio.com', 'G-Shock': 'gshock.com', Seiko: 'seikowatches.com', Citizen: 'citizenwatch.com', Tissot: 'tissotwatches.com', 'Ralph Lauren': 'ralphlauren.com', 'Levi’s': 'levis.com', 'Carhartt WIP': 'carhartt-wip.com', Puma: 'puma.com', Vans: 'vans.com', Converse: 'converse.com' };
  const logoUrl = value => `https://cdn.simpleicons.org/${logoSlugs[value] || slug(value)}`;
  const logoFallbackUrl = value => logoFallbacks[value] ? `https://logo.clearbit.com/${logoFallbacks[value]}` : '';
  function renderBrands() {
    const mount = $('#brandsMount');
    if (!mount) return;
    const groups = [['Relojes', 'relojes'], ['Ropa', 'ropa'], ['Zapatillas', 'zapatillas'], ['Accesorios', 'accesorios']];
    mount.innerHTML = groups.map(([label, filter]) => {
      const list = categoryProducts(filter);
      const brands = [...new Set(list.map(product => product.brand))].sort();
      if (!brands.length) return '';
      return `<section class="brand-group"><p class="eyebrow">${label}</p><div class="brand-list">${brands.map(value => {
        const sample = list.find(product => product.brand === value);
        const fallback = logoFallbackUrl(value);
        return `<a class="brand-card" href="${brandLink(value)}"><div class="brand-visual" style="background-image:url('${sample.image}')"><span class="brand-logo-fallback">${value}</span><img src="${logoUrl(value)}" data-fallback="${fallback}" alt="Logo de ${value}" loading="lazy" onerror="if(this.dataset.fallback && this.src !== this.dataset.fallback){this.src=this.dataset.fallback}else{this.style.display='none';this.previousElementSibling.style.display='block'}"></div><div><h3>${value}</h3><p>${list.filter(product => product.brand === value).length} piezas demo · Ver selección ↗</p></div></a>`;
      }).join('')}</div></section>`;
    }).join('');
  }

  function renderBrand() {
    const mount = $('#brandMount');
    if (!mount) return;
    const list = products.filter(product => product.brand === brand);
    mount.innerHTML = list.length ? list.map(card).join('') : '<p class="empty-state show">No hay productos demo para esta marca.</p>';
    const title = $('#brandTitle');
    if (title) title.textContent = brand;
  }

  function renderSearch() {
    const input = $('#globalSearch');
    const mount = $('#searchResults');
    if (!input || !mount) return;
    const params = new URLSearchParams(location.search);
    input.value = params.get('q') || '';
    const render = () => {
      const query = input.value.trim().toLocaleLowerCase('es-AR');
      const list = query ? products.filter(product => `${product.name} ${product.brand} ${product.category} ${categoryLabel(product.category)}`.toLocaleLowerCase('es-AR').includes(query)) : [];
      mount.innerHTML = query ? (list.length ? list.map(card).join('') : '<div class="search-empty"><span>24</span><p>No encontramos esa pieza. Probá con otra marca o categoría.</p></div>') : '<div class="search-empty"><span>24</span><p>Buscá por producto, marca o categoría.</p></div>';
    };
    input.addEventListener('input', render);
    render();
  }

  function renderProduct() {
    const mount = $('#productMount');
    if (!mount) return;
    const product = products.find(item => item.id === new URLSearchParams(location.search).get('id'));
    if (!product) { mount.innerHTML = '<p class="empty-state show">Producto no encontrado.</p>'; return; }
    const hasSizes = ['remeras', 'buzos', 'pantalones', 'camperas'].includes(product.category) && product.sizes?.length;
    const hasColors = ['remeras', 'buzos', 'camperas', 'zapatillas'].includes(product.category) && product.colors?.length;
    const sizeOptions = hasSizes ? `<div class="variant-group"><span class="variant-label">Talle de referencia · demo</span><div class="variant-options" role="group" aria-label="Elegir talle de referencia">${product.sizes.map((size, index) => `<button class="variant-choice" type="button" data-variant="size" data-value="${size}" aria-pressed="${index === 0}">${size}</button>`).join('')}</div></div>` : '';
    const colorOptions = hasColors ? `<div class="variant-group"><span class="variant-label">Color de referencia · demo</span><div class="variant-options" role="group" aria-label="Elegir color de referencia">${product.colors.map((color, index) => `<button class="variant-choice" type="button" data-variant="color" data-value="${color}" aria-pressed="${index === 0}">${color}</button>`).join('')}</div></div>` : '';
    mount.innerHTML = `<div class="product-gallery"><div class="product-detail-image"><img src="${product.image}" alt="${product.brand} ${product.name}" fetchpriority="high"></div></div>
      <div class="product-detail-copy"><p class="eyebrow">${categoryLabel(product.category)} / ${product.brand}</p><h1>${product.name}</h1><p>${product.description}</p><strong>${money(product.price)} ${product.oldPrice ? `<span class="old-price">${money(product.oldPrice)}</span>` : ''}</strong><span class="demo-note">Producto, variantes y precio de demostración · disponibilidad a confirmar</span>${sizeOptions}${colorOptions}${selectionButton(product, 'button button-dark', 'productAdd')}<a class="underlink" href="${brandLink(product.brand)}">Ver más de ${product.brand} ↗</a></div>`;
    $$('.variant-choice', mount).forEach(button => button.addEventListener('click', () => {
      $$(`.variant-choice[data-variant="${button.dataset.variant}"]`, mount).forEach(option => option.setAttribute('aria-pressed', String(option === button)));
    }));
    const related = products.filter(item => item.id !== product.id && item.category === product.category).slice(0, 4);
    const relatedSection = $('#relatedProducts');
    const relatedGrid = $('#relatedGrid');
    if (related.length && relatedSection && relatedGrid) {
      relatedGrid.innerHTML = related.map(card).join('');
      relatedSection.hidden = false;
    }
  }

  function transitions() {
    document.documentElement.classList.add('js-motion');
    const reveals = $$('.reveal');
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      }), { threshold: .08, rootMargin: '0px 0px -24px 0px' });
      reveals.forEach(node => observer.observe(node));
    } else reveals.forEach(node => node.classList.add('is-visible'));
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
      let next;
      try { next = new URL(link.href, location.href); } catch (_) { return; }
      if (next.origin !== location.origin || (next.pathname === location.pathname && next.search === location.search) || next.hash && next.pathname === location.pathname && next.search === location.search) return;
      event.preventDefault();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { window.location.assign(next.href); return; }
      document.body.classList.add('is-leaving');
      const screen = document.createElement('div');
      screen.className = 'loading-screen page-transition-screen';
      screen.setAttribute('aria-hidden', 'true');
      screen.innerHTML = loadingMarkup();
      document.body.append(screen);
      requestAnimationFrame(() => screen.classList.add('is-active'));
      window.setTimeout(() => window.location.assign(next.href), 360);
    });
  }

  function scrollHeader() {
    const target = $('header.site-header');
    if (!target) return;
    const update = () => target.classList.toggle('scrolled', window.scrollY > 36);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function init() {
    header(); footer(); theme(); accent(); cart(); loading(); transitions(); scrollHeader();
    if (view === 'catalog') renderCatalog();
    if (view === 'offers') renderOffers();
    if (view === 'brands') renderBrands();
    if (view === 'brand') renderBrand();
    if (view === 'search') renderSearch();
    if (view === 'product') renderProduct();
    if (view === 'settings') settings();
    $$('[data-demo]').forEach(node => { node.textContent = 'Catálogo y precios de demostración'; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
