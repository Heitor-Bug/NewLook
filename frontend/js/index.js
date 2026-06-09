/*
    API_BASE: URL base do backend.
    let: declara variável que pode ser reatribuída (diferente de const).
    Set: coleção que armazena valores únicos (sem duplicatas).
*/
const API_BASE = 'http://localhost:8080';

let selectedFile = null;       // Arquivo de foto selecionado pelo usuário
const selectedColors = new Set(); // Cores selecionadas (ex: "preto", "branco")

/*
    Init: configura tudo quando a página carrega.
    Se o usuário não estiver logado, redireciona para login.html.
*/
document.addEventListener('DOMContentLoaded', () => {
    initPhotoUpload();
    initChips();
    initColorPicker();
    initOutroSelects();
    if (!localStorage.getItem('newlook_userId')) window.location.href = 'login.html';
});

/*
    initPhotoUpload: configura o upload de foto (clique, drag & drop, preview).
    getElementById: busca um elemento pelo atributo id (deve ser único na página).
*/
function initPhotoUpload() {
    const input = document.getElementById('photo-input');
    const preview = document.getElementById('photo-preview');
    const uploadLabel = document.getElementById('upload-label');
    const uploadIcon = document.getElementById('upload-icon');

    /*
        addEventListener('change', ...): dispara quando o valor do input muda
        (usuário selecionou um arquivo).
        Parâmetro 'e' (event): objeto com informações sobre o evento.
        e.target: elemento que disparou o evento (o input).
        e.target.files: array de arquivos selecionados.
    */
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        // file.size: tamanho em bytes. 10 * 1024 * 1024 = 10MB.
        if (file.size > 10 * 1024 * 1024) { alert('A foto deve ter no máximo 10MB.'); return; }

        selectedFile = file;
        /*
            FileReader: API do navegador para ler arquivos localmente.
            readAsDataURL: converte o arquivo para uma URL base64 (pode ser usada em src de img).
            reader.onload: callback executado quando a leitura termina.
        */
        const reader = new FileReader();
        reader.onload = (ev) => {
            preview.src = ev.target.result; // ev.target.result contém a URL base64
            preview.classList.remove('hidden');
            uploadLabel.textContent = file.name;
            uploadIcon.textContent = 'check_circle';
            uploadIcon.classList.add('text-primary');
        };
        reader.readAsDataURL(file);
    });

    /*
        Drag & Drop: eventos de arrastar e soltar.
        preventDefault(): necessário para permitir o drop (navegador bloqueia por padrão).
    */
    const uploadArea = document.getElementById('upload-area');
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('border-primary'); });
    uploadArea.addEventListener('dragleave', () => { uploadArea.classList.remove('border-primary'); });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-primary');
        const file = e.dataTransfer.files[0]; // Arquivo solto
        /*
            file.type: tipo MIME do arquivo (ex: "image/jpeg").
            dispatchEvent: dispara um evento programaticamente (simula a seleção).
        */
        if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
            input.files = e.dataTransfer.files;
            input.dispatchEvent(new Event('change')); // Reusa a lógica do change
        }
    });
}

/*
    initChips: botões de toggle para estação e orçamento.
    dataset: acessa atributos data-* do HTML (ex: data-group vira dataset.group).
    classList: API para manipular classes CSS (add, remove, contains, toggle).
*/
function initChips() {
    document.querySelectorAll('[data-group]').forEach(btn => {
        btn.addEventListener('click', () => {
            const group = btn.dataset.group;
            /*
                contains: verifica se a classe existe no elemento.
            */
            const isActive = btn.classList.contains('chip-active');

            if (isActive) {
                btn.classList.remove('chip-active');
                document.getElementById(group === 'estacao' ? 'estacao-value' : 'orcamento-value').value = '';
            } else {
                /*
                    querySelectorAll: seleciona TODOS os botões do mesmo grupo.
                    forEach: itera sobre cada um e remove a classe ativa.
                */
                document.querySelectorAll(`[data-group="${group}"]`).forEach(b => b.classList.remove('chip-active'));
                btn.classList.add('chip-active');
                document.getElementById(group === 'estacao' ? 'estacao-value' : 'orcamento-value').value = btn.dataset.value;
            }

            /*
                Orçamento "Outro": mostra/esconde o campo de texto.
                toggle: adiciona se não tem, remove se tem.
                A condição !(valor == 'outro' && ativo) decide se deve esconder.
            */
            if (group === 'orcamento') {
                const outroInput = document.getElementById('orcamento-outro');
                if (outroInput) outroInput.classList.toggle('hidden', !(btn.dataset.value === 'outro' && btn.classList.contains('chip-active')));
            }
        });
    });
}

/*
    initColorPicker: seleção de cores (bolinhas circulares).
    style.boxShadow: sombra externa (simula uma borda destacada).
    [...selectedColors]: spread operator, converte Set em array.
*/
function initColorPicker() {
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.dataset.color;
            /*
                has(): verifica se o Set contém o valor.
                delete(): remove do Set.
                add(): adiciona ao Set.
            */
            if (selectedColors.has(color)) {
                selectedColors.delete(color);
                btn.style.boxShadow = ''; // Remove destaque
            } else {
                selectedColors.add(color);
                btn.style.boxShadow = '0 0 0 2px #fff, 0 0 0 4px #1b1c1c'; // Destaca
            }
            /*
                join(', '): une os elementos do array em uma string separada por vírgula.
            */
            document.getElementById('cores-value').value = [...selectedColors].join(', ');
        });
    });

    // Botão "Outro" para cores
    const outroBtn = document.querySelector('.color-btn-outro');
    const outroInput = document.getElementById('cores-outro');
    if (outroBtn && outroInput) {
        outroBtn.addEventListener('click', () => {
            const isActive = outroBtn.classList.contains('chip-active');
            if (isActive) {
                outroBtn.classList.remove('chip-active');
                selectedColors.delete('outro');
                outroInput.classList.add('hidden');
            } else {
                outroBtn.classList.add('chip-active');
                selectedColors.add('outro');
                outroInput.classList.remove('hidden');
            }
            document.getElementById('cores-value').value = [...selectedColors].join(', ');
        });
    }
}

