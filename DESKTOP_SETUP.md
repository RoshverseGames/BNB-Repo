# B&B CRM — Desktop App Setup

This guide walks you through getting `B&B-CRM-Setup-1.0.0.exe` (Windows) and `B&B CRM-1.0.0.dmg` (Mac) built in the cloud via GitHub Actions — **no local building required**.

## What you'll get

| File | Platform | How to install |
|---|---|---|
| `B&B-CRM-Setup-1.0.0.exe` | Windows 10/11 (x64) | Double-click → install wizard |
| `B&B-CRM-1.0.0-arm64.dmg` | Mac (Apple Silicon: M1/M2/M3) | Open → drag to Applications |
| `B&B-CRM-1.0.0-x64.dmg` | Mac (Intel) | Open → drag to Applications |
| `B&B-CRM-1.0.0-x64.AppImage` | Linux (bonus) | `chmod +x` → double-click |

Each installer contains the full app + a seed database (30 sample companies, ~80 people, ~80 notes). On first launch, the database is copied to your user folder so your data persists between launches.

---

## One-time setup (10 minutes, never repeat)

### Step 1 — Create a GitHub account (if you don't have one)

Go to https://github.com/signup and create a free account.

### Step 2 — Create a new repository

1. Click the **+** in the top-right → **New repository**
2. Repository name: `bnb-crm`
3. Description: `Bridges and Blueprints CRM`
4. Choose **Public** (free unlimited Actions minutes) OR **Private** (2,000 free minutes/month — more than enough)
5. **Don't** check "Add a README" or any other initialization
6. Click **Create repository**
7. Copy the repo URL — looks like `https://github.com/YOUR_USERNAME/bnb-crm`

### Step 3 — Send me the repo URL

Tell me the URL and I'll push the code (with the GitHub Actions workflow) to that repo. This requires:
- Either you give me push access temporarily (Settings → Collaborators → add my GitHub username)
- OR you create the repo and I provide you a single shell command to push the code from this sandbox

(We'll figure out the easiest path together when you get there.)

### Step 4 — Run the build (one click)

1. Go to your repo on GitHub
2. Click the **Actions** tab
3. On the left sidebar, click **Build Desktop Installers**
4. Click the **Run workflow** button (top-right) → choose version `1.0.0` → click green **Run workflow**
5. Wait ~5–8 minutes. You can click into the running workflow to watch progress in real-time.

When it finishes:
- A green ✅ appears next to the run
- All three installers (`.exe`, `.dmg` ×2, `.AppImage`) are downloadable as **artifacts** from the run page
- Scroll to the bottom of the run summary → download each artifact (a `.zip` containing the installer)

---

## Future updates (1 minute each)

Whenever you want me to change something in the app:

1. I make the change in this sandbox
2. I push the updated code to your GitHub repo (one command for me)
3. You go to **Actions** → **Run workflow** → enter the new version (e.g. `1.1.0`) → click Run
4. Download the new installers in 5–8 minutes

Optionally, you can also push a git tag like `v1.1.0` and the workflow auto-runs + creates a Release page with all installers attached.

---

## Cost

- **$0** if your repo is public (unlimited free Actions minutes)
- **$0** if your repo is private and you build < 130 times per month (2,000 free minutes/month, each build uses ~15 minutes total)
- After that, GitHub bills $0.008/minute — so a full Win+Mac+Linux build would cost ~$0.12. Realistically you won't hit this.

---

## First-run notes for end users

### Windows
- SmartScreen may say "Windows protected your PC" → click **More info** → **Run anyway**
- This is normal for unsigned installers; the app is safe. To remove the warning, you'd need to purchase a code-signing certificate (~$200/year from DigiCert/Sectigo) — talk to me if you want to do that.

### macOS
- First launch: "B&B CRM cannot be opened because the developer cannot be verified"
- **Right-click** the app → **Open** → **Open anyway**
- After that, it opens normally every time
- To remove this warning permanently, you'd need an Apple Developer account ($99/year) — talk to me if you want to do that.

### Where is my data stored?
- **Windows:** `C:\Users\<you>\AppData\Roaming\B&B CRM\data\custom.db`
- **macOS:** `~/Library/Application Support/B&B CRM/data/custom.db`
- **Linux:** `~/.config/B&B CRM/data/custom.db`

Use the in-app menu **Help → Open Database Folder** to jump straight there.

---

## Troubleshooting

**Workflow fails with "module not found"**
- Make sure you pushed everything including `package.json` and `bun.lock`. Re-push if unsure.

**Workflow fails at "Build Next.js" step**
- Check the workflow log; usually a TypeScript error. Send me the error.

**`.dmg` won't open on Mac**
- Mac says "cannot be opened because the developer cannot be verified" — right-click → Open → Open anyway. This is expected for unsigned apps.

**App opens but shows blank window**
- The Next.js server may have failed to start. Try **View → Reload** (Cmd/Ctrl+R) in the app menu. If still blank, use **View → Toggle Developer Tools** and check the console — send me any errors.

**Want to wipe all data and start fresh**
- In the app: **Help → Reset Demo Data** → confirm
- Or manually delete the `custom.db` file from the data folder above and restart the app
