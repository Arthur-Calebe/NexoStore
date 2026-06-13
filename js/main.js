/* =============================================
   NEXO STORE — main.js
   ============================================= */

'use strict';

// Limit=0 busca todas as categorias da API
const API_URL = 'https://dummyjson.com/products?limit=0';
const CART_KEY = 'nexo_cart';

/* ---- Cart utilities ---- */
const Cart = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  },

  save(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    Cart.updateBadge();
  },

  add(product) {
    const items = Cart.get();
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({
        id: product.id,
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
        qty: 1
      });
    }
    Cart.save(items);
    showToast(`"${product.title.slice(0, 28)}…" adicionado ao carrinho`);
  },

  updateBadge() {
    const badge = document.querySelector('.nav__cart-badge');
    if (!badge) return;
    const total = Cart.get().reduce((s, i) => s + i.qty, 0);
    badge.textContent = total > 99 ? '99+' : total;
    badge.classList.toggle('visible', total > 0);
  },

  total() {
    return Cart.get().reduce((s, i) => s + i.price * i.qty, 0);
  }
};

/* ---- Toast ---- */
function showToast(msg, duration = 2800) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="ph-fill ph-check-circle" style="color: var(--accent); margin-right: 8px;"></i> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

/* ---- Highlight active nav link ---- */
function setActiveNavLink() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href').split('/').pop();
    link.classList.toggle('active', href === path);
  });
}

/* ---- On DOM ready ---- */
document.addEventListener('DOMContentLoaded', () => {
  Cart.updateBadge();
  setActiveNavLink();

  if (document.querySelector('.products-page')) initProductsPage();
  if (document.querySelector('.cart-page')) initCartPage();

  // Menu hambúrguer
const hamburger = document.querySelector('.nav__hamburger');
const navLinks  = document.querySelector('.nav__links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    hamburger.querySelector('i').className = isOpen ? 'ph ph-x' : 'ph ph-list';
  });

  // Fecha ao clicar em qualquer link
  navLinks.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      hamburger.querySelector('i').className = 'ph ph-list';
    });
  });
}
});

/* =============================================
   PRODUCTS PAGE
   ============================================= */
