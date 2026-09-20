
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return Response.json(
        { error: "Telegram config missing" },
        { status: 500 }
      );
    }

    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: "HTML",
        }),
      }
    );

    const data = await res.json();
    return Response.json(data, { status: res.ok ? 200 : 500 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
