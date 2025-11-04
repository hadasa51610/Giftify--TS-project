import StorageManager from "../storage.js"
import { formatPrice, showMessage, generateId, getCategoryName } from "../utils.js"
import { validateName, validatePrice, validateStock, validateRequired } from "../validation.js"
import type { Product } from "../types.js"

const storage = StorageManager.getInstance()

type ImageMeta = { file: string; name: string; description: string }

const imageCatalog: Record<string, ImageMeta[]> = {
  back_to_school: [
    { file: "תיק שרוך.avif", name: "תיק שרוך", description: "תיק שרוך קל ונוח לנשיאה" },
    { file: "קופסת אוכל.webp", name: "קופסת אוכל", description: "קופסת אוכל מעוצבת לבית הספר" },
    { file: "מחברות.avif", name: "מחברות", description: "סט מחברות מעוצבות לבית הספר" },
    { file: "מדבקות שם.avif", name: "מדבקות שם", description: "מדבקות שם להתאמה אישית למחברות ולציוד" },
    { file: "יומן שבועי.webp", name: "יומן שבועי", description: "יומן שבועי לניהול מערכת שיעורים" },
    { file: "בקבוק ללימודים.avif", name: "בקבוק ללימודים", description: "בקבוק שתייה נוח לתלמידים" },
  ],
  winter: [
    { file: "בקבוק טרמי.jpg", name: "בקבוק טרמי", description: "בקבוק טרמי שומר חום וקור לאורך זמן" },
    { file: "בקבוק ניירוסטה טרמי.jpg", name: "בקבוק נירוסטה טרמי", description: "בקבוק נירוסטה טרמי עמיד ואיכותי" },
    { file: "גרביים במארז.jpg", name: "גרביים במארז", description: "מארז גרביים חמים ונעימים" },
    { file: "כירבולית למבוגרים.jpg", name: "כירבולית למבוגרים", description: "שמיכת כירבול מפנקת לימי החורף" },
    { file: "מארז לקפה.jpg", name: "מארז לקפה", description: "מארז מושלם לאוהבי הקפה" },
    { file: "מטריה מתקפלת.jpg", name: "מטריה מתקפלת", description: "מטריה מתקפלת קומפקטית לנשיאה" },
    { file: "קופסה לממחטות.jpg", name: "קופסה לממחטות", description: "קופסה אלגנטית לממחטות נייר" },
  ],
  door_sign: [
    { file: "שלט לדלת אותיות בולטות.jpg", name: "שלט לדלת - אותיות בולטות", description: "שלט לדלת עם אותיות בולטות בעיצוב אישי" },
    { file: "שלט לדלת תליוניים.jpg", name: "שלט לדלת - תליוניים", description: "שלט לדלת עם תליונים בעיצוב ייחודי" },
    { file: "תיבת דואר.jpg", name: "תיבת דואר", description: "תיבת דואר לבית בעיצוב קלאסי" },
    { file: "שלט מספר לדלת.jpg", name: "שלט מספר לדלת", description: "שלט מספר לדלת בהתאמה אישית" },
    { file: "שלט מלבני.webp", name: "שלט מלבני", description: "שלט מלבני נקי ומודרני" },
    { file: "שלט אותיות.jpg", name: "שלט אותיות", description: "שלט אותיות מעוצב" },
  ],
  other: [],
}

function toImagePath(name: string): string {
  return `/public/images/${name}`
}

function setImageOptions(category: string, input: HTMLInputElement, datalist: HTMLDataListElement): void {
  const items = imageCatalog[category] || []
  datalist.innerHTML = items.map((m) => `<option value="${toImagePath(m.file)}" label="${m.name}"></option>`).join("")
  if (!input.value || !input.value.startsWith("/public/images/")) {
    if (items.length > 0) input.value = toImagePath(items[0].file)
  }
}

function tryAutofillByImagePath(path: string, nameInput: HTMLInputElement, descInput: HTMLTextAreaElement): void {
  const file = path.startsWith("/public/images/") ? path.replace("/public/images/", "") : ""
  if (!file) return
  for (const cat of Object.keys(imageCatalog)) {
    const meta = imageCatalog[cat].find((m) => m.file === file)
    if (meta) {
      if (!nameInput.value) nameInput.value = meta.name
      if (!descInput.value) descInput.value = meta.description
      break
    }
  }
}

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

