export default {
  type: 'directory',
  children: [
    {
      name: 'package.json',
      type: 'file',
    },
    {
      name: 'packages',
      type: 'directory',
      children: [
        {
          name: 'app-1',
          type: 'directory',
          children: [
            {
              name: 'package.json',
              type: 'file',
            },
          ],
        },
        {
          name: 'app-2',
          type: 'directory',
          children: [
            {
              name: 'package.json',
              type: 'file',
            },
          ],
        },
        {
          name: 'lib-1',
          type: 'directory',
          children: [
            {
              name: 'package.json',
              type: 'file',
            },
          ],
        },
        {
          name: 'lib-2',
          type: 'directory',
          children: [
            {
              name: 'package.json',
              type: 'file',
            },
          ],
        },
      ],
    },
  ],
}
