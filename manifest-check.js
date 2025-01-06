import fs from "fs";

const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));
const manifestJson = JSON.parse(
	fs.readFileSync("./manifest-beta.json", "utf8"),
);

if (packageJson.version !== manifestJson.version) {
	throw new Error(
		`package.json version(${packageJson.version}) and manifest-beta.json version(${manifestJson.version}) are different.`,
	);
}

console.log("Version check passed.");
