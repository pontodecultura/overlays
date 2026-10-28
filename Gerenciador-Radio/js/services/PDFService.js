/**
 * Service: PDFService
 * Padrão: Strategy + Factory
 * Gera relatórios em PDF usando jsPDF
 */
class PDFService {
    constructor(config) {
        this.config = config;
        this.doc = null;
    }

    // Factory Method
    static create(config) {
        return new PDFService(config);
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    generateScheduleReport(programs, presenters, type = 'full') {
        const { jsPDF } = window.jspdf;
        this.doc = new jsPDF('p', 'mm', 'a4');
        const doc = this.doc;
        const colors = this.config.colors;
        const rgb = this.hexToRgb;

        let y = 20;
        const margin = 20;
        const pageWidth = 210;
        const contentWidth = pageWidth - (margin * 2);

        // Cabeçalho com logo
        if (this.config.logo) {
            try {
                doc.addImage(this.config.logo, 'PNG', margin, y, 30, 30);
                y += 35;
            } catch (e) {
                // Se não conseguir adicionar imagem, continua
            }
        }

        // Título do relatório
        const headerColor = rgb(colors.headerBg);
        doc.setFillColor(headerColor.r, headerColor.g, headerColor.b);
        doc.rect(margin, y, contentWidth, 12, 'F');

        const headerTextColor = rgb(colors.headerText);
        doc.setTextColor(headerTextColor.r, headerTextColor.g, headerTextColor.b);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(this.config.reportTitle || 'Grade de Programação', margin + 5, y + 8);

        const accentColor = rgb(colors.accent);
        doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(this.config.radioName, margin + 5, y + 16);

        y += 25;

        // Data do relatório
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(9);
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, margin, y);
        y += 10;

        // Agrupar programas
        const dayOrder = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
        const dayLabels = {
            segunda: 'SEGUNDA-FEIRA',
            terca: 'TERÇA-FEIRA',
            quarta: 'QUARTA-FEIRA',
            quinta: 'QUINTA-FEIRA',
            sexta: 'SEXTA-FEIRA',
            sabado: 'SÁBADO',
            domingo: 'DOMINGO'
        };

        // Relatório completo - por dias da semana
        if (type === 'full' || type === 'weekly') {
            dayOrder.forEach(day => {
                const dayPrograms = programs
                    .filter(p => p.days.includes(day))
                    .sort((a, b) => a.time.localeCompare(b.time));

                if (dayPrograms.length > 0) {
                    // Verifica se precisa de nova página
                    if (y > 250) {
                        doc.addPage();
                        y = 20;
                    }

                    // Cabeçalho do dia
                    const dayHeaderColor = rgb(colors.dayHeaderBg);
                    doc.setFillColor(dayHeaderColor.r, dayHeaderColor.g, dayHeaderColor.b);
                    doc.rect(margin, y, contentWidth, 8, 'F');

                    const dayHeaderTextColor = rgb(colors.dayHeaderText);
                    doc.setTextColor(dayHeaderTextColor.r, dayHeaderTextColor.g, dayHeaderTextColor.b);
                    doc.setFontSize(11);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`[${dayLabels[day]}]`, margin + 3, y + 5.5);
                    y += 12;

                    // Programas do dia
                    dayPrograms.forEach(prog => {
                        const presenter = presenters.find(p => p.id === prog.presenterId);
                        const presenterName = presenter ? presenter.name : 'N/A';

                        const itemBgColor = rgb(colors.itemBg);
                        doc.setFillColor(itemBgColor.r, itemBgColor.g, itemBgColor.b);
                        doc.rect(margin, y - 2, contentWidth, 7, 'F');

                        const timeColor = rgb(colors.timeColor);
                        doc.setTextColor(timeColor.r, timeColor.g, timeColor.b);
                        doc.setFontSize(10);
                        doc.setFont('helvetica', 'bold');
                        doc.text(`${prog.time} - ${prog.name}`, margin + 3, y + 3);

                        const itemTextColor = rgb(colors.itemText);
                        doc.setTextColor(itemTextColor.r, itemTextColor.g, itemTextColor.b);
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(8);
                        doc.text(`Apresentador: ${presenterName} | Formato: ${prog.format}`, margin + 3, y + 7);

                        y += 10;

                        if (y > 270) {
                            doc.addPage();
                            y = 20;
                        }
                    });

                    y += 4;
                }
            });
        }

