// src/js/info.js
import { QuizEngine } from './class.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://pbxmhrwhebegnejjzksp.supabase.co";
const supabaseAnonKey = "sb_publishable_Fg8_-r_e4Ef0rQDIzqWYyg_oK9Rsek2";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 🔒 ГЛОБАЛЬНЫЙ КЭШ ЭЛЕМЕНТОВ DOM — СТРОГО НА САМОМ ВЕРХУ ФАЙЛА
let DOM_CACHE = {};
let listaLeads = [];
let filtroRolActual = 'all';
let criterioSortActual = 'date-desc';
let listaComplaints = [];
let pestañaActual = 'leads'; 
let engine = null; // Экземпляр движка квиза

// Функция кэширования селекторов, чтобы браузер не искал их вглубь HTML-дерева постоянно
const inicializarCacheDOM = () => {
    DOM_CACHE = {
        quizFlowContainer: document.getElementById('quiz-flow-container'),
        progressBar: document.getElementById('progress-bar'),
        stepCounter: document.getElementById('step-counter'),
        stepsHolder: document.getElementById('dynamic-steps-holder'),
        questionTemplate: document.getElementById('question-template'),
        buttonTemplate: document.getElementById('button-template'),
        stepCardForm: document.getElementById('step-card-form'),
        stepCardSuccess: document.getElementById('step-card-success'),
        inputNombre: document.getElementById('lead-nombre'),
        inputEmail: document.getElementById('lead-email'),
        inputTelefono: document.getElementById('lead-telefono'),
        inputProvincia: document.getElementById('lead-provincia'),
        inputRole: document.getElementById('lead-role'),
        
        ctaModal: document.getElementById('cta-modal'),
        ctaModalCard: document.getElementById('cta-modal-card'),
        ctaModalTitle: document.getElementById('cta-modal-title'),
        ctaModalText: document.getElementById('cta-modal-text'),
        
        confirmModal: document.getElementById('confirm-modal'),
        confirmCard: document.getElementById('confirm-modal-card'),
        confirmPercent: document.getElementById('confirm-modal-percent'),
        confirmBar: document.getElementById('confirm-modal-bar'),
        modalNextBtn: document.getElementById('modal-next-btn'),
        prevQuestionBtn: document.getElementById('prev-question-btn'),
        
        resultCard: document.getElementById('step-card-resultat'),
        resultTitle: document.getElementById('result-status-title'),
        resultDescription: document.getElementById('result-description-text'),
        resultLine: document.getElementById('result-top-line'),
        resultIcon: document.getElementById('result-icon'),
        
        adminModal: document.getElementById('admin-modal'),
        adminCard: document.getElementById('modal-card'),
        loginBlock: document.getElementById('admin-login-block'),
        contentBlock: document.getElementById('admin-content-block'),
        passwordInput: document.getElementById('admin-password-input'),
        tbody: document.getElementById('leads-table-body'),
        mobileList: document.getElementById('leads-mobile-list'),
        
        metricTotal: document.getElementById('metric-total'),
        metricSocios: document.getElementById('metric-socios'),
        metricPadas: document.getElementById('metric-padas')
    };
};

// ⚡ Обновление метрик панели администратора
const actualizarMetricasAdmin = (leads) => {
    if (!DOM_CACHE.metricTotal || !DOM_CACHE.metricSocios || !DOM_CACHE.metricPadas) return;
    const total = leads.length;
    const socios = leads.filter(l => !l.modalidad_implicacion || l.modalidad_implicacion.toLowerCase() === 'socio').length;
    const padas = leads.filter(l => l.modalidad_implicacion && l.modalidad_implicacion.toLowerCase() === 'pada').length;

    DOM_CACHE.metricTotal.textContent = total;
    DOM_CACHE.metricSocios.textContent = socios;
    DOM_CACHE.metricPadas.textContent = padas;
};

