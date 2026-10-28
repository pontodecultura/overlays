/**
 * Controller: ConfigController
 * Padrão: Singleton
 * Gerencia as configurações do sistema
 */
class ConfigController {
    constructor(storageService) {
        this.storage = storageService;
        this.config = null;
        this.listeners = [];
        this.loadConfig();
    }

    static getInstance(storageService) {
        if (!ConfigController.instance) {
            ConfigController.instance = new ConfigController(storageService);
        }
        return ConfigController.instance;
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    notify(event, data) {
        this.listeners.forEach(callback => callback(event, data));
    }

    loadConfig() {
        const data = this.storage.getConfig();
        this.config = Config.fromJSON(data);
    }

    getConfig() {
        return this.config;
    }

    updateConfig(configData) {
        this.config = new Config({ ...this.config.toJSON(), ...configData });
        this.storage.saveConfig(this.config);
        this.notify('configUpdated', this.config);
        return this.config;
    }

    updateColors(colors) {
        this.config.colors = { ...this.config.colors, ...colors };
        this.storage.saveConfig(this.config);
        this.notify('configUpdated', this.config);
        return this.config;
    }

    setLogo(logoData) {
        this.config.logo = logoData;
        this.storage.saveConfig(this.config);
        this.notify('configUpdated', this.config);
        return this.config;
    }
}
