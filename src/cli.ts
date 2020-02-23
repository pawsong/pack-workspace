#!/usr/bin/env node

import meow from 'meow'
import { pack } from './pack'

const cli = meow(`
	Usage
	  $ pack-workspace <input>

	Options
	  --dir, -d  Output directory

	Examples
	  $ pack-workspace --directory out
`, {
	flags: {
		dir: {
			type: 'string',
			alias: 'd'
		}
	}
})

pack({
  workspaces: cli.input,
  cwd: process.cwd(),
  dir: cli.flags.dir,
}).catch(err => {
  console.error(err.message)
  process.exit(1)
})
