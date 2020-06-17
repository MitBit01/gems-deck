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
  }, new Map()).entries())
}

/**
 * @template T
 * @param {T[]} arr 
 * @param {function(T): boolean} predicate 
 * @returns {boolean}
 */
function anyMatch(arr, predicate) {
  for (const elm of arr)
    if (predicate(elm))
      return true
  return false
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

function incrementCounterMap(map, element) {
  let oldCount = map.get(element) ?? 0
  map.set(element, oldCount + 1)
}

/** @param {number[]} nums @returns {number} */
function longestRun(nums) {
  let longestRun = 0
  let s = new Set(nums)
  s.forEach(n => {
    let count = 0
    while (s.has(n + count))
      count++
    if (count > longestRun)
      longestRun = count
  })
  return longestRun
}

/** @param {{rank: number, suit: string}[]} hand */
function classifySicasepHand(hand) {
  const counts = countEach(hand.map(c => c.rank)).map(rc => rc[1])
  if (counts.includes(6)) {
    return '6 of a Kind'
  } else if (counts.includes(5)) {
    return '5 of a Kind'
  } else if (counts.includes(4) && counts.includes(2)) {
    return 'Fuller House (Quad, Pair)'
  } else if (counts.includes(4)) {
    return 'One Quad'
  } else if (counts.filter(c => c === 3).length === 2) {
    return 'All Triples'
  } else if (counts.includes(3) && counts.includes(2)) {
    return 'Full House (Triple, Pair)'
  } else if (counts.includes(3)) {
    return 'One Triple'
  } else if (counts.filter(c => c === 2).length === 3) {
    return 'All Pairs'
  } else if (counts.filter(c => c === 2).length === 2) {
    return 'Two Pairs'
  } else if (counts.includes(2)) {
    return 'One Pair'
  } else {
    return 'All Solos'
  }
}

/** @param {{rank: number, suit: string}[]} hand */
function classifyPokerHand(hand) {
  const hasStraight = longestRun(hand.map(c => c.rank)) >= 5
  const hasFlush = anyMatch(countEach(hand.map(c => c.suit)), sc => sc[1] === 5)
  const rankCounts = countEach(hand.map(c => c.rank)).map(rc => rc[1])
  if (hasStraight && hasFlush) {
    return 'Straight Flush'
  } else if (hasStraight) {
    return 'Straight'
  } else if (hasFlush) {
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
  <td>${(rowData.probability * 100).toFixed(6)}%</td>
  <td>${(rowData.cumulativeProbability * 100).toFixed(6)}%</td></tr>`
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

const runCount = parseInt(document.querySelector('#prob-count').innerHTML.replace(/,/gi, ''))

function runSimulation(classification, cardsDealt) {
  let classCounts = new Map()
  let classSamples = new Map()
  for (let run = 0; run < runCount; run++) {
    let sample = drawFrom(deck, cardsDealt)
    let hand = classification(sample)
    incrementCounterMap(classCounts, hand)
    if (!classSamples.has(hand)) classSamples.set(hand, sample)
  }
  let rowDatas = Array.from(classCounts.entries()).sort((a, b) => a[1] - b[1])
    .map(cc => ({ hand: cc[0], sample: classSamples.get(cc[0]), probability: cc[1] / runCount }))
  let cumulativeProbability = 0
  for (const data of rowDatas) {
    cumulativeProbability += data.probability
    data.cumulativeProbability = cumulativeProbability
  }
  return rowDatas
}

render(probRepTableTemplate(runSimulation(classifyPokerHand, 5)), document.querySelector('#prob-table-5'))
render(probRepTableTemplate(runSimulation(classifyPokerHand, 7)), document.querySelector('#prob-table-7'))
render(probRepTableTemplate(runSimulation(classifySicasepHand, 6)), document.querySelector('#prob-table-6'))
