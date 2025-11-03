import StorageManager from "../storage.js"
import { showMessage, generateId } from "../utils.js"
import { validateName, validateEmail, validatePassword, validatePhone, validateRequired } from "../validation.js"
import type { User } from "../types.js"

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

const form = document.getElementById("registerForm")

if (form) {
  form.addEventListener("submit", (e: Event) => {
    e.preventDefault()

    const nameInput = document.getElementById("name") as HTMLInputElement
    const emailInput = document.getElementById("email") as HTMLInputElement
    const passwordInput = document.getElementById("password") as HTMLInputElement
    const phoneInput = document.getElementById("phone") as HTMLInputElement
    const addressInput = document.getElementById("address") as HTMLTextAreaElement

    const nameError = document.getElementById("nameError")
    const emailError = document.getElementById("emailError")
    const passwordError = document.getElementById("passwordError")
    const phoneError = document.getElementById("phoneError")
    const addressError = document.getElementById("addressError")

    let isValid = true

    const nameValidation = validateName(nameInput.value)
    if (!nameValidation.isValid && nameError) {
      nameError.textContent = nameValidation.error || ""
      isValid = false
    } else if (nameError) {
      nameError.textContent = ""
    }

    const emailValidation = validateEmail(emailInput.value)
    if (!emailValidation.isValid && emailError) {
      emailError.textContent = emailValidation.error || ""
      isValid = false
    } else if (emailError) {
      emailError.textContent = ""
    }

    const existingUser = storage.getUserByEmail(emailInput.value)
    if (existingUser && emailError) {
      emailError.textContent = "אימייל זה כבר רשום במערכת"
      isValid = false
    }

    const passwordValidation = validatePassword(passwordInput.value)
    if (!passwordValidation.isValid && passwordError) {
      passwordError.textContent = passwordValidation.error || ""
      isValid = false
    } else if (passwordError) {
      passwordError.textContent = ""
    }

    const phoneValidation = validatePhone(phoneInput.value)
    if (!phoneValidation.isValid && phoneError) {
      phoneError.textContent = phoneValidation.error || ""
      isValid = false
    } else if (phoneError) {
      phoneError.textContent = ""
    }

    const addressValidation = validateRequired(addressInput.value, "כתובת")
    if (!addressValidation.isValid && addressError) {
      addressError.textContent = addressValidation.error || ""
      isValid = false
    } else if (addressError) {
      addressError.textContent = ""
    }

    if (!isValid) return

    const newUser: User = {
      id: generateId(),
      name: nameInput.value,
      email: emailInput.value,
      password: passwordInput.value,
      phone: phoneInput.value,
      address: addressInput.value,
      createdAt: new Date().toISOString(),
    }

    storage.addUser(newUser)
    storage.setCurrentUser(newUser)
    showMessage("נרשמת בהצלחה!")

    setTimeout(() => {
      window.location.href = "store.html"
    }, 1500)
  })
}

window.addEventListener("beforeunload", () => {
  clearInterval(timeInterval)
})
