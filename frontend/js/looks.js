/* ============================================
   NewLook - Meus Looks
   ============================================ */

const API_BASE = 'http://localhost:8080';
let lookAtivo = null;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    carregarLooks();
});

// ─── Auth ─────────────────────────────────────────────────────────
function checkAuth() {
    if (!localStorage.getItem('newlook_userId')) {
        window.location.href = 'login.html';
    }
}

// ─── Carrega looks do usuário ─────────────────────────────────────
async function carregarLooks() {
    const userId = localStorage.getItem('newlook_userId');

    try {
        const response = await fetch(`${API_BASE}/get/looks?idUsuario=${userId}`);
        if (!response.ok) throw new Error(`Erro ${response.status}`);

        const looks = await response.json();

        document.getElementById('looks-loading').classList.add('hidden');

        if (!looks || looks.length === 0) {
            document.getElementById('looks-empty').classList.remove('hidden');
            return;
        }

        renderLooks(looks);

    } catch (error) {
        document.getElementById('looks-loading').classList.add('hidden');
        document.getElementById('looks-empty').classList.remove('hidden');
        console.error('Erro ao carregar looks:', error);
    }
}

// ─── Renderiza grid de cards ──────────────────────────────────────
function renderLooks(looks) {
    const grid = document.getElementById('looks-grid');
    grid.classList.remove('hidden');
    grid.innerHTML = '';

    looks.forEach(look => {
        const card = document.createElement('div');
        card.className = 'look-card bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col gap-4 cursor-pointer hover:border-primary hover:shadow-sm transition-all duration-200';
        card.onclick = () => abrirModal(look.id);

        card.innerHTML = `
            <div class="flex items-start justify-between gap-2">
                <h3 class="font-headline-lg text-on-surface leading-tight">${look.nome}</h3>
                <span class="material-symbols-outlined text-primary flex-shrink-0">chevron_right</span>
            </div>

            <div class="flex flex-wrap gap-2">
                <span class="px-3 py-1 bg-surface-container rounded-full font-label-md text-on-surface-variant text-sm">
                    ${look.estilo}
                </span>
                <span class="px-3 py-1 bg-surface-container rounded-full font-label-md text-on-surface-variant text-sm">
                    ${look.ocasiao}
                </span>
                ${look.estacao_ano ? `<span class="px-3 py-1 bg-surface-container rounded-full font-label-md text-on-surface-variant text-sm">${look.estacao_ano}</span>` : ''}
            </div>

            ${look.faixa_preco ? `
            <div class="flex items-center gap-2 text-on-surface-variant">
                <span class="material-symbols-outlined text-base">payments</span>
                <span class="font-body-sm">R$ ${look.faixa_preco}</span>
            </div>` : ''}

            <div class="flex items-center gap-2 text-primary mt-auto pt-2 border-t border-outline-variant">
                <span class="material-symbols-outlined text-base">style</span>
                <span class="font-label-md">Ver peças do look</span>
            </div>
        `;

        grid.appendChild(card);
    });
}

// ─── Modal de detalhes ────────────────────────────────────────────
async function abrirModal(idLook) {
    lookAtivo = idLook;

    try {
        const response = await fetch(`${API_BASE}/get/look?idLook=${idLook}`);
        if (!response.ok) throw new Error(`Erro ${response.status}`);

        const look = await response.json();

        // Preenche o modal
        document.getElementById('modal-nome').textContent    = look.nome;
        document.getElementById('modal-estilo').textContent  = look.estilo   || '—';
        document.getElementById('modal-ocasiao').textContent = look.ocasiao  || '—';
        document.getElementById('modal-estacao').textContent = look.estacao_ano || '—';
        document.getElementById('modal-preco').textContent   = look.faixa_preco
            ? `R$ ${look.faixa_preco}`
            : '—';
        const resultImageWrapper = document.getElementById('result-image-wrapper');
        const resultImage = document.getElementById('result-image');
        if (look.imagem) {
            resultImage.src = `data:image/jpeg;base64,${look.imagem}`;
            resultImageWrapper.classList.remove('hidden');
        } else {
            resultImageWrapper.classList.add('hidden');
        }
        
        // Renderiza as roupas
        const roupasEl = document.getElementById('modal-roupas');
        roupasEl.innerHTML = '';

        let total = 0;

        if (look.roupas && look.roupas.length > 0) {
            look.roupas.forEach(roupa => {
                total += roupa.preco || 0;

                const item = document.createElement('div');
                item.className = 'bg-surface-container-lowest border border-outline-variant rounded-lg p-4 space-y-2';
                item.innerHTML = `
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-primary text-base">checkroom</span>
                            <span class="font-headline-lg text-on-surface">${roupa.peca}</span>
                        </div>
                        ${roupa.preco ? `<span class="font-label-md text-primary">R$ ${Number(roupa.preco).toFixed(2)}</span>` : ''}
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <span class="px-2 py-1 bg-surface-container rounded font-label-md text-on-surface-variant text-xs">${roupa.cor}</span>
                        <span class="px-2 py-1 bg-surface-container rounded font-label-md text-on-surface-variant text-xs">${roupa.modelo}</span>
                        ${roupa.marca && roupa.marca !== 'Opcional' ? `<span class="px-2 py-1 bg-surface-container rounded font-label-md text-on-surface-variant text-xs">${roupa.marca}</span>` : ''}
                    </div>
                    ${roupa.justificativa_tecnica ? `<p class="font-body-sm text-on-surface-variant italic">${roupa.justificativa_tecnica}</p>` : ''}
                `;
                roupasEl.appendChild(item);
            });
        } else {
            roupasEl.innerHTML = '<p class="font-body-sm text-on-surface-variant">Nenhuma peça encontrada.</p>';
        }

        document.getElementById('modal-total').textContent =
            total > 0 ? `R$ ${total.toFixed(2)}` : '—';

        // Abre o modal
        document.getElementById('look-modal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error('Erro ao abrir look:', error);
    }
}

// ─── Fecha modal ──────────────────────────────────────────────────
function fecharModal(event) {
    if (event && event.target !== document.getElementById('look-modal')) return;
    document.getElementById('look-modal').classList.add('hidden');
    document.body.style.overflow = '';
    lookAtivo = null;
}

// Fecha com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.getElementById('look-modal').classList.add('hidden');
        document.body.style.overflow = '';
        lookAtivo = null;
    }
});

// ─── Excluir look ─────────────────────────────────────────────────
async function confirmarExcluirLook() {
    if (!lookAtivo) return;

    const confirmacao = confirm('Tem certeza que deseja excluir este look? Esta ação não pode ser desfeita.');
    if (!confirmacao) return;

    try {
        const formData = new FormData();
        formData.append('id', lookAtivo);

        const response = await fetch(`${API_BASE}/post/look/deletar`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error(`Erro ${response.status}`);

        // Fecha modal e recarrega a lista
        document.getElementById('look-modal').classList.add('hidden');
        document.body.style.overflow = '';
        lookAtivo = null;

        carregarLooks();

    } catch (error) {
        alert('Erro ao excluir look. Tente novamente.');
    }
}