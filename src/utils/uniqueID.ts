/**
 * Generate unique ID
 */
const usedIDs: number[] = []
export const uniqueID = (): number => {
  let id: number
  do {
    id = (Math.random() * 1000000) | 0
  } while (usedIDs.includes(id))
  usedIDs.push(id)
  return id
}
