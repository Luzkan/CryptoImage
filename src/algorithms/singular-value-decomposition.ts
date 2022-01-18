// -------------------------------------------------------------
// Singular value decomposition algorithm

const blockSize = 8; // minimum m + 2
const preservedColumns = 2;
// const defaultBits = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0];
// const defaultBits = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
// const defaultBits = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const testBits = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
const defaultBits = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1];
// const defaultBits = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
// const defaultBits = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const correctBitsThreshold = 10
const repetitionNumber = 3


let totalBlocks = 0;
let correctBlocks = 0;

let totalCorrectBlockBits = 0;
let correctCorrectBlockBits = 0;

let totalBits = 0;
let correctBits = 0;

function bytesToWriteSVD(bmp: BMP) {

  return Math.floor(pixel3DArrayTo2DArrays(bmp.pixels3D)
    .flatMap(twoDimArrayToBlocks)
    .filter(block => !BlockSkipUtils.shouldBlockBeSkipped(block))
    .length * bitsPerBlock() / repetitionNumber / 8)
}

function bitsPerBlock(): number {

  return defaultBits.length
}

function singularValueDecompositionEncrypt(bmp: BMP, asciiMessage: string) {

  textIterator = new EncodedTextIterator(asciiMessage);

  const arrays = pixel3DArrayTo2DArrays(bmp.pixels3D);

  arrays.forEach(encrypt2DArray);

  return BMP.from3DArray(twoDimArraysToPixel3DArray(arrays));
}

function pixel3DArrayTo2DArrays(pixel3DArray: number[][][]): number[][][] {

  return [pixel3DArray, pixel3DArray, pixel3DArray].map((matrix, i) => matrix.map(vector => vector.map(pixel => pixel[i])));
}

function encrypt2DArray(twoDimArray: number[][]) {

  const blocks = twoDimArrayToBlocks(twoDimArray);
  blocks.forEach(encryptInBlock)
  overwriteBlocks(twoDimArray, blocks)
}

function twoDimArrayToBlocks(twoDimArray: number[][]): number[][][] {

  const blocksHeight = Math.floor(twoDimArray.length / blockSize);
  const blocksWidth = Math.floor(twoDimArray[0].length / blockSize);
  const blocks: number[][][] = []

  for (let y = 0; y < blocksHeight; y++) {
    for (let x = 0; x < blocksWidth; x++) {
      blocks.push(readBlock(twoDimArray, x, y))
    }
  }

  return blocks;
}

function readBlock(array: number[][], x: number, y: number): number[][] {

  const newBlock: number[][] = [];
  for (let currentY = y * blockSize; currentY < (y + 1) * blockSize; currentY++) {
    const newRow: number[] = [];
    for (let currentX = x * blockSize; currentX < (x + 1) * blockSize; currentX++) {
      newRow.push(array[currentY][currentX]);
    }
    newBlock.push(newRow);
  }
  return newBlock;
}

function encryptInBlock(block: number[][]) {
  totalBlocks++;
  if (BlockSkipUtils.shouldBlockBeSkipped(block)) {
    return;
  }
  correctBlocks++;
  const nextMessage = textIterator!.nextCharacterMessage();
  const [u, q, v] = SVD(block);
  const uDash = orthogonalize(createUDash(u, nextMessage));
  const aDash = dotProduct(dotProduct(uDash, q), transpose(v));
  const clippedADash = clipAndRound(aDash);
  clippedADash.forEach((row, y) => block[y] = row);

  totalCorrectBlockBits += nextMessage.length;
  correctCorrectBlockBits += countCorrectBits(decryptBlock(block, nextMessage.length, false), nextMessage);
}

function createUDash(u: number[][], bits: number[]): number[][] {

  const transformedBits = bitsToPlusOrNegativeOnes(bits)
  const uDash = JSON.parse(JSON.stringify(u))
  let currentBit = 0;

  for (let col = preservedColumns; col < blockSize; col++) {
    for (let row = 1; row < blockSize - (col - preservedColumns + 2) && currentBit < bits.length; row++) {
      uDash[row][col] = Math.abs(uDash[row][col]) * transformedBits[currentBit]
      currentBit++;
    }
  }

  return uDash;
}

function bitsToPlusOrNegativeOnes(bits: number[]): number[] {

  return bits.map(bit => bit + bit - 1)
}

