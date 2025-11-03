export function formatPrice(price) {
    return `₪${price.toFixed(2)}`;
}
export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
export function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}
export function showMessage(message, type = "success") {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === "success" ? "#10b981" : "#ef4444"};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
    document.body.appendChild(messageDiv);
    const timer = setTimeout(() => {
        messageDiv.style.animation = "slideOut 0.3s ease-out";
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}
export function getCategoryName(category) {
    const categories = {
        back_to_school: "חוזרים ללימודים",
        winter: "חורף",
        door_sign: "שלט לדלת",
        other: "אחר",
    };
    return categories[category] || category;
}
export function getStatusName(status) {
    const statuses = {
        pending: "ממתין",
        processing: "בטיפול",
        shipped: "נשלח",
        delivered: "הושלם",
        cancelled: "בוטל",
    };
    return statuses[status] || status;
}
