# Getting started

Português: [primeiros-passos.md](primeiros-passos.md).

This guide takes you from no manual to an exported one. It takes about ten minutes.

## What you need

- Node 22.12 or newer.
- For PDF export, Chrome, Edge or Chromium installed on the machine. HTML and Markdown need no browser. If the browser lives somewhere unusual, point to it with the `EXPLICAI_BROWSER` variable.

## 1. Open the Studio

```bash
npx explicai manuals
```

The Studio opens in your browser at `http://localhost:4321`. The `manuals` folder is the workspace: each manual becomes a subfolder, and the folder is created if it does not exist. With no argument, the current folder is used.

Command options:

- `--port 4322` (or `-p`) changes the port. If 4321 is busy, the command says so and suggests the next one.
- `--no-open` skips opening the browser.
- `--version` prints the version and `--help` prints the usage. The command's own messages are in Portuguese.

The Studio listens only on `127.0.0.1`, so nobody outside your machine can reach it. Press Ctrl+C in the terminal to stop it.

## 2. Create a manual

On first run the Studio asks "Which system are you going to explain?". Type a name, such as "Billing", and confirm. "New manual" creates the others. The manual language is the interface language at creation time (Portuguese or English, following the browser). It drives the spellchecker and the labels in the exported HTML.

On disk you get `manuals/billing/manual.json`. The full format is in [manual-format.md](manual-format.md) (in Portuguese).

## 3. Write a page

Use "New page" in the tree on the left. One page per screen or task, with subpages for the parts of a larger task. Drag in the tree to reorder.

Inside a page:

- Type `/` to insert a block (heading, list, divider, alert and others).
- Write steps as a numbered list. After each step, a quote starting with "Result:" (or "Resultado:") says what the reader should see. The exported HTML highlights that line.
- An alert (Tip, Warning, Error, Note) is a quote starting with `[!TIP]`, `[!WARNING]`, `[!CAUTION]` or `[!NOTE]`.

## 4. Paste a screenshot and mark it up

The Studio does not capture the screen. Take the screenshot with your system's tool and paste it into the page with Ctrl+V. The image goes to `assets/`.

Click the screenshot and choose "Edit image" to add numbered markers, highlights, arrows and clickable areas (which lead to another page, a section or a URL). Positions are stored in `assets/<image>.json`, between 0 and 1, so they work at any screen size. Write what each number shows: a marker with no description is flagged when the manual is checked.

## 5. Save versions and pick the one that counts

"Save page version" copies the current text into `.versoes/`. In the version list, "Use on the manual page" picks which one goes into the export. With no pick, the current text is used. Restoring a version first saves the text that was there.

Each page also has a stage: draft, in review, approved or published. In the export dialog, "Approved pages only" leaves out the rest.

## 6. Export

Use "Export manual" at the top of the page and pick a format. Files land in `exportacao/`, inside the manual folder:

| Format | File |
| --- | --- |
| HTML | `exportacao/html/index.html`, with `assets/` and `fonts/` next to it. Opens offline. |
| PDF | `exportacao/<title>.pdf`, the same HTML printed by the browser on the machine. |
| Markdown | `exportacao/markdown/manual.md`, a single file with each screenshot's caption as text. |

To split the manual by audience (student and administrator, for example), set the audience of each page and export one profile at a time. A profile export is written next to the others, in `exportacao/html-<profile>/` and the like. An audience is not access control: hand over the exported file, never the manual folder.

## 7. Keep it in git

A manual is a folder of text. You can version `pages/`, `assets/` and `manual.json` with your code. `exportacao/` and `.lixeira/` usually go in `.gitignore`.

## See a complete manual

[docs/exemplo](exemplo/README.md) has the finished "Financeiro" manual (in Portuguese): three pages, one marked-up screenshot, a chosen version and an audience. To open it:

```bash
npx explicai docs/exemplo
```

In a clone of the repository, run `npm run build` and then `npm start -- docs/exemplo`.

## Compatibility

From 1.0 on, the folder format only grows by addition, and a manual created since 0.1 opens on any 1.x. What follows semver and what is internal are in [Compatibilidade](manual-format.md#compatibilidade) (in Portuguese).
