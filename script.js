/* ============================================================
   FORMAT UANG
============================================================ */
function formatRupiah(x){
  return 'Rp ' + Number(x).toLocaleString('id-ID');
}

/* ============================================================
   KERANJANG (CART)
============================================================ */
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(name, price){
  cart.push({ name: name, price: price });
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Produk ditambahkan ke keranjang!");
}

/* Tampilkan Cart di keranjang.html */
function loadCartPage(){
  const container = document.getElementById("cart-list");
  const totalEl = document.getElementById("total");

  if(!container) return;

  if(cart.length === 0){
    container.innerHTML = '<p>Keranjang kosong.</p>';
    if(totalEl) totalEl.innerHTML = formatRupiah(0);
    return;
  }

  let html = "";
  let total = 0;

  cart.forEach((item, i)=>{
    html += `
      <div class="cart-item">
        <b>${item.name}</b> — ${formatRupiah(item.price)}
        <button onclick="removeItem(${i})">Hapus</button>
      </div>
    `;
    total += item.price;
  });

  container.innerHTML = html;
  if(totalEl) totalEl.innerHTML = formatRupiah(total);
}

function removeItem(i){
  cart.splice(i, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  location.reload();
}

/* ============================================================
   SHORTCUT DARI HOME → PEMESANAN (prefill 1 item)
============================================================ */
function goToPemesanan(name, price){
  const order = { product: name, price: price };
  localStorage.setItem('prefillProduct', JSON.stringify(order));
  window.location = 'pemesanan.html';
}

function pesanLangsung(name, price){
  goToPemesanan(name, price);
}

/* ============================================================
   FORM PEMESANAN (SUPPORT CART)
============================================================ */

function clearSelectedProduct(){
  localStorage.removeItem('prefillProduct');
  if(document.getElementById('produk')) document.getElementById('produk').value = '';
  if(document.getElementById('harga')) document.getElementById('harga').value = '';
  if(document.getElementById('totalLabel')) document.getElementById('totalLabel').textContent = 'Total: Rp 0';
}

function recalcTotal(){
  const jumlah = Number(document.getElementById('jumlah').value || 0);
  const harga = Number(document.getElementById('harga').value || 0);
  const total = jumlah * harga;
  const label = document.getElementById('totalLabel');
  if(label) label.textContent = 'Total: ' + formatRupiah(total);
}

function getSelectedProduct(){
  const produkEl = document.getElementById('produk');
  const hargaEl = document.getElementById('harga');
  const jumlahEl = document.getElementById('jumlah');

  const name = produkEl ? produkEl.value.trim() : '';
  const price = hargaEl ? Number(hargaEl.value || 0) : 0;
  const qty = jumlahEl ? Number(jumlahEl.value || 0) : 0;

  if(!name || price <= 0 || qty <= 0) return null;
  return { name, price, qty, total: price * qty };
}

/* ============================================================
   LOAD PAGE
============================================================ */
window.addEventListener('load', function(){

  /* === PREFILL PRODUK DARI KATALOG === */
  const pre = localStorage.getItem('prefillProduct');
  if(pre){
    const obj = JSON.parse(pre);
    if(document.getElementById('produk')) document.getElementById('produk').value = obj.product;
    if(document.getElementById('harga')) document.getElementById('harga').value = obj.price;
    recalcTotal();
  }

  /* === CART → FORM PEMESANAN === */
  if(document.getElementById("produk-dipilih")){
    let names = cart.map(x => x.name).join(", ");
    let total = cart.reduce((a,b) => a + b.price, 0);

    document.getElementById("produk-dipilih").value = names;
    if(document.getElementById("total-harga"))
      document.getElementById("total-harga").textContent = formatRupiah(total);
  }

  /* === LOAD CART LIST DI HALAMAN KERANJANG === */
  loadCartPage();

  /* === SUCCESS PAGE === */
  if(window.location.pathname.includes("success.html")){
    const raw = localStorage.getItem('lastOrder');
    const container = document.getElementById('orderSummary');

    if(!raw || !container){
      container.innerHTML = '<p>Tidak ada data pesanan.</p>';
      return;
    }
    const order = JSON.parse(raw);

    container.innerHTML = `
      <table style="width:100%">
        <tr><td><strong>ID Pesanan</strong></td><td>${order.id}</td></tr>
        <tr><td><strong>Waktu</strong></td><td>${order.time}</td></tr>
        <tr><td><strong>Nama</strong></td><td>${order.name}</td></tr>
        <tr><td><strong>Alamat</strong></td><td>${order.address}</td></tr>
        <tr><td><strong>Total Bayar</strong></td><td>${formatRupiah(order.total)}</td></tr>
      </table>
    `;
  }
});

/* ============================================================
   SUBMIT FORM
============================================================ */
function submitOrder(e){
  e.preventDefault();

  const name = document.getElementById('nama').value.trim();
  const addr = document.getElementById('alamat').value.trim();
  const selectedProduct = getSelectedProduct();

  let totalHarga = 0;
  let items = [];

  if(selectedProduct){
    totalHarga = selectedProduct.total;
    items = [{
      name: selectedProduct.name,
      price: selectedProduct.price,
      qty: selectedProduct.qty
    }];
  } else {
    totalHarga = cart.reduce((a, b) => a + (b.price * (b.qty || 1)), 0);
    items = cart.map(item => ({
      name: item.name,
      price: item.price,
      qty: item.qty || 1
    }));
  }

  if(!name || !addr || totalHarga <= 0){
    alert("Lengkapi data pemesanan!");
    return false;
  }

  /* BUAT ORDER ID */
  const now = new Date();
  const id = 'VS-' + now.getTime().toString(36).toUpperCase();

  const orderObj = {
    id: id,
    time: now.toLocaleString('id-ID'),
    name: name,
    address: addr,
    total: totalHarga,
    items: items
  };

  localStorage.setItem('lastOrder', JSON.stringify(orderObj));
  localStorage.removeItem('cart');
  localStorage.removeItem('prefillProduct');

  window.location = "success.html";
  return false;
}