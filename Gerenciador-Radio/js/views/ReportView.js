/**
 * View: ReportView
 * Padrão: View + Strategy
 * Gerencia a geração e visualização de relatórios
 */
class ReportView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.programController = null;
        this.presenterController = null;
        this.configController = null;
    }

    setControllers(progCtrl, presCtrl, cfgCtrl) {
        this.programController = progCtrl;
        this.presenterController = presCtrl;
        this.configController = cfgCtrl;
    }

    render() {
        const config = this.configController.getConfig();

        this.container.innerHTML = `
            <div class="page-header">
                <h2>Relatórios</h2>
                <p>Gere e visualize relatórios da sua rádio</p>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">Gerar Relatório</span>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Tipo de Relatório</label>
                        <select class="form-select" id="reportType">
                            <option value="full">Grade Completa (Semanal + Formatos)</option>
                            <option value="weekly">Apenas Grade Semanal</option>
                            <option value="byFormat">Agrupado por Formato</option>
                            <option value="presenters">Relatório de Apresentadores</option>
                        </select>
                    </div>
                    <div class="form-group" style="display: flex; align-items: flex-end;">
                        <button class="btn btn-gold" id="btnGeneratePDF" style="width: 100%;">
                            <i class="fas fa-file-pdf"></i> Gerar PDF
                        </button>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">Pré-visualização</span>
                </div>
                <div id="reportPreviewArea">
                    ${this.renderPreview()}
                </div>
            </div>
        `;

        this.attachEvents();
    }

    renderPreview() {
        const programs = this.programController.getAllPrograms();
        const presenters = this.presenterController.getAllPresenters();
        const config = this.configController.getConfig();
        const presenterMap = {};
        presenters.forEach(p => presenterMap[p.id] = p.name);

        const dayLabels = {
            segunda: 'SEGUNDA-FEIRA',
            terca: 'TERÇA-FEIRA',
            quarta: 'QUARTA-FEIRA',
            quinta: 'QUINTA-FEIRA',
            sexta: 'SEXTA-FEIRA',
            sabado: 'SÁBADO',
            domingo: 'DOMINGO'
        };

        const dayOrder = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

        return `
            <div class="report-preview" id="reportPreviewContent">
                <div class="report-header-preview">
                    ${config.logo ? `<img src="${config.logo}" class="report-logo-preview" alt="Logo">` : ''}
                    <h2 style="color: ${config.colors.headerBg};">${config.reportTitle}</h2>
                    <p>${config.radioName}${config.radioSlogan ? ' - ' + config.radioSlogan : ''}</p>
                    <p style="font-size: 11px; color: #999; margin-top: 8px;">Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
                </div>

                <div class="report-section">
                    <h3><i class="fas fa-calendar-week"></i> Grade Semanal</h3>
                    ${dayOrder.map(day => {
                        const dayPrograms = programs
                            .filter(p => p.days.includes(day))
                            .sort((a, b) => a.time.localeCompare(b.time));

                        if (dayPrograms.length === 0) return '';

                        return `
                            <div style="margin-bottom: 16px;">
                                <h4 style="font-size: 13px; color: ${config.colors.accent}; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">[${dayLabels[day]}]</h4>
                                <ul class="report-program-list">
                                    ${dayPrograms.map(prog => `
                                        <li>
                                            <span class="report-program-time">${prog.time}</span>
                                            <span class="report-program-name">${prog.name}</span>
                                            <span class="report-program-presenter">${presenterMap[prog.presenterId] || 'N/A'}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="report-section">
                    <h3><i class="fas fa-layer-group"></i> Por Formato</h3>
                    ${['Semanal', 'Mensal', 'Trimestral', 'Quinzenal', 'Excepcional'].map(format => {
                        const formatPrograms = programs.filter(p => p.format === format);
                        if (formatPrograms.length === 0) return '';
                        return `
                            <div style="margin-bottom: 12px;">
                                <h4 style="font-size: 13px; color: ${config.colors.accent}; margin-bottom: 6px;">[${format.toUpperCase()}]</h4>
                                <ul class="report-program-list">
                                    ${formatPrograms.map(prog => `
                                        <li>
                                            <span class="report-program-time">${prog.time}</span>
                                            <span class="report-program-name">${prog.name}</span>
                                            <span class="report-program-presenter">${presenterMap[prog.presenterId] || 'N/A'}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    attachEvents() {
        const btnGenerate = this.container.querySelector('#btnGeneratePDF');
        if (btnGenerate) {
            btnGenerate.addEventListener('click', () => this.generatePDF());
        }
    }

    generatePDF() {
        const reportType = document.getElementById('reportType').value;
        const programs = this.programController.getAllPrograms().map(p => p.toJSON());
        const presenters = this.presenterController.getAllPresenters().map(p => p.toJSON());
        const config = this.configController.getConfig();

        const pdfService = PDFService.create(config);

        if (reportType === 'presenters') {
            const doc = pdfService.generatePresenterReport(presenters, programs);
            pdfService.download('relatorio_apresentadores.pdf');
        } else {
            const doc = pdfService.generateScheduleReport(programs, presenters, reportType);
            pdfService.download('grade_programacao.pdf');
        }

        window.App.toast('PDF gerado com sucesso!', 'success');
    }
}
