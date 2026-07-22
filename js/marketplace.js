// ============================================================
// AgroSmartHub 3.0 — Marketplace
// ============================================================

let cartItems = [];
let activeCategory = 'all';
let searchQuery = '';

function renderMarketplace(container) {
  updateTopbar('Marketplace', 'Buy certified produce directly from farmers');
  cartItems = JSON.parse(sessionStorage.getItem('ash_cart') || '[]');

  container.innerHTML = `
    <!-- Toolbar -->
    <div class="market-toolbar" style="margin-bottom:24px">
      <div class="market-search glass-card" style="padding:10px 16px">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Search crops, farmers, locations…" id="marketSearch" onkeyup="filterProducts()" />
      </div>
      <div class="market-filters">
        ${['all','vegetables','fruits','grains','seeds'].map(cat => `
          <button class="filter-chip ${cat === activeCategory ? 'active' : ''}" onclick="filterCategory('${cat}')">${capitalize(cat)}</button>
        `).join('')}
      </div>
      <select class="form-select" id="sortSelect" onchange="filterProducts()" style="width:auto;padding:8px 12px">
        <option value="default">Sort: Featured</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="grade">By Grade</option>
        <option value="certified">Certified First</option>
      </select>
      <button onclick="toggleCart()" style="position:relative;padding:10px 18px;background:linear-gradient(135deg,var(--green-600),var(--teal-600));border:none;border-radius:var(--radius-full);color:white;font-family:Outfit,sans-serif;font-weight:600;font-size:.85rem;cursor:pointer">
        🛒 Cart
        <span id="cartBadge" style="position:absolute;top:-6px;right:-6px;background:var(--red-500);color:white;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:.65rem;font-weight:700;${cartItems.length?'':'display:none !important'}">${cartItems.length}</span>
      </button>
    </div>

    <!-- Certified Banner -->
    <div style="background:linear-gradient(135deg,rgba(22,163,74,0.1),rgba(13,148,136,0.1));border:1px solid rgba(22,163,74,0.2);border-radius:var(--radius-lg);padding:16px 24px;margin-bottom:24px;display:flex;align-items:center;gap:16px;flex-wrap:wrap">
      <span style="font-size:1.5rem">🏅</span>
      <div style="flex:1">
        <div style="font-weight:700;font-size:.9rem">AI-Certified Products Available</div>
        <div style="font-size:.78rem;color:var(--text-muted)">All certified products have passed AI health analysis + expert verification. 100% quality guarantee.</div>
      </div>
      <div style="display:flex;gap:8px">
        <label style="display:flex;align-items:center;gap:8px;font-size:.8rem;cursor:pointer">
          <input type="checkbox" id="certifiedOnly" onchange="filterProducts()" />
          Show certified only
        </label>
      </div>
    </div>

    <!-- Products Grid -->
    <div class="products-grid" id="productsGrid"></div>

    <!-- Cart Drawer -->
    <div id="cartDrawer" style="display:none;position:fixed;right:0;top:0;height:100vh;width:360px;background:rgba(7,26,12,0.98);backdrop-filter:blur(20px);border-left:1px solid var(--border);z-index:200;padding:24px;overflow-y:auto;animation:slide-from-right .3s ease">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h3>🛒 Shopping Cart</h3>
        <button onclick="toggleCart()" style="background:none;border:1px solid var(--border);width:32px;height:32px;border-radius:50%;color:var(--text-muted);cursor:pointer;font-size:.8rem">✕</button>
      </div>
      <div id="cartContent"></div>
    </div>
  `;

  filterProducts();
}

function filterCategory(cat) {
  activeCategory = cat;
  document.querySelectorAll('.filter-chip').forEach(b => {
    b.classList.toggle('active', b.textContent.toLowerCase() === cat);
  });
  filterProducts();
}

