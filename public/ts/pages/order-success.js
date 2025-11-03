import StorageManager from "../storage.js";
import { formatPrice, formatDate } from "../utils.js";
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
function displayOrderSuccess() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("orderId");
    const container = document.getElementById("successContent");
    if (!container)
        return;
    if (!orderId) {
        container.innerHTML = `
      <div class="success-message">
        <div class="success-icon">✓</div>
        <h2>ההזמנה בוצעה בהצלחה!</h2>
        <p>תודה על הקנייה</p>
        <div class="success-actions">
          <a href="store.html" class="btn btn-primary">המשך קניות</a>
          <a href="profile.html" class="btn btn-secondary">צפייה בהזמנות</a>
        </div>
      </div>
    `;
        return;
    }
    const orders = storage.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
        container.innerHTML = `
      <div class="success-message">
        <h2>הזמנה לא נמצאה</h2>
        <a href="store.html" class="btn btn-primary">חזרה לחנות</a>
      </div>
    `;
        return;
    }
    const orderItems = order.items
        .map((item) => {
        const product = storage.getProductById(item.productId);
        if (!product)
            return "";
        return `
      <div class="order-item">
        <span>${product.name}</span>
        <span>כמות: ${item.quantity}</span>
        <span>${formatPrice(item.price * item.quantity)}</span>
      </div>
    `;
    })
        .join("");
    container.innerHTML = `
    <div class="success-message">
      <div class="success-icon">✓</div>
      <h2>ההזמנה בוצעה בהצלחה!</h2>
      <p>מספר הזמנה: <strong>${order.id}</strong></p>
      <p>תאריך: ${formatDate(order.createdAt)}</p>
      
      <div class="order-details">
        <h3>פרטי ההזמנה</h3>
        ${orderItems}
        <div class="order-total">
          <span>סה"כ:</span>
          <span>${formatPrice(order.totalAmount)}</span>
        </div>
      </div>
      
      <div class="shipping-details">
        <h3>פרטי משלוח</h3>
        <p><strong>שם:</strong> ${order.customerName}</p>
        <p><strong>אימייל:</strong> ${order.customerEmail}</p>
        <p><strong>טלפון:</strong> ${order.customerPhone}</p>
        <p><strong>כתובת:</strong> ${order.customerAddress}</p>
      </div>
      
      <div class="success-actions">
        <a href="store.html" class="btn btn-primary">המשך קניות</a>
        <a href="profile.html" class="btn btn-secondary">צפייה בהזמנות</a>
      </div>
    </div>
  `;
}
updateNavigation();
updateCartCount();
displayOrderSuccess();
window.addEventListener("beforeunload", () => {
    clearInterval(timeInterval);
});