function orthogonalize(block: number[][]): number[][] {

  const transposedBlock = transpose(block);
  for (let i = preservedColumns; i < blockSize - 1; i++) {
    orthogonalizeVector(transposedBlock[i], transposedBlock.slice(0, i))
  }
  return transpose(transposedBlock);
}

function transpose(matrix: number[][]): number[][] {

  return matrix[0].map((_, col) => matrix.map(row => row[col]));
}

// make a vector orthogonal to a set of other vectors by modifying its last values
function orthogonalizeVector(vector: number[], vectors: number[][]) {

  const equations = convertToLinearEquations(vector, vectors);
  const solutions = GaussianElimination.solve(equations);
  solutions.forEach((solution, i) => {
    vector[vector.length - (i + 1)] = solution
  })
}

// create an array of vectors representing linear equations solving of which 
// is necessary to make a vector orthogonal in orthogonalizeVector()
function convertToLinearEquations(vectorToOrthogonalize: number[], vectors: number[][]): number[][] {

  const numberOfVariables = vectors.length;
  return vectors.map(vector => {
    const equation: number[] = [];
    for (let i = 0; i < numberOfVariables; i++) {
      equation.push(vector[vector.length - (i + 1)])
    }
    let constant = 0;
    for (let i = 0; i < vector.length - numberOfVariables; i++) {
      constant += vectorToOrthogonalize[i] * vector[i]
    }
    equation.push(constant);
    return equation;
  })
}

function dotProduct(matrixA: number[][], matrixB: number[][]): number[][] {

  const matrixBTransposed = transpose(matrixB);
  return matrixA.map(rowA => matrixBTransposed.map(rowB => rowB.map((x, i) => x * rowA[i]).reduce((a, b) => a + b)));
}

function clipAndRound(matrix: number[][]): number[][] {
  return matrix.map(row => row.map(value => Math.min(255, Math.max(0, Math.round(value)))))
}

function overwriteBlocks(twoDimArray: number[][], blocks: number[][][]) {

  const blocksWidth = Math.floor(twoDimArray[0].length / blockSize);
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const x = i % blocksWidth;
    const y = Math.floor(i / blocksWidth);
    overwriteBlock(twoDimArray, block, x, y);
  }
}

function overwriteBlock(twoDimArray: number[][], block: number[][], x: number, y: number) {

  const xOffset = x * blockSize;
  const yOffset = y * blockSize;

  for (let currentY = 0; currentY < blockSize; currentY++) {
    for (let currentX = 0; currentX < blockSize; currentX++) {
      twoDimArray[yOffset + currentY][xOffset + currentX] = block[currentY][currentX];
    }
  }
}

function twoDimArraysToPixel3DArray(twoDimArrays: number[][][]): number[][][] {

  return twoDimArrays[0].map((vector, y) => vector.map((point, x) => [point, twoDimArrays[1][y][x], twoDimArrays[2][y][x]]))
}

function singularValueDecompositionDecrypt(bmp: BMP): [BMP, string] {

  const arrays = pixel3DArrayTo2DArrays(bmp.pixels3D)

  arrays.map(decrypt2DArray)

  const decodedMessage = charCodeArrayToString(bitsToByteArray(duplicationDecoder.message))

  console.log(`SVD: Correctly encoded ${correctBlocks}/${totalBlocks} blocks (${Math.round((correctBlocks * 10000) / totalBlocks) / 100}%)`)
  console.log(`SVD: Correctly decoded ${correctCorrectBlockBits}/${totalCorrectBlockBits} bits (${Math.round((correctCorrectBlockBits * 10000) / totalCorrectBlockBits) / 100}%)`)

  return [BMP.from3DArray(twoDimArraysToPixel3DArray(arrays)), decodedMessage];
}

function decrypt2DArray(twoDimArray: number[][]) {
  let blocks = twoDimArrayToBlocks(twoDimArray);
  blocks.filter(block => !BlockSkipUtils.shouldBlockBeSkipped(block)).map(block => decryptBlock(block));
  overwriteBlocks(twoDimArray, blocks);
}

function decryptBlock(block: number[][], messageSize = defaultBits.length, isDecoding = true): number[] {
  const decryptedMessage: number[] = [];
  const [u, q, v] = SVD(block);
  let currentBit = 0;
  for (let col = preservedColumns; col < blockSize; col++) {
    for (let row = 1; row < blockSize - (col - preservedColumns + 2) && currentBit < messageSize ; row++) {
      const bit = u[row][col] >= 0 ? 1 : 0;
      decryptedMessage.push(bit);
      currentBit++;
    }
  }
  if (isDecoding) {
    duplicationDecoder.nextBits(decryptedMessage);
  }
  return decryptedMessage;
}

