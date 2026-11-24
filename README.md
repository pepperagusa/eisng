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

Rolls and history are saved in the browser (localStorage). The daily limit resets at local midnight.

## Run it

No build step. Serve the folder with any static server, for example:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Change the rules

The rules live in `classify.js`. After changing them, run:

```bash
npm test
```

The test recounts every number and fails if the counts in `TIERS` are out of date or the categories stop getting rarer in order. The failure message prints the new counts to paste in.
