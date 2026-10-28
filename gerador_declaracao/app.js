'use strict';

const DEFAULT_TEMPLATE = `Declaramos, para os devidos fins, que <NOME_COMPLETO>, inscrito(a) no CPF sob o nº <CPF>, exerceu a função de <FUNCAO> nesta instituição, no período de <DATA_INICIO> a <DATA_FIM>.

Durante o período indicado, o(a) profissional desempenhou atividades relacionadas à área de <AREA>, incluindo:

<ATIVIDADES>

A presente declaração é emitida a pedido do(a) interessado(a), para fins de comprovação das atividades profissionais efetivamente exercidas, conforme os registros e as informações disponíveis nesta instituição.

Por ser expressão da verdade, firmamos a presente declaração.`;

const $ = (id) => document.getElementById(id);
const fieldIds = [
  'institutionName', 'institutionOrg', 'institutionCnpj', 'institutionAddress',
  'fullName', 'cpf', 'jobTitle', 'startDate', 'endDate', 'area', 'genderMode',
  'municipality', 'state', 'issueDate', 'signerName', 'signerTitle', 'documentTitle'
];
let logoDataUrl = '';
let activityCounter = 0;
let customMarkerValues = {};
const initialIssueDate = toInputDate(new Date());
$('issueDate').value = initialIssueDate;
$('templateText').value = DEFAULT_TEMPLATE;

function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  if (!value) return '';
  const parts = value.split('-');
  if (parts.length !== 3) return value;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function dateParts(value) {
  const date = value ? new Date(`${value}T12:00:00`) : new Date();
  if (Number.isNaN(date.getTime())) return { day: '', month: '', year: '' };
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: date.toLocaleDateString('pt-BR', { month: 'long' }),
    year: String(date.getFullYear())
  };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function genderize(text, mode) {
  if (mode === 'inclusive') return text;
  const feminine = mode === 'feminine';
  return text
    .replace(/o\(a\)/gi, feminine ? 'a' : 'o')
    .replace(/a\(o\)/gi, feminine ? 'a' : 'o');
}

function getActivities() {
  return [...document.querySelectorAll('.activity-input')]
    .map((input) => input.value.trim())
    .filter(Boolean);
}

function getAllValues() {
  const issue = dateParts($('issueDate').value);
  const values = {
    NOME_INSTITUICAO: $('institutionName').value.trim(),
    INSTITUICAO: $('institutionName').value.trim(),
    ORGAO: $('institutionOrg').value.trim(),
    CNPJ_INSTITUICAO: $('institutionCnpj').value.trim(),
    CNPJ: $('institutionCnpj').value.trim(),
    ENDERECO_INSTITUICAO: $('institutionAddress').value.trim(),
    ENDERECO: $('institutionAddress').value.trim(),
    NOME_COMPLETO: $('fullName').value.trim(),
    CPF: $('cpf').value.trim(),
    FUNCAO: $('jobTitle').value.trim(),
    CARGO: $('jobTitle').value.trim(),
    DATA_INICIO: formatDate($('startDate').value),
    DATA_FIM: formatDate($('endDate').value),
    AREA: $('area').value.trim(),
    ATIVIDADES: getActivities().map((item) => `• ${item}`).join('\n'),
    MUNICIPIO: $('municipality').value.trim(),
    UF: $('state').value.trim().toUpperCase(),
    DATA_EMISSAO: formatDate($('issueDate').value),
    DIA_EMISSAO: issue.day,
    MES_EMISSAO: issue.month,
    ANO_EMISSAO: issue.year,
    RESPONSAVEL: $('signerName').value.trim(),
    NOME_RESPONSAVEL: $('signerName').value.trim(),
    CARGO_RESPONSAVEL: $('signerTitle').value.trim(),
    FUNCAO_RESPONSAVEL: $('signerTitle').value.trim()
  };
  for (const [key, value] of Object.entries(customMarkerValues)) values[key] = value;
  return values;
}

function normalizedMarkerName(raw) {
  return raw.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9_ ]/g, '').replace(/[\s]+/g, '_');
}

function collectMarkers(template) {
  const markers = [];
  const seen = new Set();
  const regex = /<([^<>\n]+)>/g;
  let match;
  while ((match = regex.exec(template)) !== null) {
    const key = normalizedMarkerName(match[1]);
    if (key && !seen.has(key)) { seen.add(key); markers.push({ raw: match[0], key, label: match[1].trim() }); }
  }
  return markers;
}

