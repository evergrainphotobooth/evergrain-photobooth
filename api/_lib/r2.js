/* =========================================================
   Cloudflare R2 client (module, not a route)

   Minimal S3-compatible client for R2 using AWS SigV4, built on Node crypto +
   fetch — no SDK (matches the project's pure-fetch style). Powers the CMS
   Assets manager (list / view / upload / delete / rename / edit metadata).

   Reads credentials from env:
     R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
     R2_ENDPOINT   (https://<accountid>.r2.cloudflarestorage.com)  [or R2_ACCOUNT_ID]
     R2_BUCKET     (e.g. evergrain-media)
     R2_PUBLIC_BASE(e.g. https://pub-xxxx.r2.dev)   — for building public URLs
   ========================================================= */

import crypto from "node:crypto";

const REGION = "auto";
const SERVICE = "s3";

export function r2cfg() {
  const endpoint = process.env.R2_ENDPOINT
    || (process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : "");
  return {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    endpoint: endpoint.replace(/\/+$/, ""),
    bucket: process.env.R2_BUCKET || "",
    publicBase: (process.env.R2_PUBLIC_BASE || "").replace(/\/+$/, ""),
  };
}
export function r2Configured(cfg = r2cfg()) {
  return !!(cfg.accessKeyId && cfg.secretAccessKey && cfg.endpoint && cfg.bucket);
}
export function publicUrl(key, cfg = r2cfg()) {
  return `${cfg.publicBase}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

const sha256hex = (b) => crypto.createHash("sha256").update(b).digest("hex");
const hmac = (key, data) => crypto.createHmac("sha256", key).update(data).digest();
// RFC3986 encode; keep "/" when encodeSlash=false (for object key paths).
function uriEncode(str, encodeSlash = true) {
  return String(str).replace(/[^A-Za-z0-9_.~-]/g, (c) => {
    if (c === "/" && !encodeSlash) return c;
    return "%" + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0");
  });
}

/* Core SigV4 signer. Returns { url, headers } ready for fetch.
   opts: { method, path (canonical, already-encoded, starts with /),
           query (object), headers (extra), bodyHash (hex or UNSIGNED-PAYLOAD), body } */
function sign(cfg, { method, path, query = {}, headers = {}, bodyHash, body }) {
  const host = new URL(cfg.endpoint).host;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");    // YYYYMMDDTHHMMSSZ
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = bodyHash || (body != null ? sha256hex(body) : sha256hex(""));

  const allHeaders = {
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
    ...Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), String(v)])),
  };
  const signedNames = Object.keys(allHeaders).sort();
  const canonicalHeaders = signedNames.map((n) => `${n}:${allHeaders[n].trim().replace(/\s+/g, " ")}\n`).join("");
  const signedHeaders = signedNames.join(";");

  const canonicalQuery = Object.keys(query).sort()
    .map((k) => `${uriEncode(k)}=${uriEncode(query[k])}`).join("&");

  const canonicalRequest = [method, path, canonicalQuery, canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const scope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256hex(canonicalRequest)].join("\n");

  let k = hmac("AWS4" + cfg.secretAccessKey, dateStamp);
  k = hmac(k, REGION); k = hmac(k, SERVICE); k = hmac(k, "aws4_request");
  const signature = crypto.createHmac("sha256", k).update(stringToSign).digest("hex");

  const authorization = `AWS4-HMAC-SHA256 Credential=${cfg.accessKeyId}/${scope}, `
    + `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const url = `${cfg.endpoint}${path}${canonicalQuery ? "?" + canonicalQuery : ""}`;
  return { url, headers: { ...allHeaders, Authorization: authorization } };
}

async function send(cfg, opts) {
  const { url, headers } = sign(cfg, opts);
  const r = await fetch(url, { method: opts.method, headers, body: opts.body });
  return r;
}

/* ---------- operations ---------- */

