import { isStorybookEnv, isTestEnv } from '@/utils/env'
import { MemoryDBRepository } from './MemoryDBRepository'
import { IndexedDBRepository } from './IndexedDBRepository'
import type { IRepository } from './IRepository'

const repository: IRepository =
  isTestEnv() || isStorybookEnv() ? new MemoryDBRepository() : new IndexedDBRepository()

export default repository
