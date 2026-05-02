import { Buffer } from "node:buffer"
import { existsSync, readFileSync } from "node:fs"

import path from "pathe"
import { getFixtures } from "tinyfixturez"
import { describe, expect, it } from "vitest"

import { relativeToCwd } from "./utils.ts"

it("base dir gets set to absolute path from relative", () => {
	const fixtures = getFixtures(path.relative(process.cwd(), import.meta.dirname))

	expect(path.isAbsolute(fixtures.baseDir)).toBe(true)

	expect(relativeToCwd(fixtures.baseDir)).toMatchInlineSnapshot(`"tests"`)
})

describe(".find()", () => {
	it("can find fixtures next to the test file", () => {
		const fixtures = getFixtures(import.meta.dirname)

		const fixturePath = fixtures.find("root.txt")
		expect(relativeToCwd(fixturePath)).toMatchInlineSnapshot(`"tests/fixtures/root.txt"`)
	})

	it("files closer to the test file override ones with same name above it", () => {
		const fixtures = getFixtures(import.meta.dirname)

		const fixturePath = fixtures.find("overridden.txt")
		expect(relativeToCwd(fixturePath)).toMatchInlineSnapshot(`"tests/fixtures/overridden.txt"`)
	})

	it("throws when fixture doesn't exist", () => {
		const fixtures = getFixtures(import.meta.dirname)
		expect(() => fixtures.find("nonexistent.txt")).toThrow(/Could not find fixture/)
	})
})

describe(".copy()", () => {
	it("copies files to a temp directory", () => {
		const fixtures = getFixtures(import.meta.dirname)

		const fixturePath = fixtures.copy("root.txt")
		expect(fixturePath).toBeInsideOsTempDir()
		expect(fixturePath).toEqual(expect.stringMatching(/root\.txt$/))
	})

	it("copies a directory to a temp directory", () => {
		const fixtures = getFixtures(import.meta.dirname)

		const fixturePath = fixtures.copy("dir")
		expect(fixturePath).toBeInsideOsTempDir()
		expect(fixturePath).toEqual(expect.stringMatching(/dir$/))

		expect(existsSync(path.join(fixturePath, "one.txt"))).toBe(true)
		expect(existsSync(path.join(fixturePath, "two.txt"))).toBe(true)
	})

	it("throws when fixture doesn't exist", () => {
		const fixtures = getFixtures(import.meta.dirname)
		expect(() => fixtures.copy("nonexistent.txt")).toThrow(/Could not find fixture/)
	})
})

describe(".temp()", () => {
	it("creates a temp directory and returns the path", () => {
		const fixtures = getFixtures(import.meta.dirname)

		const fixturePath = fixtures.temp()
		expect(fixturePath).toBeInsideOsTempDir()
		expect(existsSync(fixturePath)).toBe(true)
	})
})

describe(".build()", () => {
	it("creates a temp directory and returns the path", () => {
		const fixtures = getFixtures(import.meta.dirname)

		const fixturePath = fixtures.build({})
		expect(fixturePath).toBeInsideOsTempDir()
		expect(existsSync(fixturePath)).toBe(true)
	})

	it("writes string file to the temp directory", () => {
		const fixtures = getFixtures(import.meta.dirname)
		const fixturePath = fixtures.build({ "root.txt": "Hello, world!" })

		expect(existsSync(path.join(fixturePath, "root.txt"))).toBe(true)
		expect(readFileSync(path.join(fixturePath, "root.txt"), "utf-8")).toBe("Hello, world!")
	})

	it("writes json file to the temp directory", () => {
		const fixtures = getFixtures(import.meta.dirname)
		const value = { message: "Hello, world!" }
		const fixturePath = fixtures.build({ "root.json": value })

		expect(existsSync(path.join(fixturePath, "root.json"))).toBe(true)
		const contents = readFileSync(path.join(fixturePath, "root.json"), "utf-8")
		expect(JSON.parse(contents)).toStrictEqual(value)
	})

	it("writes Uint8Array data to the temp directory", () => {
		const fixtures = getFixtures(import.meta.dirname)
		const value = new Uint8Array([72, 101, 108, 108, 111, 44, 32, 119, 111, 114, 108, 100, 33])
		const fixturePath = fixtures.build({ "root.bin": value })

		expect(existsSync(path.join(fixturePath, "root.bin"))).toBe(true)
		const contents = readFileSync(path.join(fixturePath, "root.bin"))
		expect(Uint8Array.from(contents)).toStrictEqual(value)
	})

	it("writes Buffer data to the temp directory", () => {
		const fixtures = getFixtures(import.meta.dirname)
		const value = Buffer.from([72, 101, 108, 108, 111, 44, 32, 119, 111, 114, 108, 100, 33])
		const fixturePath = fixtures.build({ "root.bin": value })

		expect(existsSync(path.join(fixturePath, "root.bin"))).toBe(true)
		const contents = readFileSync(path.join(fixturePath, "root.bin"))
		expect(contents).toStrictEqual(value)
	})
})

describe(".dispose()", () => {
	it("cleans up temporary directories", () => {
		const fixtures = getFixtures(import.meta.dirname)
		const fixturePath = fixtures.copy("root.txt")

		fixtures.dispose()
		expect(existsSync(fixturePath)).toBe(false)
	})

	// crashes before runtime in Node <24 so we can't uncomment this :(
	// it("gets called when a `using` variable exits scope", () => {
	// 	let fixturePath: string
	// 	{
	// 		using fixtures = getFixtures(import.meta.dirname)
	// 		fixturePath = fixtures.copy("root.txt")
	// 	}
	//
	// 	expect(existsSync(fixturePath)).toBe(false)
	// })
})
