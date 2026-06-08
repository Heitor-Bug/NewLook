const API_BASE = 'http://localhost:8080';

// ─── Estado global ────────────────────────────────────────────────
let selectedFile = null;
const selectedColors = new Set();

// ─── Init ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initPhotoUpload();
    initChips();
    initColorPicker();
    checkAuth();
});

// ─── Auth ─────────────────────────────────────────────────────────
function checkAuth() {
    const userId = localStorage.getItem('newlook_userId');
    if (!userId) {
        // Se não estiver logado, redireciona para login
        window.location.href = 'login.html';
        return;
    }
    updateAuthUI(true);
}

// ─── Upload de foto ───────────────────────────────────────────────
function initPhotoUpload() {
    const input = document.getElementById('photo-input');
    const preview = document.getElementById('photo-preview');
    const uploadLabel = document.getElementById('upload-label');
    const uploadIcon = document.getElementById('upload-icon');

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Valida tamanho (10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('A foto deve ter no máximo 10MB.');
            return;
        }

        selectedFile = file;

        // Mostra preview
        const reader = new FileReader();
        reader.onload = (ev) => {
            preview.src = ev.target.result;
            preview.classList.remove('hidden');
            uploadLabel.textContent = file.name;
            uploadIcon.textContent = 'check_circle';
            uploadIcon.classList.add('text-primary');
        };
        reader.readAsDataURL(file);
    });

    // Drag and drop
    const uploadArea = document.getElementById('upload-area');
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('border-primary');
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('border-primary');
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-primary');
        const file = e.dataTransfer.files[0];
        if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
            input.files = e.dataTransfer.files;
            input.dispatchEvent(new Event('change'));
        }
    });
}

// ─── Chips (estação e orçamento) ──────────────────────────────────
function initChips() {
    document.querySelectorAll('[data-group]').forEach(btn => {
        btn.addEventListener('click', () => {
            const group = btn.dataset.group;

            // Remove active de todos do grupo
            document.querySelectorAll(`[data-group="${group}"]`).forEach(b => {
                b.classList.remove('chip-active');
            });

            // Ativa o clicado
            btn.classList.add('chip-active');

            // Atualiza o input hidden
            const inputId = group === 'estacao' ? 'estacao-value' : 'orcamento-value';
            document.getElementById(inputId).value = btn.dataset.value;
        });
    });
}

// ─── Seletor de cores ─────────────────────────────────────────────
function initColorPicker() {
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.dataset.color;

            if (selectedColors.has(color)) {
                selectedColors.delete(color);
                btn.style.outline = '';
                btn.style.outlineOffset = '';
            } else {
                selectedColors.add(color);
                btn.style.outline = '3px solid var(--color-primary)';
                btn.style.outlineOffset = '3px';
            }

            document.getElementById('cores-value').value = [...selectedColors].join(', ');
        });
    });
}

// ─── Submit ───────────────────────────────────────────────────────
async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedFile) {
        alert('Por favor, envie uma foto antes de continuar.');
        return;
    }

    const userId = localStorage.getItem('newlook_userId');
    if (!userId) {
        window.location.href = 'login.html';
        return;
    }

    // Pega os valores do formulário
    const genero = localStorage.getItem('newlook_genero') || 'Não informado';
    const estilo = document.getElementById('estilo').value;
    const ocasiao = document.getElementById('ocasiao').value;
    const estacao = document.getElementById('estacao-value').value;
    const orcamento = document.getElementById('orcamento-value').value;
    const cores = document.getElementById('cores-value').value || 'Sem preferência';
    const observacoes = document.getElementById('observacoes').value || '';

    // Monta o FormData
    const formData = new FormData();
    formData.append('fotoUsuario', selectedFile);
    formData.append('idUsuario', userId);
    formData.append('genero', genero);
    formData.append('estilo', estilo);
    formData.append('ocasiao', ocasiao);
    formData.append('estacaoAno', estacao);
    formData.append('faixaPreco', orcamento);
    formData.append('coresFavoritas', cores);
    formData.append('preferenciasAdicionais', observacoes);

    // Mostra loading
    showStage('loading');
    animateLoadingSteps();

    try {
        const response = await fetch(`${API_BASE}/post/foto`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const texto = await response.text();

        // Backend retorna "Sucesso:{idLook}"
        if (texto.startsWith('Sucesso:')) {
            const idLook = texto.split(':')[1];
            await mostrarResultado(idLook);
        } else {
            throw new Error('Resposta inesperada do servidor.');
        }

    } catch (error) {
        showStage('results');
        document.getElementById('results-error').classList.remove('hidden');
        document.getElementById('results-error').textContent = `Erro: ${error.message}`;
    }
}

