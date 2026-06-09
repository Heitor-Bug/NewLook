/*
    Função de logout compartilhada entre todas as páginas.
    Carregada via <script src="../js/nav.js"> em cada página.

    localStorage: armazenamento persistente no navegador do usuário.
    removeItem(): deleta uma chave do localStorage.
    window.location.href: redireciona para outra página.
*/
function handleLogout() {
    // Limpa todos os dados da sessão do usuário
    localStorage.removeItem('newlook_userId');
    localStorage.removeItem('newlook_nome');
    localStorage.removeItem('newlook_email');
    localStorage.removeItem('newlook_genero');
    localStorage.removeItem('newlook_avatar');
    localStorage.removeItem('newlook_senha');
    // Redireciona para a tela de login
    window.location.href = 'login.html';
}
