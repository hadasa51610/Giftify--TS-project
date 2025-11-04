import StorageManager from "../storage.js"
import { formatPrice, formatDate, showMessage } from "../utils.js"
import type { Order } from "../types.js"

const storage = StorageManager.getInstance()

if (!storage.isAdminLoggedIn()) {
  window.location.href = "admin-login.html"
}

function updateTime(): void {
  const timeElement = document.getElementById("headerTime")
  if (timeElement) {
    const now = new Date()
    timeElement.textContent = now.toLocaleTimeString("he-IL")
  }
}

updateTime()
const timeInterval = setInterval(updateTime, 1000)

const logoutLink = document.getElementById("logoutLink")
if (logoutLink) {
  logoutLink.addEventListener("click", (e) => {
    e.preventDefault()
    storage.setAdminSession(false)
    window.location.href = "admin-login.html"
  })
}

function displayOrders(): void {
  const orders = storage.getOrders()
  const container = document.getElementById("ordersContent")

  if (!container) return

  if (orders.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-light);">אין הזמנות עדיין</p>'
    return
  }

  container.innerHTML = `
    <div class="admin-table">
      <table>
        <thead>
          <tr>
            <th>מספר הזמנה</th>
            <th>לקוח</th>
            <th>תאריך</th>
            <th>סכום</th>
            <th>סטטוס</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          ${orders
            .map(
              (order) => `
            <tr>
              <td>#${order.id}</td>
              <td>${order.customerName}</td>
              <td>${formatDate(order.createdAt)}</td>
              <td>${formatPrice(order.totalAmount)}</td>
              <td>
                <select class="status-select status-${order.status}" onchange="window.updateOrderStatusGlobal('${order.id}', this.value)">
                  <option value="pending" ${order.status === "pending" ? "selected" : ""}>ממתין</option>
                  <option value="processing" ${order.status === "processing" ? "selected" : ""}>בטיפול</option>
                  <option value="shipped" ${order.status === "shipped" ? "selected" : ""}>נשלח</option>
                  <option value="delivered" ${order.status === "delivered" ? "selected" : ""}>הושלם</option>
                  <option value="cancelled" ${order.status === "cancelled" ? "selected" : ""}>בוטל</option>
                </select>
              </td>
              <td>
                <button class="btn-table btn-view" onclick="window.viewOrderDetailsGlobal('${order.id}')">צפה</button>
              </td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
    <div id="orderDetailsModal" style="display: none;"></div>
  `
}

function updateOrderStatus(orderId: string, status: Order["status"]): void {
  storage.updateOrderStatus(orderId, status)
  showMessage("סטטוס ההזמנה עודכן")
}

function viewOrderDetails(orderId: string): void {
  const order = storage.getOrders().find((o) => o.id === orderId)
  if (!order) return

  const modal = document.getElementById("orderDetailsModal")
  if (!modal) return

  const itemsHtml = order.items
    .map((item) => {
      const product = storage.getProductById(item.productId)
      return product
        ? `
      <div class="order-detail-item">
        <span>${product.name}</span>
        <span>x${item.quantity}</span>
        <span>${formatPrice(item.price * item.quantity)}</span>
      </div>
    `
        : ""
    })
    .join("")

  modal.style.display = "block"
  modal.innerHTML = `
    <div class="modal-overlay" onclick="window.closeModalGlobal()"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>פרטי הזמנה #${order.id}</h3>
        <button class="modal-close" onclick="window.closeModalGlobal()">×</button>
      </div>
      <div class="modal-body">
        <div class="order-detail-section">
          <h4>פרטי לקוח</h4>
          <p><strong>שם:</strong> ${order.customerName}</p>
          <p><strong>אימייל:</strong> ${order.customerEmail}</p>
          <p><strong>טלפון:</strong> ${order.customerPhone}</p>
          <p><strong>כתובת:</strong> ${order.customerAddress}</p>
        </div>
        <div class="order-detail-section">
          <h4>פריטים</h4>
          ${itemsHtml}
        </div>
        <div class="order-detail-total">
          <strong>סה"כ:</strong>
          <strong>${formatPrice(order.totalAmount)}</strong>
        </div>
      </div>
    </div>
  `
}

function closeModal(): void {
  const modal = document.getElementById("orderDetailsModal")
  if (modal) {
    modal.style.display = "none"
  }
}

displayOrders()
window.updateOrderStatusGlobal = updateOrderStatus
window.viewOrderDetailsGlobal = viewOrderDetails
window.closeModalGlobal = closeModal

window.addEventListener("beforeunload", () => {
  clearInterval(timeInterval)
})
