import StorageManager from "../storage.js"
import { showMessage } from "../utils.js"
import { validateEmail, validatePassword } from "../validation.js"

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

const form = document.getElementById("loginForm")

if (form) {
  form.addEventListener("submit", (e: Event) => {
    e.preventDefault()

    const emailInput = document.getElementById("email") as HTMLInputElement
    const passwordInput = document.getElementById("password") as HTMLInputElement
    const emailError = document.getElementById("emailError")
    const passwordError = document.getElementById("passwordError")

    let isValid = true

    const emailValidation = validateEmail(emailInput.value)
    if (!emailValidation.isValid && emailError) {
      emailError.textContent = emailValidation.error || ""
      isValid = false
    } else if (emailError) {
      emailError.textContent = ""
    }

    const passwordValidation = validatePassword(passwordInput.value)
    if (!passwordValidation.isValid && passwordError) {
      passwordError.textContent = passwordValidation.error || ""
      isValid = false
    } else if (passwordError) {
      passwordError.textContent = ""
    }

    if (!isValid) return

    const user = storage.getUserByEmail(emailInput.value)

    if (!user || user.password !== passwordInput.value) {
      showMessage("אימייל או סיסמה שגויים", "error")
      return
    }

    storage.setCurrentUser(user)
    showMessage("התחברת בהצלחה!")

    setTimeout(() => {
      window.location.href = "store.html"
    }, 1500)
  })
}

window.addEventListener("beforeunload", () => {
  clearInterval(timeInterval)
})
