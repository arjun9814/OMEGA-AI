import fs from 'fs';
const content = fs.readFileSync('/app/applet/skills/system_skills/gemini_api/SKILL.md', 'utf-8');
const index = content.indexOf('sendClientContent');
console.log(content.substring(Math.max(0, index - 200), index + 500));
