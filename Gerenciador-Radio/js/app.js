/**
 * Web Radio Manager - Aplicação Principal
 * Padrão: Facade + Singleton
 * Orquestra todos os módulos MVC
 */
class WebRadioApp {
    constructor() {
        if (WebRadioApp.instance) {
            return WebRadioApp.instance;
        }
        WebRadioApp.instance = this;

        this.currentPage = 'dashboard';
        this.init();
    }

    static getInstance() {
        if (!WebRadioApp.instance) {
            WebRadioApp.instance = new WebRadioApp();
        }
        return WebRadioApp.instance;
    }

    init() {
        // Inicializa Services (Singleton)
        this.storageService = StorageService.getInstance();

        // Inicializa Controllers
        this.programController = new ProgramController(this.storageService);
        this.presenterController = new PresenterController(this.storageService);
        this.configController = ConfigController.getInstance(this.storageService);

        // Inicializa Views
        this.dashboardView = new DashboardView('mainContent');
        this.programView = new ProgramView('mainContent');
        this.presenterView = new PresenterView('mainContent');
        this.scheduleView = new ScheduleView('mainContent');
        this.reportView = new ReportView('mainContent');
        this.configView = new ConfigView('mainContent');

        // Conecta Views aos Controllers
        this.dashboardView.setControllers(this.programController, this.presenterController);
        this.programView.setControllers(this.programController, this.presenterController);
        this.presenterView.setController(this.presenterController);
        this.scheduleView.setControllers(this.programController, this.presenterController);
        this.reportView.setControllers(this.programController, this.presenterController, this.configController);
        this.configView.setController(this.configController);

        // Configura callbacks de edição/exclusão
        this.programView.onEdit = (id) => this.editProgram(id);
        this.programView.onDelete = (id) => this.deleteProgram(id);
        this.presenterView.onEdit = (id) => this.editPresenter(id);
        this.presenterView.onDelete = (id) => this.deletePresenter(id);

        // Observadores para atualização automática
        this.programController.addListener((event, data) => {
            if (this.currentPage === 'dashboard') this.dashboardView.render();
            if (this.currentPage === 'schedule') this.scheduleView.render();
            if (this.currentPage === 'reports') this.reportView.render();
        });

        this.presenterController.addListener((event, data) => {
            if (this.currentPage === 'dashboard') this.dashboardView.render();
        });

        // Inicializa navegação
        this.initNavigation();

        // Renderiza página inicial
        this.navigateTo('dashboard');

        // Container de toasts
        this.createToastContainer();
    }

    initNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.navigateTo(page);
            });
        });
    }

    navigateTo(page) {
        this.currentPage = page;

        // Atualiza navegação ativa
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        // Renderiza a view correspondente
        switch (page) {
            case 'dashboard':
                this.dashboardView.render();
                break;
            case 'programs':
                this.programView.render();
                break;
            case 'presenters':
                this.presenterView.render();
                break;
            case 'schedule':
                this.scheduleView.render();
                break;
            case 'reports':
                this.reportView.render();
                break;
            case 'settings':
                this.configView.render();
                break;
        }
    }

    editProgram(id) {
        const program = this.programController.getProgramById(id);
        if (program) {
            this.programView.openModal(program);
        }
    }

    deleteProgram(id) {
        if (confirm('Tem certeza que deseja excluir este programa?')) {
            this.programController.deleteProgram(id);
            this.programView.render();
            this.toast('Programa excluído com sucesso!', 'success');
        }
    }

    editPresenter(id) {
        const presenter = this.presenterController.getPresenterById(id);
        if (presenter) {
            this.presenterView.openModal(presenter);
        }
    }

    deletePresenter(id) {
        const result = this.presenterController.deletePresenter(id);
        if (result.success) {
            this.presenterView.render();
            this.toast('Apresentador excluído com sucesso!', 'success');
        } else {
            this.toast(result.error, 'error');
        }
    }

    createToastContainer() {
        if (!document.getElementById('toastContainer')) {
            const container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }

    toast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.App = WebRadioApp.getInstance();
});
