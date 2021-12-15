"use strict";
class HuffmanNode {
    constructor(weight) {
        this.weight = weight;
    }
}
class HuffmanBranchNode extends HuffmanNode {
    constructor(left, right) {
        super(left.weight + right.weight);
        this.left = left;
        this.right = right;
    }
}
class HuffmanLeafNode extends HuffmanNode {
    constructor(c, weight) {
        super(weight);
        this.c = c;
        this.weight = weight;
    }
}
function generateHuffmanMap(node, code, map = {}) {
    if (node instanceof HuffmanLeafNode) {
        if (code.length !== 0) {
            map[node.c] = code;
        }
        else {
            map[node.c] = [0];
        }
        return map;
    }
    generateHuffmanMap(node.left, [...code, 0], map);
    generateHuffmanMap(node.right, [...code, 1], map);
    return map;
}
function huffmanMap(bytesStrToEncode) {
    const frequencyMap = bytesStrToEncode.reduce((dict, byte) => {
        dict[byte] = (dict[byte] ?? 0) + 1;
        return dict;
    }, {});
    const q = Object
        .entries(frequencyMap)
        .map(([key, value]) => new HuffmanLeafNode(key, value));
    while (q.length > 1) {
        q.sort((a, b) => a.weight - b.weight);
        const x = q.shift();
        const y = q.shift();
        q.push(new HuffmanBranchNode(x, y));
    }
    const root = q[0];
    return generateHuffmanMap(root, []);
}
// Return bits array
function huffmanCompress(byteToEncode) {
    const bytesStr = byteToEncode.map(byte => byte.toString(2).padStart(8, '0'));
    const huffMap = huffmanMap(bytesStr);
    const compressed = flatMap(bytesStr.map(byte => huffMap[byte]));
    // 1 byte => max 256 map length (shifted by 1)
    const mapLength = Object.keys(huffMap).length - 1;
    // 1 byte => # of bytes per item code
    const bytesPerCode = Math.floor(Math.max(...Object.values(huffMap).map(i => i.length)) / 8 + 1);
    const fullCompressedComplex = [];
    fullCompressedComplex.push(toBitArray([mapLength]));
    fullCompressedComplex.push(toBitArray([bytesPerCode]));
    const bitsPerCode = bytesPerCode * 8;
    Object.entries(huffMap).forEach(([value, code]) => {
        const prefixBit = code[0] === 0 ? 1 : 0;
        const prefixBits = new Array(bitsPerCode - code.length).fill(prefixBit);
        fullCompressedComplex.push(toBitArray([Number.parseInt(value, 2)]));
        fullCompressedComplex.push(flatMap([prefixBits, code]));
    });
    fullCompressedComplex.push(compressed);
    return flatMap(fullCompressedComplex);
}
function huffmanDecompress(bits, decodeBytesCount) {
    const mapLength = bitsToByteArray(bits.slice(0, 8))[0] + 1;
    const bytesPerCode = bitsToByteArray(bits.slice(8, 16))[0];
    const bitsPerCode = bytesPerCode * 8;
    const bitsPerLegendItem = bitsPerCode + 8;
    const legendEnd = 16 + bitsPerLegendItem * mapLength;
    const legend = bits.slice(16, legendEnd);
    const compressedValues = bits.slice(legendEnd);
    const valueMap = {};
    for (let i = 0; i < mapLength; i++) {
        const pos = i * bitsPerLegendItem;
        const prefixedCode = legend.slice(pos + 8, pos + 8 + bitsPerCode);
        const beginIdx = prefixedCode.findIndex(bit => bit !== prefixedCode[0]);
        const code = prefixedCode.slice(beginIdx).join('');
        valueMap[code] = legend.slice(pos, pos + 8);
    }
    const decodedComplex = [];
    let pos = 0;
    for (let i = 0; i < decodeBytesCount; i++) {
        const str = compressedValues.slice(pos, pos + bitsPerCode).join('');
        for (let j = 1; j < bitsPerCode; j++) {
            const test = str.substr(0, j);
            if (valueMap[test]) {
                decodedComplex.push(valueMap[test]);
                pos = pos + j;
                break;
            }
        }
    }
    const payload = compressedValues.slice(pos);
    return [flatMap(decodedComplex), payload];
}
