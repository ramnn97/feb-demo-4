import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

const careerRecipient = "careers@facebuilds.com";
const maxCareerAttachmentSize = 10 * 1024 * 1024;

function jsonResponse(body: Record<string, string>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function encodeBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
}

async function sendCareerApplication(request: Request, env: unknown): Promise<Response> {
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

  const runtimeEnv = env && typeof env === "object" ? env as Record<string, unknown> : {};
  const processEnv = typeof process === "undefined" ? {} : process.env;
  const apiKey = String(runtimeEnv.RESEND_API_KEY ?? processEnv.RESEND_API_KEY ?? "");
  const sender = String(runtimeEnv.CAREER_EMAIL_FROM ?? processEnv.CAREER_EMAIL_FROM ?? "");
  if (!apiKey || !sender) {
    return jsonResponse({ error: "Application email isn’t configured yet. Please email careers@facebuilds.com directly." }, 503);
  }

  let fields: FormData;
  try {
    fields = await request.formData();
  } catch {
    return jsonResponse({ error: "Please complete the application form and attach your resume." }, 400);
  }

  const role = String(fields.get("role") ?? "").trim();
  const name = String(fields.get("name") ?? "").trim();
  const email = String(fields.get("email") ?? "").trim();
  const portfolio = String(fields.get("portfolio") ?? "").trim();
  const message = String(fields.get("message") ?? "").trim();
  const attachment = fields.get("attachment");

  if (!role || !name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message || !(attachment instanceof File) || !attachment.size) {
    return jsonResponse({ error: "Please complete all required fields and attach your resume." }, 400);
  }
  if (attachment.size > maxCareerAttachmentSize) {
    return jsonResponse({ error: "Your file is larger than 10 MB. Please choose a smaller file." }, 413);
  }
  if (!/\.(pdf|doc|docx)$/i.test(attachment.name)) {
    return jsonResponse({ error: "Please upload a PDF, DOC, or DOCX file." }, 400);
  }

  const attachmentBytes = new Uint8Array(await attachment.arrayBuffer());
  const emailPayload = {
    from: sender,
    to: [careerRecipient],
    reply_to: email,
    subject: `FaceBuilds application — ${role}`,
    text: [
      `Role: ${role}`,
      `Name: ${name}`,
      `Email: ${email}`,
      `Portfolio or LinkedIn: ${portfolio || "Not provided"}`,
      "",
      "About me:",
      message,
    ].join("\n"),
    attachments: [{ filename: attachment.name, content: encodeBase64(attachmentBytes) }],
  };

  try {
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(emailPayload),
    });
    if (!emailResponse.ok) {
      console.error("Career application email provider rejected the message:", emailResponse.status, await emailResponse.text());
      return jsonResponse({ error: "We couldn’t send your application right now. Please email careers@facebuilds.com directly." }, 502);
    }
    return jsonResponse({ message: "Application sent." });
  } catch (error) {
    console.error("Career application email delivery failed:", error);
    return jsonResponse({ error: "We couldn’t send your application right now. Please email careers@facebuilds.com directly." }, 502);
  }
}

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/api/career-application") {
        return await sendCareerApplication(request, env);
      }
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
