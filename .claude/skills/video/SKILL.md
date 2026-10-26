---
name: video
description: Entry point of the video studio. Use at the start of a session in this workspace when the user greets, says they want to make/edit a video, or gives no concrete instruction; also when they ask "what's the status" or "continue". Asks new-vs-continue, then routes to the right pipeline stage skill.
---

# Studio entry point

You are opening a production session. Goal: within one or two questions, know **which project** and **which stage**, then hand off to the stage skill.

## 1. Read the state

The SessionStart hook already printed `VIDEO STUDIO STATUS`. If it's missing, run `node scripts/status.mjs`.

If `.env` is missing, mention once: "Voice/music generation needs API keys — copy `.env.example` to `.env` and fill ElevenLabs / Cartesia / Stability keys." Don't block on it; intake, script and build work without keys.

## 2. Ask one routing question

Use AskUserQuestion:

- **"What are we working on?"** — options: `New video` (recommended when no active projects), then up to 3 most recently updated non-delivered projects as `Continue <slug> (<stage>)`. "Other" covers the rest (revisions to a delivered video, a client brand kit, etc.).

If the user's message already answers this, skip the question.

## 3. Route

| Situation | Go to |
|---|---|
| New video | `video-intake` |
| Continue a project | read `projects/<slug>/project.json`, `brief.md`, latest `feedback/round-N.md` if any; then the skill for its `stage` (table below) |
| Client sent feedback on a draft | `video-feedback` |
| New client / brand update | `brand-kit` |
| "Render it", "export", "deliver" | `video-render` |

| `stage` | Skill |
|---|---|
| intake | `video-intake` (finish missing brief fields) |
| references | `video-reference` |
| script | `video-script` |
| voiceover | `video-voiceover` |
| build | `video-build` (it pulls in `video-ui-recreate`, `video-motion`, `video-music` as needed) |
| review | `video-render` (draft + stills), then wait for client feedback |
| revisions | `video-feedback` |
| delivered | ask what changed → `video-feedback` (new revision round) |

When continuing, give a 2–3 line recap first: what the video is, what's done, what's next — then proceed.

## 4. Keep state current

At the end of every stage: update `project.json` (`stage`, `approvals.*`, `revision`, `updatedAt`) so the next session's status line is right.

## Approval gates (never skip)

1. **Script approved** before generating voice-over (costs credits; every later step depends on it).
2. **Preview approved** before the final full-quality render in all formats.

When an approval is given, record it: `"approvals": {"script": "2026-10-27 by client via email"}`.
