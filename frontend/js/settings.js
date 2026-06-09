const API_BASE = 'http://localhost:8080';

/*
    DOMContentLoaded: inicializa a página de configurações.
    Verifica se o usuário está logado, carrega dados, e registra eventos.
*/
document.addEventListener('DOMContentLoaded', () => {
    /*
        Se não há userId no localStorage, redireciona para login.
        return encerra a execução do callback.
    */
    if (!localStorage.getItem('newlook_userId')) { window.location.href = 'login.html'; return; }
    carregarDadosUsuario();
    /*
        addEventListener('submit', ...): captura o envio do formulário.
        handleSaveSettings é passado como referência (sem parênteses).
    */
    document.getElementById('settings-form').addEventListener('submit', handleSaveSettings);
    document.getElementById('reset-senha-btn').addEventListener('click', handleResetSenha);
    document.getElementById('delete-account-btn').addEventListener('click', handleDeleteAccount);
});

/*
    carregarDadosUsuario: busca os dados do usuário no backend e preenche o formulário.
    Se a requisição falhar, usa dados do localStorage como fallback.
    try/catch: tenta executar o try; se lançar erro, executa o catch.
*/
async function carregarDadosUsuario() {
    const userId = localStorage.getItem('newlook_userId');
    try {
        const res = await fetch(`${API_BASE}/get/user?id=${userId}`);
        if (res.ok) {
            /*
                res.json(): extrai o corpo da resposta como objeto JavaScript.
                Exemplo de retorno: { id: 1, nome: "Maria", email: "maria@email.com", ... }
            */
            const dados = await res.json();
            if (dados.nome) document.getElementById('nome').value = dados.nome;
            if (dados.email) document.getElementById('email').value = dados.email;
            if (dados.genero) document.getElementById('genero').value = dados.genero;
            // Atualiza localStorage com dados frescos do backend
            if (dados.nome) localStorage.setItem('newlook_nome', dados.nome);
            if (dados.email) localStorage.setItem('newlook_email', dados.email);
            if (dados.genero) localStorage.setItem('newlook_genero', dados.genero);
            return; // Sai da função, ignorando o fallback abaixo
        }
    } catch (_) {} // Ignora erro de rede

    // Fallback: se o servidor falhou, usa o que tem no localStorage
    const nome = localStorage.getItem('newlook_nome');
    const email = localStorage.getItem('newlook_email');
    const genero = localStorage.getItem('newlook_genero');
    if (nome) document.getElementById('nome').value = nome;
    if (email) document.getElementById('email').value = email;
    if (genero) document.getElementById('genero').value = genero;
}

/*
    handleSaveSettings: salva as alterações do perfil (nome, email, gênero).
    Envia a senha atual junto (exigência do backend) para não sobrescrever com vazio.
    disabled = true: desabilita o botão durante a requisição (evita duplo clique).
*/
async function handleSaveSettings(event) {
    event.preventDefault();
    const userId = localStorage.getItem('newlook_userId');
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const genero = document.getElementById('genero').value;
    if (!nome || !email) { showMessage('Nome e e-mail são obrigatórios.', 'error'); return; }

    const btn = document.getElementById('save-btn');
    btn.disabled = true;
    /*
        innerHTML com HTML: mostra ícone de loading + texto.
        A classe animate-spin do Tailwind faz o ícone girar.
        Depois de salvar, voltamos o texto normal com textContent.
    */
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Salvando...';

    try {
        const formData = new FormData();
        formData.append('id', userId);
        formData.append('nome', nome);
        formData.append('email', email);
        /*
            O backend exige o campo "senha" mesmo quando não estamos alterando a senha.
            Por isso recuperamos a senha salva no login (newlook_senha) e enviamos ela de volta.
        */
        formData.append('senha', localStorage.getItem('newlook_senha'));
        formData.append('genero', genero);
        const res = await fetch(`${API_BASE}/post/user/edit`, { method: 'POST', body: formData });
        if (!res.ok) throw new Error(); // res.ok = true se status for 200-299
        // Atualiza localStorage com os novos valores
        localStorage.setItem('newlook_nome', nome);
        localStorage.setItem('newlook_email', email);
        localStorage.setItem('newlook_genero', genero);
        showMessage('Alterações salvas com sucesso!', 'success');
    } catch (_) {
        showMessage('Erro ao salvar alterações. Tente novamente.', 'error');
    }
    btn.disabled = false;
    btn.textContent = 'Salvar Alterações';
}

