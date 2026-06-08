/* ============================================
   NewLook - Login
   ============================================ */

const API_BASE = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', () => {
    initPasswordToggle();
    initLoginForm();
    redirectIfLoggedIn();
});

// ─── Se já estiver logado, redireciona direto ─────────────────────
function redirectIfLoggedIn() {
    if (localStorage.getItem('newlook_userId')) {
        window.location.href = 'index.html';
    }
}

// ─── Toggle de senha ──────────────────────────────────────────────
function initPasswordToggle() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.getElementById('toggle-password');

    if (!passwordInput || !toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        toggleBtn.innerHTML = `
            <span class="material-symbols-outlined text-[20px]">
                ${isPassword ? 'visibility_off' : 'visibility'}
            </span>`;
    });
}

// ─── Form ─────────────────────────────────────────────────────────
function initLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;
    form.addEventListener('submit', handleLogin);
}

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('password').value;

    if (!email || !senha) {
        showError('Preencha todos os campos.');
        return;
    }

    const button = document.getElementById('login-btn');
    setButtonLoading(button, true);

    try {
        // Chama o endpoint de auth
        const formData = new FormData();
        formData.append('email', email);
        formData.append('senha', senha);

        const response = await fetch(`${API_BASE}/post/user/auth`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Erro ${response.status}`);
        }

        const userId = await response.text();

        // Backend retorna 0 se email/senha errados
        if (!userId || userId.trim() === '0') {
            showError('E-mail ou senha incorretos.');
            setButtonLoading(button, false);
            return;
        }

        // Salva o id do usuário
        localStorage.setItem('newlook_userId', userId.trim());

        // Busca os dados do usuário para salvar gênero e nome
        await carregarDadosUsuario(userId.trim());

        // Feedback visual de sucesso
        button.disabled = true;
        button.innerHTML = `
            <span class="material-symbols-outlined">check</span>
            Login realizado`;

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 800);

    } catch (error) {
        showError('Erro ao conectar com o servidor. Tente novamente.');
        setButtonLoading(button, false);
    }
}

// ─── Carrega e salva dados do usuário no localStorage ─────────────
async function carregarDadosUsuario(userId) {
    try {
        const response = await fetch(`${API_BASE}/get/user?id=${userId}`);
        if (!response.ok) return;

        const dados = await response.json();

        // Salva nome e gênero para usar nas outras páginas
        if (dados.nome)   localStorage.setItem('newlook_nome',   dados.nome);
        if (dados.genero) localStorage.setItem('newlook_genero', dados.genero);
        if (dados.email)  localStorage.setItem('newlook_email',  dados.email);

    } catch (e) {
        // Não bloqueia o login se falhar
        console.warn('Não foi possível carregar dados do usuário:', e);
    }
}

// ─── Helpers ──────────────────────────────────────────────────────
function setButtonLoading(button, loading) {
    button.disabled = loading;
    button.innerHTML = loading
        ? `<span class="material-symbols-outlined animate-spin">progress_activity</span> Entrando...`
        : 'Entrar';
}

function showError(msg) {
    // Reutiliza alerta existente ou cria um
    let errorEl = document.getElementById('login-error');
    if (!errorEl) {
        errorEl = document.createElement('p');
        errorEl.id = 'login-error';
        errorEl.className = 'text-error font-body-sm text-center mt-2';
        document.getElementById('login-form').appendChild(errorEl);
    }
    errorEl.textContent = msg;
}