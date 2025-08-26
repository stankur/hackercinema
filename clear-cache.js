#!/usr/bin/env node

// Simple script to clear the GitHub data cache
// Run this if you want fresh data or are having cache issues

console.log("🧹 Clearing GitHub data cache...");

// This would need to be run in the browser console since it's localStorage
const clearCacheScript = `
// Clear all GitHub cache entries (old and new format)
Object.keys(localStorage)
  .filter(key => key.startsWith('profile_') || key.startsWith('repos_') || key.startsWith('api_profile_') || key.startsWith('api_repos_'))
  .forEach(key => {
    localStorage.removeItem(key);
    console.log('Cleared:', key);
  });

console.log('✅ All cache cleared! Refresh the page to fetch fresh data.');
`;

console.log("Copy and paste this into your browser console:");
console.log("=====================================");
console.log(clearCacheScript);
console.log("=====================================");
console.log(
	"Or just refresh the page in a few hours when cache expires naturally."
);
console.log("");
console.log("Cache behavior:");
console.log("- All data cached permanently");
console.log("- Only cleared manually with this script");
console.log("- Saves on API calls and loads instantly!");
