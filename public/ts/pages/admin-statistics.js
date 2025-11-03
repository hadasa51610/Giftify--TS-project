import StorageManager from "../storage.js";
import { formatPrice, formatDate, getCategoryName } from "../utils.js";
const storage = StorageManager.getInstance();
if (!storage.isAdminLoggedIn()) {
    window.location.href = "admin-login.html";
}
function updateTime() {
    const timeElement = document.getElementById("headerTime");
    if (timeElement) {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString("he-IL");
    }
}
updateTime();
const timeInterval = setInterval(updateTime, 1000);
const logoutLink = document.getElementById("logoutLink");
if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        storage.setAdminSession(false);
        window.location.href = "admin-login.html";
    });
}
function displayStatistics() {
    const products = storage.getProducts();
    const orders = storage.getOrders();
    const activityLog = storage.getActivityLog();
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const ordersByStatus = {
        pending: orders.filter((o) => o.status === "pending").length,
        processing: orders.filter((o) => o.status === "processing").length,
        shipped: orders.filter((o) => o.status === "shipped").length,
        delivered: orders.filter((o) => o.status === "delivered").length,
        cancelled: orders.filter((o) => o.status === "cancelled").length,
    };
    const productSales = {};
    orders.forEach((order) => {
        order.items.forEach((item) => {
            productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity;
        });
    });
    const topProducts = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([productId, quantity]) => {
        const product = storage.getProductById(productId);
        return product ? { product, quantity } : null;
    })
        .filter((item) => item !== null);
    const categorySales = {};
    orders.forEach((order) => {
        order.items.forEach((item) => {
            const product = storage.getProductById(item.productId);
            if (product) {
                categorySales[product.category] = (categorySales[product.category] || 0) + item.price * item.quantity;
            }
        });
    });
    const recentActivity = activityLog.slice(-10).reverse();
    const container = document.getElementById("statisticsContent");
    if (!container)
        return;
    container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card-large">
        <h3>סיכום כללי</h3>
        <div class="stat-row">
          <span>סה"כ הכנסות:</span>
          <span class="stat-value">${formatPrice(totalRevenue)}</span>
        </div>
        <div class="stat-row">
          <span>מספר הזמנות:</span>
          <span class="stat-value">${orders.length}</span>
        </div>
        <div class="stat-row">
          <span>מספר מוצרים:</span>
          <span class="stat-value">${products.length}</span>
        </div>
      </div>
      
      <div class="stat-card-large">
        <h3>הזמנות לפי סטטוס</h3>
        <div class="stat-row">
          <span>ממתין:</span>
          <span class="stat-value">${ordersByStatus.pending}</span>
        </div>
        <div class="stat-row">
          <span>בטיפול:</span>
          <span class="stat-value">${ordersByStatus.processing}</span>
        </div>
        <div class="stat-row">
          <span>נשלח:</span>
          <span class="stat-value">${ordersByStatus.shipped}</span>
        </div>
        <div class="stat-row">
          <span>הושלם:</span>
          <span class="stat-value">${ordersByStatus.delivered}</span>
        </div>
        <div class="stat-row">
          <span>בוטל:</span>
          <span class="stat-value">${ordersByStatus.cancelled}</span>
        </div>
      </div>
    </div>
    
    <div class="stats-section">
      <h3>מוצרים הנמכרים ביותר</h3>
      <div class="top-products">
        ${topProducts
        .map((item) => item
        ? `
          <div class="top-product-item">
            <span>${item.product.name}</span>
            <span class="product-sales">${item.quantity} נמכרו</span>
          </div>
        `
        : "")
        .join("")}
      </div>
    </div>
    
    <div class="stats-section">
      <h3>מכירות לפי קטגוריה</h3>
      <div class="category-sales">
        ${Object.entries(categorySales)
        .map(([category, amount]) => `
          <div class="category-sale-item">
            <span>${getCategoryName(category)}</span>
            <span class="category-amount">${formatPrice(amount)}</span>
          </div>
        `)
        .join("")}
      </div>
    </div>
    
    <div class="stats-section">
      <h3>פעילות אחרונה</h3>
      <div class="activity-log">
        ${recentActivity
        .map((log) => `
          <div class="activity-item">
            <div class="activity-action">${log.action}</div>
            <div class="activity-details">${log.details}</div>
            <div class="activity-time">${formatDate(log.timestamp)}</div>
          </div>
        `)
        .join("")}
      </div>
    </div>
  `;
}
displayStatistics();
window.addEventListener("beforeunload", () => {
    clearInterval(timeInterval);
});
