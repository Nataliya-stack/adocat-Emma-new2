import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://pbxmhrwhebegnejjzksp.supabase.co";
const supabaseAnonKey = "sb_publishable_Fg8_-r_e4Ef0rQDIzqWYyg_oK9Rsek2";

let supabase;
let currentUserName = "DOCENT AFILIAT";
let btnSocio = null;
let btnCertificat = null;
let btnNotificar = null;

if (typeof window !== 'undefined') {
  if (!window.supabaseClient) {
    window.supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  supabase = window.supabaseClient;

  // Объявляем константы DOM один раз в самом верху области видимости window
  const authContainer = document.getElementById('auth-container');
  const profileContainer = document.getElementById('profile-container');
  const userWelcome = document.getElementById('user-welcome');
  const userIdEl = document.getElementById('user-id');
  const userEmailEl = document.getElementById('user-email');
  const logoutBtn = document.getElementById('logout-btn');

  const compteModal = document.getElementById('compte-modal');
  const compteModalCard = document.getElementById('compte-modal-card');
  const compteModalContent = document.getElementById('compte-modal-content');
  const closeCompteModal = document.getElementById('close-compte-modal');
  const compteModalBg = document.getElementById('compte-modal-bg');

  // Функция автоматического переключения экранов
    // Функция обновления интерфейса и принудительной активации кнопок после входа
  const actualizarInterfaz = (session) => {
    if (session?.user) {
      const user = session.user;
      currentUserName = user.user_metadata?.nombre || user.email.split('@')[0].toUpperCase();

      if (userWelcome) userWelcome.textContent = `Benvingut, ${currentUserName}`;
      if (userIdEl) userIdEl.textContent = user.id.substring(0, 8).toUpperCase();
      if (userEmailEl) userEmailEl.textContent = user.email;

      authContainer?.classList.add('hidden');
      profileContainer?.classList.remove('hidden');

      // Инициализируем клики документов и связи ТОЛЬКО после того, как контейнер стал видимым
      initCabinetButtons();
    } else {
      profileContainer?.classList.add('hidden');
      authContainer?.classList.remove('hidden');
    }
  };

  // Выносим активацию всех внутренних кнопок кабинета в изолированную функцию
  const initCabinetButtons = () => {
    btnSocio = document.getElementById('btn-cta-socio');
    btnCertificat = document.getElementById('btn-cta-colaborar');
    btnNotificar = document.getElementById('btn-notificar-canvi');

  // Если кнопок на текущей странице нет — мгновенно выходим
    if (!btnSocio || !btnCertificat || !btnNotificar) return;
        // Кнопка 1: Полноценное юридическое соглашение на страницу (Acord de Sindicació)
    btnSocio?.addEventListener('click', () => {
      const currentId = supabase.auth.session ? supabase.auth.session().user.id.substring(0,8).toUpperCase() : 'AD-2026';
      const htmlSocio = `
        <div class="w-full border-4 border-double border-gray-800 p-8 md:p-10 bg-white font-serif text-gray-900 space-y-6 shadow-sm select-text relative text-left max-w-2xl mx-auto leading-relaxed text-xs md:text-sm">
            <div class="absolute right-10 bottom-36 w-36 h-36 border-4 border-dashed border-emerald-700/20 rounded-full flex items-center justify-center text-[11px] font-sans font-black text-emerald-700/20 uppercase tracking-widest rotate-12 pointer-events-none">ADOCAT SERVEI JURÍDIC</div>
            
            <div class="flex justify-between items-start border-b-2 border-gray-800 pb-4 font-sans">
                <div class="space-y-1">
                    <h2 class="text-sm font-black text-gray-900 uppercase">ASSOCIACIÓ DE DOCENTS OCUPACIONALS DE CATALUNYA</h2>
                    <p class="text-[9px] text-gray-400 font-bold uppercase tracking-wider">REGISTRE DE SINDICACIÓ ACTIVA — EXPEDIENT: #AD-${currentId}/26</p>
                </div>
                <div class="text-right text-[10px] text-gray-400 shrink-0 font-bold">DATA D'EMISSIÓ:<br>11/09/2026</div>
            </div>

            <div class="text-center py-2">
                <h3 class="text-xs md:text-sm font-black uppercase tracking-wide underline decoration-1 underline-offset-4 font-sans">ACORD ESTRATEGIC DE PROTECCIÓ JURÍDICA I DEFENSA DE DRETS LABORALS</h3>
            </div>

            <div class="space-y-4 text-gray-800 text-justify font-medium">
                <p><strong>REUNITS:</strong> D'una part, el <strong>DEPARTAMENT JURÍDIC D'ADOCAT</strong>, en representació de l'Associació de Docents Ocupacionals de Catalunya, i de l'altra, el/la docent afiliat/da <strong>${currentUserName.toUpperCase()}</strong>, amb accés confirmat a la bústia de blindatge col·lectiu.</p>
                
                <p><strong>ESTIPULACIONS LEGALS I COMPROMISOS REUS:</strong></p>
                
                <div class="space-y-3 pl-2 border-l-2 border-gray-300">
                    <p><strong>PRIMER. OBJECTE DEL BLINDATGE:</strong> ADOCAT assumeix formalment la representació, mediació i assessoria jurídica del/la docent davant de qualsevol modificació contractual substancial, aplicació incorrecta de les taules salarials vigents de la FP Ocupacional o inspeccions del SOC.</p>
                    
                    <p><strong>SEGON. DRETS DE L'AFILIAT/DA:</strong> El/la docent té dret a l'auditoria permanent de les seves hores lectives i períodes de preparació, així com a l'activació del protocol d'alerta davant la detecció de la figura fraudulenta del fals autònom en centres homologats per la Generalitat de Catalunya.</p>
                    
                    <p><strong>TERCER. OBLIGACIONS I NOTIFICACIONS:</strong> L'afiliat/da es compromet a notificar de forma immediata al seu assessor qualsevol pressió corporativa, retard en els pagaments o modificació de mòduls formatius a través de la bústia segura del gabinet privat.</p>
                    
                    <p><strong>QUART. CONFIDENCIALITAT ABSOLUTA:</strong> Totes les dades creuades, expedients oberts i comunicacions queden sota el secret professional i la protecció del protocol d'encriptació central d'ADOCAT, essent directament oposables davant la Inspecció de Treball.</p>
                </div>

                <p class="text-[11px] italic text-gray-500 font-sans">Aquest document és una acta oficial digitalitzada d'alta integral. L'activació de la signatura criptogràfica central s'ha completat correctament mitjançant la verificació de dades amb el servidor Supabase.</p>
            </div>

            <div class="pt-8 grid grid-cols-2 gap-6 font-sans text-[10px] font-bold text-center border-t border-gray-100">
                <div>
                    <p class="uppercase tracking-wider text-gray-400 mb-6">Signatura de l'Afiliat/da</p>
                    <p class="border-b border-gray-200 mx-auto w-36 pt-2 font-mono font-normal text-gray-400">[Signat Electrònicament]</p>
                </div>
                <div>
                    <p class="uppercase tracking-wider text-gray-400 mb-6">Departament de Registre ADOCAT</p>
                    <p class="border-b border-gray-200 mx-auto w-36 pt-2 font-mono font-normal text-emerald-700">✓ Validat Centralment</p>
                </div>
            </div>
        </div>
      `;
      openLocalModal(htmlSocio);
    });

    // Кнопка 2: Динамический исторический сертификат изменения рисков во времени
    btnCertificat?.addEventListener('click', () => {
      const htmlCertificat = `
        <div class="w-full border-4 border-double border-gray-800 p-8 md:p-10 bg-white font-serif text-gray-900 space-y-6 shadow-sm relative text-left max-w-2xl mx-auto leading-relaxed text-xs md:text-sm">
            <div class="space-y-2 font-sans border-b-2 border-gray-800 pb-4">
                <p class="text-[10px] font-black tracking-widest text-gray-400 uppercase">Generalitat de Catalunya — Àmbit Ensenyament FPE</p>
                <h2 class="text-base md:text-lg font-black text-gray-900 uppercase tracking-tight">CERTIFICAT D'EVOLUCIÓ DE RISC I HISTÒRIC LABORAL</h2>
                <p class="text-[9px] font-mono text-gray-400 uppercase">Codi de Verificació Segura (CVS): CVS-ADOCAT-HIST-2026</p>
            </div>

            <div class="py-2 text-justify">
                <p class="text-xs italic font-medium text-gray-700">L'òrgan directiu de l'Associació de Docents Ocupacionals de Catalunya fa constar l'historial tècnic auditat del/la docent:</p>
                <h3 class="text-lg md:text-xl font-black tracking-tight text-brand-dark uppercase my-3 font-sans border-b border-gray-300 pb-1 max-w-md">${currentUserName.toUpperCase()}</h3>
            </div>

            <!-- 📊 АДАПТИВНАЯ ХРОНОЛОГИЯ ИЗМЕНЕНИЙ РИСКА -->
            <div class="space-y-3 font-sans">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-wider">Cronologia de Seguretat Normativa Contractual:</p>
                
                <div class="border border-gray-200 rounded-xs overflow-hidden">
                    <!-- НАСТОЯЩАЯ ТАБЛИЦА (ПОКАЗЫВАЕТСЯ ТОЛЬКО НА ПК) -->
                    <table class="hidden md:table w-full text-left text-[11px] font-semibold text-gray-600 bg-gray-50/50">
                        <thead class="bg-gray-100 text-gray-800 text-[10px] uppercase font-black border-b border-gray-200">
                            <tr>
                                <th class="p-2.5 whitespace-nowrap">Període / Data</th>
                                <th class="p-2.5">Estat contractual SOC</th>
                                <th class="p-2.5 text-center whitespace-nowrap">Nivell de Risc</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200 bg-white">
                            <tr>
                                <td class="p-2.5 font-mono text-gray-400 whitespace-nowrap">12/01/2026</td>
                                <td class="p-2.5">Alta Regim General — Contracte Inicial Consolidat</td>
                                <td class="p-2.5 text-center"><span class="px-1.5 py-0.5 bg-emerald-50 text-brand-green border border-emerald-100 text-[9px] font-black rounded-xs whitespace-nowrap">✓ PROTEGIT</span></td>
                            </tr>
                            <tr>
                                <td class="p-2.5 font-mono text-gray-400 whitespace-nowrap">04/05/2026</td>
                                <td class="p-2.5">Canvi a Mòdul Autònom — Sospita de Fals Autònom</td>
                                <td class="p-2.5 text-center"><span class="px-1.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 text-[9px] font-black rounded-xs whitespace-nowrap">⚠️ RISC CRÍTIC</span></td>
                            </tr>
                            <tr>
                                <td class="p-2.5 font-mono text-gray-400 whitespace-nowrap">11/09/2026</td>
                                <td class="p-2.5">Blindatge Actiu ADOCAT — Intervenció Jurídica</td>
                                <td class="p-2.5 text-center"><span class="px-1.5 py-0.5 bg-blue-50 text-brand-blue border border-blue-100 text-[9px] font-black rounded-xs whitespace-nowrap">🛡️ AUDITAT</span></td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- КАРТОЧКИ ДЛЯ МОБИЛЬНЫХ (ПОКАЗЫВАЮТСЯ ТОЛЬКО НА ТЕЛЕФОНАХ) -->
                    <div class="block md:hidden bg-white divide-y divide-gray-100 p-1 text-[11px]">
                        <!-- Строка 1 -->
                        <div class="p-3 space-y-2">
                            <div class="flex justify-between items-center">
                                <span class="font-mono text-gray-400 font-bold">12/01/2026</span>
                                <span class="px-1.5 py-0.5 bg-emerald-50 text-brand-green border border-emerald-100 text-[9px] font-black rounded-xs">✓ PROTEGIT</span>
                            </div>
                            <div class="text-gray-700 font-medium">Alta Regim General — Contracte Inicial Consolidat</div>
                        </div>
                        <!-- Строка 2 -->
                        <div class="p-3 space-y-2">
                            <div class="flex justify-between items-center">
                                <span class="font-mono text-gray-400 font-bold">04/05/2026</span>
                                <span class="px-1.5 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 text-[9px] font-black rounded-xs">⚠️ RISC CRÍTIC</span>
                            </div>
                            <div class="text-gray-700 font-medium">Canvi a Mòdul Autònom — Sospita de Fals Autònom</div>
                        </div>
                        <!-- Строка 3 -->
                        <div class="p-3 space-y-2">
                            <div class="flex justify-between items-center">
                                <span class="font-mono text-gray-400 font-bold">11/09/2026</span>
                                <span class="px-1.5 py-0.5 bg-blue-50 text-brand-blue border border-blue-100 text-[9px] font-black rounded-xs">🛡️ AUDITAT</span>
                            </div>
                            <div class="text-gray-700 font-medium">Blindatge Actiu ADOCAT — Intervenció Jurídica</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="text-xs leading-relaxed text-gray-600 text-justify pt-2">
                <strong>INDICADORS DE CONTROL:</strong> Els desviaments normatius detectats en els Certificats de Professionalitat obligatoris queden registrats de forma permanent en l'historial de l'afiliat. Qualsevol variació posterior s'actualitzarà automàticament en aquest panell central.
            </div>

            <div class="flex justify-between items-center pt-4 font-sans text-[10px] text-gray-400 font-semibold border-t border-gray-100">
                <p>Registre Auditat Central: REG-ADOCAT-2026</p>
                <p class="text-emerald-700 font-bold">✓ Segell de Seguretat Històric Actiu</p>
            </div>
        </div>
      `;
      openLocalModal(htmlCertificat);
    });

        // Кнопка 3: Связь с асессором / Сообщить об изменениях (Исправлено под Supabase v2)
    btnNotificar?.addEventListener('click', (e) => {
      e.preventDefault();
      const htmlSupport = `
        <div class="space-y-4 text-left">
          <div class="border-b border-gray-100 pb-3">
            <span class="text-[10px] font-black uppercase text-brand-green bg-emerald-50 px-2 py-0.5 rounded-full tracking-wider inline-block">Suport Tècnic i Jurídic</span>
            <h3 class="text-lg font-black uppercase tracking-tight text-brand-dark mt-1">Notificar Canvi Contractual / Consulta</h3>
          </div>
          
          <form id="support-secure-form" class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase tracking-wider text-gray-400 block ml-1">Tipus de Consulta</label>
              <select id="support-type" required class="w-full p-3 bg-gray-50 border border-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-brand-dark focus:bg-white transition-all">
                <option value="contracte">Modificació d'Hores / Contracte</option>
                <option value="salari">Problemes amb Taules Salarials / Pagaments</option>
                <option value="incidencia">Incidència Activa amb el SOC / Centre</option>
                <option value="altres">Altres consultes al Departament Jurídic</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase tracking-wider text-gray-400 block ml-1">Descripció detallada de la teva situació</label>
              <textarea id="support-message" required rows="4" class="w-full p-3 bg-gray-50 border border-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-brand-dark focus:bg-white transition-all" placeholder="Explica breument quins canvis s'han produït..."></textarea>
            </div>

            <button type="submit" id="support-submit-btn" class="w-full bg-brand-dark hover:bg-black text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all cursor-pointer shadow-md text-center">
              Enviar Missatge de Forma Segura →
            </button>
          </form>
        </div>
      `;
      openLocalModal(htmlSupport);

      const supportForm = document.getElementById('support-secure-form');
      supportForm?.addEventListener('submit', async (submitEvent) => {
        submitEvent.preventDefault();
        
        const type = document.getElementById('support-type').value;
        const msg = document.getElementById('support-message').value.trim();
        const submitBtn = document.getElementById('support-submit-btn');

        if (submitBtn) {
          submitBtn.setAttribute('disabled', 'true');
          submitBtn.textContent = "S'està enviant...";
        }

        try {
          // Безопасное получение текущей сессии по стандартам Supabase v2
          const { data: { session } } = await supabase.auth.getSession();
          const user = session?.user;

          const { error } = await supabase
            .from('complaints')
            .insert([
              { 
                centre_name: `CONSULTA AFILIAT: ${currentUserName}`, 
                irregularity_type: `SUPPORT-${type.toUpperCase()}`, 
                description: msg, 
                contact_info: `ID: ${user?.id?.substring(0,8) || 'AUTH-USER'} | ${user?.email || 'Email verified'}`
              }
            ]);

          if (error) throw error;

          if (compteModalContent) {
            compteModalContent.innerHTML = `
              <div class="text-center py-8 space-y-3">
                <span class="text-4xl">🛡️</span>
                <h4 class="text-base font-black uppercase tracking-tight text-brand-dark">Consulta Tramesa Correctament</h4>
                <p class="text-xs text-gray-500 font-medium max-w-sm mx-auto">El teu assessor jurídic d'ADOCAT ha rebut la notificació. Es posarà en contacte amb tu de forma prioritària.</p>
              </div>
            `;
          }
        } catch (err) {
          console.error('Support error:', err.message);
          alert('Error en enviar la consulta.');
          if (submitBtn) {
            submitBtn.removeAttribute('disabled');
            submitBtn.textContent = "Enviar Missatge de Forma Segura →";
          }
        }
      });
    });
  };

  // Проверка текущей сессии при загрузке
  supabase.auth.getSession().then(({ data: { session } }) => {
    actualizarInterfaz(session);
  });

  // Отслеживание входа/выхода в реальном времени
  supabase.auth.onAuthStateChange((_event, session) => {
    actualizarInterfaz(session);
  });

  // Глобальный перехват отправки формы (Event Delegation)
  document.addEventListener('submit', async (e) => {
    const targetForm = e.target;
    
    if (targetForm && targetForm.id === 'auth-form') {
      e.preventDefault();
      e.stopPropagation();

      const emailInput = document.getElementById('auth-email');
      const passwordInput = document.getElementById('auth-password');
      const authError = document.getElementById('auth-error');
      const submitBtn = document.getElementById('auth-submit-btn');

      if (authError) authError.classList.add('hidden');

      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value.trim() : '';

      console.log('Attempting login for:', email);

      if (submitBtn) {
        submitBtn.setAttribute('disabled', 'true');
        submitBtn.textContent = "Processant...";
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (error) throw error;
        console.log('Login successful:', data);

      } catch (err) {
        console.error('Supabase Auth Error:', err.message);
        if (authError) {
          authError.textContent = `Error: ${err.message}`;
          authError.classList.remove('hidden');
        }
      } finally {
        if (submitBtn) {
          submitBtn.removeAttribute('disabled');
          submitBtn.textContent = "Entrar a l'Àrea Privada";
        }
      }
    }
  });

  // Выход из аккаунта
  logoutBtn?.addEventListener('click', async () => {
    await supabase.auth.signOut();
  });

  // --- УПРАВЛЕНИЕ ЛОКАЛЬНЫМИ МОДАЛЬНЫМИ ОКНАМИ ДЛЯ ДОКУМЕНТОВ ---
  const openLocalModal = (contentHtml) => {
    if (!compteModal || !compteModalCard || !compteModalContent) return;
    compteModalContent.innerHTML = contentHtml;
    compteModal.classList.remove('opacity-0', 'pointer-events-none');
    compteModalCard.classList.remove('scale-95');
  };

  const closeLocalModalFunc = () => {
    compteModal?.classList.add('opacity-0', 'pointer-events-none');
    compteModalCard?.classList.add('scale-95');
  };

  closeCompteModal?.addEventListener('click', closeLocalModalFunc);
  compteModalBg?.addEventListener('click', closeLocalModalFunc);

  // Генерация Acord de Sindicació
  document.getElementById('btn-cta-socio')?.addEventListener('click', () => {
    const htmlSocio = `
      <div class="w-full border-4 border-double border-gray-800 p-6 md:p-8 bg-white font-serif text-gray-900 space-y-6 shadow-sm select-text relative">
          <div class="absolute right-6 bottom-24 w-32 h-32 border-4 border-dashed border-emerald-700/20 rounded-full flex items-center justify-center text-[10px] font-sans font-black text-emerald-700/20 uppercase tracking-widest rotate-12 pointer-events-none">ADOCAT VALIDAT</div>
          <div class="flex justify-between items-start border-b-2 border-gray-800 pb-4">
              <div class="space-y-1 text-left">
                  <h2 class="text-base md:text-lg font-black tracking-tight text-gray-900 font-sans uppercase">ASSOCIACIÓ DE DOCENTS OCUPACIONALS DE CATALUNYA</h2>
                  <p class="text-[10px] font-sans text-gray-500 font-bold uppercase tracking-wider">DEPARTAMENT JURÍDIC — REGISTRE: #AD-2026/9482</p>
              </div>
          </div>
          <div class="text-center py-1">
              <h3 class="text-sm md:text-base font-black uppercase tracking-wide underline decoration-1 underline-offset-4">FULL D'ALTA INTEGRAL I GARANTIA DE DRETS LABORALS</h3>
          </div>
          <div class="text-xs leading-relaxed space-y-3 font-medium text-justify text-gray-800">
              <p>Per la present acta oficial, es formalitza l'incorporació del/la docent <strong>${currentUserName.toUpperCase()}</strong> a la bústia de protecció col·lectiva d'<strong>ADOCAT</strong>.</p>
          </div>
          <div class="pt-6 grid grid-cols-2 gap-4 font-sans text-[10px] font-bold text-center border-t border-gray-100">
              <div><p class="border-b border-gray-300 mx-auto w-32 pt-2 font-mono font-normal text-gray-400">[Signat Digitalment]</p></div>
              <div><p class="border-b border-gray-300 mx-auto w-32 pt-2 font-mono font-normal text-emerald-700">✓ Verificat Central</p></div>
          </div>
      </div>
    `;
    openLocalModal(htmlSocio);
  });

  // Генерация Certificat Tècnic Laboral
  document.getElementById('btn-cta-colaborar')?.addEventListener('click', () => {
    const htmlCertificat = `
      <div class="w-full border-4 border-double border-gray-800 p-6 md:p-8 bg-white font-serif text-gray-900 space-y-6 shadow-sm text-center relative">
          <div class="space-y-1 font-sans">
              <p class="text-[10px] font-black tracking-widest text-gray-400 uppercase">Generalitat de Catalunya — Àmbit Ensenyament FPE</p>
              <h2 class="text-base font-black text-gray-900 uppercase tracking-tight">CERTIFICAT D'AVALUACIÓ TÈCNICA LABORAL</h2>
          </div>
          <div class="py-4">
              <p class="text-xs italic font-medium text-gray-700">L'òrgan directiu de l'Associació de Docents Ocupacionals de Catalunya fa constar que:</p>
              <h3 class="text-lg md:text-xl font-black tracking-tight text-brand-dark uppercase my-2 font-sans border-b-2 border-gray-800 pb-1 max-w-xs mx-auto">${currentUserName.toUpperCase()}</h3>
              <p class="text-[10px] font-sans font-bold text-rose-600 uppercase tracking-wider bg-rose-50 px-2 py-1 rounded-xs inline-block border border-rose-100">DOCENT EN RISK DE PRECARIETAT LABORAL</p>
          </div>
      </div>
    `;
    openLocalModal(htmlCertificat);
  });
}
