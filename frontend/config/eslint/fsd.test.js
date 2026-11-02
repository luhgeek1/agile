import { RuleTester } from 'eslint'
import { fsdBoundaries } from './fsd.js'

const filename = '/project/frontend/src/views/home/ui/home-page.tsx'
new RuleTester().run('fsd/boundaries', fsdBoundaries, {
  valid: [
    { filename, code: "import { GoalCard } from '@/entities/goal'" },
    { filename, code: "import { GoalCard } from '../../../entities/goal'" },
    { filename, code: "import { local } from '../model/local'" },
    { filename, code: "import { Button } from '@/shared/ui'" },
    {
      filename: '/project/frontend/src/entities/activity/ui/card.tsx',
      code: "import { CategoryIcon } from '@/entities/wallet/@x/activity'",
    },
    {
      filename: '/project/frontend/src/app/app.tsx',
      code: "import { HomePage } from '@/views/home'",
    },
  ],
  invalid: [
    {
      filename,
      code: "import { Other } from '@/views/settings'",
      errors: [{ messageId: 'slice' }],
    },
    { filename, code: "import { Other } from '../../settings'", errors: [{ messageId: 'slice' }] },
    { filename, code: "import { App } from '@/app'", errors: [{ messageId: 'layer' }] },
    {
      filename,
      code: "import { Card } from '@/entities/goal/ui/card'",
      errors: [{ messageId: 'publicApi' }],
    },
    {
      filename,
      code: "export { Card } from '../../../entities/goal/ui/card'",
      errors: [{ messageId: 'publicApi' }],
    },
    { filename, code: "import('@/app/app')", errors: [{ messageId: 'layer' }] },
    {
      filename: '/project/frontend/src/shared/ui/button.tsx',
      code: "import { Goal } from '@/entities/goal'",
      errors: [{ messageId: 'layer' }],
    },
    {
      filename: '/project/frontend/src/entities/goal/ui/card.tsx',
      code: "import { Wallet } from '@/entities/wallet/@x/activity'",
      errors: [{ messageId: 'slice' }],
    },
  ],
})
console.log('FSD boundaries: 14 cases passed')
