/* ============================================
   NewLook - Cadastro
   ============================================ */

const API_BASE = 'http://localhost:8080';

document.addEventListener('DOMContentLoaded', () => {
    initRegisterForm();
    redirectIfLoggedIn();
});

// ─── Se já estiver logado, redireciona direto ─────────────────────
function redirectIfLoggedIn() {
    if (localStorage.getItem('newlook_userId')) {
        window.location.href = 'index.html';
    }
}

// ─── Form ─────────────────────────────────────────────────────────
function initRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;
    form.addEventListener('submit', handleRegister);
}

async function handleRegister(event) {
    event.preventDefault();

    const nome     = document.getElementById('name');
    const email    = document.getElementById('email');
    const senha    = document.getElementById('password');
    const confirmar = document.getElementById('confirm_password');
    const genero   = document.getElementById('genero');
    const termos   = document.getElementById('terms');

    clearValidation();

    // ─── Validações ───────────────────────────────────────────────
    let valid = true;

    [nome, email, senha, confirmar].forEach(input => {
        if (!input.value.trim()) {
            setFieldError(input, true);
            valid = false;
        }
    });

    if (!valid) {
        showError('Preencha todos os campos obrigatórios.');
        return;
    }

    if (senha.value.length < 6) {
        setFieldError(senha, true);
        showError('A senha deve ter pelo menos 6 caracteres.');
        return;
    }

    if (senha.value !== confirmar.value) {
        setFieldError(senha, true);
        setFieldError(confirmar, true);
        showError('As senhas não coincidem.');
        return;
    }

    if (!termos.checked) {
        showError('Você precisa aceitar os Termos de Uso.');
        return;
    }

    // ─── Envio ────────────────────────────────────────────────────
    const button = document.getElementById('register-btn');
    setButtonLoading(button, true);

    try {
        const formData = new FormData();
        formData.append('nome', nome.value.trim());
        formData.append('email', email.value.trim());
        formData.append('senha', senha.value);
        formData.append('genero', genero.value || 'Não informado');

        const response = await fetch(`${API_BASE}/post/user/cadastro`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Erro ${response.status}`);
        }

        // Feedback visual de sucesso
        button.disabled = true;
        button.innerHTML = `
            <span class="material-symbols-outlined">check</span>
            Conta criada!`;

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 800);

    } catch (error) {
        showError('Erro ao criar conta. Tente novamente.');
        setButtonLoading(button, false);
    }
}

// ─── Helpers ──────────────────────────────────────────────────────
function setFieldError(input, hasError) {
    input.style.borderColor = hasError ? '#ba1a1a' : '';
}

function clearValidation() {
    document.querySelectorAll('input, select').forEach(input => {
        input.style.borderColor = '';
    });

    const errorEl = document.getElementById('register-error');
    if (errorEl) errorEl.textContent = '';
}

function setButtonLoading(button, loading) {
    button.disabled = loading;
    button.innerHTML = loading
        ? `<span class="material-symbols-outlined animate-spin">progress_activity</span> Criando conta...`
        : 'Criar conta';
}

function showError(msg) {
    let errorEl = document.getElementById('register-error');
    if (!errorEl) {
        errorEl = document.createElement('p');
        errorEl.id = 'register-error';
        errorEl.className = 'text-error font-body-sm text-center mt-2';
        document.getElementById('register-form').appendChild(errorEl);
    }
    errorEl.textContent = msg;
}