function displayProducts(): void {
  const products = storage.getProducts()
  const container = document.getElementById("productsContent")

  if (!container) return

  container.innerHTML = `
    <div class="admin-table">
      <table>
        <thead>
          <tr>
            <th>תמונה</th>
            <th>שם</th>
            <th>קטגוריה</th>
            <th>מחיר</th>
            <th>מלאי</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          ${products
            .map(
              (product) => `
            <tr>
              <td><img src="${product.image}" alt="${product.name}" class="table-image"></td>
              <td>${product.name}</td>
              <td>${getCategoryName(product.category)}</td>
              <td>${formatPrice(product.price)}</td>
              <td>${product.stock}</td>
              <td>
                <button class="btn-table btn-edit" onclick="window.editProductGlobal('${product.id}')">ערוך</button>
                <button class="btn-table btn-delete" onclick="window.deleteProductGlobal('${product.id}')">מחק</button>
              </td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `
}

function showProductForm(productId?: string): void {
  const container = document.getElementById("productFormContainer")
  if (!container) return

  const product = productId ? storage.getProductById(productId) : null
  const isEdit = !!product

  container.style.display = "block"
  container.innerHTML = `
    <div class="admin-form-card">
      <h3>${isEdit ? "עריכת מוצר" : "הוספת מוצר חדש"}</h3>
      <form id="productForm">
        <div class="form-group">
          <label class="form-label" for="productName">שם המוצר *</label>
          <input type="text" id="productName" class="form-input" value="${product?.name || ""}" required>
          <div class="form-error" id="nameError"></div>
        </div>
        <div class="form-group">
          <label class="form-label" for="productDescription">תיאור *</label>
          <textarea id="productDescription" class="form-textarea" required>${product?.description || ""}</textarea>
          <div class="form-error" id="descriptionError"></div>
        </div>
        <div class="form-group">
          <label class="form-label" for="productPrice">מחיר *</label>
          <input type="text" id="productPrice" class="form-input" value="${product?.price || ""}" required>
          <div class="form-error" id="priceError"></div>
        </div>
        <div class="form-group">
          <label class="form-label" for="productCategory">קטגוריה *</label>
          <select id="productCategory" class="form-select" required>
            <option value="back_to_school" ${product?.category === "back_to_school" ? "selected" : ""}>חוזרים ללימודים</option>
            <option value="winter" ${product?.category === "winter" ? "selected" : ""}>חורף</option>
            <option value="door_sign" ${product?.category === "door_sign" ? "selected" : ""}>שלט לדלת</option>
            <option value="other" ${product?.category === "other" ? "selected" : ""}>אחר</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="productImage">כתובת תמונה *</label>
          <input type="text" id="productImage" class="form-input" list="imageOptions" value="${product?.image || ""}" required>
          <datalist id="imageOptions"></datalist>
          <div class="form-error" id="imageError"></div>
        </div>
        <div class="form-group">
          <label class="form-label" for="productStock">מלאי *</label>
          <input type="text" id="productStock" class="form-input" value="${product?.stock || ""}" required>
          <div class="form-error" id="stockError"></div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">${isEdit ? "עדכן" : "הוסף"}</button>
          <button type="button" class="btn btn-secondary" onclick="window.cancelFormGlobal()">ביטול</button>
        </div>
      </form>
    </div>
  `

  const form = document.getElementById("productForm")
  if (form) {
    form.addEventListener("submit", (e) => handleProductSubmit(e, productId))
  }

  const categorySelect = document.getElementById("productCategory") as HTMLSelectElement | null
  const imageInput = document.getElementById("productImage") as HTMLInputElement | null
  const imageDatalist = document.getElementById("imageOptions") as HTMLDataListElement | null
  const nameInput = document.getElementById("productName") as HTMLInputElement | null
  const descriptionInput = document.getElementById("productDescription") as HTMLTextAreaElement | null
  if (categorySelect && imageInput && imageDatalist) {
    setImageOptions(categorySelect.value, imageInput, imageDatalist)
    categorySelect.addEventListener("change", () => setImageOptions(categorySelect.value, imageInput, imageDatalist))
  }
  if (imageInput && nameInput && descriptionInput) {
    tryAutofillByImagePath(imageInput.value, nameInput, descriptionInput)
    imageInput.addEventListener("input", () => tryAutofillByImagePath(imageInput.value, nameInput, descriptionInput))
  }

  container.scrollIntoView({ behavior: "smooth" })
}

function handleProductSubmit(e: Event, productId?: string): void {
  e.preventDefault()

  const nameInput = document.getElementById("productName") as HTMLInputElement
  const descriptionInput = document.getElementById("productDescription") as HTMLTextAreaElement
  const priceInput = document.getElementById("productPrice") as HTMLInputElement
  const categoryInput = document.getElementById("productCategory") as HTMLSelectElement
  const imageInput = document.getElementById("productImage") as HTMLInputElement
  const stockInput = document.getElementById("productStock") as HTMLInputElement

  const nameError = document.getElementById("nameError")
  const descriptionError = document.getElementById("descriptionError")
  const priceError = document.getElementById("priceError")
  const imageError = document.getElementById("imageError")
  const stockError = document.getElementById("stockError")

  let isValid = true

  const nameValidation = validateName(nameInput.value)
  if (!nameValidation.isValid && nameError) {
    nameError.textContent = nameValidation.error || ""
    isValid = false
  } else if (nameError) {
    nameError.textContent = ""
  }

  const descriptionValidation = validateRequired(descriptionInput.value, "תיאור")
  if (!descriptionValidation.isValid && descriptionError) {
    descriptionError.textContent = descriptionValidation.error || ""
    isValid = false
  } else if (descriptionError) {
    descriptionError.textContent = ""
  }

  const priceValidation = validatePrice(priceInput.value)
  if (!priceValidation.isValid && priceError) {
    priceError.textContent = priceValidation.error || ""
    isValid = false
  } else if (priceError) {
    priceError.textContent = ""
  }

  const imageValidation = validateRequired(imageInput.value, "כתובת תמונה")
  if (!imageValidation.isValid && imageError) {
    imageError.textContent = imageValidation.error || ""
    isValid = false
  } else if (imageError) {
    imageError.textContent = ""
  }

  const stockValidation = validateStock(stockInput.value)
  if (!stockValidation.isValid && stockError) {
    stockError.textContent = stockValidation.error || ""
    isValid = false
  } else if (stockError) {
    stockError.textContent = ""
  }

  if (!isValid) return

  if (productId) {
    storage.updateProduct(productId, {
      name: nameInput.value,
      description: descriptionInput.value,
      price: Number.parseFloat(priceInput.value),
      category: categoryInput.value,
      image: imageInput.value,
      stock: Number.parseInt(stockInput.value),
    })
    showMessage("המוצר עודכן בהצלחה")
  } else {
    const newProduct: Product = {
      id: generateId(),
      name: nameInput.value,
      description: descriptionInput.value,
      price: Number.parseFloat(priceInput.value),
      category: categoryInput.value,
      image: imageInput.value,
      stock: Number.parseInt(stockInput.value),
      createdAt: new Date().toISOString(),
    }
    storage.addProduct(newProduct)
    showMessage("המוצר נוסף בהצלחה")
  }

  cancelForm()
  displayProducts()
}

function editProduct(productId: string): void {
  showProductForm(productId)
}

function deleteProduct(productId: string): void {
  if (confirm("האם אתה בטוח שברצונך למחוק את המוצר?")) {
    storage.deleteProduct(productId)
    showMessage("המוצר נמחק בהצלחה")
    displayProducts()
  }
}

function cancelForm(): void {
  const container = document.getElementById("productFormContainer")
  if (container) {
    container.style.display = "none"
  }
}

const addProductBtn = document.getElementById("addProductBtn")
if (addProductBtn) {
  addProductBtn.addEventListener("click", () => showProductForm())
}

displayProducts()
window.editProductGlobal = editProduct
window.deleteProductGlobal = deleteProduct
window.cancelFormGlobal = cancelForm

window.addEventListener("beforeunload", () => {
  clearInterval(timeInterval)
})
