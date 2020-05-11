#!/usr/local/bin/node
const fs = require('fs')
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const requiredScores = pkg.lighthouse.requiredScores
const report = JSON.parse(fs.readFileSync('./report.json', 'utf8'))

let success = true

const ciStdout = []

const failedAudits = () => {
  ciStdout.push(Object.keys(report.audits).filter(audit => {
    if (audit.score === 0) {
      return audit
    }
  }))
}

Object.keys(requiredScores).forEach(category => {
  const requiredOutOf100 = requiredScores[category]
  const score = report.categories[category].score * 100

  if (score < requiredScores[category]) {
    ciStdout.push(`❌ ${category} score: ${score}% - Minimum required score ${requiredOutOf100}%`)
    ciStdout.push(`📝 Failed audits: `)
    failedAudits()
    success = false
  } else {
    ciStdout.push(`✅ ${category} score: ${score}% - Minimum required score ${requiredOutOf100}%`)
    if (score > requiredOutOf100) {
      ciStdout.push('over achiever! 😛')
    }
  }
})

console.log(ciStdout.join('\n'))

if (!success) {
  process.exit(1)
}
