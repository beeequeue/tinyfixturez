# tinyfixturez

[![Open on npmx.dev](https://npmx.dev/api/registry/badge/version/tinyfixturez)](https://npmx.dev/package/tinyfixturez)
[![Open on npmx.dev](https://npmx.dev/api/registry/badge/dependencies/tinyfixturez)](https://npmx.dev/package/tinyfixturez)
[![Open on npmx.dev](https://npmx.dev/api/registry/badge/size/tinyfixturez)](https://npmx.dev/package/tinyfixturez)

A tiny library for building and using file fixtures in tests

I tried to keep the same API as [fixturez](https://github.com/substack/fixturez) with a few differences:

- The default export is replaced with the named export `getFixtures()`
- All paths are normalized to use `/` as the path separator on all platforms
- More functionality (`build()`, `Symbol.dispose` support)

## Usage

You can also check out the [tests](./tests) for working, tested examples.

### Building a temporary file structure

```ts
import { getFixtures } from "tinyfixturez"

// all temporary directories are cleaned up on process exit
const fixtures = getFixtures(import.meta.dirname)

const tempDir = fixtures.build({
	"foo.txt": "hello world",
	"bar/foo.json": { hello: "world" },
	"biz/baz/foo.bin": Buffer.from("hello world", "utf8"),
})

console.log(tempDir) // /tmp/tinyfixturez-1234567890abcdef

// Generates these files:
// /tmp/tinyfixturez-1234567890abcdef/foo.txt
// /tmp/tinyfixturez-1234567890abcdef/bar/foo.json
// /tmp/tinyfixturez-1234567890abcdef/biz/baz/foo.bin
```

### Loading existing fixtures

```ts
// src/fixtures/bar.json
// { "hello": "world" }

// src/foo/bar.test.ts
import { readFileSync } from "node:fs"
import { getFixtures } from "tinyfixturez"
import { expect, it } from "vitest"
import { fn } from "./bar.ts"

// all temporary directories are cleaned up on process exit
const fixtures = getFixtures(import.meta.dirname)

// Searches upwards for the closest `fixtures/bar.json` file from the current directory (import.meta.dirname)
const barFixturePath = fixtures.find("bar.json")
const barFixture = readFileSync(barFixturePath)

it("should look like the fixture", () => {
	expect(fn()).toStrictEqual({ hello: "world" })
})
```
