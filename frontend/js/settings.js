/* ============================================
   NewLook - Configurações
   ============================================ */

const API_BASE = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    carregarDadosUsuario();
    initAvatarUpload();
    initSettingsForm();
    initDeleteAccount();
});

// ─── Auth ─────────────────────────────────────────────────────────
function checkAuth() {
    const userId = localStorage.getItem('newlook_userId');
    if (!userId) {
        window.location.href = 'login.html';
    }
}

// ─── Carrega dados do usuário nos campos ──────────────────────────
async function carregarDadosUsuario() {
    const userId = localStorage.getItem('newlook_userId');

    try {
        const response = await fetch(`${API_BASE}/get/user?id=${userId}`);
        if (!response.ok) throw new Error('Erro ao buscar usuário');

        const dados = await response.json();

        // Preenche os campos do formulário
        if (dados.nome)   document.getElementById('nome').value  = dados.nome;
        if (dados.email)  document.getElementById('email').value = dados.email;
        if (dados.genero) {
            const select = document.getElementById('genero');
            if (select) select.value = dados.genero;
        }

        // Atualiza localStorage com dados frescos
        if (dados.nome)   localStorage.setItem('newlook_nome',   dados.nome);
        if (dados.email)  localStorage.setItem('newlook_email',  dados.email);
        if (dados.genero) localStorage.setItem('newlook_genero', dados.genero);

    } catch (error) {
        // Se falhar, preenche com o que está no localStorage
        const nome   = localStorage.getItem('newlook_nome');
        const email  = localStorage.getItem('newlook_email');
        const genero = localStorage.getItem('newlook_genero');

        if (nome)   document.getElementById('nome').value  = nome;
        if (email)  document.getElementById('email').value = email;
        if (genero) {
            const select = document.getElementById('genero');
            if (select) select.value = genero;
        }

        console.warn('Usando dados do cache:', error);
    }
}

// ─── Avatar ───────────────────────────────────────────────────────
function initAvatarUpload() {
    const input   = document.getElementById('avatar-upload');
    const preview = document.getElementById('avatar-preview');

    if (!input || !preview) return;

    // Carrega avatar salvo no localStorage
    const avatarSalvo = localStorage.getItem('newlook_avatar');
    if (avatarSalvo) preview.src = avatarSalvo;

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showError('O avatar deve ter no máximo 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            preview.src = ev.target.result;
            // Salva o avatar em base64 no localStorage
            localStorage.setItem('newlook_avatar', ev.target.result);

            // Atualiza o avatar da topbar também
            const topbarAvatar = document.getElementById('topbar-avatar');
            if (topbarAvatar) topbarAvatar.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// ─── Formulário de configurações ──────────────────────────────────
function initSettingsForm() {
    const form = document.getElementById('settings-form');
    if (!form) return;
    form.addEventListener('submit', handleSaveSettings);

    const resetSenhaBtn = document.getElementById('reset-senha-btn');
    if (resetSenhaBtn) resetSenhaBtn.addEventListener('click', handleResetSenha);
}

async function handleSaveSettings(event) {
    event.preventDefault();

    const userId = localStorage.getItem('newlook_userId');
    const nome   = document.getElementById('nome').value.trim();
    const email  = document.getElementById('email').value.trim();
    const genero = document.getElementById('genero').value;

    if (!nome || !email) {
        showError('Nome e e-mail são obrigatórios.');
        return;
    }

    const saveBtn = document.getElementById('save-btn');
    setButtonLoading(saveBtn, true);

    try {
        // Busca a senha atual para não sobrescrever com vazio
        const senhaAtual = localStorage.getItem('newlook_senha') || '';

        const formData = new FormData();
        formData.append('id', userId);
        formData.append('nome', nome);
        formData.append('email', email);
        formData.append('senha', senhaAtual);
        formData.append('genero', genero);

        const response = await fetch(`${API_BASE}/post/user/edit`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error(`Erro ${response.status}`);

        // Atualiza localStorage
        localStorage.setItem('newlook_nome',   nome);
        localStorage.setItem('newlook_email',  email);
        localStorage.setItem('newlook_genero', genero);

        showSuccess('Alterações salvas com sucesso!');

    } catch (error) {
        showError('Erro ao salvar alterações. Tente novamente.');
    } finally {
        setButtonLoading(saveBtn, false);
    }
}

async function handleResetSenha() {
    const userId   = localStorage.getItem('newlook_userId');
    const novaSenha = document.getElementById('nova-senha').value;

    if (!novaSenha) {
        showError('Digite a nova senha antes de redefinir.');
        return;
    }

    if (novaSenha.length < 6) {
        showError('A senha deve ter pelo menos 6 caracteres.');
        return;
    }

    try {
        const nome   = document.getElementById('nome').value.trim();
        const email  = document.getElementById('email').value.trim();
        const genero = document.getElementById('genero').value;

        const formData = new FormData();
        formData.append('id', userId);
        formData.append('nome', nome);
        formData.append('email', email);
        formData.append('senha', novaSenha);
        formData.append('genero', genero);

        const response = await fetch(`${API_BASE}/post/user/edit`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error(`Erro ${response.status}`);

        localStorage.setItem('newlook_senha', novaSenha);
        document.getElementById('nova-senha').value = '';
        showSuccess('Senha redefinida com sucesso!');

    } catch (error) {
        showError('Erro ao redefinir senha. Tente novamente.');
    }
}

// ─── Deletar conta ────────────────────────────────────────────────
function initDeleteAccount() {
    const deleteBtn = document.getElementById('delete-account-btn');
    if (!deleteBtn) return;

    deleteBtn.addEventListener('click', handleDeleteAccount);
}

async function handleDeleteAccount() {
    const confirmacao = confirm(
        'Tem certeza que deseja excluir sua conta?\n\nTodos os seus dados e looks gerados serão permanentemente removidos. Esta ação não pode ser desfeita.'
    );

    if (!confirmacao) return;

    const userId = localStorage.getItem('newlook_userId');

    try {
        const formData = new FormData();
        formData.append('id', userId);

        const response = await fetch(`${API_BASE}/post/user/deletar`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error(`Erro ${response.status}`);

        // Limpa tudo do localStorage
        limparLocalStorage();

        window.location.href = 'login.html';

    } catch (error) {
        showError('Erro ao excluir conta. Tente novamente.');
    }
}

// ─── Helpers ──────────────────────────────────────────────────────
function limparLocalStorage() {
    localStorage.removeItem('newlook_userId');
    localStorage.removeItem('newlook_nome');
    localStorage.removeItem('newlook_email');
    localStorage.removeItem('newlook_genero');
    localStorage.removeItem('newlook_avatar');
    localStorage.removeItem('newlook_senha');
}

function setButtonLoading(button, loading) {
    if (!button) return;
    button.disabled = loading;
    button.innerHTML = loading
        ? `<span class="material-symbols-outlined animate-spin">progress_activity</span> Salvando...`
        : 'Salvar Alterações';
}

function showError(msg) {
    clearMessages();
    let el = document.createElement('p');
    el.id = 'settings-message';
    el.className = 'text-error font-body-sm text-center mt-2';
    el.textContent = msg;
    document.getElementById('settings-form').prepend(el);
}

function showSuccess(msg) {
    clearMessages();
    let el = document.createElement('p');
    el.id = 'settings-message';
    el.className = 'text-primary font-body-sm text-center mt-2';
    el.textContent = msg;
    document.getElementById('settings-form').prepend(el);
}

function clearMessages() {
    const existing = document.getElementById('settings-message');
    if (existing) existing.remove();
}