// ⚡ Рендеринг таблицы лидов и мобильных карточек
const renderizarTabla = (filtro, sorting, tbody, mobileList) => {
    const rowTemplate = document.getElementById('table-row-template');
    const cardTemplate = document.getElementById('mobile-card-template');
    
    if (!tbody || !mobileList || !rowTemplate || !cardTemplate) return;

    tbody.innerHTML = '';
    mobileList.innerHTML = '';

    let leadsProcesados = filtro === 'all' 
        ? [...listaLeads] 
        : listaLeads.filter(l => l.modalidad_implicacion && l.modalidad_implicacion.toLowerCase() === filtro.toLowerCase());

    leadsProcesados.sort((a, b) => {
        if (criterioSortActual === 'date-desc') return new Date(b.created_at) - new Date(a.created_at);
        if (criterioSortActual === 'date-asc') return new Date(a.created_at) - new Date(b.created_at);
        if (criterioSortActual === 'name-asc') return (a.nombre || '').localeCompare(b.nombre || '');
        if (criterioSortActual === 'provincia-asc') return (a.provincia || 'Barcelona').localeCompare(b.provincia || 'Barcelona');
        return 0;
    });

    if (leadsProcesados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-400 font-medium">No s'han trobat registres.</td></tr>`;
        mobileList.innerHTML = `<div class="p-6 text-center text-gray-400 font-medium border border-dashed border-gray-200">No s'han trobat registres.</div>`;
        actualizarMetricasAdmin(listaLeads);
        return;
    }

    leadsProcesados.forEach(lead => {
        const fechaText = new Date(lead.created_at).toLocaleDateString('ca-ES');
        const provinciaText = lead.provincia || 'Barcelona';
        const rolText = lead.modalidad_implicacion ? lead.modalidad_implicacion.toUpperCase() : 'SOCI/A';

        // 1. Десктопная строка
        const rowClone = rowTemplate.content.cloneNode(true);
        const trNode = rowClone.querySelector('tr');
        if (trNode) trNode.setAttribute('data-id', lead.id);

        rowClone.querySelector('.td-date').textContent = fechaText;
        rowClone.querySelector('.td-name').textContent = `${lead.nombre || 'Anònim'} (${provinciaText})`;
        rowClone.querySelector('.td-email').textContent = lead.email || '-';
        rowClone.querySelector('.td-phone').textContent = lead.telefono || '-';
        
        const badge = rowClone.querySelector('.td-badge');
        if (badge) {
            badge.textContent = rolText;
            badge.className = rolText === 'PADA' 
                ? "px-2 py-0.5 bg-blue-50 text-[#007cc2] border border-blue-100 text-[10px] font-black rounded-xs uppercase tracking-wider"
                : "px-2 py-0.5 bg-emerald-50 text-brand-green border border-emerald-100 text-[10px] font-black rounded-xs uppercase tracking-wider";
        }
        tbody.appendChild(rowClone);

        // 2. Мобильная карточка
        const cardClone = cardTemplate.content.cloneNode(true);
        const cardDiv = cardClone.querySelector('div');
        if (cardDiv) cardDiv.setAttribute('data-id', lead.id);

        cardClone.querySelector('.card-date').textContent = fechaText;
        cardClone.querySelector('.card-name').textContent = `${lead.nombre || 'Anònim'} (${provinciaText})`;
        cardClone.querySelector('.card-email').textContent = lead.email || '-';
        cardClone.querySelector('.card-phone').textContent = lead.telefono || '-';
        
        const cardBadge = cardClone.querySelector('.card-badge');
        const cardSideLine = cardClone.querySelector('.card-side-line');
        if (cardBadge) {
            cardBadge.textContent = rolText;
            if (rolText === 'PADA') {
                cardBadge.className = "px-2 py-0.5 bg-blue-50 text-[#007cc2] border border-blue-100 text-[9px] font-black rounded-xs uppercase tracking-wider";
                if (cardSideLine) cardSideLine.className = "absolute top-0 left-0 bottom-0 w-1 bg-[#007cc2] card-side-line";
            } else {
                cardBadge.className = "px-2 py-0.5 bg-emerald-50 text-brand-green border border-emerald-100 text-[9px] font-black rounded-xs uppercase tracking-wider";
            }
        }
        mobileList.appendChild(cardClone);
    });

    actualizarMetricasAdmin(listaLeads);
};
// ⚡ Рендеринг таблицы жалоб и официальных тикетов поддержки
const renderizarComplaints = (tbody, mobileList) => {
    const rowTemplate = document.getElementById('complaint-row-template');
    const cardTemplate = document.getElementById('complaint-card-template');
    
    if (!tbody || !mobileList || !rowTemplate || !cardTemplate) return;

    tbody.innerHTML = '';
    mobileList.innerHTML = '';

    if (listaComplaints.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-gray-400 font-medium">No s'han trobat denúncies enregistrades.</td></tr>`;
        mobileList.innerHTML = `<div class="p-6 text-center text-gray-400 font-medium border border-dashed border-gray-200">No s'han trobat denúncies enregistrades.</div>`;
        return;
    }

    listaComplaints.forEach(comp => {
        const fechaText = new Date(comp.created_at).toLocaleDateString('ca-ES');
        const esConsulta = comp.centre_name && comp.centre_name.includes('CONSULTA AFILIAT:');
        
        const displayCentre = esConsulta 
            ? comp.centre_name.replace('CONSULTA AFILIAT:', '👤').trim() 
            : (comp.centre_name || 'Desconegut');
            
        const displayType = esConsulta 
            ? `<span class="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-xs bg-blue-50 text-[#007cc2] border border-blue-100">📌 SUPORT AFILIAT</span>`
            : (comp.irregularity_type?.toUpperCase().replace(/-/g, ' ') || 'ALTRES');

        // 1. Десктопная строка жалоб
        const rowClone = rowTemplate.content.cloneNode(true);
        const trNode = rowClone.querySelector('tr');
        if (trNode) {
            trNode.setAttribute('data-id', comp.id);
            if (esConsulta) trNode.classList.add('bg-blue-50/20');
        }

        const cellCentre = rowClone.querySelector('.comp-centre');
        const cellType = rowClone.querySelector('.comp-type');
        
        rowClone.querySelector('.comp-date').textContent = fechaText;
        if (cellCentre) cellCentre.innerHTML = displayCentre;
        if (cellType) cellType.innerHTML = displayType;
        rowClone.querySelector('.comp-contact').textContent = comp.contact_info || '-';
        tbody.appendChild(rowClone);

        // 2. Мобильная карточка жалоб
        const cardClone = cardTemplate.content.cloneNode(true);
        const cardDiv = cardClone.querySelector('div');
        if (cardDiv) {
            cardDiv.setAttribute('data-id', comp.id);
            if (esConsulta) cardDiv.classList.add('bg-blue-50/20', 'border-blue-100');
        }

        const mobileCentre = cardClone.querySelector('.comp-card-centre');
        const mobileType = cardClone.querySelector('.comp-card-type');

        cardClone.querySelector('.comp-card-date').textContent = fechaText;
        if (mobileCentre) mobileCentre.innerHTML = displayCentre;
        if (mobileType) mobileType.innerHTML = displayType;
        cardClone.querySelector('.comp-card-contact').textContent = comp.contact_info || '-';
        mobileList.appendChild(cardClone);
    });
};

