import { getFixtures } from "tinyfixturez"
import { expect, it } from "vitest"

it("can find fixtures next to the test file", () => {
	const fixtures = getFixtures(import.meta.dirname)
	expect(fixtures.find("deep.txt").trim()).toMatchInlineSnapshot(
		`"This is a deep.txt fixture, which should only be available to \`deeply-nested.test.ts\`"`,
	)
})

it("files closer to the test file overrides ones with same name above it", () => {
	const fixtures = getFixtures(import.meta.dirname)
	expect(fixtures.find("overridden.txt").trim()).toMatchInlineSnapshot(
		`"This is the overridden.txt fixture, which should be overriding the root fixture's file of the same name."`,
	)
})
