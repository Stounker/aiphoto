/**
 * Cloudflare Worker: Transparent Reverse Proxy for Telegram Bot API
 * Позволяет 100% стабильно обходить любые блокировки api.telegram.org в РФ без VPN и аренды серверов.
 * Бесплатный тариф Cloudflare: до 100 000 запросов в день.
 *
 * ИНСТРУКЦИЯ ПО РАЗВЁРТЫВАНИЮ ЗА 1 МИНУТУ:
 * 1. Зайдите в личный кабинет Cloudflare (dash.cloudflare.com)
 * 2. Перейдите в раздел "Workers & Pages" -> нажмите кнопку "Create application" -> "Create Worker"
 * 3. Назовите воркер (например: ai-nikolaev-tg) и нажмите "Deploy"
 * 4. Нажмите "Edit code", удалите всё и вставьте код из этого файла
 * 5. Нажмите "Deploy" в правом верхнем углу
 * 6. Скопируйте полученный URL (например: https://ai-nikolaev-tg.username.workers.dev)
 * 7. В файле index.html вставьте этот URL в константу CUSTOM_TG_PROXY:
 *    const CUSTOM_TG_PROXY = "https://ai-nikolaev-tg.username.workers.dev";
 */

export default {
  async fetch(request, env, ctx) {
    // Предварительный CORS-запрос браузера
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Max-Age": "86400"
        }
      });
    }

    const url = new URL(request.url);
    url.hostname = "api.telegram.org";

    const newHeaders = new Headers(request.headers);
    newHeaders.delete("host");

    const modifiedRequest = new Request(url.toString(), {
      method: request.method,
      headers: newHeaders,
      body: request.method === "GET" || request.method === "HEAD" ? null : request.body,
      redirect: "follow"
    });

    try {
      const response = await fetch(modifiedRequest);
      const newResponse = new Response(response.body, response);
      newResponse.headers.set("Access-Control-Allow-Origin", "*");
      newResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      newResponse.headers.set("Access-Control-Allow-Headers", "*");
      return newResponse;
    } catch (err) {
      return new Response(JSON.stringify({ ok: false, error: err.message }), {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
};

