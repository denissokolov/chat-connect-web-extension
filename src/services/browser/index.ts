import { isTestEnv, isStorybookEnv } from '@/utils/env'

import { WXTBrowser } from './WXTBrowser'
import { MockBrowser } from './MockBrowser'
import type { IBrowser } from './IBrowser'

const browser: IBrowser = isTestEnv() || isStorybookEnv() ? new MockBrowser() : new WXTBrowser()

export default browser
