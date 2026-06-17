// Build script: compiles electron/main.ts → electron/main.cjs
// and copies the standalone Next.js build into the Electron app package.
// Run with: bun run scripts/build-electron.ts

import { build } from 'esbuild'
import { existsSync, rmSync, mkdirSync, copyFileSync, cpSync, lstatSync, readlinkSync, unlinkSync } from 'fs'
import { join } from 'path'

const ROOT = '/home/z/my-project'

// Recursively copy a directory, dereferencing symlinks so the copy contains
// real files instead of broken links (Next.js standalone uses symlinks for
// node_modules pruning, which 7-Zip / Windows can't follow).
function copyDirDerefollow(src: string, dest: string) {
  cpSync(src, dest, {
    recursive: true,
    dereference: true,
  })
}

// Scan and remove any remaining broken symlinks in a directory tree.
function removeBrokenSymlinks(dir: string) {
  if (!existsSync(dir)) return
  const entries = require('fs').readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isSymbolicLink()) {
      try {
        const target = readlinkSync(fullPath)
        const resolved = target.startsWith('/')
          ? target
          : join(dir, target)
        if (!existsSync(resolved)) {
          console.log('  Removing broken symlink:', fullPath, '→', target)
          unlinkSync(fullPath)
          continue
        }
      } catch {
        // ignore
      }
    }
    if (entry.isDirectory()) {
      removeBrokenSymlinks(fullPath)
    }
  }
}

async function main() {
  console.log('[1/3] Compiling electron/main.ts → electron/main.cjs …')
  await build({
    entryPoints: [join(ROOT, 'electron/main.ts')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node20',
    outfile: join(ROOT, 'electron/main.cjs'),
    external: ['electron', 'next'],
    loader: { '.node': 'file' },
    logLevel: 'info',
  })
  console.log('  ✓ Wrote electron/main.cjs')

  console.log('[2/3] Preparing build/resources for electron-builder …')
  if (!existsSync(join(ROOT, '.next/standalone'))) {
    console.error('  ✗ .next/standalone not found — run `bun run build` first')
    process.exit(1)
  }

  // Wipe and re-copy with dereference:true so symlinks become real files
  if (existsSync(join(ROOT, 'public'))) {
    if (existsSync(join(ROOT, '.next/standalone/public'))) {
      rmSync(join(ROOT, '.next/standalone/public'), { recursive: true, force: true })
    }
    copyDirDerefollow(join(ROOT, 'public'), join(ROOT, '.next/standalone/public'))
    console.log('  ✓ Copied public/ into .next/standalone/')
  }

  if (existsSync(join(ROOT, '.next/static'))) {
    if (existsSync(join(ROOT, '.next/standalone/.next/static'))) {
      rmSync(join(ROOT, '.next/standalone/.next/static'), { recursive: true, force: true })
    }
    copyDirDerefollow(join(ROOT, '.next/static'), join(ROOT, '.next/standalone/.next/static'))
    console.log('  ✓ Copied .next/static into .next/standalone/.next/static/')
  }

  if (existsSync(join(ROOT, 'db'))) {
    if (existsSync(join(ROOT, '.next/standalone/db'))) {
      rmSync(join(ROOT, '.next/standalone/db'), { recursive: true, force: true })
    }
    copyDirDerefollow(join(ROOT, 'db'), join(ROOT, '.next/standalone/db'))
    console.log('  ✓ Copied db/ (seed database) into .next/standalone/')
  }

  if (existsSync(join(ROOT, 'prisma'))) {
    if (existsSync(join(ROOT, '.next/standalone/prisma'))) {
      rmSync(join(ROOT, '.next/standalone/prisma'), { recursive: true, force: true })
    }
    copyDirDerefollow(join(ROOT, 'prisma'), join(ROOT, '.next/standalone/prisma'))
    console.log('  ✓ Copied prisma/ into .next/standalone/')
  }

  // Sweep for any remaining broken symlinks (Prisma client symlinks etc.)
  console.log('  • Scanning for broken symlinks in .next/standalone/ …')
  removeBrokenSymlinks(join(ROOT, '.next/standalone'))

  // Prisma creates a runtime symlink at .next/standalone/.next/node_modules/@prisma/client-<hash>
  // that points to ../../../node_modules/@prisma/client. This symlink is VALID
  // relative to the project, but BROKEN when electron-builder copies the
  // standalone dir into resources/app/ and tries to compress it. Remove the
  // symlink entirely — the runtime will recreate it on first DB access.
  const prismaDir = join(ROOT, '.next/standalone/.next/node_modules/@prisma')
  if (existsSync(prismaDir)) {
    const fs = require('fs')
    for (const entry of fs.readdirSync(prismaDir, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) {
        const linkPath = join(prismaDir, entry.name)
        console.log('  • Removing Prisma runtime symlink:', linkPath)
        fs.unlinkSync(linkPath)
      }
    }
  }

  console.log('[3/3] Done. Ready for `electron-builder`.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

