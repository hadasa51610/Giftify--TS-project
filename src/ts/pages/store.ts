import StorageManager from "../storage.js"
import { formatPrice, showMessage, getCategoryName } from "../utils.js"
import type { Product } from "../types.js"

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

function addToCart(productId: string): void {
  const currentUser = storage.getCurrentUser()

  if (!currentUser) {
    showMessage("יש להתחבר כדי להוסיף מוצרים לעגלה", "error")
    setTimeout(() => {
      window.location.href = "login.html"
    }, 1500)
    return
  }

  const product = storage.getProductById(productId)
  if (!product) return

  if (product.stock <= 0) {
    showMessage("המוצר אזל מהמלאי", "error")
    return
  }

  storage.addToCart(currentUser.id, productId, 1)
  showMessage("המוצר נוסף לעגלה בהצלחה")
  updateCartCount()
}

function productCard(product: Product): string {
  return `
    <div class="product-card">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-footer">
          <span class="product-price">${formatPrice(product.price)}</span>
          <span class="product-stock">${product.stock > 0 ? `במלאי: ${product.stock}` : "אזל מהמלאי"}</span>
        </div>
        <button class="btn btn-primary btn-full" onclick="window.addToCartGlobal('${product.id}')" ${product.stock <= 0 ? "disabled" : ""}>
          הוסף לעגלה
        </button>
      </div>
    </div>`
}

function displayProductsFlat(products: Product[]): void {
  const container = document.getElementById("productsGrid")
  if (!container) return
  if (products.length === 0) {
    container.innerHTML = '<p style="text-align: center; font-size: 18px; color: var(--text-light);">לא נמצאו מוצרים</p>'
    return
  }
  container.innerHTML = `<div class="products-grid">${products.map(productCard).join("")}</div>`
}

const categoryOrder = ["back_to_school", "winter", "door_sign", "other"] as const
type CategoryKey = typeof categoryOrder[number]

function displayProductsGrouped(products: Product[]): void {
  const container = document.getElementById("productsGrid")
  if (!container) return
  if (products.length === 0) {
    container.innerHTML = '<p style="text-align: center; font-size: 18px; color: var(--text-light);">לא נמצאו מוצרים</p>'
    return
  }
  const sections = categoryOrder
    .map((cat) => {
      const list = products.filter((p) => p.category === cat)
      if (list.length === 0) return ""
      return `
        <h2 class="section-title" style="margin-top: 24px;">${getCategoryName(cat)}</h2>
        <div class="products-grid">${list.map(productCard).join("")}</div>
      `
    })
    .join("")
  container.innerHTML = sections
}

let selectedCategory: string = ""
let selectedSort: string = "newest"

function filterAndSortProducts(): void {
  let products = storage.getProducts()
  const searchInput = document.getElementById("searchInput") as HTMLInputElement | null

  if (searchInput && searchInput.value) {
    const searchTerm = searchInput.value.toLowerCase()
    products = products.filter(
      (p) => p.name.toLowerCase().includes(searchTerm) || p.description.toLowerCase().includes(searchTerm),
    )
  }

  if (selectedCategory) {
    products = products.filter((p) => p.category === selectedCategory)
  }

  switch (selectedSort) {
    case "price-low":
      products.sort((a, b) => a.price - b.price)
      break
    case "price-high":
      products.sort((a, b) => b.price - a.price)
      break
    case "newest":
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
    case "popular":
      products.sort((a, b) => b.stock - a.stock)
      break
  }

  if (selectedCategory) {
    displayProductsFlat(products)
  } else {
    displayProductsGrouped(products)
  }
}

function renderCategoryButtons(): void {
  const el = document.getElementById("categoryButtons")
  if (!el) return
  const defs: { key: string; label: string }[] = [
    { key: "", label: "כל הקטגוריות" },
    { key: "back_to_school", label: getCategoryName("back_to_school") },
    { key: "winter", label: getCategoryName("winter") },
    { key: "door_sign", label: getCategoryName("door_sign") },
    { key: "other", label: getCategoryName("other") },
  ]
  el.innerHTML = defs
    .map(
      (d) => `<button class="btn btn-filter ${selectedCategory === d.key ? "btn-filter--active" : ""}" data-key="${d.key}">${d.label}</button>`,
    )
    .join("")
  Array.from(el.querySelectorAll("button")).forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const key = (e.currentTarget as HTMLButtonElement).getAttribute("data-key") || ""
      selectedCategory = key
      renderCategoryButtons()
      filterAndSortProducts()
    }),
  )
}

function renderSortButtons(): void {
  const el = document.getElementById("sortButtons")
  if (!el) return
  const defs: { key: string; label: string }[] = [
    { key: "newest", label: "חדשים ביותר" },
    { key: "price-low", label: "מחיר: נמוך לגבוה" },
    { key: "price-high", label: "מחיר: גבוה לנמוך" },
    { key: "popular", label: "פופולריים" },
  ]
  el.innerHTML = defs
    .map(
      (d) => `<button class="btn btn-filter ${selectedSort === d.key ? "btn-filter--active" : ""}" data-key="${d.key}">${d.label}</button>`,
    )
    .join("")
  Array.from(el.querySelectorAll("button")).forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const key = (e.currentTarget as HTMLButtonElement).getAttribute("data-key") || "newest"
      selectedSort = key
      renderSortButtons()
      filterAndSortProducts()
    }),
  )
}

const urlParams = new URLSearchParams(window.location.search)
const categoryParam = urlParams.get("category")
if (categoryParam) {
  selectedCategory = categoryParam
}

updateNavigation()
updateCartCount()
renderCategoryButtons()
renderSortButtons()
filterAndSortProducts()

const searchInput = document.getElementById("searchInput")
if (searchInput) {
  searchInput.addEventListener("input", filterAndSortProducts)
}
window.addToCartGlobal = addToCart

window.addEventListener("beforeunload", () => {
  clearInterval(timeInterval)
})
