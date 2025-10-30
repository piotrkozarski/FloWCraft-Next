import type { Over } from '@dnd-kit/core'

/**
 * Get the column ID from a drop target, handling both column drops and item drops
 * @param over The drop target from DnD Kit
 * @returns The column ID or null if invalid
 */
export function getDropColumnId(over: Over | null): string | null {
  if (!over) return null

  const d = over.data?.current as any

  // 1) If we hit a column directly
  if (d?.type === 'column' && over.id) return String(over.id)

  // 2) If we hit an item - use its columnId
  if (d?.type === 'item' && d?.columnId) return String(d.columnId)

  // 3) Fallback: try to match by id
  return typeof over.id === 'string' ? over.id : null
}

/**
 * Calculate the target index for dropping an item
 * @param over The drop target
 * @param items The items in the target column
 * @returns The target index for insertion
 */
export function getDropIndex(over: Over | null, items: any[]): number {
  if (!over) return items.length

  const d = over.data?.current as any

  // If dropped on an item, insert before it
  if (d?.type === 'item' && d?.index !== undefined) {
    return d.index
  }

  // If dropped on empty space, append to end
  return items.length
}
