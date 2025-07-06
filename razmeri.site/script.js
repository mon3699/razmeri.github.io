// RAZMERI - Full Cart & Checkout Logic JavaScript

// Retrieve existing cart or initialize
let cart = JSON.parse(localStorage.getItem("razmeri-cart")) || [];

// DOM Elements
const cartCount = document.getElementById("cart-count");
const cartDrawer = document.getElementById("cart-drawer");
const cartBtn = document.getElementById("cart-btn");
const closeCart = document.getElementById("close-cart");
const cartItemsList = document.getElementById("cart-items");
const cartSubtotal = document.getElementById("cart-subtotal");
const cartSGST = document.getElementById("cart-sgst");
const cartCGST = document.getElementById("cart-cgst");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");

// Open cart drawer
cartBtn.addEventListener("click", () => cartDrawer.classList.add("open"));
// Close cart drawer
closeCart.addEventListener("click", () => cartDrawer.classList.remove("open"));

// Add to Cart buttons
document.querySelectorAll(".add-to-cart").forEach(btn => {
  btn.addEventListener("click", () => {
    const name = btn.getAttribute("data-name");
    const price = parseInt(btn.getAttribute("data-price"), 10);
    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ name, price, qty: 1 });
    }
    updateCart();
  });
});

// Update Cart Display & Storage
function updateCart() {
  // Save to localStorage
  localStorage.setItem("razmeri-cart", JSON.stringify(cart));

  // Clear list and recalc
  cartItemsList.innerHTML = "";
  let subtotal = 0;

  cart.forEach((item, index) => {
    subtotal += item.price * item.qty;
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${item.name}</strong><br/>
        ₹${item.price} × ${item.qty}
      </div>
      <div class="qty-controls">
        <button onclick="changeQty(${index}, -1)">−</button>
        <button onclick="changeQty(${index}, 1)">+</button>
        <button class="remove-btn" onclick="removeItem(${index})">x</button>
      </div>
    `;
    cartItemsList.appendChild(li);
  });

  // Calculations
  const sgst = Math.round(subtotal * 0.09);
  const cgst = Math.round(subtotal * 0.09);
  const shipping = cart.length > 0 ? 49 : 0;
  const total = subtotal + sgst + cgst + shipping;

  // Update counters
  cartCount.textContent = cart.reduce((acc, item) => acc + item.qty, 0);
  cartSubtotal.textContent = subtotal.toFixed(2);
  cartSGST.textContent = sgst.toFixed(2);
  cartCGST.textContent = cgst.toFixed(2);
  cartTotal.textContent = total.toFixed(2);
}

// Quantity adjust
function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  updateCart();
}

// Remove item completely
function removeItem(index) {
  cart.splice(index, 1);
  updateCart();
}

// Checkout navigation
checkoutBtn.addEventListener("click", () => {
  window.location.href = "checkout.html";
});

// Initial render
updateCart();
