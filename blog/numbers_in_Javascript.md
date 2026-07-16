# Understanding JavaScript Number

In JS, a variable can be of type number. This means a variable having type number can store numerical data—signed, integer and floating.

The limit is $\pm(2^{53} - 1)$.

Computers only understand bits (0 or 1). So you can assume that numbers, whether integers like `1`, `2`, `-4` etc., or fractions like `3.45`, `2.00`, `3.14` etc., are to be stored in bits only.

Usually, to write big numbers, we humans use something like:
$$276,000 = 2.76 \times 10^5$$

IEEE 754 _(a standard to save fractions in computer)_ suggests saving numbers in this format only, with the base as 2. So, the formula becomes:

$$\text{Sign} \times \text{Mantissa(Fraction)} \times 2^{\text{exponent}}$$

So, back to our JavaScript part, the number data type allots a variable a 64-bit slot. Now, IEEE 754 divides the slot into three parts:

- **1 bit:** sign (positive as 0, negative as 1)
- **11 bits:** exponent
- **52 bits:** fraction

Integers are stored exactly the same way.

### Example: Storing the number 5

- **Sign bit:** `0` (positive)
- **Binary form:** 5 is `0101` or $1.01 \times 2^2$
- **Exponent bit:** $2 + 1023$ (safety bias is added always) = `1025`
- **Conversion:** `1025` is converted to an 11-bit exponent binary
- **Mantissa:** `010000...` (for 53-bit binary) and is stored as such.

Because of this layout, there is an upper limit for a `Number` variable to be stored safely:

```js
console.log(Number.MAX_SAFE_INTEGER);
// Output: 9007199254740991
```

You can check how things go wrong by typing this:

```js
let x = 9007199254740991;
console.log(x + 1); // 9007199254740992 (Correct)
console.log(x + 2); // 9007199254740992 (Wrong! Ran out of bits)
```

### The Two Zeros in JavaScript

In JS, there are two zeros: `+0` and `-0` (remember, there is a signed bit in the IEEE 754 format). They are usually treated as the same:

```js
console.log(0 === -0); // true
```

Unless they are used in division:

```js
console.log(1 / 0); // Infinity
console.log(1 / -0); // -Infinity
```

### Core Number Constants

There are various constants for storing different values in `Number`:

| Constant             | Value / Meaning                                                                                                         |
| :------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| **Number.MAX_VALUE** | `1.7976931348623157e+308` (The absolute largest number JS can hold before turning into `Infinity`)                      |
| **Number.MIN_VALUE** | `5e-324` (The smallest positive number closest to zero, not a negative number)                                          |
| **Number.EPSILON**   | `2.220446049250313e-16` (The tiny difference between 1 and the next inspectable float—used to safely compare fractions) |

- **`MAX_VALUE`** is the absolute cutoff after which the value becomes `Infinity`.
- **`MAX_SAFE_INTEGER`** is the maximum value safe to use as an integer. Beyond this point, it does not immediately become infinity, but it suffers from roundoff errors (meaning it gets inaccurate).

---

## Introduction to BigInt

To solve the limitations of `Number` with integers (as they can only hold up to `MAX_SAFE_INTEGER` properly), there is a separate data type in JS named `BigInt`.

You can create a `BigInt` by appending an `n` to the end of any integer, or by using the global `BigInt()` function:

```js
const explicitBigInt = 9007199254740995n; // Notice the 'n' at the end
const functionalBigInt = BigInt("9007199254740995"); // Useful for parsing large string IDs
```

> ⚠️ **Note:** `BigInt` is strictly for integers.

**`Number` caps out at 16 digits of precision, and `BigInt` completely ignores decimals.**

The standard JavaScript `Number` type can store between **15 to 17 significant decimal digits** in total. Crucially, this limit applies to **significant digits**, meaning it counts both the numbers _before_ and _after_ the decimal point combined.

To store and calculate highly precise decimal digits—like `0.00000000000000000000123456789`—JavaScript **cannot do it natively**.

---

## Handling Ultra-Precise Decimals

We can solve this limitation using two approaches:

### 1. Scaled Integers

```js
// Instead of storing 0.000000000000000005 BTC as a Number (which corrupts it)
// We scale it up by 10^18 and store it as a whole integer (called Satoshis/Wei)
const scaleFactor = 10n ** 18n;

let balance1 = 5n; // Represents 0.000000000000000005
let balance2 = 12n; // Represents 0.000000000000000012

let total = balance1 + balance2; // 17n

// To display it back to the user, you stitch the decimal back visually using strings
let rawString = total.toString().padStart(19, "0");
let formatted = "0." + rawString;
console.log(formatted); // "0.000000000000000017"
```

### 2. External Arbitrary-Precision Libraries

1. **Decimal.js**
2. **Big.js**
3. **Bignumber.js**
