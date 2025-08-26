#!/usr/bin/env node

console.log("🔍 Cache Inspector");
console.log("==================");
console.log(
	"Copy and paste this into your browser console to see what's cached:\n"
);

const inspectScript = `
console.log('🔍 GitHub Data Cache Inspector');
console.log('==============================');

const profileKeys = Object.keys(localStorage).filter(key => key.startsWith('profile_'));
const repoKeys = Object.keys(localStorage).filter(key => key.startsWith('repos_'));

console.log(\`📊 Found \${profileKeys.length} cached profiles and \${repoKeys.length} cached repo sets\`);

if (profileKeys.length > 0) {
  console.log('\\n👤 Profile Cache:');
  profileKeys.forEach(key => {
    const username = key.replace('profile_', '');
    try {
      const data = JSON.parse(localStorage.getItem(key));
      const hasAvatar = !!data?.avatar_url;
      const hasLogin = !!data?.login;
      const isValid = hasAvatar && hasLogin;
      console.log(\`  \${isValid ? '✅' : '❌'} \${username}: \${isValid ? 'Valid' : 'Invalid'} - avatar: \${hasAvatar}, login: \${hasLogin}\`);
      if (!isValid) {
        console.log('    Data:', data);
      }
    } catch (e) {
      console.log(\`  ❌ \${username}: Parse Error - \${e.message}\`);
    }
  });
}

if (repoKeys.length > 0) {
  console.log('\\n📦 Repo Cache:');
  repoKeys.forEach(key => {
    const username = key.replace('repos_', '');
    try {
      const data = JSON.parse(localStorage.getItem(key));
      const isArray = Array.isArray(data);
      console.log(\`  \${isArray ? '✅' : '❌'} \${username}: \${isArray ? \`\${data.length} repos\` : 'Invalid (not array)'}\`);
      if (!isArray) {
        console.log('    Data:', data);
      }
    } catch (e) {
      console.log(\`  ❌ \${username}: Parse Error - \${e.message}\`);
    }
  });
}

console.log('\\n🧹 To clear invalid cache entries:');
console.log('Object.keys(localStorage).filter(key => key.startsWith("profile_") || key.startsWith("repos_")).forEach(key => localStorage.removeItem(key));');
`;

console.log(inspectScript);
console.log("\n💡 This will show you:");
console.log("- How many items are cached");
console.log("- Which cache entries are valid/invalid");
console.log("- What invalid data looks like");
console.log("- Command to clear all cache");
