/**
 * Controller: ProgramController
 * Padrão: Controller + Observer (notifica views)
 * Gerencia a lógica de negócio dos programas
 */
class ProgramController {
    constructor(storageService) {
        this.storage = storageService;
        this.listeners = [];
    }

    // Observer Pattern
    addListener(callback) {
        this.listeners.push(callback);
    }

    removeListener(callback) {
        this.listeners = this.listeners.filter(cb => cb !== callback);
    }

    notify(event, data) {
        this.listeners.forEach(callback => callback(event, data));
    }

    // CRUD Operations
    getAllPrograms() {
        return this.storage.getPrograms().map(p => Program.fromJSON(p));
    }

    getProgramById(id) {
        const data = this.storage.getProgramById(id);
        return data ? Program.fromJSON(data) : null;
    }

    createProgram(programData) {
        const program = new Program(programData);
        const errors = program.validate();

        if (errors.length > 0) {
            return { success: false, errors };
        }

        this.storage.addProgram(program);
        this.notify('programCreated', program);
        return { success: true, program };
    }

    updateProgram(id, programData) {
        const existing = this.getProgramById(id);
        if (!existing) {
            return { success: false, errors: ['Programa não encontrado'] };
        }

        const updated = new Program({ ...existing, ...programData, id });
        const errors = updated.validate();

        if (errors.length > 0) {
            return { success: false, errors };
        }

        this.storage.updateProgram(updated);
        this.notify('programUpdated', updated);
        return { success: true, program: updated };
    }

    deleteProgram(id) {
        const success = this.storage.deleteProgram(id);
        if (success) {
            this.notify('programDeleted', id);
        }
        return success;
    }

    // Business Logic
    getProgramsByDay(day) {
        return this.getAllPrograms().filter(p => p.days.includes(day));
    }

    getProgramsByPresenter(presenterId) {
        return this.getAllPrograms().filter(p => p.presenterId === presenterId);
    }

    getProgramsByFormat(format) {
        return this.getAllPrograms().filter(p => p.format === format);
    }

    getScheduleByDay() {
        const days = Program.getDaysOfWeek();
        const schedule = {};

        days.forEach(day => {
            schedule[day.value] = this.getProgramsByDay(day.value)
                .sort((a, b) => a.time.localeCompare(b.time));
        });

        return schedule;
    }

    getStatistics() {
        const programs = this.getAllPrograms();
        const formats = {};
        const daysCount = {};

        programs.forEach(p => {
            formats[p.format] = (formats[p.format] || 0) + 1;
            p.days.forEach(d => {
                daysCount[d] = (daysCount[d] || 0) + 1;
            });
        });

        return {
            total: programs.length,
            byFormat: formats,
            byDay: daysCount
        };
    }
}
