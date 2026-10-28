/**
 * Model: Presenter
 * Representa um apresentador de rádio
 */
class Presenter {
    constructor(data = {}) {
        this.id = data.id || Presenter.generateId();
        this.name = data.name || '';
        this.email = data.email || '';
        this.phone = data.phone || '';
        this.bio = data.bio || '';
        this.active = data.active !== undefined ? data.active : true;
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    static generateId() {
        return 'pres_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    validate() {
        const errors = [];
        if (!this.name.trim()) errors.push('Nome do apresentador é obrigatório');
        return errors;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            phone: this.phone,
            bio: this.bio,
            active: this.active,
            createdAt: this.createdAt
        };
    }

    static fromJSON(json) {
        return new Presenter(json);
    }
}
