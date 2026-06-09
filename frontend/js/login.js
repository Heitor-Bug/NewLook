/*
    API_BASE: endereço do backend (Java Spring Boot rodando em localhost:8080).
    const: declara uma constante (não pode ser reatribuída).
    Recomendação: em produção, trocar para a URL do servidor real.
*/
const API_BASE = 'http://localhost:8080';

/*
    DOMContentLoaded: evento disparado quando o HTML terminou de carregar.
    Só então podemos manipular os elementos da página com getElementById.
*/
document.addEventListener('DOMContentLoaded', () => {
    /*
        Se já existe um userId no localStorage, o usuário já está logado.
        Neste caso, redirecionamos direto para index.html.
    */
    if (localStorage.getItem('newlook_userId')) {
        window.location.href = 'index.html';
        return; // return vazio encerra a função
    }
    /*
        Toggle de visibilidade da senha.
        querySelector: busca o primeiro elemento que match o seletor CSS.
        addEventListener: registra uma função para executar no clique.
    */
    const toggleBtn = document.getElementById('toggle-password');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const input = document.getElementById('password');
            /*
                Operador ternário: condição ? valorSeVerdadeiro : valorSeFalso.
                É uma forma compacta de if/else.
            */
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            /*
                Template literal (crases): permite interpolar variáveis com ${}.
                innerHTML: substitui o conteúdo HTML interno do elemento.
            */
            toggleBtn.innerHTML = `<span class="material-symbols-outlined text-[20px]">${isPassword ? 'visibility_off' : 'visibility'}</span>`;
        });
    }
    // Registra o submit do formulário
    document.getElementById('login-form').addEventListener('submit', handleLogin);
});

/*
    async: função assíncrona (retorna uma Promise).
    await: pausa a execução até a Promise ser resolvida (útil para fetch).
    event.preventDefault(): impede o comportamento padrão (recarregar a página).
*/
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('password').value;
    // Validação: se algum campo vazio, exibe erro e para
    if (!email || !senha) { showError('Preencha todos os campos.'); return; }

    const button = document.getElementById('login-btn');
    button.disabled = true; // Desabilita o botão para evitar múltiplos envios
    /*
        innerHTML com HTML: insere um spinner (ícone animado) + texto.
        animate-spin: classe do Tailwind que gira o elemento infinitamente.
    */
    button.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Entrando...';

    try {
        /*
            FormData: objeto usado para enviar dados como formulário HTML
            (multipart/form-data), que é o que o backend espera.
            append: adiciona um campo ao formulário.
        */
        const formData = new FormData();
        formData.append('email', email);
        formData.append('senha', senha);
        /*
            fetch: faz uma requisição HTTP.
            Primeiro parâmetro: URL do endpoint.
            Segundo parâmetro: objeto de configuração (method, body, etc.).
        */
        const response = await fetch(`${API_BASE}/post/user/auth`, { method: 'POST', body: formData });

        if (!response.ok) throw new Error(); // Se status não for 2xx, lança erro

        /*
            response.text(): extrai o corpo da resposta como texto.
            await: aguarda a leitura completa.
            .trim(): remove espaços extras no início/fim.
        */
        const userId = (await response.text()).trim();
        if (!userId || userId === '0') {
            showError('E-mail ou senha incorretos.');
            button.disabled = false;
            button.textContent = 'Entrar';
            return;
        }

        // Salva dados no localStorage
        localStorage.setItem('newlook_userId', userId);
        localStorage.setItem('newlook_senha', senha); // Necessário para salvar settings depois

        /*
            Segundo fetch: busca dados completos do usuário recém-logado.
            try/catch aninhado: se falhar, não impede o login.
        */
        try {
            const userRes = await fetch(`${API_BASE}/get/user?id=${userId}`);
            if (userRes.ok) {
                const dados = await userRes.json(); // Converte resposta para objeto JS
                // Salva só se existir (evita sobrescrever com undefined)
                if (dados.nome) localStorage.setItem('newlook_nome', dados.nome);
                if (dados.genero) localStorage.setItem('newlook_genero', dados.genero);
                if (dados.email) localStorage.setItem('newlook_email', dados.email);
            }
        } catch (_) {} // catch vazio: ignora erros silenciosamente

        window.location.href = 'index.html';
    } catch (_) {
        showError('Erro ao conectar com o servidor. Tente novamente.');
        button.disabled = false;
        button.textContent = 'Entrar';
    }
}

/*
    showError: exibe uma mensagem de erro dinamicamente no formulário.
    Se o elemento <p> com id "login-error" não existir, cria um novo.
    appendChild: adiciona o elemento como último filho do formulário.
*/
function showError(msg) {
    let el = document.getElementById('login-error');
    if (!el) {
        el = document.createElement('p');  // Cria um elemento <p>
        el.id = 'login-error';
        el.className = 'text-error font-body-sm text-center mt-2';
        document.getElementById('login-form').appendChild(el);
    }
    el.textContent = msg; // textContent: define apenas o texto (seguro contra XSS)
}
