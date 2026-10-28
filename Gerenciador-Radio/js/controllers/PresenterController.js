/**
 * Controller: PresenterController
 * Padrão: Controller + Observer
 * Gerencia a lógica de negócio dos apresentadores
 */
class PresenterController {
    constructor(storageService) {
        this.storage = storageService;
        this.listeners = [];
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    removeListener(callback) {
        this.listeners = this.listeners.filter(cb => cb !== callback);
    }

    notify(event, data) {
        this.listeners.forEach(callback => callback(event, data));
    }

    getAllPresenters() {
        return this.storage.getPresenters().map(p => Presenter.fromJSON(p));
    }

    getActivePresenters() {
        return this.getAllPresenters().filter(p => p.active);
    }

    getPresenterById(id) {
        const data = this.storage.getPresenterById(id);
        return data ? Presenter.fromJSON(data) : null;
    }

    createPresenter(presenterData) {
        const presenter = new Presenter(presenterData);
        const errors = presenter.validate();

        if (errors.length > 0) {
            return { success: false, errors };
        }

        this.storage.addPresenter(presenter);
        this.notify('presenterCreated', presenter);
        return { success: true, presenter };
    }

    updatePresenter(id, presenterData) {
        const existing = this.getPresenterById(id);
        if (!existing) {
            return { success: false, errors: ['Apresentador não encontrado'] };
        }

        const updated = new Presenter({ ...existing, ...presenterData, id });
        const errors = updated.validate();

        if (errors.length > 0) {
            return { success: false, errors };
        }

        this.storage.updatePresenter(updated);
        this.notify('presenterUpdated', updated);
        return { success: true, presenter: updated };
    }

    deletePresenter(id) {
        // Verifica se há programas vinculados
        const programs = this.storage.getPrograms();
        const hasPrograms = programs.some(p => p.presenterId === id);

        if (hasPrograms) {
            return { success: false, error: 'Não é possível excluir: existem programas vinculados a este apresentador' };
        }

        const success = this.storage.deletePresenter(id);
        if (success) {
            this.notify('presenterDeleted', id);
        }
        return { success };
    }

    getPresenterName(id) {
        const presenter = this.getPresenterById(id);
        return presenter ? presenter.name : 'N/A';
    }

    getStatistics() {
        const presenters = this.getAllPresenters();
        const active = presenters.filter(p => p.active).length;

        return {
            total: presenters.length,
            active,
            inactive: presenters.length - active
        };
    }
}
