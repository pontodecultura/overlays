/**
 * View: DashboardView
 * Padrão: View + Template Method
 * Renderiza o painel principal
 */
class DashboardView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.programController = null;
        this.presenterController = null;
    }

    setControllers(programCtrl, presenterCtrl) {
        this.programController = programCtrl;
        this.presenterController = presenterCtrl;
    }

    render() {
        const programStats = this.programController.getStatistics();
        const presenterStats = this.presenterController.getStatistics();

        this.container.innerHTML = `
            <div class="page-header">
                <h2>Dashboard</h2>
                <p>Visão geral da sua web rádio</p>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon blue">
                        <i class="fas fa-radio"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${programStats.total}</h3>
                        <p>Programas Cadastrados</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon gold">
                        <i class="fas fa-microphone"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${presenterStats.total}</h3>
                        <p>Apresentadores</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon dark">
                        <i class="fas fa-calendar-week"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${presenterStats.active}</h3>
                        <p>Apresentadores Ativos</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon gray">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${Object.values(programStats.byDay).reduce((a,b) => a+b, 0)}</h3>
                        <p>Horários por Semana</p>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">Programação de Hoje</span>
                    <span class="badge badge-semanal">${this.getTodayLabel()}</span>
                </div>
                ${this.renderTodaySchedule()}
            </div>

            <div class="card">
                <div class="card-header">
                    <span class="card-title">Distribuição por Formato</span>
                </div>
                ${this.renderFormatChart(programStats.byFormat)}
            </div>
        `;
    }

    getTodayLabel() {
        const days = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
        const labels = {
            segunda: 'Segunda-feira',
            terca: 'Terça-feira',
            quarta: 'Quarta-feira',
            quinta: 'Quinta-feira',
            sexta: 'Sexta-feira',
            sabado: 'Sábado',
            domingo: 'Domingo'
        };
        return labels[days[new Date().getDay()]] || 'Hoje';
    }

    renderTodaySchedule() {
        const days = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
        const today = days[new Date().getDay()];
        const programs = this.programController.getProgramsByDay(today)
            .sort((a, b) => a.time.localeCompare(b.time));

        if (programs.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-calendar-xmark"></i>
                    <h3>Sem programação hoje</h3>
                    <p>Não há programas agendados para ${this.getTodayLabel()}</p>
                </div>
            `;
        }

        return `
            <div class="schedule-day-content">
                ${programs.map(prog => {
                    const presenter = this.presenterController.getPresenterById(prog.presenterId);
                    return `
                        <div class="schedule-item">
                            <span class="schedule-time">${prog.time}</span>
                            <div class="schedule-info">
                                <h4>${prog.name}</h4>
                                <p><i class="fas fa-microphone" style="color: var(--dourado); margin-right: 4px;"></i>${presenter ? presenter.name : 'N/A'} | ${prog.format}</p>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderFormatChart(byFormat) {
        const formats = ['Semanal', 'Mensal', 'Trimestral', 'Quinzenal', 'Excepcional'];
        const total = Object.values(byFormat).reduce((a, b) => a + b, 0) || 1;

        return `
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${formats.map(format => {
                    const count = byFormat[format] || 0;
                    const percentage = Math.round((count / total) * 100);
                    return `
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="min-width: 100px; font-size: 13px; font-weight: 500;">${format}</span>
                            <div style="flex: 1; height: 8px; background: var(--cinza-claro); border-radius: 4px; overflow: hidden;">
                                <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, var(--azul-marinho), var(--dourado)); border-radius: 4px; transition: width 0.5s ease;"></div>
                            </div>
                            <span style="min-width: 40px; text-align: right; font-size: 13px; font-weight: 600; color: var(--azul-marinho);">${count}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
}