const BUILT_IN_MARKERS = new Set([
  'NOME_INSTITUICAO', 'INSTITUICAO', 'ORGAO', 'CNPJ_INSTITUICAO', 'CNPJ',
  'ENDERECO_INSTITUICAO', 'ENDERECO', 'NOME_COMPLETO', 'CPF', 'FUNCAO', 'CARGO',
  'DATA_INICIO', 'DATA_FIM', 'AREA', 'ATIVIDADES', 'MUNICIPIO', 'UF', 'DATA_EMISSAO',
  'DIA_EMISSAO', 'MES_EMISSAO', 'ANO_EMISSAO', 'RESPONSAVEL', 'NOME_RESPONSAVEL',
  'CARGO_RESPONSAVEL', 'FUNCAO_RESPONSAVEL'
]);

function renderCustomMarkerFields() {
  const markers = collectMarkers($('templateText').value).filter((marker) => !BUILT_IN_MARKERS.has(marker.key));
  const container = $('customMarkerFields');
  container.innerHTML = '';
  customMarkerValues = Object.fromEntries(Object.entries(customMarkerValues).filter(([key]) => markers.some((m) => m.key === key)));
  if (!markers.length) {
    $('customMarkerArea').hidden = true;
    return;
  }
  $('customMarkerArea').hidden = false;
  markers.forEach((marker) => {
    const label = document.createElement('label');
    label.className = 'field field-wide';
    label.append(document.createTextNode(marker.label));
    const input = document.createElement('input');
    input.type = 'text';
    input.value = customMarkerValues[marker.key] || '';
    input.placeholder = `Valor para <${marker.label}>`;
    input.dataset.markerKey = marker.key;
    input.addEventListener('input', () => {
      customMarkerValues[marker.key] = input.value;
      updatePreview();
    });
    label.append(input);
    container.append(label);
  });
}

function replaceMarkers(template) {
  const values = getAllValues();
  let text = template.replace(/<([^<>\n]+)>/g, (match, name) => {
    const key = normalizedMarkerName(name);
    const value = values[key];
    return (value === undefined || value === '') ? `⟦${name.trim()}⟧` : String(value);
  });
  text = genderize(text, $('genderMode').value);
  return text;
}

function renderBodyText() {
  const substituted = replaceMarkers($('templateText').value);
  const paragraphs = substituted.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  $('previewBody').innerHTML = paragraphs.map((paragraph) =>
    `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`
  ).join('');
}

function updatePreview() {
  const institution = $('institutionName').value.trim();
  $('previewInstitutionName').textContent = institution || 'NOME DA INSTITUIÇÃO';
  $('previewInstitutionOrg').textContent = $('institutionOrg').value.trim();
  $('previewInstitutionOrg').hidden = !$('institutionOrg').value.trim();
  const cnpj = $('institutionCnpj').value.trim();
  $('previewInstitutionCnpj').textContent = cnpj ? `CNPJ: ${cnpj}` : '';
  $('previewInstitutionCnpj').hidden = !cnpj;
  $('previewInstitutionAddress').textContent = $('institutionAddress').value.trim();
  $('previewInstitutionAddress').hidden = !$('institutionAddress').value.trim();
  $('previewDocumentTitle').textContent = $('documentTitle').value.trim() || 'DECLARAÇÃO DE ATIVIDADES PROFISSIONAIS';
  renderBodyText();

  const municipality = $('municipality').value.trim();
  const state = $('state').value.trim().toUpperCase();
  const issue = dateParts($('issueDate').value);
  const dateLine = municipality || state
    ? `${municipality}${municipality && state ? ' - ' : ''}${state}, ${issue.day} de ${issue.month} de ${issue.year}`
    : `${issue.day} de ${issue.month} de ${issue.year}`;
  $('previewIssueDate').textContent = dateLine;
  $('previewSignerName').textContent = $('signerName').value.trim() || 'NOME DO RESPONSÁVEL';
  $('previewSignerTitle').textContent = $('signerTitle').value.trim() || 'CARGO / FUNÇÃO';

  const logo = $('documentLogo');
  if (logoDataUrl) {
    logo.src = logoDataUrl;
    logo.hidden = false;
  } else {
    logo.removeAttribute('src');
    logo.hidden = true;
  }
}

