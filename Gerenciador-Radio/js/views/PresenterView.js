/**
 * View: PresenterView
 * Padrão: View
 * Gerencia a interface de apresentadores
 */
class PresenterView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.controller = null;
        this.onEdit = null;
        this.onDelete = null;
    }

    setController(ctrl) {
        this.controller = ctrl;
    }

    render() {
        const presenters = this.controller.getAllPresenters();

        this.container.innerHTML = `
            <div class="page-header">
                <h2>Apresentadores</h2>
                <p>Gerencie os apresentadores da sua rádio</p>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">Lista de Apresentadores</span>
                    <button class="btn btn-primary" id="btnAddPresenter">
                        <i class="fas fa-plus"></i> Novo Apresentador
                    </button>
                </div>

                ${presenters.length === 0 ? this.renderEmptyState() : this.renderTable(presenters)}
            </div>
        `;

        this.attachEvents();
    }

    renderEmptyState() {
        return `
            <div class="empty-state">
                <i class="fas fa-microphone"></i>
                <h3>Nenhum apresentador cadastrado</h3>
                <p>Clique em "Novo Apresentador" para começar</p>
            </div>
        `;
    }

    renderTable(presenters) {
        return `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Telefone</th>
                            <th>Status</th>
                            <th style="text-align: center;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${presenters.map(p => `
                            <tr data-id="${p.id}">
                                <td><strong>${p.name}</strong></td>
                                <td>${p.email || '-'}</td>
                                <td>${p.phone || '-'}</td>
                                <td>
                                    <span class="badge ${p.active ? 'badge-semanal' : 'badge-excepcional'}">
                                        ${p.active ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td style="text-align: center;">
                                    <button class="btn btn-sm btn-outline btn-edit" data-id="${p.id}">
                                        <i class="fas fa-pen"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline btn-delete" data-id="${p.id}" style="margin-left: 4px; color: #c62828; border-color: #ffcdd2;">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    attachEvents() {
        const btnAdd = this.container.querySelector('#btnAddPresenter');
        if (btnAdd) {
            btnAdd.addEventListener('click', () => this.openModal());
        }

        this.container.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                if (this.onEdit) this.onEdit(id);
            });
        });

        this.container.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                if (this.onDelete) this.onDelete(id);
            });
        });
    }

    openModal(presenter = null) {
        const isEdit = !!presenter;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'presenterModal';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${isEdit ? 'Editar Apresentador' : 'Novo Apresentador'}</h3>
                    <button class="modal-close" id="closeModal"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <form id="presenterForm">
                        <input type="hidden" id="presenterId" value="${presenter ? presenter.id : ''}">

                        <div class="form-group">
                            <label class="form-label">Nome Completo</label>
                            <input type="text" class="form-input" id="presenterName" value="${presenter ? presenter.name : ''}" placeholder="Ex: João Silva" required>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-input" id="presenterEmail" value="${presenter ? presenter.email : ''}" placeholder="email@exemplo.com">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Telefone</label>
                                <input type="tel" class="form-input" id="presenterPhone" value="${presenter ? presenter.phone : ''}" placeholder="(00) 00000-0000">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Biografia (opcional)</label>
                            <textarea class="form-textarea" id="presenterBio" placeholder="Conte um pouco sobre o apresentador...">${presenter ? presenter.bio : ''}</textarea>
                        </div>

                        <div class="form-group">
                            <label class="checkbox-item ${presenter && presenter.active ? 'checked' : ''}" style="display: inline-flex;">
                                <input type="checkbox" id="presenterActive" ${presenter && presenter.active ? 'checked' : ''}>
                                <span>Apresentador ativo</span>
                            </label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="cancelModal">Cancelar</button>
                    <button class="btn btn-primary" id="savePresenter">
                        <i class="fas fa-save"></i> ${isEdit ? 'Atualizar' : 'Salvar'}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('#closeModal').addEventListener('click', () => this.closeModal());
        modal.querySelector('#cancelModal').addEventListener('click', () => this.closeModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        modal.querySelector('#presenterActive').addEventListener('change', (e) => {
            e.target.closest('.checkbox-item').classList.toggle('checked', e.target.checked);
        });

        modal.querySelector('#savePresenter').addEventListener('click', () => this.handleSave());
    }

    closeModal() {
        const modal = document.getElementById('presenterModal');
        if (modal) modal.remove();
    }

    handleSave() {
        const id = document.getElementById('presenterId').value;
        const name = document.getElementById('presenterName').value.trim();
        const email = document.getElementById('presenterEmail').value.trim();
        const phone = document.getElementById('presenterPhone').value.trim();
        const bio = document.getElementById('presenterBio').value.trim();
        const active = document.getElementById('presenterActive').checked;

        const data = { name, email, phone, bio, active };

        let result;
        if (id) {
            result = this.controller.updatePresenter(id, data);
        } else {
            result = this.controller.createPresenter(data);
        }

        if (result.success) {
            this.closeModal();
            this.render();
            window.App.toast('Apresentador salvo com sucesso!', 'success');
        } else {
            window.App.toast(result.errors.join(', '), 'error');
        }
    }
}
