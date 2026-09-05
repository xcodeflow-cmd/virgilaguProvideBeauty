const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const test = require("node:test");
const ts = require("typescript");

const source = fs.readFileSync(path.join(__dirname, "../app/admin/actions.ts"), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true }
}).outputText;

function fixture(role = "ADMIN") {
  const sessions = new Map([["deleted-live", { recordingMimeType: "video/mp4" }], ["kept-live", {}]]);
  const purchases = [{ liveSessionId: "deleted-live" }, { liveSessionId: "kept-live" }];
  const revalidated = [];
  const removedFiles = [];
  let transactions = 0;
  const related = () => ({ deleteMany: async () => ({ count: 0 }) });
  const prisma = {
    liveSignal: related(),
    liveChatMessage: related(),
    liveChatRestriction: related(),
    purchase: {
      updateMany: async ({ where, data }) => {
        for (const purchase of purchases) {
          if (purchase.liveSessionId === where.liveSessionId) Object.assign(purchase, data);
        }
      }
    },
    liveSession: {
      findUnique: async ({ where }) => sessions.get(where.id) || null,
      delete: async ({ where }) => {
        if (!sessions.has(where.id)) throw new Error("Record to delete does not exist.");
        sessions.delete(where.id);
      },
      deleteMany: async ({ where }) => ({ count: Number(sessions.delete(where.id)) })
    },
    $transaction: async (operations) => {
      transactions++;
      return Promise.all(operations);
    }
  };
  const imports = {
    "node:fs/promises": { unlink: async (file) => {
      removedFiles.push(file);
      throw Object.assign(new Error("Missing recording file"), { code: "ENOENT" });
    } },
    "next/cache": { revalidatePath: (url) => revalidated.push(url) },
    "next/navigation": { redirect: () => { throw new Error("Unauthorized redirect"); } },
    "@prisma/client": { SessionVisibility: {} },
    "@/auth": { auth: async () => ({ user: { id: "user", role } }) },
    "@/lib/data": {},
    "@/lib/prisma": { prisma },
    "@/lib/live-recordings": {
      getLiveRecordingExtension: (mime) => mime === "video/mp4" ? "mp4" : "webm",
      getLiveRecordingFilePath: (id, extension) => `${id}.${extension}`
    },
    "@/lib/romania-time": {}
  };
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    require: (name) => {
      assert.ok(name in imports, `Unexpected dependency: ${name}`);
      return imports[name];
    }
  });
  const form = (id = "deleted-live") => ({ get: (name) => name === "id" ? id : null });
  return { sessions, purchases, revalidated, removedFiles, exports, form, transactions: () => transactions };
}

test("deleting the same live twice succeeds and preserves unrelated lives and purchases", async () => {
  const f = fixture();
  await f.exports.deleteLiveSession(f.form());
  await f.exports.deleteLiveSession(f.form());
  assert.equal(f.sessions.has("deleted-live"), false);
  assert.equal(f.sessions.has("kept-live"), true);
  assert.deepEqual(f.purchases, [{ liveSessionId: null }, { liveSessionId: "kept-live" }]);
  assert.equal(f.transactions(), 2);
  for (const url of ["/", "/live", "/admin", "/dashboard"]) {
    assert.equal(f.revalidated.filter((value) => value === url).length, 2);
  }
  assert.ok(f.removedFiles.length > 0);
  assert.ok(f.removedFiles.every((file) => file.startsWith("deleted-live.")));
});

test("non-admin cannot delete a live", async () => {
  const f = fixture("USER");
  await assert.rejects(f.exports.deleteLiveSession(f.form()), /Unauthorized/);
  assert.equal(f.sessions.size, 2);
  assert.equal(f.transactions(), 0);
  assert.equal(f.removedFiles.length, 0);
});

test("two stale forms can submit the same deletion concurrently", async () => {
  const f = fixture();
  await Promise.all([
    f.exports.deleteLiveSession(f.form()),
    f.exports.deleteLiveSession(f.form())
  ]);
  assert.equal(f.sessions.has("deleted-live"), false);
  assert.equal(f.sessions.has("kept-live"), true);
});

test("missing id cannot delete any live", async () => {
  const f = fixture();
  await assert.rejects(f.exports.deleteLiveSession(f.form("")), /Missing live session id/);
  assert.equal(f.sessions.size, 2);
  assert.equal(f.transactions(), 0);
});
