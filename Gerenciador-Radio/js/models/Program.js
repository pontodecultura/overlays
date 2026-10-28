/**
 * Model: Program
 * Representa um programa de rádio
 */
class Program {
    constructor(data = {}) {
        this.id = data.id || Program.generateId();
        this.name = data.name || '';
        this.presenterId = data.presenterId || '';
        this.format = data.format || 'Semanal'; // Semanal, Mensal, Trimestral, Quinzenal, Excepcional
        this.time = data.time || '';
        this.days = data.days || []; // ['segunda', 'terca', ...]
        this.description = data.description || '';
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    static generateId() {
        return 'prog_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    static getFormats() {
        return ['Semanal', 'Mensal', 'Trimestral', 'Quinzenal', 'Excepcional'];
    }

    static getDaysOfWeek() {
        return [
            { value: 'segunda', label: 'Segunda-feira' },
            { value: 'terca', label: 'Terça-feira' },
            { value: 'quarta', label: 'Quarta-feira' },
            { value: 'quinta', label: 'Quinta-feira' },
            { value: 'sexta', label: 'Sexta-feira' },
            { value: 'sabado', label: 'Sábado' },
            { value: 'domingo', label: 'Domingo' }
        ];
    }

    validate() {
        const errors = [];
        if (!this.name.trim()) errors.push('Nome do programa é obrigatório');
        if (!this.presenterId) errors.push('Apresentador é obrigatório');
        if (!this.time) errors.push('Horário é obrigatório');
        if (this.days.length === 0) errors.push('Selecione pelo menos um dia da semana');
        return errors;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            presenterId: this.presenterId,
            format: this.format,
            time: this.time,
            days: this.days,
            description: this.description,
            createdAt: this.createdAt,
            updatedAt: new Date().toISOString()
        };
    }

    static fromJSON(json) {
        return new Program(json);
    }
}
