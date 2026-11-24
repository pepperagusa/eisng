# Randomize

A single-page web app. Every day you get 7 presses of the **Randomize** button. Each press gives a random number from 1 to 1,000,000 and ranks it by how unique its pattern is.

| Category   | Chance       | Examples |
|------------|--------------|----------|
| Common     | 1 in 2       | 982,145 |
| Uncommon   | 1 in 3       | ends in zero, only four different digits |
| Cool       | 1 in 9       | three in a row (444), three-step sequence (345), round hundred |
| Rare       | 1 in 18      | two pairs (1122), palindrome (12321), four-step sequence, round thousand |
| Insane     | 1 in 368     | six-digit palindrome (123321), repeating triple (456456), two-digit number |
| Extreme    | 1 in 2,123   | 500,000, 121,212, five of a kind, single digit |
| Impossible | 1 in 43,478  | 777,777, 123,456, 1,000,000, 314,159 (pi) |

The odds are exact: they come from classifying all 1,000,000 possible numbers.

## Achievements and points

Each roll earns achievements: 2,001 in total, in 13 families.

| Family | Example | Count |
|---|---|---|
| Classics | Double Duplicates (1 & 4), Calendar Day, Palindrome | 70 |
| Hidden codes | Has 583 in it | 995 |
| Hidden pairs | Has 58 in it | 99 |
| Years | Has 1999 in it | 200 |
| Starts with / Ends with | Starts with 42, ends with 7 | 207 |
| Bookends | Starts and ends with 5 | 9 |
| Divisible by | A multiple of 23 | 93 |
| Neighborhoods | Between 340,000 and 349,999 | 110 |
| Digit sums | Digits add up to 27 | 61 |
| Digit counts | Exactly three 5s, no 8s | 78 |
| Runs | Four 4s in a row | 49 |
| Math collectibles | Twin prime, Armstrong number, Taxicab 1729 | 30 |

Points come from how many of the 1,000,000 numbers earn the achievement: `10 × √(1,000,000 / count)`, rounded. So a 1-in-2 achievement is worth 15 points, a 1-in-1,000 one about 325, and a one-of-a-kind number 10,000.

The ⚙️ button opens Settings: how to play, an achievement browser (search, filter by family or locked/unlocked, sort), and a reset button.

## Icon shop

The 🛒 button opens a shop of 10 original cube icons (in `shop.js`), drawn as inline SVG. Points to spend = points earned − points spent. The equipped icon shows next to the title.

| # | Icon | Price |
|---|---|---|
| 1 | Sunny | 10,000 |
| 2 | Grump | 30,000 |
| 3 | Checker | 50,000 |
| 4 | Zap | 65,000 |
| 5 | Visor | 95,000 |
| 6 | Spook | 120,000 |
| 7 | Blaze | 150,000 |
| 8 | Monarch | 175,000 |
| 9 | Nebula | 190,000 |
| 10 | Prism (animated) | 230,000 |

## Daily chest

Once a day you can open a chest for bonus points (`chest.js`). Chest points can be spent in the shop.

| Prize | Points | Chance |
|---|---|---|
| Small | 1,000 | 50% |
| Nice | 2,500 | 25% |
| Big | 5,000 | 15% |
| Huge | 10,000 | 7% |
| Mega | 25,000 | 2.5% |
| Jackpot! | 50,000 | 0.5% |

## Test mode

`UNLIMITED = true` at the top of `app.js` removes the 7-per-day limit and lets the chest be reopened, for testing. Set it to `false` for launch.

Rolls and history are saved in the browser (localStorage). The daily limit resets at local midnight.

## Run it

No build step. Serve the folder with any static server, for example:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Change the rules

The category rules live in `classify.js` and the achievements in `achievements.js`. After changing achievements, regenerate their counts:

```bash
npm run counts
```

Then run the tests:

```bash
npm test
```

The test recounts every number (takes about 30 seconds) and fails if `counts.js` or the counts in `TIERS` are out of date, if any achievement can't be earned, or if the categories stop getting rarer in order.
