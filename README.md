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

You can also check out the [tests](./tests) for full, working usage examples.

```ts
// assuming this file structure:
// src/fixtures/foo.json
// src/fixtures/bar.json

// src/foo/bar.test.ts
import { readFileSync } from "node:fs"
import { getFixtures } from "tinyfixturez"
import { fn } from "./bar.ts"

const fixtures = getFixtures(import.meta.dirname)

const barFixturePath = fixtures.find("bar.json")
const barFixture = readFileSync(barFixturePath)

it("should look like the fixture", () => {
	expect(fn()).toEqual(barFixture)
})

// TODO
```
