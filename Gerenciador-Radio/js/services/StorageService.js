/**
 * Service: StorageService
 * Padrão: Singleton + Repository
 * Gerencia persistência no LocalStorage
 */
class StorageService {
    constructor() {
        if (StorageService.instance) {
            return StorageService.instance;
        }
        this.prefix = 'web_radio_';
        StorageService.instance = this;
    }

    static getInstance() {
        if (!StorageService.instance) {
            StorageService.instance = new StorageService();
        }
        return StorageService.instance;
    }

    // Programas
    getPrograms() {
        const data = localStorage.getItem(this.prefix + 'programs');
        return data ? JSON.parse(data) : [];
    }

    savePrograms(programs) {
        localStorage.setItem(this.prefix + 'programs', JSON.stringify(programs));
    }

    addProgram(program) {
        const programs = this.getPrograms();
        programs.push(program.toJSON());
        this.savePrograms(programs);
        return program;
    }

    updateProgram(program) {
        const programs = this.getPrograms();
        const index = programs.findIndex(p => p.id === program.id);
        if (index !== -1) {
            programs[index] = program.toJSON();
            this.savePrograms(programs);
            return program;
        }
        return null;
    }

    deleteProgram(id) {
        const programs = this.getPrograms();
        const filtered = programs.filter(p => p.id !== id);
        this.savePrograms(filtered);
        return filtered.length < programs.length;
    }

    getProgramById(id) {
        const programs = this.getPrograms();
        return programs.find(p => p.id === id) || null;
    }

    // Apresentadores
    getPresenters() {
        const data = localStorage.getItem(this.prefix + 'presenters');
        return data ? JSON.parse(data) : [];
    }

    savePresenters(presenters) {
        localStorage.setItem(this.prefix + 'presenters', JSON.stringify(presenters));
    }

    addPresenter(presenter) {
        const presenters = this.getPresenters();
        presenters.push(presenter.toJSON());
        this.savePresenters(presenters);
        return presenter;
    }

    updatePresenter(presenter) {
        const presenters = this.getPresenters();
        const index = presenters.findIndex(p => p.id === presenter.id);
        if (index !== -1) {
            presenters[index] = presenter.toJSON();
            this.savePresenters(presenters);
            return presenter;
        }
        return null;
    }

    deletePresenter(id) {
        const presenters = this.getPresenters();
        const filtered = presenters.filter(p => p.id !== id);
        this.savePresenters(filtered);
        return filtered.length < presenters.length;
    }

    getPresenterById(id) {
        const presenters = this.getPresenters();
        return presenters.find(p => p.id === id) || null;
    }

    // Configurações
    getConfig() {
        const data = localStorage.getItem(this.prefix + 'config');
        return data ? JSON.parse(data) : {};
    }

    saveConfig(config) {
        localStorage.setItem(this.prefix + 'config', JSON.stringify(config.toJSON()));
    }

    // Utilitários
    exportAll() {
        return {
            programs: this.getPrograms(),
            presenters: this.getPresenters(),
            config: this.getConfig(),
            exportedAt: new Date().toISOString()
        };
    }

    importAll(data) {
        if (data.programs) localStorage.setItem(this.prefix + 'programs', JSON.stringify(data.programs));
        if (data.presenters) localStorage.setItem(this.prefix + 'presenters', JSON.stringify(data.presenters));
        if (data.config) localStorage.setItem(this.prefix + 'config', JSON.stringify(data.config));
    }

    clearAll() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.prefix)) {
                localStorage.removeItem(key);
            }
        });
    }
}
