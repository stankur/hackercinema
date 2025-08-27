#!/usr/bin/env tsx

import fs from "fs";
import path from "path";
import { validateProfileData } from "../lib/schemas";

async function validateProfiles() {
	try {
		console.log("🔍 Validating profile JSON files...\n");

		// Paths to check
		const sampleIndexPath = path.join(
			__dirname,
			"../public/api/sample_index.json"
		);
		const profilesDir = path.join(__dirname, "../public/api/profiles");

		let totalFiles = 0;
		let validFiles = 0;
		let invalidFiles = 0;

		// Validate sample_index.json
		if (fs.existsSync(sampleIndexPath)) {
			totalFiles++;
			console.log("📄 Validating sample_index.json...");
			try {
				const sampleData = JSON.parse(
					fs.readFileSync(sampleIndexPath, "utf8")
				);
				validateProfileData(sampleData);
				console.log("✅ sample_index.json is valid\n");
				validFiles++;
			} catch (error) {
				console.log("❌ sample_index.json is invalid:");
				console.log(
					`   ${
						error instanceof Error ? error.message : "Unknown error"
					}\n`
				);
				invalidFiles++;
			}
		}

		// Validate individual profile files
		if (fs.existsSync(profilesDir)) {
			const profileFiles = fs
				.readdirSync(profilesDir)
				.filter((file) => file.endsWith(".json"));

			for (const file of profileFiles) {
				totalFiles++;
				const filePath = path.join(profilesDir, file);
				console.log(`📄 Validating ${file}...`);

				try {
					const profileData = JSON.parse(
						fs.readFileSync(filePath, "utf8")
					);
					validateProfileData(profileData);
					console.log(`✅ ${file} is valid\n`);
					validFiles++;
				} catch (error) {
					console.log(`❌ ${file} is invalid:`);
					console.log(
						`   ${
							error instanceof Error
								? error.message
								: "Unknown error"
						}\n`
					);
					invalidFiles++;
				}
			}
		}

		// Summary
		console.log("📊 Validation Summary:");
		console.log(`   Total files: ${totalFiles}`);
		console.log(`   Valid: ${validFiles}`);
		console.log(`   Invalid: ${invalidFiles}`);

		if (invalidFiles > 0) {
			console.log(
				"\n❌ Some files failed validation. Please fix the errors above."
			);
			process.exit(1);
		} else {
			console.log("\n✅ All profile files are valid!");
		}
	} catch (error) {
		console.error(
			"💥 Validation script failed:",
			error instanceof Error ? error.message : "Unknown error"
		);
		process.exit(1);
	}
}

// Run the validation
validateProfiles();