function fill(block: number[][], ratio: number) {
  block.forEach(row => {
    for (let index = 0; index < row.length; index++) {
      row[index] = 255 * ratio;      
    }
  })
}

function countCorrectBits(bitsA: number[], bitsB: number[]): number {
  return bitsA.reduce((prev, cur, i) => prev + (cur == bitsB[i] ? 1 : 0), 0);
}

class EncodedTextIterator {

  private currentRepetition = 0;
  private currentCharacter = 0;
  private characters: number[][] = [];

  constructor(text: string) {
    this.characters = toBitArrays(asciiStringToCharCode(text))
  }

  nextCharacterMessage(): number[] {
    this.currentRepetition++;
    if (this.currentRepetition == repetitionNumber) {
      this.currentRepetition = 0;
      this.currentCharacter++;
    }
    return this.characters.length > this.currentCharacter ? this.characters[this.currentCharacter] : [0];
  }
}

let textIterator: EncodedTextIterator | undefined = undefined;

class DuplicationDecoder {

  message: number[] = [];
  private currentRepetition = 0;
  private currentMessage: number[][] = [];

  nextBits(bits: number[]) {
    this.currentMessage.push(bits);
    this.currentRepetition++;
    if (this.currentRepetition == repetitionNumber) {
      this.message = this.message.concat(this.mostProbableBits(this.currentMessage))
      this.currentRepetition = 0;
      this.currentMessage = [];
    }
  }

  private mostProbableBits(duplicatedMessages: number[][]): number[] {
    let message = [];
    for (let index = 0; index < duplicatedMessages[0].length; index++) {
      let ones = 0;
      let zeroes = 0;
      for (let messageIndex = 0; messageIndex < duplicatedMessages.length; messageIndex++) {
        if (duplicatedMessages[messageIndex][index] == 1) {
          ones++;
        } else {
          zeroes++;
        }
      }
      message.push(ones >= zeroes ? 1 : 0);
    }
    return message;
  }

}

let duplicationDecoder = new DuplicationDecoder();

class GaussianElimination {

  static solve(equations: number[][]): number[] {

    const rowEchelonForm = this.toRowEchelonForm(equations);
    return this.solveFromEchelonForm(rowEchelonForm).map(equations => equations[equations.length - 1])
  }

  private static toRowEchelonForm(equations: number[][]): number[][] {

    for (let variableIndex = 0; variableIndex < equations.length; variableIndex++) {
      const maxValueIndex = this.findMaxValueIndex(equations, variableIndex);
      this.swapRows(equations, variableIndex, maxValueIndex);
      for (let row = variableIndex + 1; row < equations.length; row++) {
        const factor = equations[row][variableIndex] / equations[variableIndex][variableIndex];
        this.subtractWithFactor(equations[row], equations[variableIndex], factor);
        equations[row][variableIndex] = 0;
      }
    }
    return equations;
  }

  private static findMaxValueIndex(equations: number[][], column: number): number {

    return equations.slice(column).map(equation => equation[column]).reduce((maxIndex, x, i, col) => x > col[maxIndex] ? i : maxIndex, 0) + column;
  }

  private static swapRows(equations: number[][], a: number, b: number) {

    let temp = equations[a];
    equations[a] = equations[b];
    equations[b] = temp;
  }

  private static subtractWithFactor(minuendRow: number[], subtrahendRow: number[], factor: number) {

    for (let i = 0; i < minuendRow.length; i++) {
      minuendRow[i] -= subtrahendRow[i] * factor;
    }
  }

  private static solveFromEchelonForm(equations: number[][]): number[][] {

    for (let i = 0; i < equations.length; i++) {
      const currentRowIndex = equations.length - (i + 1)
      const currentRow = equations[currentRowIndex];
      this.divideRowByConstant(currentRow, currentRow[currentRowIndex]);
      for (let i = 0; i < currentRowIndex; i++) {
        this.subtractWithFactor(equations[i], currentRow, equations[i][currentRowIndex]);
      };
    }
    return equations;
  }

