/**
 * View: ConfigView
 * Padrão: View
 * Gerencia as configurações do sistema
 */
class ConfigView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.controller = null;
    }

    setController(ctrl) {
        this.controller = ctrl;
    }

    render() {
        const config = this.controller.getConfig();

        this.container.innerHTML = `
            <div class="page-header">
                <h2>Configurações</h2>
                <p>Personalize o sistema e os relatórios</p>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">Informações da Rádio</span>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Nome da Rádio</label>
                        <input type="text" class="form-input" id="radioName" value="${config.radioName}" placeholder="Nome da sua rádio">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Slogan</label>
                        <input type="text" class="form-input" id="radioSlogan" value="${config.radioSlogan}" placeholder="Slogan da rádio">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Título do Relatório</label>
                    <input type="text" class="form-input" id="reportTitle" value="${config.reportTitle}" placeholder="Título que aparecerá nos relatórios">
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">Logomarca</span>
                </div>
                <div class="form-group">
                    <div class="upload-area" id="logoUploadArea">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Clique para fazer upload da logo</p>
                        <p style="font-size: 12px; margin-top: 4px;">PNG, JPG (máx. 2MB)</p>
                        <input type="file" id="logoInput" accept="image/*" style="display: none;">
                        ${config.logo ? `<img src="${config.logo}" class="upload-preview" id="logoPreview">` : ''}
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">Cores do Relatório</span>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <div class="color-picker-group">
                            <label>Fundo do Cabeçalho</label>
                            <input type="color" id="colorHeaderBg" value="${config.colors.headerBg}">
                        </div>
                        <div class="color-picker-group">
                            <label>Texto do Cabeçalho</label>
                            <input type="color" id="colorHeaderText" value="${config.colors.headerText}">
                        </div>
                        <div class="color-picker-group">
                            <label>Cor de Destaque</label>
                            <input type="color" id="colorAccent" value="${config.colors.accent}">
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="color-picker-group">
                            <label>Fundo do Dia</label>
                            <input type="color" id="colorDayHeaderBg" value="${config.colors.dayHeaderBg}">
                        </div>
                        <div class="color-picker-group">
                            <label>Texto do Dia</label>
                            <input type="color" id="colorDayHeaderText" value="${config.colors.dayHeaderText}">
                        </div>
                        <div class="color-picker-group">
                            <label>Cor do Horário</label>
                            <input type="color" id="colorTime" value="${config.colors.timeColor}">
                        </div>
                    </div>
                </div>
            </div>

            <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button class="btn btn-outline" id="btnResetConfig">Restaurar Padrão</button>
                <button class="btn btn-primary" id="btnSaveConfig">
                    <i class="fas fa-save"></i> Salvar Configurações
                </button>
            </div>
        `;

        this.attachEvents();
    }

    attachEvents() {
        // Upload de logo
        const uploadArea = this.container.querySelector('#logoUploadArea');
        const logoInput = this.container.querySelector('#logoInput');

        if (uploadArea && logoInput) {
            uploadArea.addEventListener('click', () => logoInput.click());
            logoInput.addEventListener('change', (e) => this.handleLogoUpload(e));
        }

        // Salvar configurações
        const btnSave = this.container.querySelector('#btnSaveConfig');
        if (btnSave) {
            btnSave.addEventListener('click', () => this.saveConfig());
        }

        // Reset
        const btnReset = this.container.querySelector('#btnResetConfig');
        if (btnReset) {
            btnReset.addEventListener('click', () => this.resetConfig());
        }
    }

    handleLogoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            window.App.toast('A imagem deve ter no máximo 2MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const preview = this.container.querySelector('#logoPreview');
            if (preview) {
                preview.src = event.target.result;
            } else {
                const img = document.createElement('img');
                img.src = event.target.result;
                img.className = 'upload-preview';
                img.id = 'logoPreview';
                this.container.querySelector('#logoUploadArea').appendChild(img);
            }
            this.controller.setLogo(event.target.result);
            window.App.toast('Logo atualizada!', 'success');
        };
        reader.readAsDataURL(file);
    }

    saveConfig() {
        const radioName = document.getElementById('radioName').value.trim();
        const radioSlogan = document.getElementById('radioSlogan').value.trim();
        const reportTitle = document.getElementById('reportTitle').value.trim();

        const colors = {
            headerBg: document.getElementById('colorHeaderBg').value,
            headerText: document.getElementById('colorHeaderText').value,
            accent: document.getElementById('colorAccent').value,
            dayHeaderBg: document.getElementById('colorDayHeaderBg').value,
            dayHeaderText: document.getElementById('colorDayHeaderText').value,
            timeColor: document.getElementById('colorTime').value
        };

        this.controller.updateConfig({ radioName, radioSlogan, reportTitle });
        this.controller.updateColors(colors);

        window.App.toast('Configurações salvas com sucesso!', 'success');
    }

    resetConfig() {
        if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
            this.controller.updateConfig(new Config().toJSON());
            this.render();
            window.App.toast('Configurações restauradas!', 'success');
        }
    }
}
