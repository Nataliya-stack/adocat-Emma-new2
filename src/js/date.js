// 📜 CONFIGURACIÓ DE PREGUNTES I SEGMENTACIÓ ADOCAT
export const QUIZ_QUESTIONS = [
    { 
        id: "trabajas_soc", 
        text: "¿Treballes actualment impartint formació per al SOC (Servei d'Ocupació de Catalunya)?", 
        options: ["Sí", "No"] 
    },
    { 
        id: "impartes_cp", 
        text: "¿Imparteixes Certificats de Professionalitat (CP) de manera habitual?", 
        options: ["Sí", "No"] 
    },
    { 
        id: "regimen", 
        text: "¿Quin és el teu règim laboral principal en la docència?", 
        options: ["Autònom", "Asalariat", "En cerca de centre"] 
    },
    { 
        id: "modalidad", 
        text: "¿Quina modalitat d'ensenyament imparteixes preferentment?", 
        options: ["Presencial", "Teleformació", "Mixta"] 
    },
    { 
        id: "experiencia", 
        text: "¿Quants anys d'experiència tens com a docent ocupacional?", 
        options: ["Menys de 2 anys", "De 2 a 5 anys", "Més de 5 anys"] 
    },
    { 
        id: "incidencias", 
        text: "¿Has patit o estàs patint incidències laborals o incompliments en el sector?", 
        options: [
            "Sí, retards constants en els pagaments", 
            "Sí, excés d'hores treballades no pagades", 
            "Sí, manca greu de material didàctic als centres", 
            "No, cap incidència destacable"
        ] 
    }
];

export const DEMO_USER_PROFILE = {
  nombre: "Carles Quintana i Serra",
  email: "c.quintana@correu.cat",
  provincia: "Girona",
  status: "Soci Actiu",
  statusClass: "bg-emerald-50 text-brand-green border-emerald-100",
  idAfiliat: "AD-2026-8492",
  dataAlta: "14/02/2026"
};
