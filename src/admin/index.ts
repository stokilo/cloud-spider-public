import * as zod from 'zod'

export enum SystemVersion {
   V001 = '0.0.1'
}

export const MigrationStatusSchema = zod.object({
  version: zod.string(),
  order: zod.string(),
  type: zod.string(),
  success: zod.boolean().optional(),
  migrationStart: zod.string().optional(),
  migrationEnd: zod.string().optional()
})

export const SystemStatusSchema = zod.object({
  version: zod.nativeEnum(SystemVersion),
  envName: zod.string(),
  migrationHistory: zod.array(MigrationStatusSchema)
})

export type MigrationStatus = zod.TypeOf<typeof MigrationStatusSchema>
export type SystemStatus = zod.TypeOf<typeof SystemStatusSchema>

export interface MigrationJob {
  targetSystemVersion() : SystemVersion
  orderNumber() : number
  type(): string
  allowReRun(): boolean
  migrate () : Promise<boolean>
}

export enum AdminPanelActions {
  STATUS = 'status',
  MIGRATE = 'migrate'
}

export function delay (ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