function initProductsPage() {
  let allProducts = [];
  let categories = [];
  let activeCategory = 'all';
  let searchQuery = '';
  
  let currentPage = 1;
  const itemsPerPage = 12;

  const grid = document.getElementById('productsGrid');
  const spinnerWrap = document.getElementById('spinnerWrap');
  const searchInput = document.getElementById('searchInput');
  const catFilters = document.getElementById('categoryFilters');
  const paginationEl = document.getElementById('pagination');

  async function fetchProducts() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      allProducts = data.products;
      categories = [...new Set(allProducts.map(p => p.category))].sort();
      renderCategories();
      renderProducts();
    } catch (err) {
      grid.innerHTML = `
        <div class="no-results">
          <i class="ph ph-warning no-results__icon"></i>
          <div class="no-results__title">Erro ao carregar produtos</div>
          <p style="color:var(--text-muted);font-size:.85rem">Verifique sua conexão e tente novamente.</p>
        </div>`;
    } finally {
      spinnerWrap.classList.add('hidden');
      grid.classList.remove('hidden');
    }
  }

  function renderCategories() {
    catFilters.innerHTML = '';
    const allBtn = document.createElement('button');
    allBtn.className = 'category-btn active';
    allBtn.textContent = 'Todos';
    allBtn.dataset.cat = 'all';
    catFilters.appendChild(allBtn);

    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'category-btn';
      btn.textContent = cat.replace(/-/g, ' ');
      btn.dataset.cat = cat;
      catFilters.appendChild(btn);
    });

    catFilters.addEventListener('click', e => {
      const btn = e.target.closest('.category-btn');
      if (!btn) return;
      activeCategory = btn.dataset.cat;
      catFilters.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      currentPage = 1;
      renderProducts();
    });
  }

  function renderProducts() {
    const query = searchQuery.toLowerCase();
    
    const filtered = allProducts.filter(p => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const matchSearch = !query || p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query);
      return matchCat && matchSearch;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="no-results">
          <i class="ph ph-magnifying-glass no-results__icon"></i>
          <div class="no-results__title">Nenhum produto encontrado</div>
          <p style="color:var(--text-muted);font-size:.85rem">Tente outro termo ou categoria.</p>
        </div>`;
      if(paginationEl) paginationEl.innerHTML = '';
      return;
    }

    grid.innerHTML = '';
    paginatedItems.forEach(p => grid.appendChild(createProductCard(p)));

    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    if (!paginationEl) return;
    paginationEl.innerHTML = '';

    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
      btn.textContent = i;
      
      btn.addEventListener('click', () => {
        currentPage = i;
        renderProducts();
        window.scrollTo({ 
          top: document.querySelector('.products-page').offsetTop - 20, 
          behavior: 'smooth' 
        });
      });
      
      paginationEl.appendChild(btn);
    }
  }

  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value.trim();
    currentPage = 1; 
    renderProducts();
  });

  fetchProducts();
}

function createProductCard(p) {
  const stock = p.availabilityStatus || (p.stock > 10 ? 'In Stock' : p.stock > 0 ? 'Low Stock' : 'Out of Stock');
  const stockClass = stock.toLowerCase().replace(/\s/g, '-') === 'in-stock' ? 'in-stock'
                   : stock.toLowerCase().includes('low') ? 'low-stock' : 'out-stock';

  const scene = document.createElement('div');
  scene.className = 'card-scene';

  scene.innerHTML = `
    <div class="card-flipper">
      <article class="card-face card-face--front">
        <div class="card-img-wrap">
          <img src="${p.images?.[0] || p.thumbnail}" alt="${p.title}" loading="lazy" decoding="async" width="300" height="200" />
          <span class="card-availability ${stockClass}">${stock}</span>
        </div>
        <div class="card-body">
          <h3 class="card-name">${p.title}</h3>
          <p class="card-price">$${p.price.toFixed(2)}</p>
          <p class="card-desc">${p.description}</p>
        </div>
        <div class="card-actions">
          <button class="btn-add" aria-label="Adicionar ao carrinho">
            <i class="ph ph-shopping-cart-simple"></i> Adicionar
          </button>
          <button class="btn-flip" aria-label="Ver avaliações" title="Ver avaliações">
            <i class="ph ph-arrows-clockwise"></i>
          </button>
        </div>
      </article>

      <aside class="card-face card-face--back">
        <div class="card-back-header">
          <span class="card-back-title"><i class="ph-fill ph-star" style="margin-right: 4px;"></i> Avaliações</span>
          <button class="btn-flip-back" aria-label="Voltar ao produto"><i class="ph ph-x"></i></button>
        </div>
        <div class="card-reviews">
          ${buildReviews(p.reviews)}
        </div>
        <div class="card-back-footer">
          <div class="card-rating-avg">
            <span class="card-rating-num">${p.rating?.toFixed(1) || '—'}</span>
            <span>média · ${p.reviews?.length || 0} avaliações</span>
          </div>
        </div>
      </aside>
    </div>
  `;

  scene.querySelector('.btn-add').addEventListener('click', () => Cart.add(p));
  scene.querySelector('.btn-flip').addEventListener('click', () => scene.classList.add('flipped'));
  scene.querySelector('.btn-flip-back').addEventListener('click', () => scene.classList.remove('flipped'));

  return scene;
}

function buildReviews(reviews) {
  if (!reviews || reviews.length === 0) {
    return '<p class="no-reviews">Nenhuma avaliação disponível.</p>';
  }
  return reviews.map(r => {
    const stars = buildStars(r.rating);
    const date = r.date ? new Date(r.date).toLocaleDateString('pt-BR') : '';
    return `
      <div class="review-subcard">
        <div class="review-meta">
          <span class="review-reviewer">${r.reviewerName || 'Anônimo'}</span>
          <div class="review-stars" aria-label="Nota: ${r.rating}">${stars}</div>
        </div>
        <p class="review-comment">${r.comment || ''}</p>
        ${date ? `<span class="review-date">${date}</span>` : ''}
      </div>`;
  }).join('');
}

function buildStars(rating) {
  return Array.from({ length: 5 }, (_, i) => 
    `<i class="ph-fill ph-star review-star ${i < Math.round(rating) ? 'filled' : 'empty'}"></i>`
  ).join('');
}

/* =============================================
   CART PAGE
   ============================================= */
function initCartPage() {
  const emptyEl = document.getElementById('cartEmpty');
  const itemsEl = document.getElementById('cartItems');
  const summaryEl = document.getElementById('cartSummary');
  const subtotalEl = document.getElementById('summarySubtotal');
  const shippingEl = document.getElementById('summaryShipping');
  const totalEl = document.getElementById('summaryTotal');
  const countEl = document.querySelector('.cart-page__count');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const modal = document.getElementById('purchaseModal');
  const modalTotal = document.getElementById('modalTotal');
  const modalNote = document.getElementById('modalShippingNote');
  const modalClose = document.getElementById('modalClose');

  function render() {
    const items = Cart.get();
    const totalQty = items.reduce((s, i) => s + i.qty, 0);

    if (countEl) countEl.textContent = `${totalQty} ${totalQty === 1 ? 'item' : 'itens'} no carrinho`;

    if (items.length === 0) {
      emptyEl.classList.remove('hidden');
      itemsEl.classList.add('hidden');
      summaryEl.classList.add('hidden');
      return;
    }

    emptyEl.classList.add('hidden');
    itemsEl.classList.remove('hidden');
    summaryEl.classList.remove('hidden');

    itemsEl.innerHTML = '';
    items.forEach(item => itemsEl.appendChild(createCartCard(item)));

    const subtotal = Cart.total();
    const shipping = subtotal >= 500 ? 0 : 15;
    const total = subtotal + shipping;

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Grátis' : `$${shipping.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
  }

  function createCartCard(item) {
    const card = document.createElement('div');
    card.className = 'cart-card';
    card.innerHTML = `
      <div class="cart-card__img">
        <img src="${item.thumbnail}" alt="${item.title}" loading="lazy" decoding="async" width="100" height="100" />
      </div>
      <div class="cart-card__info">
        <p class="cart-card__name">${item.title}</p>
        <p class="cart-card__price">$${item.price.toFixed(2)}</p>
        <div class="cart-card__qty">
          <button class="qty-btn remove" aria-label="Remover uma unidade"><i class="ph ph-minus"></i></button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn add" aria-label="Adicionar uma unidade"><i class="ph ph-plus"></i></button>
        </div>
      </div>
      <button class="cart-card__remove" aria-label="Remover produto do carrinho"><i class="ph ph-x"></i></button>
    `;

    card.querySelector('.qty-btn.remove').addEventListener('click', () => {
      const list = Cart.get();
      const idx = list.findIndex(i => i.id === item.id);
      if (idx === -1) return;
      if (list[idx].qty > 1) list[idx].qty -= 1;
      else list.splice(idx, 1);
      Cart.save(list);
      render();
    });

    card.querySelector('.qty-btn.add').addEventListener('click', () => {
      const list = Cart.get();
      const idx = list.findIndex(i => i.id === item.id);
      if (idx !== -1) list[idx].qty += 1;
      Cart.save(list);
      render();
    });

    card.querySelector('.cart-card__remove').addEventListener('click', () => {
      const list = Cart.get().filter(i => i.id !== item.id);
      Cart.save(list);
      render();
      showToast(`"${item.title.slice(0, 24)}…" removido`);
    });

    return card;
  }

  /* ---- FIX: função auxiliar para fechar o modal e limpar o carrinho ---- */
  function closeModalAndClear() {
    modal.classList.remove('open');
    Cart.save([]);
    render();
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      const subtotal = Cart.total();
      const shipping = subtotal >= 500 ? 0 : 15;
      const total = subtotal + shipping;

      if (modalTotal) modalTotal.textContent = `$${total.toFixed(2)}`;
      if (modalNote) {
        if (subtotal >= 500) {
          modalNote.innerHTML = '<i class="ph-fill ph-check-circle"></i> Frete grátis aplicado!';
          modalNote.className = 'modal__shipping-note free';
        } else {
          modalNote.innerHTML = `<i class="ph-fill ph-info"></i> Compras acima de $500 têm frete grátis.`;
          modalNote.className = 'modal__shipping-note paid';
        }
      }

      /* FIX: apenas abre o modal aqui — limpeza acontece ao fechar */
      modal.classList.add('open');
    });
  }

  if (modalClose) {
    /* FIX: limpa o carrinho e atualiza a tela ao fechar o modal */
    modalClose.addEventListener('click', closeModalAndClear);
  }

  if (modal) {
    /* FIX: mesmo comportamento ao clicar fora do modal */
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModalAndClear();
    });
  }

  render();
}