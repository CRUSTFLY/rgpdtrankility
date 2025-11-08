document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Trouver la nav dans le header
    const nav = document.querySelector('header nav');

    if(currentUser) {
        // Si connecté
        nav.innerHTML = `
            <a href="account.html">Mon Compte</a>
            <a href="#" id="logoutBtn">Déconnexion</a>
        `;

        // Ajouter la fonctionnalité de déconnexion
        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });

    } else {
        // Si non connecté
        nav.innerHTML = `
            <a href="login.html">Connexion</a>
            <a href="register.html">S'inscrire</a>
        `;
    }
});
