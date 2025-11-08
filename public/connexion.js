document.addEventListener('DOMContentLoaded', () => {

    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    // Fonction pour récupérer les utilisateurs stockés
    function getUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }

    // Fonction pour enregistrer les utilisateurs
    function saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }

    // --- Inscription ---
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            let users = getUsers();

            // Vérifier si email déjà utilisé
            if(users.find(u => u.email === email)) {
                alert("Cet email est déjà utilisé !");
                return;
            }

            // Ajouter l'utilisateur
            users.push({ name, email, password });
            saveUsers(users);

            alert("Compte créé avec succès !");
            window.location.href = 'login.html';
        });
    }

    // --- Connexion ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            const users = getUsers();
            const user = users.find(u => u.email === email && u.password === password);

            if(user) {
                // Sauvegarder l'utilisateur connecté
                localStorage.setItem('currentUser', JSON.stringify(user));
                window.location.href = 'account.html';
            } else {
                alert("Email ou mot de passe incorrect !");
            }
        });
    }

});