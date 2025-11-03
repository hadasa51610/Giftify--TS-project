import StorageManager from "../storage.js"
import { formatPrice } from "../utils.js"

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

function displayDashboard(): void {
  const products = storage.getProducts()
  const orders = storage.getOrders()
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
  const pendingOrders = orders.filter((o) => o.status === "pending").length

  const container = document.getElementById("dashboardContent")
  if (!container) return

  container.innerHTML = `
    <div class="admin-stats">
      <div class="stat-card">
        <h3>${products.length}</h3>
        <p>מוצרים</p>
      </div>
      <div class="stat-card">
        <h3>${orders.length}</h3>
        <p>הזמנות</p>
      </div>
      <div class="stat-card">
        <h3>${pendingOrders}</h3>
        <p>הזמנות ממתינות</p>
      </div>
      <div class="stat-card">
        <h3>${formatPrice(totalRevenue)}</h3>
        <p>סה"כ הכנסות</p>
      </div>
    </div>
    
    <div class="admin-quick-actions">
      <h3>פעולות מהירות</h3>
      <div class="quick-actions-grid">
        <a href="admin-products.html?action=new" class="action-card">
          <span class="action-icon">+</span>
          <span>הוסף מוצר</span>
        </a>
        <a href="admin-orders.html" class="action-card">
          <span class="action-icon">📦</span>
          <span>צפה בהזמנות</span>
        </a>
        <a href="admin-statistics.html" class="action-card">
          <span class="action-icon">📊</span>
          <span>סטטיסטיקות</span>
        </a>
      </div>
    </div>
  `
}

displayDashboard()

window.addEventListener("beforeunload", () => {
  clearInterval(timeInterval)
})
