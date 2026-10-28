/**
 * Model: Config
 * Configurações do sistema e do relatório
 */
class Config {
    constructor(data = {}) {
        this.radioName = data.radioName || 'Minha Web Rádio';
        this.radioSlogan = data.radioSlogan || '';
        this.logo = data.logo || '';
        this.reportTitle = data.reportTitle || 'Grade de Programação';
        this.colors = {
            headerBg: data.colors?.headerBg || '#1e3a5f',
            headerText: data.colors?.headerText || '#ffffff',
            accent: data.colors?.accent || '#c9a227',
            dayHeaderBg: data.colors?.dayHeaderBg || '#1e3a5f',
            dayHeaderText: data.colors?.dayHeaderText || '#ffffff',
            itemBg: data.colors?.itemBg || '#f8f9fa',
            itemText: data.colors?.itemText || '#1a1a2e',
            timeColor: data.colors?.timeColor || '#1e3a5f',
            borderColor: data.colors?.borderColor || '#e9ecef'
        };
    }

    toJSON() {
        return {
            radioName: this.radioName,
            radioSlogan: this.radioSlogan,
            logo: this.logo,
            reportTitle: this.reportTitle,
            colors: this.colors
        };
    }

    static fromJSON(json) {
        return new Config(json);
    }
}
