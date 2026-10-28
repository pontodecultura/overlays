/**
 * View: ProgramView
 * Padrão: View + Command
 * Gerencia a interface de programas
 */
class ProgramView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.controller = null;
        this.presenterController = null;
        this.onEdit = null;
        this.onDelete = null;
    }

    setControllers(ctrl, presenterCtrl) {
        this.controller = ctrl;
        this.presenterController = presenterCtrl;
    }

    render() {
        const programs = this.controller.getAllPrograms();
        const presenters = this.presenterController.getAllPresenters();

        this.container.innerHTML = `
            <div class="page-header">
                <h2>Programas</h2>
                <p>Gerencie os programas da sua rádio</p>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">Lista de Programas</span>
                    <button class="btn btn-primary" id="btnAddProgram">
                        <i class="fas fa-plus"></i> Novo Programa
                    </button>
                </div>

                ${programs.length === 0 ? this.renderEmptyState() : this.renderTable(programs, presenters)}
            </div>
        `;

        this.attachEvents();
    }

    renderEmptyState() {
        return `
            <div class="empty-state">
                <i class="fas fa-radio"></i>
                <h3>Nenhum programa cadastrado</h3>
                <p>Clique em "Novo Programa" para começar</p>
            </div>
        `;
    }

    renderTable(programs, presenters) {
        const presenterMap = {};
        presenters.forEach(p => presenterMap[p.id] = p.name);

        const formatBadgeClass = {
            'Semanal': 'badge-semanal',
            'Mensal': 'badge-mensal',
            'Trimestral': 'badge-trimestral',
            'Quinzenal': 'badge-quinzenal',
            'Excepcional': 'badge-excepcional'
        };

        const dayLabels = {
            segunda: 'Seg', terca: 'Ter', quarta: 'Qua',
            quinta: 'Qui', sexta: 'Sex', sabado: 'Sáb', domingo: 'Dom'
        };

        return `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Programa</th>
                            <th>Apresentador</th>
                            <th>Formato</th>
                            <th>Horário</th>
                            <th>Dias</th>
                            <th style="text-align: center;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${programs.map(prog => `
                            <tr data-id="${prog.id}">
                                <td><strong>${prog.name}</strong></td>
                                <td>${presenterMap[prog.presenterId] || 'N/A'}</td>
                                <td><span class="badge ${formatBadgeClass[prog.format] || 'badge-semanal'}">${prog.format}</span></td>
                                <td><strong style="color: var(--azul-marinho);">${prog.time}</strong></td>
                                <td>${prog.days.map(d => dayLabels[d] || d).join(', ')}</td>
                                <td style="text-align: center;">
                                    <button class="btn btn-sm btn-outline btn-edit" data-id="${prog.id}">
                                        <i class="fas fa-pen"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline btn-delete" data-id="${prog.id}" style="margin-left: 4px; color: #c62828; border-color: #ffcdd2;">
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
        const btnAdd = this.container.querySelector('#btnAddProgram');
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

    openModal(program = null) {
        const isEdit = !!program;
        const presenters = this.presenterController.getActivePresenters();
        const days = Program.getDaysOfWeek();
        const formats = Program.getFormats();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'programModal';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${isEdit ? 'Editar Programa' : 'Novo Programa'}</h3>
                    <button class="modal-close" id="closeModal"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <form id="programForm">
                        <input type="hidden" id="programId" value="${program ? program.id : ''}">

                        <div class="form-group">
                            <label class="form-label">Nome do Programa</label>
                            <input type="text" class="form-input" id="programName" value="${program ? program.name : ''}" placeholder="Ex: Manhã Animada" required>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Apresentador</label>
                                <select class="form-select" id="programPresenter" required>
                                    <option value="">Selecione...</option>
                                    ${presenters.map(p => `
                                        <option value="${p.id}" ${program && program.presenterId === p.id ? 'selected' : ''}>${p.name}</option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Formato</label>
                                <select class="form-select" id="programFormat" required>
                                    ${formats.map(f => `
                                        <option value="${f}" ${program && program.format === f ? 'selected' : ''}>${f}</option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Horário</label>
                            <input type="time" class="form-input" id="programTime" value="${program ? program.time : ''}" required>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Dias da Semana</label>
                            <div class="checkbox-group">
                                ${days.map(d => `
                                    <label class="checkbox-item ${program && program.days.includes(d.value) ? 'checked' : ''}">
                                        <input type="checkbox" name="programDays" value="${d.value}" ${program && program.days.includes(d.value) ? 'checked' : ''}>
                                        <span>${d.label}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Descrição (opcional)</label>
                            <textarea class="form-textarea" id="programDescription" placeholder="Descrição do programa...">${program ? program.description : ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="cancelModal">Cancelar</button>
                    <button class="btn btn-primary" id="saveProgram">
                        <i class="fas fa-save"></i> ${isEdit ? 'Atualizar' : 'Salvar'}
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Eventos do modal
        modal.querySelector('#closeModal').addEventListener('click', () => this.closeModal());
        modal.querySelector('#cancelModal').addEventListener('click', () => this.closeModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        // Checkbox styling
        modal.querySelectorAll('.checkbox-item input').forEach(cb => {
            cb.addEventListener('change', (e) => {
                e.target.closest('.checkbox-item').classList.toggle('checked', e.target.checked);
            });
        });

        // Save
        modal.querySelector('#saveProgram').addEventListener('click', () => this.handleSave());
    }

    closeModal() {
        const modal = document.getElementById('programModal');
        if (modal) modal.remove();
    }

    handleSave() {
        const id = document.getElementById('programId').value;
        const name = document.getElementById('programName').value.trim();
        const presenterId = document.getElementById('programPresenter').value;
        const format = document.getElementById('programFormat').value;
        const time = document.getElementById('programTime').value;
        const description = document.getElementById('programDescription').value.trim();

        const days = Array.from(document.querySelectorAll('input[name="programDays"]:checked'))
            .map(cb => cb.value);

        const data = { name, presenterId, format, time, days, description };

        let result;
        if (id) {
            result = this.controller.updateProgram(id, data);
        } else {
            result = this.controller.createProgram(data);
        }

        if (result.success) {
            this.closeModal();
            this.render();
            window.App.toast('Programa salvo com sucesso!', 'success');
        } else {
            window.App.toast(result.errors.join(', '), 'error');
        }
    }
}