        // Relatório por formato
        const formats = ['Semanal', 'Mensal', 'Trimestral', 'Quinzenal', 'Excepcional'];

        if (type === 'full' || type === 'byFormat') {
            formats.forEach(format => {
                const formatPrograms = programs.filter(p => p.format === format);

                if (formatPrograms.length > 0) {
                    if (y > 250) {
                        doc.addPage();
                        y = 20;
                    }

                    const accentColor = rgb(colors.accent);
                    doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
                    doc.setFontSize(13);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`[${format.toUpperCase()}]`, margin, y);
                    y += 8;

                    formatPrograms.forEach(prog => {
                        const presenter = presenters.find(p => p.id === prog.presenterId);
                        const presenterName = presenter ? presenter.name : 'N/A';
                        const daysText = prog.days.map(d => dayLabels[d]).join(', ');

                        doc.setTextColor(50, 50, 50);
                        doc.setFontSize(9);
                        doc.setFont('helvetica', 'normal');
                        doc.text(`• ${prog.time} - ${prog.name} (${presenterName}) - ${daysText}`, margin + 3, y);
                        y += 5;

                        if (y > 270) {
                            doc.addPage();
                            y = 20;
                        }
                    });

                    y += 6;
                }
            });
        }

        // Rodapé
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setTextColor(150, 150, 150);
            doc.setFontSize(8);
            doc.text(`${this.config.radioName} - Página ${i} de ${pageCount}`, margin, 287);
        }

        return doc;
    }

    generatePresenterReport(presenters, programs) {
        const { jsPDF } = window.jspdf;
        this.doc = new jsPDF('p', 'mm', 'a4');
        const doc = this.doc;
        const colors = this.config.colors;
        const rgb = this.hexToRgb;

        let y = 20;
        const margin = 20;
        const contentWidth = 170;

        // Cabeçalho
        const headerColor = rgb(colors.headerBg);
        doc.setFillColor(headerColor.r, headerColor.g, headerColor.b);
        doc.rect(margin, y, contentWidth, 12, 'F');

        const headerTextColor = rgb(colors.headerText);
        doc.setTextColor(headerTextColor.r, headerTextColor.g, headerTextColor.b);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Relatório de Apresentadores', margin + 5, y + 8);
        y += 20;

        doc.setTextColor(100, 100, 100);
        doc.setFontSize(9);
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, margin, y);
        y += 10;

        presenters.forEach(presenter => {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }

            const presenterPrograms = programs.filter(p => p.presenterId === presenter.id);

            doc.setTextColor(30, 58, 95);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(presenter.name, margin, y);
            y += 6;

            doc.setTextColor(100, 100, 100);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            if (presenter.email) doc.text(`Email: ${presenter.email}`, margin + 3, y);
            if (presenter.phone) doc.text(`Tel: ${presenter.phone}`, margin + 80, y);
            y += 5;

            if (presenterPrograms.length > 0) {
                doc.setTextColor(50, 50, 50);
                doc.setFontSize(9);
                presenterPrograms.forEach(prog => {
                    const daysText = prog.days.map(d => {
                        const map = {segunda:'Seg', terca:'Ter', quarta:'Qua', quinta:'Qui', sexta:'Sex', sabado:'Sáb', domingo:'Dom'};
                        return map[d] || d;
                    }).join(', ');
                    doc.text(`  • ${prog.time} - ${prog.name} (${prog.format}) [${daysText}]`, margin + 3, y);
                    y += 4;
                });
            } else {
                doc.setTextColor(150, 150, 150);
                doc.setFontSize(8);
                doc.text('  Sem programas cadastrados', margin + 3, y);
                y += 4;
            }

            y += 8;
        });

        // Rodapé
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setTextColor(150, 150, 150);
            doc.setFontSize(8);
            doc.text(`${this.config.radioName} - Página ${i} de ${pageCount}`, margin, 287);
        }

        return doc;
    }

    download(filename) {
        if (this.doc) {
            this.doc.save(filename);
        }
    }
}
