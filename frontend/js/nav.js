/* ============================================
   NewLook - Shared Navigation Logic
   ============================================ */

/**
 * Marks the current page's nav link as active.
 * Call this on each page after DOM is ready.
 * @param {string} activePage - one of: 'index', 'settings', 'login', 'register'
 */
function setActiveNav(activePage) {
    const navMap = {
        index:    '[data-nav="generate"]',
        settings: '[data-nav="settings"]',
    };
    const selector = navMap[activePage];
    if (!selector) return;
    const el = document.querySelector(selector);
    if (el) el.classList.add('nav-active');
}

function handleLogout() {
    localStorage.removeItem('newlook_userId');
    localStorage.removeItem('newlook_nome');
    localStorage.removeItem('newlook_email');
    localStorage.removeItem('newlook_genero');
    localStorage.removeItem('newlook_avatar');
    localStorage.removeItem('newlook_senha');
    window.location.href = 'login.html';
}