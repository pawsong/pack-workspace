import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import tar from 'tar'
import tmp from 'tmp'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'
import stripAnsi from 'strip-ansi'

interface PackOptions {
  workspaces: string[]
  cwd: string
  dir?: string
  filename?: string
}

type WorkspaceInfoResult = Record<string, WorkspaceInfoResultItem>

interface WorkspaceInfoResultItem {
  location: string
  workspaceDependencies: string[]
  mismatchedworkspaceDependencies: string[]
}

function generateRandomString() {
  return Math.random().toString(36).substring(7)
}

function moveDir(from: string, to: string) {
  mkdirp.sync(path.resolve(to, '..'))
  fs.renameSync(from, to)
}

function packPackage(dir: string) {
  const tmpdir = tmp.dirSync({ unsafeCleanup: true })
  const outputFile = generateRandomString()
  const outputPath = path.resolve(tmpdir.name, `${outputFile}.tar.gz`)
  execSync(`yarn pack --filename ${outputPath}`, { cwd: dir })
  tar.extract({ file: outputPath, cwd: tmpdir.name, sync: true })
  fs.unlinkSync(outputPath)
  return tmpdir.name
}

export async function pack({ workspaces, cwd, dir, filename }: PackOptions) {
  if (workspaces.length === 0) {
    throw new Error('At least one workspace package name is required')
  }

  const pkgName = path.resolve(cwd, 'package.json')
  const pkg = require(pkgName)
  if (!pkg.name) {
    throw new Error(`Root package doesn't have a name.`)
  }

  if (!pkg.version) {
    throw new Error(`Root package doesn't have a version.`)
  }

  const output = stripAnsi(
    execSync('yarn workspaces --silent info', {
      cwd,
      stdio: 'pipe',
      encoding: 'utf8',
    }),
  )

  const result: WorkspaceInfoResult = JSON.parse(output.trim())

  const ret = packPackage(cwd)
  const retPkg = path.resolve(ret, 'package')
  for (const workspaceName of Object.keys(result)) {
    const workspace = result[workspaceName]
    const pkgPath = path.resolve(retPkg, workspace.location)
    rimraf.sync(pkgPath)
  }

  const deps = new Map<string, WorkspaceInfoResultItem>()

  const resolve = (workspaceName: string) => {
    if (deps.has(workspaceName)) {
      return
    }

    const workspace = result[workspaceName]
    if (!workspace) {
      throw new Error(`cannot find workspace ${workspaceName}`)
    }

    deps.set(workspaceName, workspace)

    for (const dep of workspace.workspaceDependencies) {
      resolve(dep)
    }
  }

  for (const workspaceName of workspaces) {
    resolve(workspaceName)
  }

  for (const workspace of deps.values()) {
    const pkgPath = path.resolve(cwd, workspace.location)
    const result = packPackage(pkgPath)
    const o = path.resolve(retPkg, workspace.location)
    moveDir(path.resolve(result, 'package'), o)
  }

  const name = pkg.name[0] === '@'
  // scoped packages get special treatment
    ? pkg.name.substr(1).replace(/\//g, '-')
    : pkg.name

  if (dir) {
    fs.renameSync(retPkg, dir)
    return
  }

  const target = filename || `${name}-v${pkg.version}.tgz`
  tar.create({ gzip: true, file: path.resolve(cwd, target), cwd: ret, sync: true }, ['.'])
}
