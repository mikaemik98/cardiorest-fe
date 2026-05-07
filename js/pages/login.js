// js/pages/login.js
import { USE_MOCK } from "../services/analysisService.js";

/** Näyttää virheviestin kirjautumislomakkeessa */
function showError(message) {
  const error = document.getElementById("loginError");
  const text = document.getElementById("loginErrorText");
  if (error && text) {
    text.textContent = message;
    error.style.display = "flex";
  }
}

/** Piilottaa virheviestin */
function hideError() {
  const error = document.getElementById("loginError");
  if (error) error.style.display = "none";
}

/** Asettaa kirjautumisnapin lataus-tilan — näyttää spinnerin ja estää tuplapainalluksen */
function setLoading(loading) {
  const btn = document.getElementById("loginBtn");
  const btnText = document.getElementById("loginBtnText");
  const spinner = document.getElementById("loginSpinner");
  if (btn) btn.disabled = loading;
  if (btnText) btnText.style.display = loading ? "none" : "block";
  if (spinner) spinner.style.display = loading ? "block" : "none";
}

/**
 * Käsittelee kirjautumisen — lähettää Kubios-tunnukset backendille.
 * Onnistuneen kirjautumisen jälkeen tallentaa JWT-tokenin ja
 * käyttäjätiedot localStorageen ja ohjaa dashboardille.
 */
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
    // Tallennetaan token ja käyttäjätiedot selaimen localStorageen
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    window.location.href = "/dashboard.html";
  } catch (err) {
    console.error("Login virhe:", err);
    showError("Yhteysvirhe — yritä uudelleen");
    setLoading(false);
  }
}

// Tapahtumakuuntelijat
document.getElementById("loginBtn")?.addEventListener("click", handleLogin);

// Enter-näppäin lähettää lomakkeen salasanakentässä
document.getElementById("password")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleLogin();
});

// Enter-näppäin siirtää fokuksen sähköpostista salasanaan
document.getElementById("email")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("password")?.focus();
});

// Salasanan näyttäminen/piilottaminen silmäikonilla
document.getElementById("passwordToggle")?.addEventListener("click", () => {
  const input = document.getElementById("password");
  if (input) input.type = input.type === "password" ? "text" : "password";
});
