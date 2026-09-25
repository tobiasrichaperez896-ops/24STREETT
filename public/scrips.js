/* 24 STREET — home page interactions */
(() => {
  const products = catalogData.products;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const brandmark = () => `<svg class="wordmark-art" viewBox="0 0 340 84" aria-hidden="true" focusable="false"><text x="0" y="70" fill="currentColor" font-family="Arial Narrow,Arial,sans-serif" font-size="82" font-stretch="condensed" font-weight="800" letter-spacing="-8">24</text><path d="M101 13v58" stroke="var(--accent)" stroke-width="4"/><text x="120" y="59" fill="currentColor" font-family="Arial,sans-serif" font-size="36" font-weight="700" letter-spacing="5">STREET</text></svg>`;
  const loadingMarkup = () => `<div class="loading-mark">${brandmark()}<div class="loading-line"><i></i></div></div>`;
  const money = value => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value).replace('ARS', '').trim();
  const categoryLabel = value => ({ remeras: 'Ropa', buzos: 'Ropa', pantalones: 'Ropa', camperas: 'Ropa', relojes: 'Relojes', zapatillas: 'Zapatillas', accesorios: 'Accesorios' })[value] || value;
  const brandSlug = value => ({ Casio: 'relojes/casio', 'G-Shock': 'relojes/gshock', Seiko: 'relojes/seiko', Citizen: 'relojes/citizen', Tissot: 'relojes/tissot', Nike: 'ropa/nike', Adidas: 'ropa/adidas', Puma: 'ropa/puma', 'Levi’s': 'ropa/levis', 'New Balance': 'zapatillas/newbalance', Vans: 'zapatillas/vans', Converse: 'zapatillas/converse', 'Carhartt WIP': 'ropa/carhartt', 'The North Face': 'ropa/thenorthface', 'Ralph Lauren': 'ropa/ralphlauren' })[value] || 'ropa/nike';
  const safeRead = () => {
    try {
      const value = JSON.parse(localStorage.getItem('24street-cart') || '[]');
      return Array.isArray(value) ? value.filter(line => line && typeof line.id === 'string' && Number(line.quantity) > 0).map(line => ({ ...line, quantity: Number(line.quantity) })) : [];
    } catch (_) { return []; }
  };
  let cart = safeRead();
  let cartUndo = null;
  let cartNoticeTimer = null;
  const isInCart = id => cart.some(line => line.id === id);

  function applyAppearance() {
    try {
      const accent = localStorage.getItem('24street-accent') || 'gold';
      document.documentElement.setAttribute('data-accent', accent);
      const theme = localStorage.getItem('24street-theme');
      if (theme) document.documentElement.setAttribute('data-theme', theme);
    } catch (_) {}
  }

  function syncCount() {
    const count = cart.reduce((sum, line) => sum + line.quantity, 0);
    const countNode = $('#cartCount');
    const headCount = $('#cartHeadCount');
    if (countNode) countNode.textContent = count;
    if (headCount) headCount.textContent = `(${count})`;
    $('#cartToggle')?.setAttribute('aria-label', `Carrito, ${count} ${count === 1 ? 'producto' : 'productos'}`);
  }

  function syncHomeSelectionButtons() {
    $$('[data-home-add]').forEach(button => {
      const product = products.find(item => item.id === button.dataset.homeAdd);
      if (!product) return;
      const selected = isInCart(product.id);
      button.classList.toggle('is-added', selected);
      button.setAttribute('aria-pressed', String(selected));
      button.setAttribute('aria-label', selected ? `Quitar ${product.name} de tu selección` : `Agregar ${product.name} a la selección`);
      button.innerHTML = selected
        ? '<span class="selection-check" aria-hidden="true">✓</span> En tu selección <span class="selection-remove" aria-hidden="true">Quitar</span>'
        : 'Agregar a selección <span aria-hidden="true">+</span>';
    });
  }

  function openCart() {
    const drawer = $('#cartDrawer');
    drawer?.classList.add('open');
    drawer?.setAttribute('aria-hidden', 'false');
    drawer?.removeAttribute('inert');
    $('#overlay')?.classList.add('open');
    document.body.classList.add('locked');
    window.setTimeout(() => $('#cartClose')?.focus(), 30);
  }

  function closeCart() {
    const drawer = $('#cartDrawer');
    drawer?.classList.remove('open');
    drawer?.setAttribute('aria-hidden', 'true');
    drawer?.setAttribute('inert', '');
    $('#overlay')?.classList.remove('open');
    document.body.classList.remove('locked');
    $('#cartToggle')?.focus();
  }

  function renderCart() {
    const count = cart.reduce((sum, line) => sum + line.quantity, 0);
    const total = cart.reduce((sum, line) => {
      const product = products.find(item => item.id === line.id);
      return sum + (product ? product.price * line.quantity : 0);
    }, 0);
    syncCount();
    syncHomeSelectionButtons();
    const holder = $('#cartItems');
    if (!holder) return;
    const valid = cart.filter(line => products.some(product => product.id === line.id));
    if (valid.length !== cart.length) { cart = valid; writeCart(); }
    if (!cart.length) {
      holder.innerHTML = '<div class="cart-empty"><span>24</span><p>Tu selección está vacía.</p><a href="catalogo.html">Explorar catálogo</a></div>';
    } else {
      holder.innerHTML = cart.map((line, index) => {
        const product = products.find(item => item.id === line.id);
        const variants = [line.size && `Talle ${line.size}`, line.color && `Color ${line.color}`].filter(Boolean).join(' · ');
        return `<div class="cart-line"><img src="${product.image}" alt="${product.brand} ${product.name}" loading="lazy"><div><p>${product.brand}</p><h4>${product.name}</h4>${variants ? `<p class="cart-variant">${variants}</p>` : ''}<div class="qty"><button type="button" data-quantity="${index}" data-change="-1" aria-label="Restar una unidad de ${product.name}">−</button><span>${line.quantity}</span><button type="button" data-quantity="${index}" data-change="1" aria-label="Sumar una unidad de ${product.name}">+</button></div></div><div><strong>${money(product.price * line.quantity)}</strong><button type="button" class="remove" data-remove="${index}" aria-label="Quitar ${product.name} del carrito">Quitar</button></div></div>`;
      }).join('');
      $$('[data-quantity]').forEach(button => button.addEventListener('click', () => changeQuantity(Number(button.dataset.quantity), Number(button.dataset.change))));
      $$('[data-remove]').forEach(button => button.addEventListener('click', () => removeFromCart(Number(button.dataset.remove))));
    }
    const totalNode = $('#cartTotal');
    if (totalNode) totalNode.textContent = money(total);
    const checkout = $('#checkoutBtn');
    if (checkout) checkout.disabled = !count;
  }

  function writeCart() {
    const notice = $('#cartNotice');
    if (notice) { notice.classList.remove('show'); notice._previousCart = null; window.clearTimeout(notice._timer); }
    cartUndo = null;
    window.clearTimeout(cartNoticeTimer);
    try { localStorage.setItem('24street-cart', JSON.stringify(cart)); } catch (_) {}
    renderCart();
  }

  function showCartNotice(message, previous) {
    const notice = $('#cartNotice');
    if (!notice) return;
    cartUndo = previous;
    notice.innerHTML = `<span>${message}</span><button type="button" class="cart-notice-undo" data-cart-undo>Deshacer</button>`;
    notice.classList.add('show');
    window.clearTimeout(cartNoticeTimer);
    cartNoticeTimer = window.setTimeout(() => notice.classList.remove('show'), 7000);
  }

  function addToCart(id) {
    const product = products.find(item => item.id === id);
    if (!product) return;
    const previous = cart.map(item => ({ ...item }));
    const line = cart.find(item => item.id === id && !item.size && !item.color);
    if (line) line.quantity += 1;
    else cart.push({ id, quantity: 1 });
    writeCart();
    showCartNotice('Pieza agregada a tu selección', previous);
  }

  function changeQuantity(index, delta) {
    const line = cart[index];
    if (!line) return;
    line.quantity += delta;
    if (line.quantity < 1) cart.splice(index, 1);
    writeCart();
  }

  function removeFromCart(index) {
    const previous = cart.map(item => ({ ...item }));
    if (!cart[index]) return;
    cart.splice(index, 1);
    writeCart();
    showCartNotice('Pieza quitada de tu selección', previous);
  }

  function removeProductFromCart(id) {
    if (!isInCart(id)) return;
    const previous = cart.map(item => ({ ...item }));
    cart = cart.filter(line => line.id !== id);
    writeCart();
    showCartNotice('Pieza quitada de tu selección', previous);
  }

  function productCard(product) {
    const fallback = catalogData.imagePool[product.category]?.[0] || catalogData.imagePool.zapatillas[0];
    const selected = isInCart(product.id);
    return `<article class="product-card">
      <a class="product-image" href="producto.html?id=${encodeURIComponent(product.id)}" aria-label="Ver ${product.brand} ${product.name}">
        ${product.ofertaActiva ? `<span class="product-tag">${product.discount || 'Oferta'}</span>` : ''}
        <img src="${product.image}" alt="${product.brand} ${product.name}" loading="lazy" onerror="this.onerror=null;this.src='${fallback}'">
      </a>
      <a class="product-brand" href="marcas/${brandSlug(product.brand)}.html">${product.brand}</a>
      <h3 class="product-name"><a href="producto.html?id=${encodeURIComponent(product.id)}">${product.name}</a></h3>
      <div class="product-price">${money(product.price)} ${product.oldPrice ? `<span class="old-price">${money(product.oldPrice)}</span>` : ''}</div>
      <button type="button" class="quick-add${selected ? ' is-added' : ''}" data-home-add="${product.id}" aria-pressed="${selected}" aria-label="${selected ? `Quitar ${product.name} de tu selección` : `Agregar ${product.name} a la selección`}">${selected ? '<span class="selection-check" aria-hidden="true">✓</span> En tu selección <span class="selection-remove" aria-hidden="true">Quitar</span>' : 'Agregar a selección <span aria-hidden="true">+</span>'}</button>
    </article>`;
  }

  function renderHomeFeatured() {
    const holder = $('#homeFeaturedGrid');
    if (!holder) return;
    const wanted = [['buzos', 'Nike', 'Tech Fleece Hoodie'], ['remeras', 'Nike', 'Sportswear Essential Tee'], ['zapatillas', 'Nike', 'Air Force 1 ’07'], ['accesorios', 'Adidas', 'Adicolor Cap']];
    const list = wanted.map(([category, brand, name]) => products.find(product => product.category === category && product.brand === brand && product.name === name)).filter(Boolean);
    holder.innerHTML = list.map(productCard).join('');
  }

  function renderHomeCatalog() {
    const holder = $('#productGrid');
    if (!holder) return;
    let filter = 'all';
    let visibleCount = 8;
    let list = [...products];
    const sortSelect = $('#sortSelect');
    const more = $('#loadMore');
    const buttons = $$('#categoryFilters [data-filter]');
    const filtered = () => products.filter(product => filter === 'all' || product.category === filter);
    const render = () => {
      list = filtered();
      if (sortSelect?.value === 'low') list.sort((a, b) => a.price - b.price);
      if (sortSelect?.value === 'high') list.sort((a, b) => b.price - a.price);
      const shown = list.slice(0, visibleCount);
      holder.innerHTML = shown.map(productCard).join('');
      $('#emptyState')?.classList.toggle('show', !list.length);
      if (more) {
        more.hidden = list.length <= visibleCount;
        more.setAttribute('aria-label', `Ver más piezas, ${Math.max(0, list.length - visibleCount)} restantes`);
      }
    };
    buttons.forEach(button => button.addEventListener('click', () => {
      filter = button.dataset.filter;
      visibleCount = 8;
      buttons.forEach(item => {
        const active = item === button;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      render();
    }));
    sortSelect?.addEventListener('change', render);
    more?.addEventListener('click', () => { visibleCount += 8; render(); });
    render();
  }

  function setupSearch() {
    const toggle = $('#searchToggle');
    const panel = $('#searchPanel');
    const input = $('#searchInput');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', event => {
      event.preventDefault();
      const open = panel.classList.toggle('open');
      if (open) input?.focus();
    });
    input?.addEventListener('input', event => {
      const query = event.target.value.trim().toLocaleLowerCase('es-AR');
      const hits = products.filter(product => `${product.name} ${product.brand} ${product.category} ${categoryLabel(product.category)}`.toLocaleLowerCase('es-AR').includes(query));
      const meta = $('#searchResultsMeta');
      if (meta) meta.textContent = query ? `${hits.length} ${hits.length === 1 ? 'pieza encontrada' : 'piezas encontradas'}` : 'Explorá productos, marcas y categorías.';
    });
    $$('[data-search]').forEach(button => button.addEventListener('click', () => {
      if (!input) return;
      input.value = button.dataset.search;
      input.dispatchEvent(new Event('input'));
      input.focus();
    }));
  }

  function setupMenu() {
    const toggle = $('#menuToggle');
    const nav = $('#mobileNav');
    if (!toggle || !nav) return;
    const close = () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
      document.body.classList.remove('locked');
    };
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      document.body.classList.toggle('locked', open);
    });
    $$('a', nav).forEach(link => link.addEventListener('click', close));
  }

  function setupCart() {
    $('#cartToggle')?.addEventListener('click', event => { event.preventDefault(); openCart(); });
    $('#cartClose')?.addEventListener('click', closeCart);
    $('#overlay')?.addEventListener('click', closeCart);
    $('#checkoutBtn')?.addEventListener('click', () => {
      if (!cart.length) return;
      const summary = cart.map(line => {
        const product = products.find(item => item.id === line.id);
        return `${line.quantity}x ${product.name}${line.size ? ` (talle ${line.size})` : ''}${line.color ? ` (color ${line.color})` : ''}`;
      }).join(', ');
      window.open(`https://wa.me/5493814195683?text=${encodeURIComponent(`Hola 24 STREET, quiero consultar por: ${summary}.`)}`, '_blank', 'noopener,noreferrer');
    });
    document.addEventListener('click', event => {
      const undo = event.target.closest('[data-cart-undo]');
      if (undo && cartUndo) {
        cart = cartUndo.map(item => ({ ...item }));
        writeCart();
        return;
      }
      const button = event.target.closest('[data-home-add]');
      if (button) {
        if (isInCart(button.dataset.homeAdd)) removeProductFromCart(button.dataset.homeAdd);
        else addToCart(button.dataset.homeAdd);
      }
    });
    window.addEventListener('storage', event => {
      if (event.key !== '24street-cart') return;
      cart = safeRead();
      renderCart();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        if ($('#cartDrawer')?.classList.contains('open')) closeCart();
        const search = $('#searchPanel');
        if (search?.classList.contains('open')) { search.classList.remove('open'); $('#searchToggle')?.focus(); }
        const menu = $('#mobileNav');
        if (menu?.classList.contains('open')) {
          menu.classList.remove('open');
          $('#menuToggle')?.setAttribute('aria-expanded', 'false');
          $('#menuToggle')?.setAttribute('aria-label', 'Abrir menú');
          document.body.classList.remove('locked');
          $('#menuToggle')?.focus();
        }
      }
      if (event.key === 'Tab' && $('#cartDrawer')?.classList.contains('open')) {
        const focusable = $$('button:not(:disabled),a[href]', $('#cartDrawer'));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
  }

  function setupScroll() {
    const header = $('#siteHeader');
    if (!header) return;
    const update = () => header.classList.toggle('scrolled', window.scrollY > 36);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function setupAnchors() {
    const scrollToTarget = () => {
      const id = location.hash.slice(1);
      const target = id === 'catalogo' ? $('#catalogo-home') : id ? document.getElementById(id) : null;
      if (target) window.setTimeout(() => target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }), 40);
    };
    window.addEventListener('hashchange', scrollToTarget);
    scrollToTarget();
  }

  function setupLoader() {
    const screen = $('#loadingScreen');
    if (!screen) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { screen.remove(); return; }
    let seen = false;
    try { seen = sessionStorage.getItem('24street-seen') === '1'; } catch (_) {}
    if (seen) { screen.remove(); return; }
    try { sessionStorage.setItem('24street-seen', '1'); } catch (_) {}
    const started = performance.now();
    const finish = () => window.setTimeout(() => {
      screen.classList.add('is-done');
      window.setTimeout(() => screen.remove(), 820);
    }, Math.max(0, 1100 - (performance.now() - started)));
    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish, { once: true });
    window.setTimeout(() => screen.classList.add('is-done'), 1500);
  }

  function setupHeroVideo() {
    const video = $('#heroVideo');
    const source = video?.querySelector('source[data-src]');
    if (!video || !source) return;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const saveData = connection?.saveData || /(^|-)2g/.test(connection?.effectiveType || '');
    if (reducedMotion.matches || saveData) return;

    const play = () => {
      if (document.hidden || reducedMotion.matches) return;
      if (!source.src) {
        source.src = source.dataset.src;
        video.load();
      }
      video.play().catch(() => {});
    };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        observer.disconnect();
        play();
      }, { rootMargin: '180px 0px' });
      observer.observe(video);
    } else play();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) video.pause();
      else if (source.src && !reducedMotion.matches) video.play().catch(() => {});
    });
    reducedMotion.addEventListener?.('change', event => {
      if (event.matches) video.pause();
      else if (source.src) video.play().catch(() => {});
    });
  }

  function setupMotionAndTransitions() {
    document.documentElement.classList.add('js-motion');
    const reveals = $$('.reveal');
    if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { location.assign(next.href); return; }
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

  function init() {
    applyAppearance(); renderHomeFeatured(); renderHomeCatalog(); renderCart();
    setupCart(); setupSearch(); setupMenu(); setupScroll(); setupAnchors(); setupLoader(); setupHeroVideo(); setupMotionAndTransitions();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
