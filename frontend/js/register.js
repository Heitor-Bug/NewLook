const API_BASE = 'http://localhost:8080';

/*
    DOMContentLoaded: executa após o HTML ser completamente carregado.
    Arrow function () => {}: sintaxe moderna de função anônima.
*/
document.addEventListener('DOMContentLoaded', () => {
    // Redireciona se já estiver logado
    if (localStorage.getItem('newlook_userId')) {
        window.location.href = 'index.html';
        return;
    }
    // Vincula a função handleRegister ao evento submit do formulário
    document.getElementById('register-form').addEventListener('submit', handleRegister);
});

async function handleRegister(event) {
    event.preventDefault();
    clearError(); // Remove mensagem de erro anterior

    /*
        value: propriedade que contém o texto digitado no input.
        trim(): remove espaços em branco no início e fim.
    */
    const nome = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('password').value;
    const confirmar = document.getElementById('confirm_password').value;
    const genero = document.getElementById('genero').value;

    // Validações com early return (sai da função se algo estiver errado)
    if (!nome || !email || !senha || !confirmar) { showError('Preencha todos os campos.'); return; }
    if (senha.length < 6) { showError('A senha deve ter pelo menos 6 caracteres.'); return; }
    if (senha !== confirmar) { showError('As senhas não coincidem.'); return; }

    const button = document.getElementById('register-btn');
    button.disabled = true;
    button.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Criando conta...';

    try {
        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('email', email);
        formData.append('senha', senha);
        formData.append('genero', genero || 'Não informado');

        const response = await fetch(`${API_BASE}/post/user/cadastro`, { method: 'POST', body: formData });
        if (!response.ok) throw new Error();

        // Sucesso: mostra mensagem e redireciona para o login
        const btn = document.getElementById('register-btn');
        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Cadastro concluído!';
        btn.classList.add('bg-green-600');

        showSuccess('Conta criada com sucesso! Redirecionando...');
        setTimeout(() => { window.location.href = 'login.html'; }, 2000);
    } catch (_) {
        showError('Erro ao criar conta. Tente novamente.');
        button.disabled = false;
        button.textContent = 'Criar conta';
    }
}

/*
    showError e clearError: gerenciam a exibição de mensagens de erro.
    Diferente do login.js, aqui há uma função separada para limpar a mensagem
    (clearError é chamada no início do submit).
*/
function showError(msg) {
    let el = document.getElementById('register-error');
    if (!el) {
        el = document.createElement('p');
        el.id = 'register-error';
        el.className = 'text-error font-body-sm text-center mt-2';
        document.getElementById('register-form').appendChild(el); // appendChild: adiciona ao final
    }
    el.textContent = msg;
}

function clearError() {
    const el = document.getElementById('register-error');
    if (el) el.textContent = '';
}

function showSuccess(msg) {
    clearError();
    let el = document.getElementById('register-success');
    if (!el) {
        el = document.createElement('p');
        el.id = 'register-success';
        el.className = 'text-green-600 font-body-sm text-center mt-2';
        document.getElementById('register-form').appendChild(el);
    }
    el.textContent = msg;
}
