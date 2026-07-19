import fs from 'fs';
const d = JSON.parse(fs.readFileSync('lh-fresh.json', 'utf8'));

const cats = d.categories;
console.log('=== SCORES ===');
for (const k in cats) {
  console.log(k + ': ' + Math.round(cats[k].score * 100));
}
console.log('');

const cc = d.audits['color-contrast'];
console.log('=== CONTRAST FAILURES ===');
if (cc && cc.details && cc.details.items) {
  console.log('Total failures: ' + cc.details.items.length + '\n');
  cc.details.items.forEach((x, i) => {
    console.log('FAIL #' + (i + 1));
    if (x.fgColor) console.log('  fgColor: ' + x.fgColor);
    if (x.bgColor) console.log('  bgColor: ' + x.bgColor);
    if (x.contrastRatio) console.log('  ratio: ' + x.contrastRatio);
    if (x.node) {
      if (x.node.selector) console.log('  selector: ' + x.node.selector);
      if (x.node.snippet) console.log('  snippet: ' + x.node.snippet);
      if (x.node.nodeLabel) console.log('  nodeLabel: ' + x.node.nodeLabel);
      if (x.node.explanation) console.log('  explanation: ' + x.node.explanation);
    }
    console.log('');
  });
} else {
  console.log('(no contrast failures found)');
}

const ho = d.audits['heading-order'];
console.log('=== HEADING ORDER ===');
if (ho && ho.score !== 1) {
  console.log('FAIL (score: ' + ho.score + ')');
  if (ho.details && ho.details.items) {
    ho.details.items.forEach(x => {
      if (x.headingOrder) {
        console.log('  Elements found:');
        x.headingOrder.forEach(h => {
          console.log('    <h' + h.level + '>: ' + (h.text || '(empty)'));
        });
      }
    });
  }
} else {
  console.log('PASS');
}
