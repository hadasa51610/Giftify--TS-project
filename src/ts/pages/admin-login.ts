import StorageManager from "../storage.js"
import { showMessage } from "../utils.js"

const storage = StorageManager.getInstance()

const form = document.getElementById("adminLoginForm")

if (form) {
  form.addEventListener("submit", (e: Event) => {
    e.preventDefault()

    const usernameInput = document.getElementById("username") as HTMLInputElement
    const passwordInput = document.getElementById("password") as HTMLInputElement

    const admin = storage.getAdmin()

    if (usernameInput.value !== admin.username || passwordInput.value !== admin.password) {
      showMessage("שם משתמש או סיסמה שגויים", "error")
      return
    }

    storage.setAdminSession(true)
    showMessage("התחברת בהצלחה!")

    setTimeout(() => {
      window.location.href = "admin-dashboard.html"
    }, 1500)
  })
}
