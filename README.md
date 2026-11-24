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

Each roll also earns achievements (70 in total), like **Double Duplicates (1 & 4)**, **Even Steven**, **Prime Time** or **Calendar Day (12/14/74)**. A roll's points are the sum of its achievements.

Points come from how many of the 1,000,000 numbers earn the achievement: `10 × √(1,000,000 / count)`, rounded. So a 1-in-2 achievement is worth 15 points, a 1-in-1,000 one about 325, and a one-of-a-kind number 10,000.

## Test mode

`UNLIMITED = true` at the top of `app.js` removes the 7-per-day limit for testing. Set it to `false` for launch.

Rolls and history are saved in the browser (localStorage). The daily limit resets at local midnight.

## Run it

No build step. Serve the folder with any static server, for example:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Change the rules

The category rules live in `classify.js` and the achievements in `achievements.js`. After changing them, run:

```bash
npm test
```

The test recounts every number and fails if the counts in `TIERS` or `COUNTS` are out of date or the categories stop getting rarer in order. The failure message prints the new counts to paste in.
