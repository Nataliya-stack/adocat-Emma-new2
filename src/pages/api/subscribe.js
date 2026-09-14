export const prerender = false;
export const POST = async ({ request }) => {
  try {
    // Получаем email, который пользователь ввел на фронтенде
    const { email } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ message: 'Email requerit' }), { status: 400 });
    }

    // Делаем защищенный запрос от имени сервера Netlify к шлюзу Resend
    // УДАЛИТЕ ПРОБЕЛЫ в ссылке ниже при вставке в проект!
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'info@nataliyadev.com',
        to: email,
        subject: "✨ Benvingut/da al butlletí oficial d'ADOCAT",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; color: #111827;">
            <h2 style="font-size: 20px; font-weight: 900; text-transform: uppercase; color: #15803d; border-bottom: 2px solid #111827; padding-bottom: 10px;">ASSOCIACIÓ DE DOCENTS OCUPACIONALS DE CATALUNYA</h2>
            <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">Benvingut/da, <strong>docent</strong>.</p>
            <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">Confirmem que la teva alta al butlletí oficial s'ha completat amb èxit. A partir d'ara rebràs de forma prioritària tots els nostres comunicats legals, alertes d'inspeccions de treball i actualitzacions de les taules salarials de la FP a Catalunya.</p>
            <div style="margin-top: 24px; padding: 15px; background-color: #f9fafb; border-left: 4px solid #111827; font-size: 13px; color: #374151;">
              <strong>Recorda:</strong> Pots gestionar la teva vinculació, generar els teus certificats de risc laboral o sol·licitar suport jurídic personalitzat a la teva àrea privada de la plataforma.
            </div>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 10px;">ADOCAT — Associació de Docents Ocupacionals de Catalunya<br>Departament de Comunicació i Premsa</p>
          </div>
        `
      })
    });

    if (resendResponse.ok) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } else {
      const errorData = await resendResponse.json();
      return new Response(JSON.stringify({ message: errorData.message || 'Resend error' }), { status: 500 });
    }

  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), { status: 500 });
  }
};
