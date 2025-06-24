import { isTestEnv, isStorybookEnv } from '@/utils/env'

import { ChromeBrowser } from './ChromeBrowser'
import { MockBrowser } from './MockBrowser'
import type { IBrowser } from './IBrowser'

const browser: IBrowser = isTestEnv() || isStorybookEnv() ? new MockBrowser() : new ChromeBrowser()

export default browser