  private static divideRowByConstant(row: number[], constant: number) {

    for (let i = 0; i < row.length; i++) {
      row[i] /= constant;
    }
  }
}

class BlockSkipUtils {

  static shouldBlockBeSkipped(block: number[][]): boolean {
    const [u, q, v] = SVD(block);
    const uDash = orthogonalize(createUDash(u, testBits));

    if (BlockSkipUtils.isCorrupted(uDash)) {
      return true;
    }

    const aDash = dotProduct(dotProduct(uDash, q), transpose(v));
    const clippedADash = clipAndRound(aDash);

    return countCorrectBits(decryptBlock(clippedADash, testBits.length, false), testBits) < correctBitsThreshold
  }

  private static isCorrupted(block: number[][]): boolean {
    for (let index = 0; index < block.length; index++) {
      const row = block[index];
      for (let j = 0; j < row.length; j++) {
        if (isNaN(row[j]) || row[j] == Infinity) {
          return true;
        }
      }
    }
    return false;
  }
}

// https://www.npmjs.com/package/svd-js
function SVD(a: number[][]) {
  // Define default parameters
  const withu = true
  const withv = true
  let eps = Math.pow(2, -12)
  const tol = 1e-64 / eps

  // throw error if a is not defined
  if (!a) {
    throw new TypeError('Matrix a is not defined')
  }

  // Householder's reduction to bidiagonal form

  const n = a[0].length
  const m = a.length

  if (m < n) {
    throw new TypeError('Invalid matrix: m < n')
  }

  let i: number, j: number, k: number, l: number = 0, l1, c, f, g, h, s, x, y, z

  g = 0
  x = 0
  const e = []

  const u = []
  const v = []

  const mOrN = (!withu) ? m : n

  // Initialize u
  for (i = 0; i < m; i++) {
    u[i] = new Array(mOrN).fill(0)
  }

  // Initialize v
  for (i = 0; i < n; i++) {
    v[i] = new Array(n).fill(0)
  }

  // Initialize q
  const q = new Array(n).fill(0)

  // Copy array a in u
  for (i = 0; i < m; i++) {
    for (j = 0; j < n; j++) {
      u[i][j] = a[i][j]
    }
  }

  for (i = 0; i < n; i++) {
    e[i] = g
    s = 0
    l = i + 1
    for (j = i; j < m; j++) {
      s += Math.pow(u[j][i], 2)
    }
    if (s < tol) {
      g = 0
    } else {
      f = u[i][i]
      g = f < 0 ? Math.sqrt(s) : -Math.sqrt(s)
      h = f * g - s
      u[i][i] = f - g
      for (j = l; j < n; j++) {
        s = 0
        for (k = i; k < m; k++) {
          s += u[k][i] * u[k][j]
        }
        f = s / h
        for (k = i; k < m; k++) {
          u[k][j] = u[k][j] + f * u[k][i]
        }
      }
    }
    q[i] = g
    s = 0
    for (j = l; j < n; j++) {
      s += Math.pow(u[i][j], 2)
    }
    if (s < tol) {
      g = 0
    } else {
      f = u[i][i + 1]
      g = f < 0 ? Math.sqrt(s) : -Math.sqrt(s)
      h = f * g - s
      u[i][i + 1] = f - g
      for (j = l; j < n; j++) {
        e[j] = u[i][j] / h
      }
      for (j = l; j < m; j++) {
        s = 0
        for (k = l; k < n; k++) {
          s += u[j][k] * u[i][k]
        }
        for (k = l; k < n; k++) {
          u[j][k] = u[j][k] + s * e[k]
        }
      }
    }
    y = Math.abs(q[i]) + Math.abs(e[i])
    if (y > x) {
      x = y
    }
  }

  // Accumulation of right-hand transformations
  if (withv) {
    for (i = n - 1; i >= 0; i--) {
      if (g !== 0) {
        h = u[i][i + 1] * g
        for (j = l; j < n; j++) {
          v[j][i] = u[i][j] / h
        }
        for (j = l; j < n; j++) {
          s = 0
          for (k = l; k < n; k++) {
            s += u[i][k] * v[k][j]
          }
          for (k = l; k < n; k++) {
            v[k][j] = v[k][j] + s * v[k][i]
          }
        }
      }
      for (j = l; j < n; j++) {
        v[i][j] = 0
        v[j][i] = 0
      }
      v[i][i] = 1
      g = e[i]
      l = i
    }
  }

  // Accumulation of left-hand transformations
  if (withu) {
    if (!withu) {
      for (i = n; i < m; i++) {
        for (j = n; j < m; j++) {
          u[i][j] = 0
        }
        u[i][i] = 1
      }
    }
    for (i = n - 1; i >= 0; i--) {
      l = i + 1
      g = q[i]
      for (j = l; j < mOrN; j++) {
        u[i][j] = 0
      }
      if (g !== 0) {
        h = u[i][i] * g
        for (j = l; j < mOrN; j++) {
          s = 0
          for (k = l; k < m; k++) {
            s += u[k][i] * u[k][j]
          }
          f = s / h
          for (k = i; k < m; k++) {
            u[k][j] = u[k][j] + f * u[k][i]
          }
        }
        for (j = i; j < m; j++) {
          u[j][i] = u[j][i] / g
        }
      } else {
        for (j = i; j < m; j++) {
          u[j][i] = 0
        }
      }
      u[i][i] = u[i][i] + 1
    }
  }

  // Diagonalization of the bidiagonal form
  eps = eps * x
  let testConvergence
  for (k = n - 1; k >= 0; k--) {
    for (let iteration = 0; iteration < 50; iteration++) {
      // test-f-splitting
      testConvergence = false
      for (l = k; l >= 0; l--) {
        if (Math.abs(e[l]) <= eps) {
          testConvergence = true
          break
        }
        if (Math.abs(q[l - 1]) <= eps) {
          break
        }
      }

      if (!testConvergence) { // cancellation of e[l] if l>0
        c = 0
        s = 1
        l1 = l - 1
        for (i = l; i < k + 1; i++) {
          f = s * e[i]
          e[i] = c * e[i]
          if (Math.abs(f) <= eps) {
            break // goto test-f-convergence
          }
          g = q[i]
          q[i] = Math.sqrt(f * f + g * g)
          h = q[i]
          c = g / h
          s = -f / h
          if (withu) {
            for (j = 0; j < m; j++) {
              y = u[j][l1]
              z = u[j][i]
              u[j][l1] = y * c + (z * s)
              u[j][i] = -y * s + (z * c)
            }
          }
        }
      }

      // test f convergence
      z = q[k]
      if (l === k) { // convergence
        if (z < 0) {
          // q[k] is made non-negative
          q[k] = -z
          if (withv) {
            for (j = 0; j < n; j++) {
              v[j][k] = -v[j][k]
            }
          }
        }
        break // break out of iteration loop and move on to next k value
      }

      // Shift from bottom 2x2 minor
      x = q[l]
      y = q[k - 1]
      g = e[k - 1]
      h = e[k]
      f = ((y - z) * (y + z) + (g - h) * (g + h)) / (2 * h * y)
      g = Math.sqrt(f * f + 1)
      f = ((x - z) * (x + z) + h * (y / (f < 0 ? (f - g) : (f + g)) - h)) / x

      // Next QR transformation
      c = 1
      s = 1
      for (i = l + 1; i < k + 1; i++) {
        g = e[i]
        y = q[i]
        h = s * g
        g = c * g
        z = Math.sqrt(f * f + h * h)
        e[i - 1] = z
        c = f / z
        s = h / z
        f = x * c + g * s
        g = -x * s + g * c
        h = y * s
        y = y * c
        if (withv) {
          for (j = 0; j < n; j++) {
            x = v[j][i - 1]
            z = v[j][i]
            v[j][i - 1] = x * c + z * s
            v[j][i] = -x * s + z * c
          }
        }
        z = Math.sqrt(f * f + h * h)
        q[i - 1] = z
        c = f / z
        s = h / z
        f = c * g + s * y
        x = -s * g + c * y
        if (withu) {
          for (j = 0; j < m; j++) {
            y = u[j][i - 1]
            z = u[j][i]
            u[j][i - 1] = y * c + z * s
            u[j][i] = -y * s + z * c
          }
        }
      }
      e[l] = 0
      e[k] = f
      q[k] = x
    }
  }

  // Number below eps should be zero
  for (i = 0; i < n; i++) {
    if (q[i] < eps) q[i] = 0
  }

  let qArr: number[][] = []
  q.forEach((val, i) => {
    let row = new Array(q.length).fill(0)
    row[i] = val
    qArr.push(row)
  })
  return [u, qArr, v]
}