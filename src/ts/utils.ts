export function formatPrice(price: number): string {
  return `₪${price.toFixed(2)}`
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("he-IL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

export function showMessage(message: string, type: "success" | "error" = "success"): void {
  const messageDiv = document.createElement("div")
  messageDiv.className = `message message-${type}`
  messageDiv.textContent = message
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: #fce7f3; /* light pink */
    color: #111111; /* black text for readability */
    border: 1px solid #f5b8d2; /* subtle border */
    border-radius: 10px;
    box-shadow: 0 6px 16px rgba(0,0,0,0.12);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `

  document.body.appendChild(messageDiv)

  const timer = setTimeout(() => {
    messageDiv.style.animation = "slideOut 0.3s ease-out"
    setTimeout(() => {
      document.body.removeChild(messageDiv)
    }, 300)
  }, 3000)
}

export function getCategoryName(category: string): string {
  const categories: Record<string, string> = {
    back_to_school: "חוזרים ללימודים",
    winter: "חורף",
    door_sign: "שלט לדלת",
    other: "אחר",
  }
  return categories[category] || category
}

export function getStatusName(status: string): string {
  const statuses: Record<string, string> = {
    pending: "ממתין",
    processing: "בטיפול",
    shipped: "נשלח",
    delivered: "הושלם",
    cancelled: "בוטל",
  }
  return statuses[status] || status
}