// ─── Busca e exibe resultado ──────────────────────────────────────
async function mostrarResultado(idLook) {
    try {
        const response = await fetch(`${API_BASE}/get/look?idLook=${idLook}`);
        const look = await response.json();

        showStage('results');

        // Atualiza meta
        document.getElementById('results-meta').textContent =
            `${look.nome} · criado pela IA com base no seu perfil`;

        // Monta descrição das peças
        let descricao = '';
        if (look.roupas && look.roupas.length > 0) {
            descricao = look.roupas.map(r =>
                `• ${r.peca}: ${r.cor}, ${r.modelo}${r.marca !== 'Opcional' ? ` (${r.marca})` : ''} — R$ ${Number(r.preco).toFixed(2)}\n  ${r.justificativa_tecnica}`
            ).join('\n\n');
        }

        document.getElementById('result-description').textContent = descricao;
        document.getElementById('result-text-wrapper').classList.remove('hidden');

        // Atualiza stepper
        updateStepper(3);

    } catch (error) {
        document.getElementById('results-error').classList.remove('hidden');
        document.getElementById('results-error').textContent = `Erro ao carregar resultado: ${error.message}`;
    }
}

// ─── Animação do loading ──────────────────────────────────────────
function animateLoadingSteps() {
    const steps = document.querySelectorAll('.loading-step');
    const titles = [
        { title: 'Analisando sua foto…', sub: 'Nossa IA está identificando seu perfil de estilo.' },
        { title: 'Criando seu look…', sub: 'Montando combinações personalizadas para você.' },
        { title: 'Finalizando…', sub: 'Quase pronto! Gerando a visualização do look.' }
    ];

    let current = 0;

    function activateStep(index) {
        if (index >= steps.length) return;

        const step = steps[index];
        const dot = step.querySelector('.step-dot');
        const bar = step.querySelector('.step-bar');

        dot.classList.remove('bg-outline-variant');
        dot.classList.add('bg-primary');
        bar.style.width = '100%';

        document.getElementById('loading-title').textContent = titles[index].title;
        document.getElementById('loading-subtitle').textContent = titles[index].sub;
    }

    // Ativa primeiro passo imediatamente
    activateStep(0);

    // Ativa os outros com delay
    const interval = setInterval(() => {
        current++;
        if (current >= steps.length) {
            clearInterval(interval);
            return;
        }
        activateStep(current);
    }, 4000);
}

// ─── Controle de stages ───────────────────────────────────────────
function showStage(stage) {
    document.getElementById('stage-form').classList.add('hidden');
    document.getElementById('stage-loading').classList.add('hidden');
    document.getElementById('stage-results').classList.add('hidden');

    document.getElementById(`stage-${stage}`).classList.remove('hidden');
    updateStepper(stage === 'form' ? 1 : stage === 'loading' ? 2 : 3);
}

function updateStepper(activeStep) {
    for (let i = 1; i <= 3; i++) {
        const indicator = document.getElementById(`step-${i}-indicator`);
        const circle = indicator.querySelector('div');
        const label = indicator.querySelector('span');

        if (i <= activeStep) {
            circle.classList.remove('bg-surface-container', 'text-on-surface-variant');
            circle.classList.add('bg-primary', 'text-on-primary');
            label.classList.remove('text-on-surface-variant');
            label.classList.add('text-primary');
        } else {
            circle.classList.add('bg-surface-container', 'text-on-surface-variant');
            circle.classList.remove('bg-primary', 'text-on-primary');
            label.classList.add('text-on-surface-variant');
            label.classList.remove('text-primary');
        }
    }
}

// ─── Reset ────────────────────────────────────────────────────────
function resetToForm() {
    selectedFile = null;
    selectedColors.clear();

    document.getElementById('photo-preview').classList.add('hidden');
    document.getElementById('upload-label').textContent = 'Clique para enviar sua foto';
    document.getElementById('upload-icon').textContent = 'person';
    document.getElementById('photo-input').value = '';
    document.getElementById('cores-value').value = '';
    document.getElementById('results-error').classList.add('hidden');
    document.getElementById('result-text-wrapper').classList.add('hidden');
    document.getElementById('result-image-wrapper').classList.add('hidden');

    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.style.outline = '';
        btn.style.outlineOffset = '';
    });

    showStage('form');
}

// ─── Feedback ─────────────────────────────────────────────────────
function sendFeedback(tipo) {
    // Por enquanto só visual — pode conectar a um endpoint futuramente
    alert(tipo === 'positivo' ? '😊 Ótimo! Ficamos felizes que gostou!' : '📝 Obrigado! Vamos melhorar.');
}