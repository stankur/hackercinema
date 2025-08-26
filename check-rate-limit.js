#!/usr/bin/env node

// Load .env.local file
const fs = require("fs");
const path = require("path");

try {
	const envPath = path.join(__dirname, ".env.local");
	if (fs.existsSync(envPath)) {
		const envFile = fs.readFileSync(envPath, "utf8");
		envFile.split("\n").forEach((line) => {
			const [key, value] = line.split("=");
			if (key && value && !key.startsWith("#")) {
				process.env[key.trim()] = value.trim();
			}
		});
		console.log("📁 Loaded .env.local");
	}
} catch (error) {
	console.log("⚠️  Could not load .env.local:", error.message);
}

async function checkRateLimit() {
	try {
		console.log("🔍 Checking GitHub API Rate Limit Status...\n");

		const headers = {
			Accept: "application/vnd.github.v3+json",
			"User-Agent": "Builder-Directory-Rate-Checker",
		};

		// Add auth header if token is available
		if (process.env.GITHUB_TOKEN) {
			headers["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
			console.log("🔑 Using GitHub token for rate limit check");
		} else {
			console.log(
				"⚠️  No GitHub token found - checking anonymous limits"
			);
		}

		const response = await fetch("https://api.github.com/rate_limit", {
			headers,
		});

		if (!response.ok) {
			console.log(`❌ HTTP ${response.status}: ${response.statusText}`);
			if (response.status === 403) {
				console.log("🚨 You are currently RATE LIMITED!");
				console.log("The rate limit check itself is being blocked.");
				console.log("Wait about an hour and try again.");
			}
			return;
		}

		const data = await response.json();
		const core = data.resources.core;
		const resetTime = new Date(core.reset * 1000);
		const now = new Date();
		const minutesUntilReset = Math.ceil((resetTime - now) / (1000 * 60));
		const hoursUntilReset = Math.floor(minutesUntilReset / 60);
		const remainingMinutes = minutesUntilReset % 60;

		console.log("📊 GitHub API Rate Limit Status");
		console.log("================================");
		console.log(`Remaining requests: ${core.remaining}/${core.limit}`);
		console.log(`Used requests: ${core.limit - core.remaining}`);
		console.log(`Reset time: ${resetTime.toLocaleString()}`);

		if (hoursUntilReset > 0) {
			console.log(
				`Time until reset: ${hoursUntilReset}h ${remainingMinutes}m`
			);
		} else {
			console.log(`Time until reset: ${minutesUntilReset} minutes`);
		}

		console.log("\n📈 Status:");
		if (core.remaining === 0) {
			console.log("🚨 COMPLETELY RATE LIMITED!");
			console.log(
				`⏰ Wait ${
					hoursUntilReset > 0
						? `${hoursUntilReset}h ${remainingMinutes}m`
						: `${minutesUntilReset} minutes`
				} for reset`
			);
		} else if (core.remaining < 5) {
			console.log("⚠️  CRITICALLY LOW - Only a few requests left!");
		} else if (core.remaining < 20) {
			console.log("⚠️  LOW - Use carefully!");
		} else {
			console.log("✅ Rate limit OK - Safe to use");
		}

		// Check for token
		const hasToken = process.env.GITHUB_TOKEN ? "Yes" : "No";
		console.log(`\n🔑 GitHub token configured: ${hasToken}`);

		if (!process.env.GITHUB_TOKEN) {
			console.log("\n💡 RECOMMENDATION:");
			console.log("Add GITHUB_TOKEN to .env.local for:");
			console.log("- 5000 requests/hour (vs current 60)");
			console.log("- Much better rate limits");
			console.log("Get token: https://github.com/settings/tokens");
		}

		// Show current usage rate
		const usedPercentage = Math.round(
			((core.limit - core.remaining) / core.limit) * 100
		);
		console.log(`\n📊 Usage: ${usedPercentage}% of hourly limit used`);
	} catch (error) {
		console.error("❌ Error checking rate limit:", error.message);
		console.log("\n🤔 This might mean:");
		console.log("- Network connection issue");
		console.log("- GitHub API is down");
		console.log("- You're already rate limited");
	}
}

// Run every few seconds to monitor in real-time
async function monitor() {
	await checkRateLimit();

	if (process.argv.includes("--watch")) {
		console.log("\n👀 Watching rate limits (press Ctrl+C to stop)...\n");
		setInterval(async () => {
			console.log("\n" + "=".repeat(50));
			await checkRateLimit();
		}, 30000); // Check every 30 seconds
	}
}

monitor();