// ⚡ Чистая стрелочная функция экспорта данных в CSV
const ejecutarExportacionCSV = () => {
    if (listaLeads.length === 0) return alert('No hi ha dades per exportar.');
    let csvContenido = "data:text/csv;charset=utf-8,Data,Nom,Provincia,Email,Telefon,Rol\n";
    listaLeads.forEach(l => {
        const d = new Date(l.created_at).toLocaleDateString('ca-ES');
        const n = (l.nombre || 'Anonim').replace(/,/g, ' ');
        const p = (l.provincia || 'Barcelona').replace(/,/g, ' ');
        const e = (l.email || '-').replace(/,/g, ' ');
        const t = (l.telefono || '-').replace(/,/g, ' ');
        const r = l.modalidad_implicacion || 'socio';
        csvContenido += `${d},${n},${p},${e},${t},${r}\n`;
    });
    const encodedUri = encodeURI(csvContenido);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LEADS_ADOCAT.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// 🔥 ГЛАВНЫЙ СЛУШАТЕЛЬ СТРАНИЦЫ
document.addEventListener('DOMContentLoaded', () => {
    inicializarCacheDOM();
    // ⚡ Функция физической отрисовки шагов квиза (Перенесена из class.js)
    const renderizarPasoQuiz = (state) => {
        // 1. Обновляем прогресс-бар и счетчики
        if (DOM_CACHE.progressBar) DOM_CACHE.progressBar.style.width = `${state.percent}%`;
        if (DOM_CACHE.stepCounter) DOM_CACHE.stepCounter.textContent = `${state.currentIndex + 1} / ${state.totalSteps}`;

        // Управляем видимостью кнопки "Назад"
        if (DOM_CACHE.prevQuestionBtn) {
            if (state.currentIndex > 0 && !state.isQuizFinished) {
                DOM_CACHE.prevQuestionBtn.classList.remove('opacity-0', 'pointer-events-none');
            } else {
                DOM_CACHE.prevQuestionBtn.classList.add('opacity-0', 'pointer-events-none');
            }
        }

        // 2. Если квиз завершен — выводим окно результатов
        if (state.isQuizFinished) {
            if (DOM_CACHE.quizFlowContainer) DOM_CACHE.quizFlowContainer.classList.add('hidden');
            if (DOM_CACHE.stepsHolder) DOM_CACHE.stepsHolder.innerHTML = '';
            
            const stepCounterBlock = DOM_CACHE.stepCounter?.closest('.bg-white');
            if (stepCounterBlock) stepCounterBlock.classList.add('hidden');
            if (DOM_CACHE.prevQuestionBtn) DOM_CACHE.prevQuestionBtn.classList.add('hidden');

            // Наполняем карточку результата чистыми данными из движка класса
            if (DOM_CACHE.resultTitle) DOM_CACHE.resultTitle.textContent = state.result.title;
            if (DOM_CACHE.resultDescription) DOM_CACHE.resultDescription.innerHTML = state.result.description;
            if (DOM_CACHE.resultLine) DOM_CACHE.resultLine.className = state.result.lineClass;
            if (DOM_CACHE.resultIcon) DOM_CACHE.resultIcon.textContent = state.result.icon;

            if (DOM_CACHE.resultCard) {
                DOM_CACHE.resultCard.classList.remove('hidden');
                setTimeout(() => {
                    DOM_CACHE.resultCard.classList.remove('opacity-0');
                    DOM_CACHE.resultCard.classList.add('opacity-100');
                }, 50);
            }
            return;
        }
        // 3. Рендеринг карточки текущего вопроса
        if (DOM_CACHE.stepsHolder) DOM_CACHE.stepsHolder.innerHTML = ''; 
        if (!state.currentQuestion) return;

        const cardClone = DOM_CACHE.questionTemplate.content.cloneNode(true);
        const cardDiv = cardClone.querySelector('.quiz-card');
        const title = cardClone.querySelector('.question-title');
        const grid = cardClone.querySelector('.options-grid');

        if (title) title.textContent = state.currentQuestion.text;

        state.currentQuestion.options.forEach(option => {
            const btnClone = DOM_CACHE.buttonTemplate.content.cloneNode(true);
            const btn = btnClone.querySelector('button');
            if (btn) {
                btn.textContent = option;
                if (state.currentQuestion.savedAnswer === option) {
                    btn.setAttribute('data-selected', 'true');
                    btn.style.borderColor = '#00bf63';
                    btn.style.backgroundColor = '#f4fbf7';
                }

                // Клик по кнопке ответа передает управление в info.js для открытия модалки
                btn.addEventListener('click', () => {
                    engine.saveAnswer(state.currentQuestion.id, option);
                    abrirModalConfirmacion(state.currentProgress);
                });
            }
            if (grid) grid.appendChild(btnClone);
        });

        if (cardDiv) cardDiv.classList.add('opacity-0', '-translate-y-6', 'transition-all', 'duration-500');
        if (DOM_CACHE.stepsHolder) DOM_CACHE.stepsHolder.appendChild(cardClone);
        
        setTimeout(() => {
            const activeCard = DOM_CACHE.stepsHolder?.querySelector('.quiz-card');
            if (activeCard) activeCard.classList.remove('opacity-0', '-translate-y-6');
        }, 50);
    };

    // ⚡ Логика модального окна подтверждения ответа
    const abrirModalConfirmacion = (currentProgress) => {
        if (DOM_CACHE.confirmPercent) DOM_CACHE.confirmPercent.textContent = `Has completat el ${currentProgress}% del diagnòstic`;
        if (DOM_CACHE.confirmBar) DOM_CACHE.confirmBar.style.width = `${currentProgress}%`;

        if (DOM_CACHE.confirmModal && DOM_CACHE.confirmCard) {
            DOM_CACHE.confirmModal.classList.remove('opacity-0', 'pointer-events-none');
            DOM_CACHE.confirmCard.classList.remove('scale-95');
        }

        if (DOM_CACHE.modalNextBtn) {
            DOM_CACHE.modalNextBtn.onclick = () => {
                if (DOM_CACHE.confirmModal && DOM_CACHE.confirmCard) {
                    DOM_CACHE.confirmModal.classList.add('opacity-0', 'pointer-events-none');
                    DOM_CACHE.confirmCard.classList.add('scale-95');
                }
                setTimeout(() => engine.nextStep(), 200);
            };
        }
    };

    // ⚡ Функции управления экранами и модальными окнами квиза
    const revealForm = () => {
        if (DOM_CACHE.resultCard) DOM_CACHE.resultCard.classList.add('hidden');
        if (DOM_CACHE.stepCardForm) {
            DOM_CACHE.stepCardForm.classList.remove('hidden');
            setTimeout(() => {
                DOM_CACHE.stepCardForm.classList.remove('opacity-0');
                DOM_CACHE.stepCardForm.classList.add('opacity-100');
            }, 50);
        }
    };

    const openModal = (title, htmlContent) => {
        if (DOM_CACHE.ctaModalTitle && DOM_CACHE.ctaModalText && DOM_CACHE.ctaModal && DOM_CACHE.ctaModalCard) {
            DOM_CACHE.ctaModalTitle.textContent = title;
            DOM_CACHE.ctaModalText.innerHTML = htmlContent;
            DOM_CACHE.ctaModal.classList.remove('opacity-0', 'pointer-events-none');
            DOM_CACHE.ctaModalCard.classList.remove('scale-95');
        }
    };

    const closeModal = () => {
        if (DOM_CACHE.ctaModal && DOM_CACHE.ctaModalCard) {
            DOM_CACHE.ctaModal.classList.add('opacity-0', 'pointer-events-none');
            DOM_CACHE.ctaModalCard.classList.add('scale-95');
        }
    };
    // ⚡ Инициализация движка квиза и подписка на его обновления через колбэк
    if (DOM_CACHE.quizFlowContainer && DOM_CACHE.questionTemplate) {
        engine = new QuizEngine((state) => renderizarPasoQuiz(state));
        engine.start();

        DOM_CACHE.prevQuestionBtn?.addEventListener('click', () => engine.prevStep());
        document.getElementById('go-to-form-btn')?.addEventListener('click', () => revealForm());
        
        // Перехват формы лида и передача чистого объекта данных в изолированный метод класса
        document.getElementById('lead-form-adocat')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const inputProvincia = document.getElementById('lead-provincia');
            const inputRole = document.getElementById('lead-role');

            const userData = {
                nombre: DOM_CACHE.inputNombre?.value.trim() || 'No especificat',
                email: DOM_CACHE.inputEmail?.value.trim() || '',
                telefono: DOM_CACHE.inputTelefono?.value.replace(/\D/g, '') || '',
                provincia: inputProvincia ? inputProvincia.value : 'No especificada',
                role: inputRole ? inputRole.value : 'socio'
            };

            const result = await engine.saveLeadToDatabase(userData);
            if (result.success) {
                if (DOM_CACHE.stepCardForm) DOM_CACHE.stepCardForm.classList.add('hidden');
                if (DOM_CACHE.stepCardSuccess) {
                    DOM_CACHE.stepCardSuccess.classList.remove('hidden');
                    setTimeout(() => DOM_CACHE.stepCardSuccess.classList.remove('opacity-0'), 50);
                }
            } else {
                alert('Hi va haver un problema en enviar les dades a Supabase: ' + result.error);
            }
        });

        // Бланк документа: Акт синдикации
        document.getElementById('btn-cta-socio')?.addEventListener('click', () => {
            const htmlSocio = `
                <div class="w-full border-4 border-double border-gray-800 p-8 md:p-10 bg-white font-serif text-gray-900 space-y-6 shadow-sm select-text relative">
                    <div class="absolute right-10 bottom-24 w-32 h-32 border-4 border-dashed border-emerald-700/20 rounded-full flex items-center justify-center text-[10px] font-sans font-black text-emerald-700/20 uppercase tracking-widest rotate-12 pointer-events-none">ADOCAT VALIDAT</div>
                    <div class="flex justify-between items-start border-b-2 border-gray-800 pb-4">
                        <div class="space-y-1 text-left">
                            <h2 class="text-xl md:text-2xl font-black tracking-tight text-gray-900 font-sans uppercase">ASSOCIACIÓ DE DOCENTS OCUPACIONALS DE CATALUNYA</h2>
                            <p class="text-xs font-sans text-gray-500 font-bold uppercase tracking-wider">DEPARTAMENT JURÍDIC I DE SINDICACIÓ — PROTOCOL REGISTRE: #AD-2026/9482</p>
                        </div>
                        <div class="text-right font-sans text-xs text-gray-400">DATA: 12/09/2026</div>
                    </div>
                    <div class="text-center py-2">
                        <h3 class="text-lg md:text-xl font-black uppercase tracking-wide underline decoration-1 underline-offset-4">FULL D'ALTA INTEGRAL I GARANTIA DE DRETS LABORALS</h3>
                    </div>
                    <div class="text-base leading-relaxed space-y-4 font-medium text-justify text-gray-800">
                        <p>Per la present acta oficial, es formalitza l'incorporació del/la docent a la bústia de protecció col·lectiva d'<strong>ADOCAT</strong>. L'associació assumeix formalment la representació i defensa de l'afiliat/da en l'àmbit de la Formació Professional Ocupacional (FPE) a Catalunya.</p>
                        <div class="bg-gray-50 border-l-4 border-gray-800 p-4 font-sans text-sm text-gray-700 space-y-2 rounded-xs">
                            <p><strong>1. ASSESSORAMENT LEGAL REU:</strong> Protecció jurídica directa davant d'incompliments salarials, aplicació errònia de convenis col·lectius i detecció activa de la figura fraudulenta del fals autònom en centres homologats pel SOC.</p>
                            <p><strong>2. CONTROL DE CONTRACTACIÓ:</strong> Auditoria tècnica de les hores lectives, períodes de preparació i processos de subrogació contractual per garantir el covalent de les taules salarials vigents.</p>
                            <p><strong>3. ACCÉS PRIORITARI A RECURSOS:</strong> Incorporació immediata a la borsa de treball interna i dret d'ús de la base de dades comuna de programacions modulars i exàmens validats.</p>
                        </div>
                        <p class="text-sm italic text-gray-600">Es requereix la signatura digital del sol·licitant per activar el protocol d'enllaç de dades amb la Inspecció de Treball. El document PDF original ha tret tramès al correu electrònic facilitat.</p>
                    </div>
                    <div class="pt-8 grid grid-cols-2 gap-4 font-sans text-xs font-bold text-center border-t border-gray-100">
                        <div>
                            <p class="uppercase tracking-wider text-gray-400 mb-6">Signatura de l'Afiliat/da</p>
                            <p class="border-b border-gray-300 mx-auto w-40 pt-2 font-mono font-normal text-gray-400">[Signat Digitalment]</p>
                        </div>
                        <div>
                            <p class="uppercase tracking-wider text-gray-400 mb-6">Departament de Registre ADOCAT</p>
                            <p class="border-b border-gray-300 mx-auto w-40 pt-2 font-mono font-normal text-emerald-700">✓ Verificat Central</p>
                        </div>
                    </div>
                </div>
            `;
            openModal("📄 ACORD DOCUMENTAL DE SINDICACIÓ", htmlSocio);
        });

        // Бланк документа: Сертификат технической оценки
        document.getElementById('btn-cta-colaborar')?.addEventListener('click', () => {
            const inputNombreVal = DOM_CACHE.inputNombre && DOM_CACHE.inputNombre.value.trim() ? DOM_CACHE.inputNombre.value.toUpperCase() : 'DOCENT ENREGISTRAT';
            const htmlCertificat = `
                <div class="w-full border-4 border-double border-gray-800 p-8 md:p-10 bg-white font-serif text-gray-900 space-y-6 shadow-sm text-center relative">
                    <div class="absolute inset-2 border border-gray-200 pointer-events-none"></div>
                    <div class="space-y-2 font-sans relative z-10">
                        <p class="text-xs font-black tracking-widest text-gray-400 uppercase">Generalitat de Catalunya — Àmbit Ensenyament FPE</p>
                        <h2 class="text-xl font-black text-gray-900 uppercase tracking-tight">CERTIFICAT D'AVALUACIÓ TÈCNICA LABORAL</h2>
                        <p class="text-xs font-mono text-gray-400 uppercase">Codi de Verificació Secura (CVS): CVS-ADOCAT-93821-2026</p>
                    </div>
                    <div class="py-6 relative z-10">
                        <p class="text-sm italic font-medium text-gray-700">L'òrgan directiu de l'Associació de Docents Ocupacionals de Catalunya faça constar que:</p>
                        <h3 class="text-xl md:text-3xl font-black tracking-tight text-brand-dark uppercase my-4 font-sans border-b-2 border-gray-800 pb-2 max-w-md mx-auto">${inputNombreVal}</h3>
                        <p class="text-xs font-sans font-bold text-rose-600 uppercase tracking-wider bg-rose-50 px-3 py-1.5 rounded-xs inline-block border border-rose-100">DOCENT EN RISK DE PRECARIETAT LABORAL</p>
                    </div>
                    <div class="text-base leading-relaxed max-w-2xl mx-auto text-justify font-medium text-gray-600 pb-4 border-b border-gray-100">
                        Ha completat satisfactoriament el test de diagnòstic auditat per la plataforma central d'<strong>ADOCAT</strong>. Els indicadors recollits mostren desviaments normatius respecte al règim laboral aplicat en els Certificats de Professionalitat obligatoris, existint indicis racionals de vulneració de drets.
                    </div>
                    <div class="flex justify-between items-center pt-4 font-sans text-xs text-gray-400 font-semibold px-4">
                        <p>Registre de Control: REG-ADOCAT-2026</p>
                        <p class="text-emerald-700 font-bold">✓ Segell de Seguretat Actiu</p>
                    </div>
                </div>
            `;
            openModal("📜 VERIFICACIÓ D'EMISSIÓ DE CERTIFICAT", htmlCertificat);
        });

        document.getElementById('btn-cta-boletin')?.addEventListener('click', function() {
            this.innerHTML = "✓ Subscrit";
            this.className = "w-full bg-emerald-50 text-emerald-700 font-black text-xs uppercase tracking-wider py-3.5 rounded-xs border border-emerald-200 transition-all cursor-default select-none pointer-events-none";
        });

        document.getElementById('btn-reiniciar-quiz')?.addEventListener('click', () => { localStorage.removeItem('adocat_answers_session'); window.location.reload(); });
        document.getElementById('close-cta-modal-btn')?.addEventListener('click', () => closeModal());
        document.getElementById('close-cta-modal-bottom-btn')?.addEventListener('click', () => closeModal());
    }
    
    // ⚡ НАДЁЖНАЯ И ПОСТОЯННАЯ ЛОГИКА ПОДПИСКИ НА НОВОСТИ (API RESEND)
    const ejecutarLogicaSuscripcion = () => {
        const form = document.getElementById('news-letter-form');
        const container = document.getElementById('news-sub-container');
        const inputEmail = document.getElementById('sub-email');

        if (!form || !container || !inputEmail) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            const emailTarget = inputEmail.value.trim();
            const submitBtn = form.querySelector('button[type="submit"]');
            
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "S'està trametent...";
            }

            try {
                const response = await fetch('/api/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: emailTarget }) 
                });

                if (response.ok) {
                    container.innerHTML = `
                        <div class="text-center py-6 space-y-2 animate-fade-in text-brand-dark">
                            <span class="text-3xl">✨</span>
                            <h4 class="text-sm font-black uppercase tracking-tight">Alta registrada correctament</h4>
                            <p class="text-xs text-gray-500 font-medium">Benvingut/da. S'ha tramès un correu de confirmació a la teva bústia.</p>
                        </div>
                    `;
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error API Resend');
                }

            } catch (err) {
                console.error('Error enviant correu:', err.message);
                alert("S'ha produït un error al servidor de correu. Si us plau, torna-ho a provar més tard.");
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Subscriure'm al butlletí &rarr;";
                }
            }
        });
    };

    ejecutarLogicaSuscripcion();

    // ⚡ НАДЁЖНАЯ И ПОСТОЯННАЯ ОТПРАВКА ЖАЛОБ В TABLE COMPLAINTS (SUPABASE)
    const ejecutarLogicaDenuncias = () => {
        const form = document.getElementById('complaint-secure-form');
        const container = document.getElementById('denuncia-form-container');

        if (!form || !container) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            const centreName = document.getElementById('denuncia-centre')?.value.trim();
            const irregularityType = document.getElementById('denuncia-tipus')?.value;
            const description = document.getElementById('denuncia-descripcio')?.value.trim();
            const contactInfo = document.getElementById('denuncia-contacte')?.value.trim() || '-';

            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "S'està enviant de forma segura...";
            }

            try {
                const { error } = await supabase
                    .from('complaints')
                    .insert([
                        { 
                            centre_name: centreName, 
                            irregularity_type: irregularityType, 
                            description: description, 
                            contact_info: contactInfo 
                        }
                    ]);

                if (error) throw error;

                container.innerHTML = `
                    <div class="text-center py-12 space-y-4 animate-fade-in text-brand-dark">
                        <span class="text-5xl">🛡️</span>
                        <h3 class="text-xl font-black uppercase tracking-tight">Alerta enviada de forma segura</h3>
                        <p class="text-sm text-gray-600 font-medium max-w-md mx-auto leading-relaxed">
                            La teva notificació ha estat encriptada i tramesa directament al Departament Jurídic d'ADOCAT. Gràcies per col·laborar en la defensa dels drets del col·lectiu docent.
                        </p>
                    </div>
                `;

            } catch (err) {
                console.error('Supabase complaints error:', err.message);
                alert("S'ha produït un error al desar la denúncia. Si us plau, torna-ho a provar més tard.");
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Enviar Alerta de Forma Segura →";
                }
            }
        });
    };

    ejecutarLogicaDenuncias();
    // ⚡ Управление окном входа администратора
    const abrirModalAdmin = (e) => {
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu) mobileMenu.classList.add('hidden');

        const modalEl = document.getElementById('admin-modal');
        const cardEl = document.getElementById('modal-card');
        const inputEl = document.getElementById('admin-password-input');

        if (modalEl && cardEl) {
            e.preventDefault();
            modalEl.classList.remove('opacity-0', 'pointer-events-none');
            cardEl.classList.remove('scale-95');
            inputEl?.focus();
        } else {
            window.location.href = "/diagnostic?openAdmin=true";
        }
    };

    document.getElementById('open-admin-nav-btn')?.addEventListener('click', abrirModalAdmin);
    document.getElementById('open-admin-mob-btn')?.addEventListener('click', abrirModalAdmin);

    if (window.location.search.includes('openAdmin=true')) {
        const modalEl = document.getElementById('admin-modal');
        const cardEl = document.getElementById('modal-card');
        const inputEl = document.getElementById('admin-password-input');
        
        if (modalEl && cardEl) {
            modalEl.classList.remove('opacity-0', 'pointer-events-none');
            cardEl.classList.remove('scale-95');
            inputEl?.focus();
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    document.getElementById('close-modal-btn')?.addEventListener('click', () => {
        const modalEl = document.getElementById('admin-modal');
        const cardEl = document.getElementById('modal-card');
        modalEl?.classList.add('opacity-0', 'pointer-events-none');
        cardEl?.classList.add('scale-95');
    });

    // ⚡ Проверка пароля и загрузка данных из базы Supabase
    const verificarPassword = async () => {
        if (DOM_CACHE.passwordInput && DOM_CACHE.passwordInput.value === 'adminGRI2026') {
            document.getElementById('login-error-msg')?.classList.add('hidden');
            DOM_CACHE.loginBlock?.classList.add('hidden');
            DOM_CACHE.contentBlock?.classList.remove('hidden');
            
            try {
                const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                listaLeads = data;
                renderizarTabla(filtroRolActual, criterioSortActual, DOM_CACHE.tbody, DOM_CACHE.mobileList);
            } catch (err) { console.error('Supabase error:', err.message); }
        } else {
            document.getElementById('login-error-msg')?.classList.remove('hidden');
            if (DOM_CACHE.passwordInput) { DOM_CACHE.passwordInput.value = ''; DOM_CACHE.passwordInput.focus(); }
        }
    };

    document.getElementById('submit-password-btn')?.addEventListener('click', verificarPassword);
    DOM_CACHE.passwordInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') verificarPassword(); });
    // ⚡ Просмотр детальных ответов лида из таблицы
    const abrirExpedienteRespuestas = async (dbId) => {
        const lead = listaLeads.find(l => String(l.id) === String(dbId));
        if (!lead) return;

        const infoHeader = document.getElementById('ans-modal-lead-info');
        const container = document.getElementById('ans-modal-container');
        const modal = document.getElementById('answers-modal');
        const card = document.getElementById('answers-modal-card');

        if (!container || !modal || !card) return;

        if (infoHeader) infoHeader.textContent = `${lead.nombre || 'Anònim'} (${lead.provincia || 'Barcelona'})`;
        
        container.innerHTML = '';
        const respuestas = lead.respuestas || {};

        if (Object.keys(respuestas).length === 0) {
            container.innerHTML = '<p class="text-sm text-gray-400 py-4 text-center">Aquest usuari no ha deixat respostes registrades.</p>';
        } else {
            Object.keys(respuestas).forEach(key => {
                const itemDiv = document.createElement('div');
                itemDiv.className = "py-3 border-b border-gray-100 text-left";
                itemDiv.innerHTML = `
                    <p class="text-[10px] font-black text-brand-green uppercase tracking-wider mb-0.5">${key.replace(/_/g, ' ')}</p>
                    <p class="text-sm text-brand-dark font-semibold leading-snug">${respuestas[key]}</p>
                `;
                container.appendChild(itemDiv);
            });
        }

        modal.classList.remove('opacity-0', 'pointer-events-none');
        card.classList.remove('scale-95');
    };

    DOM_CACHE.tbody?.addEventListener('click', (e) => {
        const btn = e.target.closest('.view-answers-btn');
        if (!btn) return;
        const dbId = btn.closest('tr')?.getAttribute('data-id');
        if (dbId) abrirExpedienteRespuestas(dbId);
    });

    DOM_CACHE.mobileList?.addEventListener('click', (e) => {
        const btn = e.target.closest('.view-answers-btn');
        if (!btn) return;
        const dbId = btn.closest('div[data-id]')?.getAttribute('data-id');
        if (dbId) abrirExpedienteRespuestas(dbId);
    });

    const cerrarExpediente = () => {
        const modal = document.getElementById('answers-modal');
        const card = document.getElementById('answers-modal-card');
        modal?.classList.add('opacity-0', 'pointer-events-none');
        card?.classList.add('scale-95');
    };
    document.getElementById('close-answers-btn')?.addEventListener('click', cerrarExpediente);
    document.getElementById('close-answers-bottom-btn')?.addEventListener('click', cerrarExpediente);

        document.querySelectorAll('.filter-role-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-role-btn').forEach(b => {
                b.className = "px-4 py-2 text-xs font-extrabold rounded-xs border-2 border-gray-200 bg-white text-gray-600 hover:border-gray-300 cursor-pointer transition-all";
            });
            this.className = "px-4 py-2 text-xs font-extrabold rounded-xs border-2 border-brand-green bg-brand-green text-white cursor-pointer transition-all";
            
            filtroRolActual = this.getAttribute('data-role') || 'all';

            // Умное переключение: если мы были в жалобах или поддержке, 
            // принудительно возвращаем админку на вкладку пользователей (leads)
            if (pestañaActual !== 'leads') {
                pestañaActual = ''; // Сбрасываем старый флаг, чтобы сработал триггер
                cambiarPestaña('leads');
            } else {
                renderizarTabla(filtroRolActual, criterioSortActual, DOM_CACHE.tbody, DOM_CACHE.mobileList);
            }
        });
    });

    document.getElementById('sort-leads-select')?.addEventListener('change', function() {
        criterioSortActual = this.value;
        renderizarTabla(filtroRolActual, criterioSortActual, DOM_CACHE.tbody, DOM_CACHE.mobileList);
    });

    document.getElementById('export-csv-btn')?.addEventListener('click', ejecutarExportacionCSV);
       // ⚡ Переключение табов администратора (Complaints / Support)
    const btnComplaints = document.getElementById('tab-btn-complaints');
    const btnSupport = document.getElementById('tab-btn-support');

    const cambiarPestaña = async (nuevaPestaña) => {
        if (pestañaActual === nuevaPestaña) return;
        pestañaActual = nuevaPestaña;

        const headerstr = document.querySelector('#admin-modal table thead tr');

        [btnComplaints, btnSupport].forEach(b => {
            if (b) {
                b.classList.replace('bg-brand-green', 'bg-white');
                b.classList.replace('text-white', 'text-gray-600');
                b.classList.replace('border-brand-green', 'border-gray-200');
            }
        });

        if (pestañaActual === 'leads') {
            if (headerstr) {
                headerstr.innerHTML = `
                    <th class="p-4">Data</th>
                    <th class="p-4">Nom i Província</th>
                    <th class="p-4">Email</th>
                    <th class="p-4">Telèfon</th>
                    <th class="p-4">Rol Actiu</th>
                    <th class="p-4 text-center">Expedient</th>
                `;
            }
            renderizarTabla(filtroRolActual, criterioSortActual, DOM_CACHE.tbody, DOM_CACHE.mobileList);

        } else if (pestañaActual === 'complaints') {
            btnComplaints?.classList.replace('bg-white', 'bg-brand-green');
            btnComplaints?.classList.replace('text-gray-600', 'text-white');
            btnComplaints?.classList.replace('border-gray-200', 'border-brand-green');

            if (headerstr) {
                headerstr.innerHTML = `
                    <th class="p-4">Data</th>
                    <th class="p-4">Centre de Formació</th>
                    <th class="p-4">Tipus d'Irregularitat</th>
                    <th class="p-4">Contacte Opcional</th>
                    <th class="p-4 text-right">Accions</th>
                `;
            }

            try {
                const { data, error } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                listaComplaints = data.filter(c => !c.centre_name || !c.centre_name.includes('CONSULTA AFILIAT:'));
                renderizarComplaints(DOM_CACHE.tbody, DOM_CACHE.mobileList);
            } catch (err) { console.error('Error carregant denúncies:', err.message); }

        } else if (pestañaActual === 'support') {
            btnSupport?.classList.replace('bg-white', 'bg-brand-green');
            btnSupport?.classList.replace('text-gray-600', 'text-white');
            btnSupport?.classList.replace('border-gray-200', 'border-brand-green');

            if (headerstr) {
                headerstr.innerHTML = `
                    <th class="p-4">Data</th>
                    <th class="p-4">Nom de l'Afiliat</th>
                    <th class="p-4">Tipus de Consulta</th>
                    <th class="p-4">Identificador i Correu</th>
                    <th class="p-4 text-right">Accions</th>
                `;
            }

            try {
                const { data, error } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                listaComplaints = data.filter(c => c.centre_name && c.centre_name.includes('CONSULTA AFILIAT:'));
                renderizarComplaints(DOM_CACHE.tbody, DOM_CACHE.mobileList);
            } catch (err) { console.error('Error carregant consultes:', err.message); }
        }
    };

    btnComplaints?.addEventListener('click', () => cambiarPestaña('complaints'));
    btnSupport?.addEventListener('click', () => cambiarPestaña('support'));


    // Просмотр детального описания жалоб/обращений (Интеллектуальные заголовки)
    const abrirDetalleDenuncia = (compId) => {
        const comp = listaComplaints.find(c => String(c.id) === String(compId));
        if (!comp) return;

        const infoHeader = document.getElementById('ans-modal-lead-info');
        const container = document.getElementById('ans-modal-container');
        const modal = document.getElementById('answers-modal');
        const card = document.getElementById('answers-modal-card');

        if (!container || !modal || !card) return;

        const esConsulta = comp.centre_name && comp.centre_name.includes('CONSULTA AFILIAT:');

        if (infoHeader) {
            if (esConsulta) {
                const nombreLimpio = comp.centre_name.replace('CONSULTA AFILIAT:', '').trim();
                infoHeader.textContent = `CONSULTA DE L'AFILIAT: ${nombreLimpio}`;
            } else {
                infoHeader.textContent = `DENÚNCIA: ${comp.centre_name || 'Centre Desconegut'}`;
            }
        }

        const labelType = esConsulta ? "Tipus de Consulta" : "Tipus d'Irregularitat";
        const labelDesc = esConsulta ? "Detalls de la consulta de l'afiliat" : "Descripció detallada del formador/a";
        const labelContact = esConsulta ? "Dades d'Identificació de l'Afiliat" : "Dades de Contacte Deixades";

        const textType = esConsulta 
            ? comp.irregularity_type?.toUpperCase().replace('SUPPORT-', '').replace(/-/g, ' ') 
            : comp.irregularity_type?.toUpperCase().replace(/-/g, ' ');

        const typeClass = esConsulta ? "text-sm text-blue-600 font-black uppercase tracking-tight" : "text-sm text-rose-600 font-black uppercase tracking-tight";

        container.innerHTML = `
            <div class="py-4 text-left border-b border-gray-100">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">${labelType}</p>
                <p class="${typeClass}">${textType || 'ALTRES'}</p>
            </div>
            <div class="py-4 text-left border-b border-gray-100">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">${labelDesc}</p>
                <p class="text-sm text-brand-dark font-medium leading-relaxed text-justify whitespace-pre-line">${comp.description}</p>
            </div>
            <div class="py-4 text-left">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">${labelContact}</p>
                <p class="text-sm font-mono font-bold text-gray-700">${comp.contact_info || '-'}</p>
            </div>
        `;
        
        modal.classList.remove('opacity-0', 'pointer-events-none');
        card.classList.remove('scale-95');
    };

    DOM_CACHE.tbody?.addEventListener('click', (e) => {
        const btn = e.target.closest('.view-complaint-btn');
        const dbId = btn?.closest('tr')?.getAttribute('data-id');
        if (dbId) abrirDetalleDenuncia(dbId);
    });

    DOM_CACHE.mobileList?.addEventListener('click', (e) => {
        const btn = e.target.closest('.view-complaint-btn');
        const dbId = btn?.closest('div[data-id]')?.getAttribute('data-id');
        if (dbId) abrirDetalleDenuncia(dbId);
    });
});
