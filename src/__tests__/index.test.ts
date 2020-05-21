import rimraf from 'rimraf'
import path from 'path'
import fs from 'fs'
import tmp from 'tmp'
import dirTree from 'directory-tree'
import { pack } from '..'
import packExpected from './fixtures/project.expected'

describe('pack-workspace', () => {
  beforeAll(() => {
    rimraf.sync(__dirname + '/fixtures/**/*.tgz')
  })

  it('creates pack tarball', async () => {
    const filename = 'test-project-v1.0.0.tgz'
    const filepath = path.resolve(__dirname, 'fixtures', 'project', filename)
    expect(fs.existsSync(filepath)).toBe(false)
    await pack({ workspaces: ['@test/app-1', '@test/app-2'], cwd: __dirname + '/fixtures/project' })
    expect(fs.existsSync(filepath)).toBe(true)
  })

  it('creates pack directory', async () => {
    const dir = tmp.dirSync()

    await pack({
      workspaces: ['@test/app-1', '@test/app-2'],
      cwd: __dirname + '/fixtures/project',
      dir: dir.name,
    })

    expect(dirTree(dir.name)).toMatchObject(packExpected)
  })
})