function addActivity(value = '') {
  activityCounter += 1;
  const row = document.createElement('div');
  row.className = 'activity-row';
  const textarea = document.createElement('textarea');
  textarea.className = 'activity-input';
  textarea.rows = 2;
  textarea.value = value;
  textarea.placeholder = `Descreva a atividade ${activityCounter}`;
  textarea.setAttribute('aria-label', `Atividade profissional ${activityCounter}`);
  textarea.addEventListener('input', updatePreview);
  const remove = document.createElement('button');
  remove.className = 'remove-activity';
  remove.type = 'button';
  remove.textContent = '×';
  remove.title = 'Remover atividade';
  remove.setAttribute('aria-label', 'Remover atividade');
  remove.addEventListener('click', () => {
    row.remove();
    updatePreview();
  });
  row.append(textarea, remove);
  $('activitiesList').append(row);
}

function validateBeforePrint() {
  const requiredIds = [
    'institutionName', 'institutionCnpj', 'fullName', 'cpf', 'jobTitle', 'startDate',
    'endDate', 'area', 'municipality', 'state', 'issueDate', 'signerName', 'signerTitle'
  ];
  document.querySelectorAll('.invalid').forEach((el) => el.classList.remove('invalid'));
  const missing = [];
  requiredIds.forEach((id) => {
    const field = $(id);
    if (!field.value.trim()) {
      field.classList.add('invalid');
      missing.push({ field, label: field.closest('label')?.childNodes[0]?.textContent?.trim() || id });
    }
  });
  if (!getActivities().length) {
    $('activitiesList').querySelector('textarea')?.classList.add('invalid');
    missing.push({ field: $('activitiesList'), label: 'Pelo menos uma atividade profissional' });
  }
  if (missing.length) {
    alert('Para gerar a declaração, preencha os campos obrigatórios:\n\n' + missing.map((item) => `• ${item.label}`).join('\n'));
    const first = missing[0].field;
    first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (typeof first.focus === 'function') first.focus({ preventScroll: true });
    return false;
  }
  if ($('startDate').value && $('endDate').value && $('startDate').value > $('endDate').value) {
    $('startDate').classList.add('invalid');
    $('endDate').classList.add('invalid');
    alert('A data de início não pode ser posterior à data de término.');
    $('startDate').focus();
    return false;
  }
  return true;
}

function makeFilename() {
  const name = $('fullName').value.trim() || 'profissional';
  const safeName = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return `Declaracao_Atividades_${safeName || 'profissional'}`;
}

$('logoInput').addEventListener('change', (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('Selecione um arquivo de imagem válido.');
    event.target.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    logoDataUrl = String(reader.result || '');
    $('logoThumb').src = logoDataUrl;
    $('logoThumb').hidden = false;
    updatePreview();
  };
  reader.onerror = () => alert('Não foi possível ler o arquivo do logotipo.');
  reader.readAsDataURL(file);
});

fieldIds.forEach((id) => $(id).addEventListener('input', updatePreview));
$('templateText').addEventListener('input', updatePreview);
$('templateText').addEventListener('change', renderCustomMarkerFields);
$('addActivityButton').addEventListener('click', () => {
  addActivity();
  const rows = document.querySelectorAll('.activity-input');
  rows[rows.length - 1]?.focus();
});
$('refreshMarkersButton').addEventListener('click', () => {
  renderCustomMarkerFields();
  updatePreview();
  const customCount = collectMarkers($('templateText').value).filter((marker) => !BUILT_IN_MARKERS.has(marker.key)).length;
  alert(customCount ? `${customCount} marcador(es) personalizado(s) disponibilizado(s) no formulário.` : 'O modelo utiliza apenas os marcadores padrão.');
});
$('pdfButton').addEventListener('click', () => {
  if (!validateBeforePrint()) return;
  updatePreview();
  const previousTitle = document.title;
  document.title = makeFilename();
  window.print();
  window.setTimeout(() => { document.title = previousTitle; }, 1500);
});
$('resetButton').addEventListener('click', () => {
  const confirmed = window.confirm('Restaurar o modelo de texto padrão? Os dados preenchidos nos campos serão mantidos.');
  if (!confirmed) return;
  $('templateText').value = DEFAULT_TEMPLATE;
  $('documentTitle').value = 'DECLARAÇÃO DE ATIVIDADES PROFISSIONAIS';
  customMarkerValues = {};
  renderCustomMarkerFields();
  updatePreview();
});

// Três linhas de atividade já aparecem no formulário, conforme o exemplo fornecido.
addActivity();
addActivity();
addActivity();
renderCustomMarkerFields();
updatePreview();