/*
    initOutroSelects: para cada select (estilo/ocasião), se escolher "Outro",
    mostra um campo de texto para digitar manualmente.
    toggle('hidden', condição): se condição for verdadeira, adiciona 'hidden'.
*/
function initOutroSelects() {
    ['estilo', 'ocasiao'].forEach(id => {
        const select = document.getElementById(id);
        const input = document.getElementById(`${id}-outro`);
        if (select && input) {
            select.addEventListener('change', () => input.classList.toggle('hidden', select.value !== 'outro'));
        }
    });
}

/*
    handleSubmit: envia o formulário para o backend.
    FormData: coleta todos os campos do formulário para enviar.
    showStage('loading'): troca a tela do formulário para o spinner.
*/
async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedFile) { alert('Por favor, envie uma foto antes de continuar.'); return; }

    const userId = localStorage.getItem('newlook_userId');
    if (!userId) { window.location.href = 'login.html'; return; }

    const genero = localStorage.getItem('newlook_genero') || 'Não informado';
    const estiloEl = document.getElementById('estilo');
    const estilo = estiloEl.value === 'outro' ? document.getElementById('estilo-outro').value : estiloEl.value;
    const ocasiaoEl = document.getElementById('ocasiao');
    const ocasiao = ocasiaoEl.value === 'outro' ? document.getElementById('ocasiao-outro').value : ocasiaoEl.value;
    const estacao = document.getElementById('estacao-value').value || 'Sem preferência';
    const orcamentoVal = document.getElementById('orcamento-value').value;
    const orcamento = orcamentoVal === 'outro' ? document.getElementById('orcamento-outro').value : orcamentoVal;
    const cores = selectedColors.has('outro') ? document.getElementById('cores-outro').value : (document.getElementById('cores-value').value || 'Sem preferência');
    const observacoes = document.getElementById('observacoes').value || '';

    const formData = new FormData();
    formData.append('fotoUsuario', selectedFile);          // Arquivo da foto
    formData.append('idUsuario', userId);
    formData.append('genero', genero);
    formData.append('estilo', estilo);
    formData.append('ocasiao', ocasiao);
    formData.append('estacaoAno', estacao);
    formData.append('faixaPreco', orcamento);
    formData.append('coresFavoritas', cores);
    formData.append('preferenciasAdicionais', observacoes);

    showStage('loading');

    try {
        const response = await fetch(`${API_BASE}/post/foto`, { method: 'POST', body: formData });
        if (!response.ok) throw new Error(`Erro ${response.status}: ${response.statusText}`);
        const texto = await response.text();
        /*
            startsWith: verifica se a string começa com "Sucesso:".
            O backend retorna "Sucesso:{idLook}" em caso de sucesso.
        */
        if (texto.startsWith('Sucesso:')) {
            window.location.replace('looks.html');
        } else {
            throw new Error('Resposta inesperada do servidor.');
        }
    } catch (error) {
        alert(`Erro: ${error.message}`); // error.message: mensagem do erro lançado
        showStage('form'); // Volta para o formulário
    }
}

/*
    showStage: controla qual div está visível (form ou loading).
    classList.add('hidden'): esconde.
    classList.remove('hidden'): mostra.
*/
function showStage(stage) {
    document.getElementById('stage-form').classList.add('hidden');
    document.getElementById('stage-loading').classList.add('hidden');
    document.getElementById(`stage-${stage}`).classList.remove('hidden');
}

/*
    resetToForm: limpa todos os campos e volta para o estágio do formulário.
    Útil para recomeçar após um erro ou sucesso.
*/
function resetToForm() {
    selectedFile = null;
    selectedColors.clear();

    document.getElementById('photo-preview').classList.add('hidden');
    document.getElementById('upload-label').textContent = 'Clique para enviar sua foto';
    document.getElementById('upload-icon').textContent = 'person';
    document.getElementById('photo-input').value = '';
    document.getElementById('cores-value').value = '';

    // Esconde e limpa campos "Outro"
    document.getElementById('estilo-outro').classList.add('hidden');
    document.getElementById('estilo-outro').value = '';
    document.getElementById('ocasiao-outro').classList.add('hidden');
    document.getElementById('ocasiao-outro').value = '';
    document.getElementById('orcamento-outro').classList.add('hidden');
    document.getElementById('orcamento-outro').value = '';
    document.getElementById('cores-outro').classList.add('hidden');
    document.getElementById('cores-outro').value = '';

    // Remove destaque das cores
    document.querySelectorAll('.color-btn').forEach(btn => btn.style.boxShadow = '');
    // Remove destaque dos chips
    document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('chip-active'));
    document.getElementById('estacao-value').value = '';
    document.getElementById('orcamento-value').value = '';

    showStage('form');
}
