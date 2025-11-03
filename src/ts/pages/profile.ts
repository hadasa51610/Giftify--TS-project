import StorageManager from "../storage.js"
import { formatPrice, formatDate, getStatusName } from "../utils.js"

const storage = StorageManager.getInstance()

function updateTime(): void {
  const timeElement = document.getElementById("headerTime")
  if (timeElement) {
    const now = new Date()
    timeElement.textContent = now.toLocaleTimeString("he-IL")
  }
}

updateTime()
const timeInterval = setInterval(updateTime, 1000)

function updateNavigation(): void {
  const currentUser = storage.getCurrentUser()
  const loginLink = document.getElementById("loginLink") as HTMLAnchorElement | null

  if (currentUser && loginLink) {
    loginLink.textContent = "התנתקות"
    loginLink.href = "#"
    loginLink.onclick = (e) => {
      e.preventDefault()
      storage.setCurrentUser(null)
      window.location.href = "index.html"
    }
  } else if (loginLink) {
    loginLink.textContent = "התחברות"
    loginLink.href = "login.html"
  }
}

function updateCartCount(): void {
  const currentUser = storage.getCurrentUser()
  const cartCountElement = document.getElementById("cartCount")

  if (cartCountElement) {
    if (currentUser) {
      const cart = storage.getCart(currentUser.id)
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
      cartCountElement.textContent = totalItems.toString()
      cartCountElement.style.display = totalItems > 0 ? "inline-block" : "none"
    } else {
      cartCountElement.textContent = "0"
      cartCountElement.style.display = "none"
    }
  }
}

function displayProfile(): void {
  const currentUser = storage.getCurrentUser()
  const container = document.getElementById("profileContent")

  if (!container) return

  if (!currentUser) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <p style="font-size: 18px; margin-bottom: 20px;">יש להתחבר כדי לצפות באזור האישי</p>
        <a href="login.html" class="btn btn-primary">התחברות</a>
      </div>
    `
    return
  }

  const userOrders = storage.getUserOrders(currentUser.id)
  const totalSpent = userOrders.reduce((sum, order) => sum + order.totalAmount, 0)

  const ordersHtml =
    userOrders.length > 0
      ? userOrders
          .map((order) => {
            const itemsHtml = order.items
              .map((item) => {
                const product = storage.getProductById(item.productId)
                return product ? `<li>${product.name} x${item.quantity}</li>` : ""
              })
              .join("")

            return `
      <div class="order-card">
        <div class="order-header">
          <h3>הזמנה #${order.id}</h3>
          <span class="order-status status-${order.status}">${getStatusName(order.status)}</span>
        </div>
        <p class="order-date">${formatDate(order.createdAt)}</p>
        <ul class="order-items">${itemsHtml}</ul>
        <p class="order-total">סה"כ: ${formatPrice(order.totalAmount)}</p>
      </div>
    `
          })
          .join("")
      : '<p style="text-align: center; color: var(--text-light);">אין הזמנות עדיין</p>'

  container.innerHTML = `
    <div class="profile-container">
      <div class="profile-header">
        <h2>שלום, ${currentUser.name}</h2>
      </div>
      
      <div class="profile-stats">
        <div class="stat-card">
          <h3>${userOrders.length}</h3>
          <p>הזמנות</p>
        </div>
        <div class="stat-card">
          <h3>${formatPrice(totalSpent)}</h3>
          <p>סה"כ הוצאות</p>
        </div>
      </div>
      
      <div class="profile-info">
        <h3>פרטים אישיים</h3>
        <p><strong>אימייל:</strong> ${currentUser.email}</p>
        <p><strong>טלפון:</strong> ${currentUser.phone}</p>
        <p><strong>כתובת:</strong> ${currentUser.address}</p>
      </div>
      
      <div class="profile-orders">
        <h3>ההזמנות שלי</h3>
        ${ordersHtml}
      </div>
    </div>
  `
}

updateNavigation()
updateCartCount()
displayProfile()

window.addEventListener("beforeunload", () => {
  clearInterval(timeInterval)
})
