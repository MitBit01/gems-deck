/**
 * @template T
 * @param {T[]} arr
 * @returns {[T, number][]}
 */
function countEach(arr) {
  return Array.from(arr.reduce((/**@type {Map<T, number>}*/map, elm) => {
    let oldCount = map.get(elm) ?? 0
    map.set(elm, oldCount + 1)
    return map
  },new Map()).entries())
}

function drawFrom(arr, n) {
  let result = new Array(n)
  let len = arr.length
  let taken = new Array(len);
  while (n--) {
    let x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}

/** @param {{rank: number, suit: string}[]} arr */
function classifyHand(arr) {
  const isStraight = arr.map(card => card.rank)
    .sort()
    .every((rank, i) => rank - i === arr[0].rank)
  const isFlush = arr.every(card => card.suit === arr[0].suit)
  const rankCounts = countEach(arr.map(c => c.rank)).map(rc => rc[1])
  if (isStraight && isFlush) {
    return 'Straight Flush'
  } else if (isStraight) {
    return 'Straight'
  } else if (isFlush) {
    return 'Flush'
  } else if (rankCounts.includes(5)) {
    return 'Five of a Kind'
  } else if (rankCounts.includes(4)) {
    return 'Four of a Kind'
  } else if (rankCounts.includes(3) && rankCounts.includes(2)) {
    return 'Full House'
  } else if (rankCounts.includes(3)) {
    return 'Three of a Kind'
  } else if (rankCounts.filter(x => x === 2).length === 2) {
    return 'Two Pair'
  } else if (rankCounts.includes(2)) {
    return 'Pair'
  } else {
    return 'Nothing'
  }
}

function cardCompare(c1, c2) {
  const suits = ['Ruby', 'Emerald', 'Sapphire']
  const c1Suit = suits.indexOf(c1.suit)
  const c2Suit = suits.indexOf(c2.suit)
  return c1Suit < c2Suit ? -1 : c1Suit > c2Suit ? 1 : c1.rank - c2.rank
}

const cardTemplate = card => html`[ ${card.rank}${card.suit[0]} ]`
const probRepRowTemplate = rowData => html`<tr>
  <td>${rowData.hand}:<br />${rowData.sample.sort(cardCompare).map(cardTemplate)}</td>
  <td>${rowData.probability.toFixed(6)}</td>
  <td>${rowData.cumulativeProbability.toFixed(6)}</td></tr>`
const probRepTableTemplate = (rowDatas) => html`
  <tr><th>Hand</th><th>Probability</th><th>Cumulative Probability</th></tr>
  ${rowDatas.map(probRepRowTemplate)}`

const deck = []
const suits = ['Ruby', 'Emerald', 'Sapphire']
for (const suit of suits) {
  for (let rank = 1; rank <= 10; rank++) {
    deck.push({ rank: rank, suit: suit })
    deck.push({ rank: rank, suit: suit })
  }
}

const runCount = parseInt(document.querySelector('#prob-run-count').innerHTML)
let handsToCounts = new Map()
let handsToSamples = new Map()
for (let run = 0; run < runCount; run++) {
  let sample = drawFrom(deck, 5)
  let hand = classifyHand(sample)
  let count = handsToCounts.get(hand) ?? 0
  handsToCounts.set(hand, count + 1)
  if (!handsToSamples.has(hand)) handsToSamples.set(hand, sample)
}
let rowDatas = Array.from(handsToCounts.entries())
  .sort((hc1, hc2) => hc1[1] - hc2[1])
  .map(hc => ({
    hand: hc[0],
    sample: handsToSamples.get(hc[0]),
    probability: hc[1] / runCount
  }))
let cumulativeProbability = 0
for (const data of rowDatas) {
  cumulativeProbability += data.probability
  data.cumulativeProbability = cumulativeProbability
}

render(probRepTableTemplate(rowDatas), document.querySelector('#probability-table'))