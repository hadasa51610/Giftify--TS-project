export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || email.trim() === "") {
        return { isValid: false, error: "אימייל הוא שדה חובה" };
    }
    if (!emailRegex.test(email)) {
        return { isValid: false, error: "אימייל לא תקין" };
    }
    return { isValid: true };
}
export function validatePhone(phone) {
    const phoneRegex = /^05\d-?\d{7}$/;
    if (!phone || phone.trim() === "") {
        return { isValid: false, error: "טלפון הוא שדה חובה" };
    }
    if (!phoneRegex.test(phone)) {
        return { isValid: false, error: "מספר טלפון לא תקין (פורמט: 05X-XXXXXXX)" };
    }
    return { isValid: true };
}
export function validatePrice(price) {
    const priceRegex = /^\d+(\.\d{1,2})?$/;
    if (!price || price.trim() === "") {
        return { isValid: false, error: "מחיר הוא שדה חובה" };
    }
    if (!priceRegex.test(price)) {
        return { isValid: false, error: "מחיר לא תקין (מספר חיובי עם עד 2 ספרות אחרי הנקודה)" };
    }
    const numPrice = Number.parseFloat(price);
    if (numPrice <= 0) {
        return { isValid: false, error: "מחיר חייב להיות גדול מ-0" };
    }
    return { isValid: true };
}
export function validateStock(stock) {
    const stockRegex = /^\d+$/;
    if (!stock || stock.trim() === "") {
        return { isValid: false, error: "מלאי הוא שדה חובה" };
    }
    if (!stockRegex.test(stock)) {
        return { isValid: false, error: "מלאי חייב להיות מספר שלם" };
    }
    const numStock = Number.parseInt(stock);
    if (numStock < 0) {
        return { isValid: false, error: "מלאי לא יכול להיות שלילי" };
    }
    return { isValid: true };
}
export function validateName(name) {
    const nameRegex = /^.{2,50}$/;
    if (!name || name.trim() === "") {
        return { isValid: false, error: "שם הוא שדה חובה" };
    }
    if (!nameRegex.test(name.trim())) {
        return { isValid: false, error: "שם חייב להכיל בין 2 ל-50 תווים" };
    }
    return { isValid: true };
}
export function validatePassword(password) {
    if (!password || password.trim() === "") {
        return { isValid: false, error: "סיסמה היא שדה חובה" };
    }
    if (password.length < 6) {
        return { isValid: false, error: "סיסמה חייבת להכיל לפחות 6 תווים" };
    }
    return { isValid: true };
}
export function validateRequired(value, fieldName) {
    if (!value || value.trim() === "") {
        return { isValid: false, error: `${fieldName} הוא שדה חובה` };
    }
    return { isValid: true };
}
