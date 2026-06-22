import express from "express";
import rateLimit from "express-rate-limit";
import { authenticate } from "../middleware/authMiddleware.js";

// Self-hosted Piston — runs on Docker at port 2000
// Override with PISTON_URL env var if needed
const PISTON_URL = process.env.PISTON_URL || "http://localhost:2000/api/v2/execute";

// Language map: friendly name → Piston execute API language + version
// The self-hosted Piston execute API uses the same friendly names as our app —
// only exceptions are aliases (cpp→c++, csharp→c#, golang→go).
const PISTON_LANG_MAP = {
  javascript:  { language: "javascript", version: "*" },
  js:          { language: "javascript", version: "*" },
  typescript:  { language: "typescript", version: "*" },
  ts:          { language: "typescript", version: "*" },
  python:      { language: "python",     version: "*" },
  python3:     { language: "python",     version: "*" },
  py:          { language: "python",     version: "*" },
  java:        { language: "java",       version: "*" },
  "c++":       { language: "c++",        version: "*" },
  cpp:         { language: "c++",        version: "*" },
  c:           { language: "c",          version: "*" },
  go:          { language: "go",         version: "*" },
  golang:      { language: "go",         version: "*" },
  rust:        { language: "rust",       version: "*" },
  kotlin:      { language: "kotlin",     version: "*" },
  ruby:        { language: "ruby",       version: "*" },
  rb:          { language: "ruby",       version: "*" },
  php:         { language: "php",        version: "*" },
  csharp:      { language: "mono",       version: "*" },
  "c#":        { language: "mono",       version: "*" },
  cs:          { language: "mono",       version: "*" },
  swift:       { language: "swift",      version: "*" },
  dart:        { language: "dart",       version: "*" },
};

const FILE_EXTENSIONS = {
  node: "js",        javascript: "js",  typescript: "ts",
  python: "py",      java: "java",      gcc: "cpp",
  go: "go",          rust: "rs",        kotlin: "kt",
  ruby: "rb",        php: "php",        mono: "cs",        dart: "dart",
  swift: "swift",    dart: "dart",
  // friendly names
  "c++": "cpp",      cpp: "cpp",        c: "c",
  csharp: "cs",      "c#": "cs",        cs: "cs",
};

const router = express.Router();

const executeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.user._id.toString(),
  message: { run: { output: "", stderr: "Too many execution requests. Please slow down." } },
});

// ── POST /execute ─────────────────────────────────────────────────────────
// Proxy to self-hosted Piston. Translates friendly language names to
// Piston runtime names (e.g. "javascript" → "node").
router.post("/execute", authenticate, executeLimiter, async (req, res) => {
  const { language, files } = req.body;

  if (!language || !files?.length) {
    return res.status(400).json({ run: { output: "", stderr: "Missing language or files" } });
  }

  const mapped = PISTON_LANG_MAP[language?.toLowerCase()];
  if (!mapped) {
    return res.status(400).json({
      run: { output: "", stderr: `Language "${language}" is not supported. Add it in Admin → Curriculum settings.` },
    });
  }

  try {
    const pistonRes = await fetch(PISTON_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: mapped.language, version: mapped.version, files }),
    });

    if (!pistonRes.ok) {
      const errText = await pistonRes.text().catch(() => pistonRes.status);
      return res.status(502).json({
        run: { output: "", stderr: `Execution service error: ${errText}` },
      });
    }

    const data = await pistonRes.json();
    return res.json({
      run: {
        output: data.run?.stdout || "",
        stderr:  data.run?.stderr  || "",
      },
    });
  } catch (err) {
    return res.status(502).json({
      run: { output: "", stderr: `Could not reach execution service: ${err.message}` },
    });
  }
});

// ── POST /run-task ────────────────────────────────────────────────────────
// Run user code against test cases (playground task blocks in courses).
// Body: { language, code, testCases: [{ input, expectedOutput }] }
router.post("/run-task", authenticate, executeLimiter, async (req, res) => {
  const { language, code, testCases } = req.body;

  if (!language || !code || !Array.isArray(testCases) || testCases.length === 0) {
    return res.status(400).json({ testResults: [], error: "Missing required fields" });
  }

  const lang   = language.toLowerCase();
  const mapped = PISTON_LANG_MAP[lang];
  if (!mapped) {
    return res.status(400).json({
      testResults: [],
      error: `Language "${language}" is not supported.`,
    });
  }
  const ext      = FILE_EXTENSIONS[mapped.language] || FILE_EXTENSIONS[lang] || lang;
  const fileName = `main.${ext}`;
  const results  = [];

  for (const tc of testCases) {
    try {
      const pistonRes = await fetch(PISTON_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: mapped.language,
          version:  mapped.version,
          files: [{ name: fileName, content: code }],
          stdin: tc.input || "",
        }),
      });

      if (!pistonRes.ok) {
        results.push({
          input: tc.input || "",
          expectedOutput: tc.expectedOutput || "",
          actualOutput: `Execution service error (${pistonRes.status})`,
          passed: false,
        });
        continue;
      }

      const data   = await pistonRes.json();
      const actual = (data.run?.stdout || "").trim();
      const stderr = (data.run?.stderr  || "").trim();
      const expected = (tc.expectedOutput || "").trim();

      results.push({
        input:          tc.input || "",
        expectedOutput: expected,
        actualOutput:   actual || stderr,
        passed:         actual === expected,
      });
    } catch (err) {
      results.push({
        input:          tc.input || "",
        expectedOutput: tc.expectedOutput || "",
        actualOutput:   `Error: ${err.message}`,
        passed:         false,
      });
    }
  }

  return res.json({ testResults: results });
});

export default router;
