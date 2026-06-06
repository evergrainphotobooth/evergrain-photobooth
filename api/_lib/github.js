/* =========================================================
   GitHub Contents API helper — minimal read/write for the CMS.

   Env vars required (set in Vercel):
     GITHUB_TOKEN    Personal Access Token (fine-scoped: Contents read/write
                     on this single repo). https://github.com/settings/tokens
     GITHUB_OWNER    Defaults to "evergrainphotobooth"
     GITHUB_REPO     Defaults to "evergrain-photobooth"
     GITHUB_BRANCH   Defaults to "main"
   ========================================================= */

const OWNER = process.env.GITHUB_OWNER || "evergrainphotobooth";
const REPO = process.env.GITHUB_REPO || "evergrain-photobooth";
const BRANCH = process.env.GITHUB_BRANCH || "main";

function authHeaders() {
  const t = process.env.GITHUB_TOKEN;
  if (!t) throw new Error("GITHUB_TOKEN env var is not set");
  return {
    Authorization: `Bearer ${t}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

/* Read a file from the repo. Returns { content, sha } or null if missing. */
export async function getFile(path) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}?ref=${BRANCH}`;
  const r = await fetch(url, { headers: authHeaders() });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`GitHub GET ${path}: ${r.status} ${await r.text()}`);
  const j = await r.json();
  return {
    content: Buffer.from(j.content, "base64").toString("utf8"),
    sha: j.sha,
  };
}

/* Commit a file (create or update). Pass `sha` from getFile() for updates. */
export async function putFile(path, content, sha, message) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}`;
  const body = {
    message: message || `CMS update: ${path}`,
    content: Buffer.from(content, "utf8").toString("base64"),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;

  const r = await fetch(url, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`GitHub PUT ${path}: ${r.status} ${await r.text()}`);
  const j = await r.json();
  return { commitSha: j.commit?.sha, contentSha: j.content?.sha };
}

/* Convenience: read JSON, parse. Returns { data, sha } or null if missing. */
export async function getJson(path) {
  const f = await getFile(path);
  if (!f) return null;
  return { data: JSON.parse(f.content), sha: f.sha };
}

/* Convenience: pretty-print + commit JSON. */
export async function putJson(path, data, sha, message) {
  const content = JSON.stringify(data, null, 2) + "\n";
  return putFile(path, content, sha, message);
}