/*
    handleResetSenha: altera a senha do usuário.
    Valida se a nova senha tem pelo menos 6 caracteres.
    Envia todos os campos do formulário + nova senha para o backend.
    Se sucesso, salva a nova senha no localStorage.
*/
async function handleResetSenha() {
    const novaSenha = document.getElementById('nova-senha').value;
    if (!novaSenha) { showMessage('Digite a nova senha.', 'error'); return; }
    if (novaSenha.length < 6) { showMessage('A senha deve ter pelo menos 6 caracteres.', 'error'); return; }

    const userId = localStorage.getItem('newlook_userId');
    try {
        const formData = new FormData();
        formData.append('id', userId);
        formData.append('nome', document.getElementById('nome').value.trim());
        formData.append('email', document.getElementById('email').value.trim());
        formData.append('senha', novaSenha); // Nova senha
        formData.append('genero', document.getElementById('genero').value);
        const res = await fetch(`${API_BASE}/post/user/edit`, { method: 'POST', body: formData });
        if (!res.ok) throw new Error();
        // Salva a nova senha para usar em futuras edições de perfil
        localStorage.setItem('newlook_senha', novaSenha);
        document.getElementById('nova-senha').value = ''; // Limpa o campo
        showMessage('Senha redefinida com sucesso!', 'success');
    } catch (_) {
        showMessage('Erro ao redefinir senha. Tente novamente.', 'error');
    }
}

/*
    handleDeleteAccount: exclui permanentemente a conta.
    confirm(): diálogo de confirmação nativo do navegador.
    Se confirmado, envia requisição POST para deletar.
    Depois limpa o localStorage e redireciona para login.
*/
async function handleDeleteAccount() {
    if (!confirm('Tem certeza que deseja excluir sua conta? Todos os seus dados e looks gerados serão permanentemente removidos. Esta ação não pode ser desfeita.')) return;
    try {
        const formData = new FormData();
        formData.append('id', localStorage.getItem('newlook_userId'));
        const res = await fetch(`${API_BASE}/post/user/deletar`, { method: 'POST', body: formData });
        if (!res.ok) throw new Error();
        // Limpa todos os dados do usuário
        localStorage.removeItem('newlook_userId');
        localStorage.removeItem('newlook_nome');
        localStorage.removeItem('newlook_email');
        localStorage.removeItem('newlook_genero');
        localStorage.removeItem('newlook_senha');
        window.location.href = 'login.html';
    } catch (_) {
        showMessage('Erro ao excluir conta. Tente novamente.', 'error');
    }
}

/*
    showMessage: exibe uma mensagem (sucesso ou erro) no topo do formulário.
    Se já existe um elemento com id "settings-message", remove e recria.
    className: define as classes CSS (cor diferente para error/success).
    prepend: adiciona como primeiro filho (antes dos outros elementos).
*/
function showMessage(msg, type) {
    const existing = document.getElementById('settings-message');
    if (existing) existing.remove(); // Remove mensagem anterior
    const el = document.createElement('p');
    el.id = 'settings-message';
    /*
        Operador ternário aninhado no template string:
        Se type === 'error', usa text-error (vermelho), senão text-primary (preto).
    */
    el.className = `font-body-sm text-center mt-2 ${type === 'error' ? 'text-error' : 'text-primary'}`;
    el.textContent = msg;
    document.getElementById('settings-form').prepend(el);
}
