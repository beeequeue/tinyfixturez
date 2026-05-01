import { Buffer } from "node:buffer"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import * as find from "empathic/find"
import whenExit from "when-exit"

const findPotentialRootDir = (): string | null => {
	const lockfilePath = find.any(["pnpm-lock.yaml", "yarn.lock", "package-lock.json"])
	return lockfilePath != null ? path.dirname(lockfilePath) : null
}

type BuildFileContent = Record<string, unknown> | unknown[] | Uint8Array | Buffer | string

export type Fixtures = {
	/** The base directory to search for fixtures from */
	baseDir: string

	/**
	 * Returns the absolute path of a fixture.
	 *
	 * Walks upwards from the base directory until it finds a fixture with the correct name.
	 */
	find: (name: string) => string

	/**
	 * Reads a fixture as a string and returns it.
	 *
	 * Walks upwards from the base directory until it finds a fixture with the correct name.
	 */
	readString: (name: string) => string
	/**
	 * Reads a fixture as JSON and returns it.
	 *
	 * Walks upwards from the base directory until it finds a fixture with the correct name.
	 */
	readJson: <T>(name: string) => T
	/**
	 * Reads a fixture as Buffer and returns it.
	 *
	 * Walks upwards from the base directory until it finds a fixture with the correct name.
	 */
	readRaw: (name: string) => Buffer

	/** Copies a fixture to a temporary directory and returns the new path. */
	copy: (name: string) => string

	/** Creates a temporary directory and returns the path. */
	temp: () => string

	/**
	 * Builds a temporary directory with the given files and returns the path.
	 *
	 * @example
	 * ```ts
	 * const tempDir = fixtures.build({
	 *   "root.txt": "Hello, world!", // string
	 *   "dir/one.txt": { hello: "world" }, // json
	 *   "dir/two.txt": Buffer.from("hello world"), // buffer
	 * })
	 * ```
	 */
	build: (input: Record<string, BuildFileContent>) => string

	/** Clean up any temporary directories created by this instance */
	dispose: () => void
	[Symbol.dispose]: () => void
	/** @deprecated Use {@link dispose} instead */
	cleanup: () => void
}

/**
 * Creates a Fixtures instance
 */
export const getFixtures = (base: string): Fixtures => {
	const baseIsFile = fs.statSync(base).isFile()
	const baseDir = path.resolve(baseIsFile ? path.dirname(base) : base)
	const rootDir = findPotentialRootDir() // TODO: option

	let cleanedUp = false // TODO: disable cleanup option
	const knownDirs = new Set<string>()
	const dispose = (): void => {
		if (cleanedUp) return
		cleanedUp = true

		for (const knownDir of knownDirs.values()) {
			fs.rmSync(knownDir, { recursive: true, force: true })
		}

		knownDirs.clear()
	}

	// TODO: skip this if in Vitest context mode?
	whenExit(() => dispose())

	const findFn = (name: string): string => {
		const fixturePath = find.up(path.join("fixtures", name), {
			cwd: baseDir,
			last: rootDir ?? undefined,
		})
		if (fixturePath == null) {
			throw new Error(`Could not find fixture "${name}"`)
		}

		return fixturePath
	}

	const temp = (): string => {
		const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tinyfixturez-"))
		knownDirs.add(tempDir)
		return tempDir
	}

	const copy = (name: string): string => {
		const fixturePath = findFn(name)
		const tempDir = temp()

		const targetPath = path.join(tempDir, name)
		fs.cpSync(fixturePath, targetPath, { recursive: true })

		return targetPath
	}

	const build = (input: Record<string, BuildFileContent>): string => {
		const tempDir = temp()
		for (const [name, data] of Object.entries(input)) {
			const targetPath = path.join(tempDir, name)

			const content =
				typeof data !== "string" && !Buffer.isBuffer(data) && !(data instanceof Uint8Array)
					? JSON.stringify(data, null, 2)
					: data

			fs.writeFileSync(targetPath, content)
		}
		return tempDir
	}

	const read = (name: string): Buffer => {
		const fixturePath = findFn(name)
		return fs.readFileSync(fixturePath)
	}
	const readString = (name: string): string => {
		return read(name).toString("utf8")
	}
	const readJson = <T>(name: string): T => {
		return JSON.parse(readString(name)) as T
	}

	return {
		baseDir,

		find: findFn,
		copy,
		temp,
		build,

		readString,
		readJson,
		readRaw: read,

		dispose,
		[Symbol.dispose]: dispose,
		cleanup: dispose,
	}
}
