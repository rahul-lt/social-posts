// Scores candidates with Jev: beginner-friendliness (0-3) + topic. Ranks by beginner score, then engagement.
// Usage: node scripts/news/score.mjs candidates.json > scored.json
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const JEV = path.join(os.homedir(), ".claude/skills/jev/jev.py");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "jev-"));
const cands = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));

const questions = {
  beginner: {
    type: "score",
    instructions: "How easily can a beginner developer (a college student or someone in their first year of coding) understand this headline and care about it?",
    criteria: [
      "Needs specialist knowledge to understand: compilers, kernels, cryptography internals, GPU or inference infrastructure, research papers",
      "Matters mainly to developers with a few years of experience running production systems",
      "A junior developer can follow it after one sentence of context",
      "A student who just learned HTML, JavaScript or Python understands it at once: tools they use (VS Code, GitHub, ChatGPT, Claude, React, npm), apps they know, jobs and careers, popular AI tools",
    ],
  },
  topic: {
    type: "choice",
    instructions: "Which software-development area is this headline mainly about? Pick not_dev if it is politics, consumer gadgets, business or general news with no lesson for a software developer.",
    criteria: {
      frontend: "Web frontend, JavaScript, TypeScript, browsers, CSS",
      backend: "Servers, databases, APIs, server languages",
      devops_cloud: "Cloud providers, outages, CI/CD, containers, infrastructure",
      ai_dev: "AI models and AI tools developers use",
      security: "Vulnerabilities, attacks, leaks, privacy",
      careers: "Jobs, hiring, learning to code, developer life",
      not_dev: "Not useful to teach a software developer",
    },
  },
};

async function score(c, i) {
  const f = path.join(tmp, `${i}.json`);
  fs.writeFileSync(f, JSON.stringify({ state: { headline: c.title, link: c.url }, questions }));
  try {
    const a = JSON.parse((await run("python3", [JEV, f])).stdout).answers;
    return { ...c, beginner: Math.round(a.beginner.score * 100) / 100, topic: a.topic.choice, topicConf: a.topic.confidence };
  } catch (e) {
    return { ...c, beginner: null, topic: null, err: String(e.message).slice(0, 120) };
  }
}

const out = [];
for (let i = 0; i < cands.length; i += 12) out.push(...await Promise.all(cands.slice(i, i + 12).map((c, j) => score(c, i + j))));
const eng = (c) => c.hnPoints ?? (c.likes ?? 0) * 3;
out.sort((a, b) => (b.beginner ?? -1) - (a.beginner ?? -1) || eng(b) - eng(a));
console.log(JSON.stringify(out, null, 1));
