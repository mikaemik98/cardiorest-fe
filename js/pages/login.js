// js/pages/login.js
import { USE_MOCK } from "../services/analysisService.js";

/* const MOCK_USERS = {
  "matti@test.fi": {
    password: "test1234",
    role: "patient",
    name: "Matti Meikäläinen",
  },
  "anna@test.fi": {
    password: "test1234",
    role: "professional",
    name: "Anna Virtanen",
  },
}; */

function showError(message) {
  const error = document.getElementById("loginError");
  const text = document.getElementById("loginErrorText");
  if (error && text) {
    text.textContent = message;
    error.style.display = "flex";
  }
}

function hideError() {
  const error = document.getElementById("loginError");
  if (error) error.style.display = "none";
}

function setLoading(loading) {
  const btn = document.getElementById("loginBtn");
  const btnText = document.getElementById("loginBtnText");
  const spinner = document.getElementById("loginSpinner");
  if (btn) btn.disabled = loading;
  if (btnText) btnText.style.display = loading ? "none" : "block";
  if (spinner) spinner.style.display = loading ? "block" : "none";
}

/* function redirectByRole(role) {
  if (role === "professional") {
    window.location.href = "/professional.html";
  } else {
    window.location.href = "/dashboard.html";
  }
} */

async function handleLogin() {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  if (!emailInput || !passwordInput) {
    console.error("Lomake-elementtejä ei löydy");
    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  hideError();

  if (!email || !password) {
    showError("Täytä kaikki kentät");
    return;
  }

  setLoading(true);

  // POST /api/auth/login - lähettää Kubios-tunnukset backendille
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
    });

    if (!res.ok) {
      showError("Väärä sähköposti tai salasana");
      setLoading(false);
      return;
    }

    const data = await res.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    window.location.href = "/dashboard.html";
  } catch (err) {
    console.error("Login virhe:", err);
    showError("Yhteysvirhe — yritä uudelleen");
    setLoading(false);
  }
}

document.getElementById("loginBtn")?.addEventListener("click", handleLogin);

document.getElementById("password")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleLogin();
});

document.getElementById("email")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("password")?.focus();
});

document.getElementById("passwordToggle")?.addEventListener("click", () => {
  const input = document.getElementById("password");
  if (input) input.type = input.type === "password" ? "text" : "password";
});
