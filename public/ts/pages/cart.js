import StorageManager from "../storage.js";
import { formatPrice, showMessage, generateId } from "../utils.js";
import { validateName, validateEmail, validatePhone, validateRequired } from "../validation.js";
const storage = StorageManager.getInstance();
function updateTime() {
    const timeElement = document.getElementById("headerTime");
    if (timeElement) {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString("he-IL");
    }
}
updateTime();
const timeInterval = setInterval(updateTime, 1000);
function updateNavigation() {
    const currentUser = storage.getCurrentUser();
    const loginLink = document.getElementById("loginLink");
    const profileLink = document.getElementById("profileLink");
    if (currentUser && loginLink && profileLink) {
        loginLink.textContent = "התנתקות";
        loginLink.href = "#";
        loginLink.onclick = (e) => {
            e.preventDefault();
            storage.setCurrentUser(null);
            window.location.href = "index.html";
        };
        profileLink.style.display = "block";
    }
    else if (loginLink && profileLink) {
        loginLink.textContent = "התחברות";
        loginLink.href = "login.html";
        profileLink.style.display = "none";
    }
}
function updateCartCount() {
    const currentUser = storage.getCurrentUser();
    const cartCountElement = document.getElementById("cartCount");
    if (cartCountElement) {
        if (currentUser) {
            const cart = storage.getCart(currentUser.id);
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalItems.toString();
            cartCountElement.style.display = totalItems > 0 ? "inline-block" : "none";
        }
        else {
            cartCountElement.textContent = "0";
            cartCountElement.style.display = "none";
        }
    }
}
function updateQuantity(productId, change) {
    const currentUser = storage.getCurrentUser();
    if (!currentUser)
        return;
    const cart = storage.getCart(currentUser.id);
    const item = cart.find((i) => i.productId === productId);
    if (item) {
        const newQuantity = item.quantity + change;
        if (newQuantity > 0) {
            storage.updateCartItemQuantity(currentUser.id, productId, newQuantity);
        }
        else {
            storage.removeFromCart(currentUser.id, productId);
        }
        displayCart();
        updateCartCount();
    }
}
function removeItem(productId) {
    const currentUser = storage.getCurrentUser();
    if (!currentUser)
        return;
    storage.removeFromCart(currentUser.id, productId);
    showMessage("המוצר הוסר מהעגלה");
    displayCart();
    updateCartCount();
}
function displayCart() {
    const currentUser = storage.getCurrentUser();
    const container = document.getElementById("cartContent");
    if (!container)
        return;
    if (!currentUser) {
        container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <p style="font-size: 18px; margin-bottom: 20px;">יש להתחבר כדי לצפות בעגלה</p>
        <a href="login.html" class="btn btn-primary">התחברות</a>
      </div>
    `;
        return;
    }
    const cart = storage.getCart(currentUser.id);
    if (cart.length === 0) {
        container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <p style="font-size: 18px; margin-bottom: 20px;">העגלה ריקה</p>
        <a href="store.html" class="btn btn-primary">המשך קניות</a>
      </div>
    `;
        return;
    }
    let totalAmount = 0;
    const cartItems = cart
        .map((item) => {
        const product = storage.getProductById(item.productId);
        if (!product)
            return "";
        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;
        return `
      <div class="cart-item">
        <img src="${product.image}" alt="${product.name}" class="cart-item-image">
        <div class="cart-item-info">
          <h3>${product.name}</h3>
          <p>${formatPrice(product.price)}</p>
        </div>
        <div class="cart-item-quantity">
          <button class="btn-quantity" onclick="window.updateQuantityGlobal('${product.id}', -1)">-</button>
          <span>${item.quantity}</span>
          <button class="btn-quantity" onclick="window.updateQuantityGlobal('${product.id}', 1)">+</button>
        </div>
        <div class="cart-item-total">
          <p>${formatPrice(itemTotal)}</p>
          <button class="btn-remove" onclick="window.removeItemGlobal('${product.id}')">הסר</button>
        </div>
      </div>
    `;
    })
        .join("");
    container.innerHTML = `
    <div class="cart-container">
      <div class="cart-items">
        ${cartItems}
      </div>
      <div class="cart-summary">
        <h3>סיכום הזמנה</h3>
        <div class="summary-row">
          <span>סה"כ:</span>
          <span class="summary-total">${formatPrice(totalAmount)}</span>
        </div>
        <button class="btn btn-primary btn-full" onclick="window.showCheckoutForm()">המשך לתשלום</button>
      </div>
    </div>
    <div id="checkoutForm" style="display: none;"></div>
  `;
}
function showCheckoutForm() {
    const currentUser = storage.getCurrentUser();
    if (!currentUser)
        return;
    const formContainer = document.getElementById("checkoutForm");
    if (!formContainer)
        return;
    formContainer.style.display = "block";
    formContainer.innerHTML = `
    <div class="checkout-form">
      <h3>פרטי משלוח</h3>
      <form id="orderForm">
        <div class="form-group">
          <label class="form-label" for="customerName">שם מלא *</label>
          <input type="text" id="customerName" class="form-input" value="${currentUser.name}" required>
          <div class="form-error" id="nameError"></div>
        </div>
        <div class="form-group">
          <label class="form-label" for="customerEmail">אימייל *</label>
          <input type="email" id="customerEmail" class="form-input" value="${currentUser.email}" required>
          <div class="form-error" id="emailError"></div>
        </div>
        <div class="form-group">
          <label class="form-label" for="customerPhone">טלפון *</label>
          <input type="tel" id="customerPhone" class="form-input" value="${currentUser.phone}" required>
          <div class="form-error" id="phoneError"></div>
        </div>
        <div class="form-group">
          <label class="form-label" for="customerAddress">כתובת משלוח *</label>
          <textarea id="customerAddress" class="form-textarea" required>${currentUser.address}</textarea>
          <div class="form-error" id="addressError"></div>
        </div>
        <button type="submit" class="btn btn-primary btn-full">אישור הזמנה</button>
      </form>
    </div>
  `;
    const form = document.getElementById("orderForm");
    if (form) {
        form.addEventListener("submit", handleOrderSubmit);
    }
    formContainer.scrollIntoView({ behavior: "smooth" });
}
function handleOrderSubmit(e) {
    e.preventDefault();
    const currentUser = storage.getCurrentUser();
    if (!currentUser)
        return;
    const nameInput = document.getElementById("customerName");
    const emailInput = document.getElementById("customerEmail");
    const phoneInput = document.getElementById("customerPhone");
    const addressInput = document.getElementById("customerAddress");
    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const phoneError = document.getElementById("phoneError");
    const addressError = document.getElementById("addressError");
    let isValid = true;
    const nameValidation = validateName(nameInput.value);
    if (!nameValidation.isValid && nameError) {
        nameError.textContent = nameValidation.error || "";
        isValid = false;
    }
    else if (nameError) {
        nameError.textContent = "";
    }
    const emailValidation = validateEmail(emailInput.value);
    if (!emailValidation.isValid && emailError) {
        emailError.textContent = emailValidation.error || "";
        isValid = false;
    }
    else if (emailError) {
        emailError.textContent = "";
    }
    const phoneValidation = validatePhone(phoneInput.value);
    if (!phoneValidation.isValid && phoneError) {
        phoneError.textContent = phoneValidation.error || "";
        isValid = false;
    }
    else if (phoneError) {
        phoneError.textContent = "";
    }
    const addressValidation = validateRequired(addressInput.value, "כתובת");
    if (!addressValidation.isValid && addressError) {
        addressError.textContent = addressValidation.error || "";
        isValid = false;
    }
    else if (addressError) {
        addressError.textContent = "";
    }
    if (!isValid)
        return;
    const cart = storage.getCart(currentUser.id);
    let totalAmount = 0;
    const orderItems = cart
        .map((item) => {
        const product = storage.getProductById(item.productId);
        if (!product)
            return null;
        totalAmount += product.price * item.quantity;
        storage.updateProduct(product.id, {
            stock: product.stock - item.quantity,
        });
        return {
            productId: product.id,
            quantity: item.quantity,
            price: product.price,
        };
    })
        .filter((item) => item !== null);
    const order = {
        id: generateId(),
        userId: currentUser.id,
        items: orderItems,
        totalAmount,
        customerName: nameInput.value,
        customerEmail: emailInput.value,
        customerPhone: phoneInput.value,
        customerAddress: addressInput.value,
        status: "pending",
        createdAt: new Date().toISOString(),
    };
    storage.addOrder(order);
    storage.clearCart(currentUser.id);
    showMessage("ההזמנה בוצעה בהצלחה!");
    setTimeout(() => {
        window.location.href = `order-success.html?orderId=${order.id}`;
    }, 1500);
}
updateNavigation();
updateCartCount();
displayCart();
window.updateQuantityGlobal = updateQuantity;
window.removeItemGlobal = removeItem;
window.showCheckoutForm = showCheckoutForm;
window.addEventListener("beforeunload", () => {
    clearInterval(timeInterval);
});
