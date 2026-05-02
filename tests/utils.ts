import os from "node:os"

import path from "pathe"
import { expect, type Matcher, type MatcherState } from "vitest"

export const relativeToCwd = (input: string): string => path.relative(process.cwd(), input)

declare module "vitest" {
	interface Matchers<T = any> {
		toBeInsideOsTempDir: () => void
	}
}

const toBeInsideOsTempDir: Matcher<MatcherState> = function (received) {
	if (!path.isAbsolute(received)) {
		return {
			pass: false,
			message: () =>
				`Can not check if "${received}" is in the OS's temp dir as it is not an absolute path.`,
		}
	}

	const tempDirPath = path.normalize(os.tmpdir())
	const normalizedPath = path.normalize(received)
	const isInside = normalizedPath.startsWith(tempDirPath)

	return {
		pass: this.isNot ? !isInside : isInside,
		message: () =>
			`Expected ${this.isNot ? "not " : ""}"${received}" to be inside the OS's temp dir "${tempDirPath}".`,
		actual: normalizedPath,
		expected: path.join(tempDirPath, "**"),
	}
}

expect.extend({
	toBeInsideOsTempDir,
})
