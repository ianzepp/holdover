import { solve } from '../src/ballistics'
import { DEFAULT_ENVIRONMENT } from '../src/scenarios'
import { DEFAULT_RIFLES } from '../src/ui/controls'

const rifle = DEFAULT_RIFLES[0] // 6.5 Creedmoor
console.log('')
console.log(rifle.name)
console.log('BC: ' + rifle.bulletBC + ' (' + rifle.dragModel + '), MV: ' + rifle.muzzleVelocityFPS + ' fps, Zero: ' + rifle.zeroDistanceYards + ' yd')
console.log('')

console.log('Distance | Drop (mils) | Cheat (d/2+0.1) | Diff')
console.log('---------|-------------|-----------------|------')

for (let dist = 200; dist <= 1500; dist += 100) {
  const solution = solve(rifle, dist, 0, [], DEFAULT_ENVIRONMENT)
  const dropMils = -solution.dropMils
  const cheat = (dist / 100) / 2 + 0.1
  const diff = dropMils - cheat
  const distStr = dist.toString().padStart(4)
  const dropStr = dropMils.toFixed(2).padStart(5)
  const cheatStr = cheat.toFixed(2).padStart(5)
  const diffStr = (diff >= 0 ? '+' : '') + diff.toFixed(2)
  console.log(distStr + ' yd  |    ' + dropStr + '    |      ' + cheatStr + '      | ' + diffStr)
}
