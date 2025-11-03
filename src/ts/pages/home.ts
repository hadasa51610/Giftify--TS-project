import StorageManager from "../storage.js"
import { formatPrice } from "../utils.js"

const storage = StorageManager.getInstance()

// Update header time with setInterval
function updateTime(): void {
  const timeElement = document.getElementById("headerTime")
  if (timeElement) {
    const now = new Date()
    timeElement.textContent = now.toLocaleTimeString("he-IL")
  }
}

updateTime()
const timeInterval = setInterval(updateTime, 1000)

// Update navigation based on user session
function updateNavigation(): void {
  const currentUser = storage.getCurrentUser()
  const loginLink = document.getElementById("loginLink") as HTMLAnchorElement | null
  const profileLink = document.getElementById("profileLink") as HTMLAnchorElement | null

  if (currentUser && loginLink && profileLink) {
    loginLink.textContent = "התנתקות"
    loginLink.href = "#"
    loginLink.onclick = (e) => {
      e.preventDefault()
      storage.setCurrentUser(null)
      window.location.reload()
    }
    profileLink.style.display = "block"
  } else if (loginLink && profileLink) {
    loginLink.textContent = "התחברות"
    loginLink.href = "login.html"
    profileLink.style.display = "none"
  }
}

// Update cart count
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

// Display featured products
function displayFeaturedProducts(): void {
  const products = storage.getProducts()
  const featuredProducts = products.slice(0, 6)
  const container = document.getElementById("featuredProducts")

  if (!container) return

  container.innerHTML = featuredProducts
    .map(
      (product) => `
    <div class="product-card">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-footer">
          <span class="product-price">${formatPrice(product.price)}</span>
          <span class="product-stock">במלאי: ${product.stock}</span>
        </div>
        <a href="store.html" class="btn btn-primary btn-sm">לחנות</a>
      </div>
    </div>
  `,
    )
    .join("")
}

// Initialize page
updateNavigation()
updateCartCount()
displayFeaturedProducts()

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  clearInterval(timeInterval)
})
