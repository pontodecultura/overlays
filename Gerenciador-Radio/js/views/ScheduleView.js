/**
 * View: ScheduleView
 * Padrão: View + Composite
 * Renderiza a grade de programação visual
 */
class ScheduleView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.controller = null;
        this.presenterController = null;
    }

    setControllers(ctrl, presenterCtrl) {
        this.controller = ctrl;
        this.presenterController = presenterCtrl;
    }

    render() {
        const schedule = this.controller.getScheduleByDay();
        const dayLabels = {
            segunda: 'Segunda-feira',
            terca: 'Terça-feira',
            quarta: 'Quarta-feira',
            quinta: 'Quinta-feira',
            sexta: 'Sexta-feira',
            sabado: 'Sábado',
            domingo: 'Domingo'
        };

        this.container.innerHTML = `
            <div class="page-header">
                <h2>Grade de Programação</h2>
                <p>Visualize a programação completa da semana</p>
            </div>

            <div class="schedule-grid">
                ${Object.entries(schedule).map(([day, programs]) => `
                    <div class="schedule-day">
                        <div class="schedule-day-header">
                            <i class="fas fa-calendar-day"></i>
                            ${dayLabels[day]}
                        </div>
                        <div class="schedule-day-content">
                            ${programs.length === 0 
                                ? '<div class="schedule-empty">Sem programação</div>'
                                : programs.map(prog => {
                                    const presenter = this.presenterController.getPresenterById(prog.presenterId);
                                    return `
                                        <div class="schedule-item">
                                            <span class="schedule-time">${prog.time}</span>
                                            <div class="schedule-info">
                                                <h4>${prog.name}</h4>
                                                <p>${presenter ? presenter.name : 'N/A'} | ${prog.format}</p>
                                            </div>
                                        </div>
                                    `;
                                }).join('')
                            }
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}