function filterProducts() {
  const search = document.getElementById('marketSearch')?.value.toLowerCase() || '';
  const certOnly = document.getElementById('certifiedOnly')?.checked || false;
  const sort = document.getElementById('sortSelect')?.value || 'default';

  let filtered = [...ASH.products];
  if (activeCategory !== 'all') filtered = filtered.filter(p => p.category === activeCategory);
  if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search) || p.farmer.toLowerCase().includes(search) || p.location.toLowerCase().includes(search));
  if (certOnly) filtered = filtered.filter(p => p.certified);

  if (sort === 'price-asc') filtered.sort((a,b) => a.price - b.price);
  else if (sort === 'price-desc') filtered.sort((a,b) => b.price - a.price);
  else if (sort === 'grade') filtered.sort((a,b) => a.grade.localeCompare(b.grade));
  else if (sort === 'certified') filtered.sort((a,b) => (b.certified?1:0) - (a.certified?1:0));

  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  if (!filtered.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted)">
      <div style="font-size:3rem;margin-bottom:12px">🔍</div>
      <div style="font-size:.9rem">No products found. Try different filters.</div>
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="product-card" onclick="showProductDetail('${p.id}')">
      <div class="product-img-wrap">
        <div class="product-emoji">${p.emoji}</div>
        ${p.certified ? '<span class="product-cert-badge">🏅 AI Certified</span>' : ''}
      </div>
      <div class="product-body">
        <div class="product-name">${p.name}</div>
        <div class="product-farmer">🧑‍🌾 ${p.farmer}</div>
        <div class="product-farmer">📍 ${p.location}</div>
        <div style="font-size:.72rem;color:var(--text-muted);margin:4px 0;line-height:1.5">${p.desc.substring(0,60)}…</div>
        <div class="product-footer">
          <div><span class="product-price">₹${p.price}</span><span class="product-unit">/${p.unit}</span></div>
          <span class="product-grade grade-${p.grade.toLowerCase().replace('+','')}">${p.grade}</span>
        </div>
        <div class="product-stock">Stock: ${p.quantity} ${p.unit}</div>
        <div style="display:flex;gap:6px;margin-top:10px">
          <button class="btn-add-cart" style="flex:1" onclick="event.stopPropagation();addToCartMarket('${p.id}')">🛒 Add to Cart</button>
          <button style="padding:8px;background:rgba(22,163,74,0.1);border:1px solid var(--border);border-radius:var(--radius-sm);cursor:pointer;font-size:1rem" onclick="event.stopPropagation();showToast('Added to wishlist ❤️','success')">❤️</button>
        </div>
      </div>
    </div>
  `).join('');
}

function addToCartMarket(productId) {
  const p = ASH.products.find(x => x.id === productId);
  if (!p) return;
  const existing = cartItems.find(i => i.id === productId);
  if (existing) { existing.qty++; }
  else { cartItems.push({...p, qty: 1}); }
  sessionStorage.setItem('ash_cart', JSON.stringify(cartItems));
  updateCartBadge();
  showToast(`${p.name} added to cart!`, 'success');
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.textContent = cartItems.length;
    badge.style.display = cartItems.length ? 'flex' : 'none';
  }
}

function toggleCart() {
  const drawer = document.getElementById('cartDrawer');
  if (!drawer) return;
  const open = drawer.style.display !== 'none';
  drawer.style.display = open ? 'none' : 'block';
  if (!open) renderCartContent();
}

function renderCartContent() {
  const content = document.getElementById('cartContent');
  if (!content) return;
  if (!cartItems.length) {
    content.innerHTML = `<div style="text-align:center;padding:40px 20px;color:var(--text-muted)"><div style="font-size:2.5rem;margin-bottom:12px">🛒</div><div>Your cart is empty</div></div>`;
    return;
  }
  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  content.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:20px">
      ${cartItems.map(item => `
        <div style="display:flex;gap:12px;padding:12px;background:rgba(22,163,74,0.05);border:1px solid var(--border);border-radius:var(--radius-sm)">
          <span style="font-size:1.5rem">${item.emoji}</span>
          <div style="flex:1">
            <div style="font-size:.85rem;font-weight:700">${item.name}</div>
            <div style="font-size:.75rem;color:var(--text-muted)">₹${item.price}/${item.unit}</div>
            <div style="display:flex;align-items:center;gap:8px;margin-top:6px">
              <button onclick="updateCartQty('${item.id}',-1)" style="width:24px;height:24px;border-radius:50%;background:var(--surface-3);border:1px solid var(--border);color:var(--text-primary);cursor:pointer;font-size:.8rem">-</button>
              <span style="font-size:.85rem;font-weight:700">${item.qty}</span>
              <button onclick="updateCartQty('${item.id}',1)" style="width:24px;height:24px;border-radius:50%;background:var(--surface-3);border:1px solid var(--border);color:var(--text-primary);cursor:pointer;font-size:.8rem">+</button>
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-weight:700;color:var(--green-400)">₹${(item.price*item.qty).toLocaleString()}</div>
            <button onclick="removeFromCart('${item.id}')" style="font-size:.7rem;color:var(--red-400);background:none;border:none;cursor:pointer;margin-top:8px">Remove</button>
          </div>
        </div>
      `).join('')}
    </div>
    <div style="border-top:1px solid var(--border);padding-top:16px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:.875rem"><span style="color:var(--text-muted)">Subtotal</span><span>₹${total.toLocaleString()}</span></div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:.875rem"><span style="color:var(--text-muted)">Delivery</span><span style="color:var(--green-400)">Free</span></div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:.875rem"><span style="color:var(--text-muted)">GST (5%)</span><span>₹${Math.round(total*0.05).toLocaleString()}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:1rem;font-weight:800;color:var(--green-400)"><span>Total</span><span>₹${Math.round(total*1.05).toLocaleString()}</span></div>
    </div>
    <button onclick="checkout()" style="width:100%;padding:14px;background:linear-gradient(135deg,var(--green-600),var(--teal-600));border:none;border-radius:var(--radius-md);color:white;font-family:Outfit,sans-serif;font-size:1rem;font-weight:700;cursor:pointer">
      Proceed to Checkout 💳
    </button>
    <div style="display:flex;gap:8px;margin-top:12px;justify-content:center">
      <span style="font-size:.75rem;color:var(--text-muted)">Pay with:</span>
      ${['UPI','Card','Wallet','COD'].map(m => `<span style="font-size:.7rem;padding:2px 8px;background:var(--surface-3);border-radius:var(--radius-full);color:var(--text-muted)">${m}</span>`).join('')}
    </div>
  `;
}

