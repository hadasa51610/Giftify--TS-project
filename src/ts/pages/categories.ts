import StorageManager from "../storage.js"
import { getCategoryName } from "../utils.js"

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
  const profileLink = document.getElementById("profileLink") as HTMLAnchorElement | null

  if (currentUser && loginLink && profileLink) {
    loginLink.textContent = "התנתקות"
    loginLink.href = "#"
    loginLink.onclick = (e) => {
      e.preventDefault()
      storage.setCurrentUser(null)
      window.location.href = "index.html"
    }
    profileLink.style.display = "block"
  } else if (loginLink && profileLink) {
    loginLink.textContent = "התחברות"
    loginLink.href = "login.html"
    profileLink.style.display = "none"
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

function displayCategories(): void {
  const products = storage.getProducts()
  const categories = ["back_to_school", "winter", "door_sign", "other"]
  const container = document.getElementById("categoriesGrid")

  if (!container) return

  const categoryIcons: Record<string, string> = {
    back_to_school: "🎒",
    winter: "❄️",
    door_sign: "🚪",
    other: "🎁",
  }

  const categoryColors: Record<string, string> = {
    back_to_school: "linear-gradient(135deg, rgba(227,198,158,0.6) 0%, rgba(200,185,204,0.6) 100%)",
    winter: "linear-gradient(135deg, rgba(200,185,204,0.6) 0%, rgba(232,232,232,0.6) 100%)",
    door_sign: "linear-gradient(135deg, rgba(227,198,158,0.65) 0%, rgba(248,244,236,0.65) 100%)",
    other: "linear-gradient(135deg, rgba(200,185,204,0.65) 0%, rgba(236,236,236,0.65) 100%)",
  }

  container.innerHTML = categories
    .map((category) => {
      const count = products.filter((p) => p.category === category).length
      return `
      <a href="store.html?category=${category}" class="category-card" style="background: ${categoryColors[category]}">
        <div class="category-icon">${categoryIcons[category]}</div>
        <h3 class="category-name">${getCategoryName(category)}</h3>
        <p class="category-count">${count} מוצרים</p>
      </a>
    `
    })
    .join("")
}

updateNavigation()
updateCartCount()
displayCategories()

window.addEventListener("beforeunload", () => {
  clearInterval(timeInterval)
})
