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

/* Commit MULTIPLE files atomically in a single commit (Tree API).
   `files` = [{ path, content }, ...]
   Returns the new commit SHA. */
export async function commitMultiple(files, message) {
  const headers = authHeaders();
  const json = { ...headers, "Content-Type": "application/json" };

  // 1. Get latest commit SHA on the branch
  const refRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`,
    { headers }
  );
  if (!refRes.ok) throw new Error(`Get ref failed: ${await refRes.text()}`);
  const latestCommitSha = (await refRes.json()).object.sha;

  // 2. Get base tree SHA from that commit
  const commitRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/git/commits/${latestCommitSha}`,
    { headers }
  );
  if (!commitRes.ok) throw new Error(`Get commit failed: ${await commitRes.text()}`);
  const baseTreeSha = (await commitRes.json()).tree.sha;

  // 3. Create a blob for each file, in parallel
  const blobs = await Promise.all(
    files.map(async (f) => {
      const r = await fetch(
        `https://api.github.com/repos/${OWNER}/${REPO}/git/blobs`,
        {
          method: "POST",
          headers: json,
          body: JSON.stringify({
            content: Buffer.from(f.content, "utf8").toString("base64"),
            encoding: "base64",
          }),
        }
      );
      if (!r.ok) throw new Error(`Blob ${f.path}: ${await r.text()}`);
      return { path: f.path, mode: "100644", type: "blob", sha: (await r.json()).sha };
    })
  );

  // 4. Create a new tree referencing those blobs
  const treeRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/git/trees`,
    {
      method: "POST",
      headers: json,
      body: JSON.stringify({ base_tree: baseTreeSha, tree: blobs }),
    }
  );
  if (!treeRes.ok) throw new Error(`Create tree: ${await treeRes.text()}`);
  const newTreeSha = (await treeRes.json()).sha;

  // 5. Create the commit
  const newCommitRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/git/commits`,
    {
      method: "POST",
      headers: json,
      body: JSON.stringify({
        message,
        tree: newTreeSha,
        parents: [latestCommitSha],
      }),
    }
  );
  if (!newCommitRes.ok) throw new Error(`Create commit: ${await newCommitRes.text()}`);
  const newCommitSha = (await newCommitRes.json()).sha;

  // 6. Move branch ref forward
  const updateRefRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`,
    {
      method: "PATCH",
      headers: json,
      body: JSON.stringify({ sha: newCommitSha }),
    }
  );
  if (!updateRefRes.ok) throw new Error(`Update ref: ${await updateRefRes.text()}`);

  return newCommitSha;
}
