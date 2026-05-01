import { getFixtures } from "tinyfixturez"
import { expect, it } from "vitest"

import { relativeToCwd } from "../../../src/utils.ts"

it("can find fixtures next to the test file", () => {
	const fixtures = getFixtures(import.meta.dirname)

	const fixturePath = fixtures.find("deep.txt")
	expect(relativeToCwd(fixturePath)).toMatchInlineSnapshot(`"tests/nested/deep/fixtures/deep.txt"`)
})

it("files closer to the test file overrides ones with same name above it", () => {
	const fixtures = getFixtures(import.meta.dirname)

	const fixturePath = fixtures.find("overridden.txt")
	expect(relativeToCwd(fixturePath)).toMatchInlineSnapshot(
		`"tests/nested/deep/fixtures/overridden.txt"`,
	)
})
