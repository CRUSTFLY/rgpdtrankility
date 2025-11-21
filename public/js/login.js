document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      // Sauvegarder le token côté client
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      alert("Connecté avec succès !");
      window.location.href = "dashboard.html"; // Page protégée
    } else {
      alert(data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Erreur réseau");
  }
});
