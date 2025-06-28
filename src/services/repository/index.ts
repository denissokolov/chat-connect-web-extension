import { isStorybookEnv, isTestEnv } from '@/utils/env'
import { MemoryDBRepository } from './MemoryDBRepository'
import { IndexedDBRepository } from './IndexedDBRepository'

const repository =
  isTestEnv() || isStorybookEnv() ? new MemoryDBRepository() : new IndexedDBRepository()

export default repository
