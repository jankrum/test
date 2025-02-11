import { test, expect } from '/test.js'

function sum(x, y) {
    return x + y
}

test('Adds 2 + 2 to equal 4', () => {
    expect(sum(2, 2)).toBe(4)
})

test('Adds 2 + 2 to NOT equal 5', () => {
    expect(sum(2, 2)).not.toBe(5)
})

test('Lazy guy', async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    expect(sum(2, 2)).toBe(4)
})

test('Meant to fail', () => {
    expect(sum(2, 2)).toBe(5)
})