function updateCartQty(id, delta) {
  const item = cartItems.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  sessionStorage.setItem('ash_cart', JSON.stringify(cartItems));
  renderCartContent();
}

function removeFromCart(id) {
  cartItems = cartItems.filter(i => i.id !== id);
  sessionStorage.setItem('ash_cart', JSON.stringify(cartItems));
  updateCartBadge();
  renderCartContent();
  showToast('Item removed from cart', 'info');
}

function checkout() {
  showToast('Redirecting to payment gateway…', 'info');
  setTimeout(() => {
    cartItems = [];
    sessionStorage.removeItem('ash_cart');
    toggleCart();
    showToast('🎉 Order placed successfully! Order #ORD-' + Date.now().toString(36).toUpperCase(), 'success');
    updateCartBadge();
  }, 1800);
}

function showProductDetail(id) {
  const p = ASH.products.find(x => x.id === id);
  if (!p) return;
  showToast(`Viewing ${p.name} — ${p.desc.substring(0,50)}…`, 'info');
}

function renderMyProducts(container) {
  updateTopbar('My Products', 'Manage your listings');
  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <div></div>
      <button onclick="showAddProductForm()" style="padding:10px 20px;background:linear-gradient(135deg,var(--green-600),var(--teal-600));border:none;border-radius:var(--radius-full);color:white;font-family:Outfit,sans-serif;font-weight:600;cursor:pointer">+ Add New Product</button>
    </div>
    <div class="products-grid">
      ${ASH.products.filter(p => p.farmer === (currentUser.name || 'Ramu Kumar')).map(p => `
        <div class="product-card">
          <div class="product-img-wrap">
            <div class="product-emoji">${p.emoji}</div>
            ${p.certified ? '<span class="product-cert-badge">🏅 AI Certified</span>' : ''}
          </div>
          <div class="product-body">
            <div class="product-name">${p.name}</div>
            <div class="product-footer">
              <div><span class="product-price">₹${p.price}</span><span class="product-unit">/${p.unit}</span></div>
              <span class="product-grade grade-${p.grade.toLowerCase().replace('+','')}">${p.grade}</span>
            </div>
            <div class="product-stock">Stock: ${p.quantity} ${p.unit}</div>
            <div style="display:flex;gap:6px;margin-top:10px">
              <button class="btn-xs">✏️ Edit</button>
              <button class="btn-xs danger">🗑️ Remove</button>
            </div>
          </div>
        </div>
      `).join('') || '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted)">No products yet. Add your first product!</div>'}
    </div>
  `;
}

function showAddProductForm() {
  showToast('Opening product form…', 'info');
  // In production, this would open a modal
}
