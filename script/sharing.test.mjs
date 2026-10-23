import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";

const context = vm.createContext({});
vm.runInContext(readFileSync(new URL("../chrome-edge/sharing.js", import.meta.url), "utf8"), context);
const sharing = context.__chmiClassicSharing;

test("native sharing sends only the public installation URL, never the current page", async () => {
  let payload;
  const result = await sharing.shareOrCopy({ share: async value => { payload = value; } });
  assert.equal(result, "shared");
  assert.equal(payload.url, "https://chromewebstore.google.com/detail/ogciancfjbeghkcjkhijmbaabpohccpp");
  assert.equal(new URL(payload.url).search, "");
  assert.equal(payload.title, "ČHMÚ Classic");
});

test("cancelling native sharing neither writes the clipboard nor retries", async () => {
  let writes = 0;
  const result = await sharing.shareOrCopy({ share: async () => { throw { name: "AbortError" }; },
    clipboard: { writeText: async () => { writes++; } } });
  assert.equal(result, "cancelled");
  assert.equal(writes, 0);
});

test("missing or denied native sharing copies the canonical link", async () => {
  for (const share of [undefined, async () => { throw {name:"NotAllowedError"}; }]) {
    let copied;
    assert.equal(await sharing.shareOrCopy({share,clipboard:{writeText:async value => {copied=value;}}}), "copied");
    assert.equal(copied, sharing.url);
  }
});

test("clipboard denial offers manual copy and never claims success", async () => {
  for (const browser of [{}, {clipboard:{writeText:async () => {throw new Error("denied");}}}])
    assert.equal(await sharing.shareOrCopy(browser), "manual");
});

test("explicit copy does not open the system sharing dialog", async () => {
  assert.equal(await sharing.shareOrCopy({share:async () => {throw new Error("must not run");},
    clipboard:{writeText:async () => {}}}, true), "copied");
});