// List objects (optionally under a prefix). Returns [{key, size, lastModified}].
export async function list(prefix = "", cfg = r2cfg()) {
  const out = [];
  let token;
  do {
    const query = { "list-type": "2", "max-keys": "1000" };
    if (prefix) query.prefix = prefix;
    if (token) query["continuation-token"] = token;
    const r = await send(cfg, { method: "GET", path: `/${uriEncode(cfg.bucket)}`, query });
    if (!r.ok) throw new Error(`R2 list ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const xml = await r.text();
    for (const m of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
      const b = m[1];
      const key = (b.match(/<Key>([\s\S]*?)<\/Key>/) || [])[1] || "";
      const size = Number((b.match(/<Size>(\d+)<\/Size>/) || [])[1] || 0);
      const lastModified = (b.match(/<LastModified>([\s\S]*?)<\/LastModified>/) || [])[1] || "";
      if (key) out.push({ key: decodeXml(key), size, lastModified });
    }
    token = (xml.match(/<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/) || [])[1];
  } while (token);
  return out;
}

// Head one object → { contentType, size, metadata:{...} } (custom x-amz-meta-*).
export async function head(key, cfg = r2cfg()) {
  const r = await send(cfg, { method: "HEAD", path: `/${uriEncode(cfg.bucket)}/${uriEncode(key, false)}` });
  if (!r.ok) throw new Error(`R2 head ${r.status}`);
  const metadata = {};
  for (const [k, v] of r.headers) { if (k.startsWith("x-amz-meta-")) metadata[k.slice("x-amz-meta-".length)] = v; }
  return { contentType: r.headers.get("content-type") || "", size: Number(r.headers.get("content-length") || 0), metadata };
}

export async function del(key, cfg = r2cfg()) {
  const r = await send(cfg, { method: "DELETE", path: `/${uriEncode(cfg.bucket)}/${uriEncode(key, false)}` });
  if (!r.ok && r.status !== 204) throw new Error(`R2 delete ${r.status}`);
  return true;
}

// Upload bytes (small/proxied). metadata = { key: value } → x-amz-meta-*.
export async function put(key, body, contentType = "application/octet-stream", metadata = {}, cfg = r2cfg()) {
  const metaHeaders = {};
  for (const [k, v] of Object.entries(metadata)) metaHeaders[`x-amz-meta-${k}`] = v;
  const r = await send(cfg, {
    method: "PUT", path: `/${uriEncode(cfg.bucket)}/${uriEncode(key, false)}`,
    headers: { "content-type": contentType, ...metaHeaders }, body,
  });
  if (!r.ok) throw new Error(`R2 put ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return true;
}

// Copy (rename/move, or edit metadata by copying onto itself with REPLACE).
export async function copy(srcKey, dstKey, { contentType, metadata, replace = false } = {}, cfg = r2cfg()) {
  const headers = { "x-amz-copy-source": `/${cfg.bucket}/${uriEncode(srcKey, false)}` };
  if (replace) {
    headers["x-amz-metadata-directive"] = "REPLACE";
    if (contentType) headers["content-type"] = contentType;
    for (const [k, v] of Object.entries(metadata || {})) headers[`x-amz-meta-${k}`] = v;
  }
  const r = await send(cfg, { method: "PUT", path: `/${uriEncode(cfg.bucket)}/${uriEncode(dstKey, false)}`, headers });
  if (!r.ok) throw new Error(`R2 copy ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return true;
}

// Presigned PUT URL so the browser uploads large files straight to R2.
export function presignPut(key, contentType = "application/octet-stream", expires = 900, cfg = r2cfg()) {
  const host = new URL(cfg.endpoint).host;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const scope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const path = `/${uriEncode(cfg.bucket)}/${uriEncode(key, false)}`;
  const q = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${cfg.accessKeyId}/${scope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expires),
    "X-Amz-SignedHeaders": "host",
  };
  const canonicalQuery = Object.keys(q).sort().map((k) => `${uriEncode(k)}=${uriEncode(q[k])}`).join("&");
  const canonicalRequest = ["PUT", path, canonicalQuery, `host:${host}\n`, "host", "UNSIGNED-PAYLOAD"].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256hex(canonicalRequest)].join("\n");
  let k = hmac("AWS4" + cfg.secretAccessKey, dateStamp);
  k = hmac(k, REGION); k = hmac(k, SERVICE); k = hmac(k, "aws4_request");
  const signature = crypto.createHmac("sha256", k).update(stringToSign).digest("hex");
  return `${cfg.endpoint}${path}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

function decodeXml(s) {
  return String(s).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}
