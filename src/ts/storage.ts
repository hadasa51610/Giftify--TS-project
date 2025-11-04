import type { Product, User, CartItem, Order, ActivityLog, Admin } from "./types.js"

class StorageManager {
  private static instance: StorageManager
  private readonly PRODUCTS_KEY = "gift_shop_products"
  private readonly USERS_KEY = "gift_shop_users"
  private readonly ORDERS_KEY = "gift_shop_orders"
  private readonly ACTIVITY_KEY = "gift_shop_activity"
  private readonly ADMIN_KEY = "gift_shop_admin"
  private readonly CURRENT_USER_KEY = "gift_shop_current_user"
  private readonly ADMIN_SESSION_KEY = "gift_shop_admin_session"

  private constructor() {
    this.initializeData()
    this.migrateProductImages()
    this.migrateProductCategories()
    this.migrateCatalogProducts()
  }

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager()
    }
    return StorageManager.instance
  }

  private initializeData(): void {
    if (!localStorage.getItem(this.PRODUCTS_KEY)) {
      this.setProducts(this.getInitialProducts())
    }
    if (!localStorage.getItem(this.ADMIN_KEY)) {
      const admin: Admin = { username: "admin", password: "admin123" }
      localStorage.setItem(this.ADMIN_KEY, JSON.stringify(admin))
    }
    if (!localStorage.getItem(this.USERS_KEY)) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify([]))
    }
    if (!localStorage.getItem(this.ORDERS_KEY)) {
      localStorage.setItem(this.ORDERS_KEY, JSON.stringify([]))
    }
    if (!localStorage.getItem(this.ACTIVITY_KEY)) {
      localStorage.setItem(this.ACTIVITY_KEY, JSON.stringify([]))
    }
  }

  private migrateProductImages(): void {
    try {
      const products = this.getProducts()
      let changed = false

      const renameMap: Record<string, string> = {
        "/romantic-flower-bouquet.jpg": "/public/images/מחברות.avif",
        "/public/romantic-flower-bouquet.jpg": "/public/images/מחברות.avif",
        "/public/images/romantic-flower-bouquet.jpg": "/public/images/מחברות.avif",

        "/premium-chocolate-box.png": "/public/images/בקבוק טרמי.jpg",
        "/public/premium-chocolate-box.png": "/public/images/בקבוק טרמי.jpg",
        "/public/images/premium-chocolate-box.png": "/public/images/בקבוק טרמי.jpg",

        "/giant-teddy-bear.jpg": "/public/images/שלט לדלת אותיות בולטות.jpg",
        "/public/giant-teddy-bear.jpg": "/public/images/שלט לדלת אותיות בולטות.jpg",
        "/public/images/giant-teddy-bear.jpg": "/public/images/שלט לדלת אותיות בולטות.jpg",

        "/scented-candles-set.jpg": "/public/images/קופסה לממחטות.jpg",
        "/public/scented-candles-set.jpg": "/public/images/קופסה לממחטות.jpg",
        "/public/images/scented-candles-set.jpg": "/public/images/קופסה לממחטות.jpg",
        "/scented-candle.png": "/public/images/קופסה לממחטות.jpg",
        "/public/scented-candle.png": "/public/images/קופסה לממחטות.jpg",
        "/public/images/scented-candle.png": "/public/images/קופסה לממחטות.jpg",

        "/fruit-basket.jpg": "/public/images/גרביים במארז.jpg",
        "/public/fruit-basket.jpg": "/public/images/גרביים במארז.jpg",
        "/public/images/fruit-basket.jpg": "/public/images/גרביים במארז.jpg",
        "/fruit-basket-gift.jpg": "/public/images/גרביים במארז.jpg",
        "/public/fruit-basket-gift.jpg": "/public/images/גרביים במארז.jpg",
        "/public/images/fruit-basket-gift.jpg": "/public/images/גרביים במארז.jpg",
      }

      for (const p of products) {
        const current = p.image
        if (current && typeof current === "string") {
          if (current in renameMap) {
            p.image = renameMap[current]
            changed = true
          } else if (!current.startsWith("/public/images/")) {
            if (current.startsWith("/")) {
              p.image = "/public/images" + current
            } else {
              p.image = "/public/images/" + current
            }
            changed = true
          }
        }
      }

      if (changed) {
        this.setProducts(products)
      }
    } catch {
    }
  }

  private migrateProductCategories(): void {
    try {
      const products = this.getProducts()
      let changed = false

      const mapCategory: Record<string, string> = {
        flowers: "back_to_school",
        chocolate: "winter",
        toys: "door_sign",
        candles: "other",
        jewelry: "other",
        other: "other",
      }

      for (const p of products) {
        const current = p.category
        if (current && current in mapCategory) {
          const next = mapCategory[current]
          if (next !== current) {
            p.category = next
            changed = true
          }
        }
      }

      if (changed) {
        this.setProducts(products)
      }
    } catch {
    }
  }

  private getInitialProducts(): Product[] {
    return this.getCatalogProducts()
  }

  private getCatalogProducts(): Product[] {
    const now = new Date().toISOString()
    const cat = (category: string, name: string, description: string, file: string, price: number, stock: number, idSeed: string): Product => ({
      id: this.makeStableId(idSeed),
      name,
      description,
      price,
      category,
      image: "/public/images/" + file,
      stock,
      createdAt: now,
    })

    const items: Product[] = [
      cat("door_sign", "שלט לדלת - אותיות בולטות", "שלט לדלת עם אותיות בולטות בעיצוב אישי", "שלט לדלת אותיות בולטות.jpg", 89.9, 20, "door_sign_1"),
      cat("door_sign", "שלט לדלת - תליוניים", "שלט לדלת עם תליונים בעיצוב ייחודי", "שלט לדלת תליוניים.jpg", 79.9, 20, "door_sign_2"),
      cat("door_sign", "תיבת דואר", "תיבת דואר לבית בעיצוב קלאסי", "תיבת דואר.jpg", 69.9, 15, "door_sign_3"),
      cat("door_sign", "שלט מספר לדלת", "שלט מספר לדלת בהתאמה אישית", "שלט מספר לדלת.jpg", 59.9, 30, "door_sign_4"),
      cat("door_sign", "שלט מלבני", "שלט מלבני נקי ומודרני", "שלט מלבני.webp", 49.9, 25, "door_sign_5"),
      cat("door_sign", "שלט אותיות", "שלט אותיות מעוצב", "שלט אותיות.jpg", 39.9, 25, "door_sign_6"),

      cat("back_to_school", "תיק שרוך", "תיק שרוך קל ונוח לנשיאה", "תיק שרוך.avif", 39.9, 50, "back_to_school_1"),
      cat("back_to_school", "קופסת אוכל", "קופסת אוכל מעוצבת לבית הספר", "קופסת אוכל.webp", 29.9, 60, "back_to_school_2"),
      cat("back_to_school", "מחברות", "סט מחברות מעוצבות לבית הספר", "מחברות.avif", 49.9, 100, "back_to_school_3"),
      cat("back_to_school", "מדבקות שם", "מדבקות שם להתאמה אישית למחברות ולציוד", "מדבקות שם.avif", 9.9, 200, "back_to_school_4"),
      cat("back_to_school", "יומן שבועי", "יומן שבועי לניהול מערכת שיעורים", "יומן שבועי.webp", 24.9, 80, "back_to_school_5"),
      cat("back_to_school", "בקבוק ללימודים", "בקבוק שתייה נוח לתלמידים", "בקבוק ללימודים.avif", 34.9, 70, "back_to_school_6"),

      cat("winter", "בקבוק טרמי", "בקבוק טרמי שומר חום וקור לאורך זמן", "בקבוק טרמי.jpg", 79.9, 40, "winter_1"),
      cat("winter", "בקבוק נירוסטה טרמי", "בקבוק נירוסטה טרמי עמיד ואיכותי", "בקבוק ניירוסטה טרמי.jpg", 99.9, 35, "winter_2"),
      cat("winter", "גרביים במארז", "מארז גרביים חמים ונעימים", "גרביים במארז.jpg", 29.9, 90, "winter_3"),
      cat("winter", "כירבולית למבוגרים", "שמיכת כירבול מפנקת לימי החורף", "כירבולית למבוגרים.jpg", 159.9, 25, "winter_4"),
      cat("winter", "מארז לקפה", "מארז מושלם לאוהבי הקפה", "מארז לקפה.jpg", 69.9, 30, "winter_5"),
      cat("winter", "מטריה מתקפלת", "מטריה מתקפלת קומפקטית לנשיאה", "מטריה מתקפלת.jpg", 99.9, 50, "winter_6"),
      cat("winter", "קופסה לממחטות", "קופסה אלגנטית לממחטות נייר", "קופסה לממחטות.jpg", 39.9, 60, "winter_7"),
    ]

    return items
  }

  private migrateCatalogProducts(): void {
    try {
      const products = this.getProducts()
      const catalog = this.getCatalogProducts()

      let changed = false

      for (const c of catalog) {
        const existing = products.find((p) => p.image === c.image)
        if (!existing) {
          products.push(c)
          changed = true
        } else {
          const updated: Partial<Product> = {}
          if (existing.name !== c.name) updated.name = c.name
          if (existing.description !== c.description) updated.description = c.description
          if (existing.category !== c.category) updated.category = c.category
          if (existing.price !== c.price) updated.price = c.price
          if (Object.keys(updated).length > 0) {
            existing.name = updated.name ?? existing.name
            existing.description = updated.description ?? existing.description
            existing.category = updated.category ?? existing.category
            existing.price = updated.price ?? existing.price
            changed = true
          }
        }
      }

      if (changed) this.setProducts(products)
    } catch {
    }
  }

  private makeStableId(seed: string): string {
    let h = 0
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
    return "p_" + Math.abs(h).toString()
  }

  getProducts(): Product[] {
    const data = localStorage.getItem(this.PRODUCTS_KEY)
    return data ? JSON.parse(data) : []
  }

  setProducts(products: Product[]): void {
    localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products))
  }

  getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id)
  }

  addProduct(product: Product): void {
    const products = this.getProducts()
    products.push(product)
    this.setProducts(products)
    this.addActivity("הוספת מוצר", `נוסף מוצר: ${product.name}`)
  }

  updateProduct(id: string, updates: Partial<Product>): void {
    const products = this.getProducts()
    const index = products.findIndex((p) => p.id === id)
    if (index !== -1) {
      products[index] = { ...products[index], ...updates }
      this.setProducts(products)
      this.addActivity("עדכון מוצר", `עודכן מוצר: ${products[index].name}`)
    }
  }

  deleteProduct(id: string): void {
    const products = this.getProducts()
    const product = products.find((p) => p.id === id)
    const filtered = products.filter((p) => p.id !== id)
    this.setProducts(filtered)
    if (product) {
      this.addActivity("מחיקת מוצר", `נמחק מוצר: ${product.name}`)
    }
  }

  getUsers(): User[] {
    const data = localStorage.getItem(this.USERS_KEY)
    return data ? JSON.parse(data) : []
  }

  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find((u) => u.email === email)
  }

  addUser(user: User): void {
    const users = this.getUsers()
    users.push(user)
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
  }

  getCurrentUser(): User | null {
    const data = localStorage.getItem(this.CURRENT_USER_KEY)
    return data ? JSON.parse(data) : null
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(this.CURRENT_USER_KEY)
    }
  }

  private getCartKey(userId: string): string {
    return `gift_shop_cart_${userId}`
  }

  getCart(userId: string): CartItem[] {
    const data = localStorage.getItem(this.getCartKey(userId))
    return data ? JSON.parse(data) : []
  }

  setCart(userId: string, cart: CartItem[]): void {
    localStorage.setItem(this.getCartKey(userId), JSON.stringify(cart))
  }

  addToCart(userId: string, productId: string, quantity = 1): void {
    const cart = this.getCart(userId)
    const existingItem = cart.find((item) => item.productId === productId)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({ productId, quantity })
    }

    this.setCart(userId, cart)
  }

  updateCartItemQuantity(userId: string, productId: string, quantity: number): void {
    const cart = this.getCart(userId)
    const item = cart.find((item) => item.productId === productId)

    if (item) {
      item.quantity = quantity
      this.setCart(userId, cart)
    }
  }

  removeFromCart(userId: string, productId: string): void {
    const cart = this.getCart(userId)
    const filtered = cart.filter((item) => item.productId !== productId)
    this.setCart(userId, filtered)
  }

  clearCart(userId: string): void {
    this.setCart(userId, [])
  }

  getOrders(): Order[] {
    const data = localStorage.getItem(this.ORDERS_KEY)
    return data ? JSON.parse(data) : []
  }

  getUserOrders(userId: string): Order[] {
    return this.getOrders().filter((order) => order.userId === userId)
  }

  addOrder(order: Order): void {
    const orders = this.getOrders()
    orders.push(order)
    localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders))
    this.addActivity("הזמנה חדשה", `הזמנה מספר: ${order.id}`)
  }

  updateOrderStatus(orderId: string, status: Order["status"]): void {
    const orders = this.getOrders()
    const order = orders.find((o) => o.id === orderId)
    if (order) {
      order.status = status
      localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders))
      this.addActivity("עדכון סטטוס הזמנה", `הזמנה ${orderId} עודכנה ל-${status}`)
    }
  }

  getActivityLog(): ActivityLog[] {
    const data = localStorage.getItem(this.ACTIVITY_KEY)
    return data ? JSON.parse(data) : []
  }

  addActivity(action: string, details: string): void {
    const logs = this.getActivityLog()
    logs.push({
      id: Date.now().toString(),
      action,
      details,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem(this.ACTIVITY_KEY, JSON.stringify(logs))
  }

  getAdmin(): Admin {
    const data = localStorage.getItem(this.ADMIN_KEY)
    return data ? JSON.parse(data) : { username: "admin", password: "admin123" }
  }

  isAdminLoggedIn(): boolean {
    return localStorage.getItem(this.ADMIN_SESSION_KEY) === "true"
  }

  setAdminSession(loggedIn: boolean): void {
    if (loggedIn) {
      localStorage.setItem(this.ADMIN_SESSION_KEY, "true")
    } else {
      localStorage.removeItem(this.ADMIN_SESSION_KEY)
    }
  }
}

export default StorageManager
