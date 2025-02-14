function dm(tag, attributes = {}, ...children) {
    const element = document.createElement(tag)

    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value)
    }

    for (const child of children) {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child))
        } else if (child) {
            element.appendChild(child)
        }
    }

    return element
}

const testSuite = {
    debounceTime: 100,  // ms
    tests: [],
    debounceTimer: null,
    addTest(name, callback) {
        const newTest = new Test(name, callback)
        document.body.appendChild(newTest.getElement())
        this.tests.push(newTest)
    },
    tryToRunTests() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer)
        }

        this.debounceTimer = setTimeout(() => {
            this.runTests()
        }, this.debounceTime)
    },
    async runTests() {
        const startTime = window.performance.now()

        // Run sequentially so globally shared state can be tested
        for (const test of this.tests) {
            await test.run()
        }

        const endTime = window.performance.now()

        const numberOfTests = this.tests.length
        const numberOfPassedTests = this.tests.filter(test => test.status === 'passed').length
        const numberOfFailedTests = this.tests.filter(test => test.status === 'failed').length

        const resultsDiv = dm('div', { id: 'results' },
            dm('p', {}, `Ran ${numberOfTests} tests in ${endTime - startTime}ms`),
            dm('p', { class: 'status-passed' }, `Passed: ${numberOfPassedTests}`),
            dm('p', { class: 'status-failed' }, `Failed: ${numberOfFailedTests}`),
        )

        document.body.appendChild(resultsDiv)

        window.scrollTo(0, document.body.scrollHeight)
    }
}

class Test {
    name = '%%NAME%%'
    callback
    status = ''
    duration
    errorMessage = ''

    elements = {
        statusDisplay: dm('span', { class: 'test-status-display' }, '%%STATUS%%'),
        nameDisplay: dm('span', { class: 'test-name-display' }, this.name),
        timeDisplay: dm('span', { class: 'test-time-display' }, '0ms'),
        errorDisplay: dm('p', { class: 'test-error-display' }, this.errorMessage),
    }

    constructor(name, callback) {
        this.name = name
        this.callback = callback
    }

    getElement() {
        this.updateElement()

        return dm('div', { class: 'test' },
            dm('p', {},
                this.elements.statusDisplay,
                ' ',
                this.elements.nameDisplay,
                this.elements.timeDisplay,
            ),
            this.elements.errorDisplay
        )
    }

    updateElement() {
        const statusDisplay = this.elements.statusDisplay
        statusDisplay.textContent = this.status.toUpperCase()
        statusDisplay.classList[this.status === 'pending' ? 'add' : 'remove']('status-pending')
        statusDisplay.classList[this.status === 'passed' ? 'add' : 'remove']('status-passed')
        statusDisplay.classList[this.status === 'failed' ? 'add' : 'remove']('status-failed')

        this.elements.nameDisplay.textContent = this.name

        this.elements.timeDisplay.textContent = ` (${this.duration ?? '?'}ms)`

        this.elements.errorDisplay.textContent = this.errorMessage
    }

    async run() {
        this.status = 'pending'
        this.updateElement()
        const startTime = window.performance.now()
        try {
            await this.callback()
            console.debug(`✅ ${this.name}`)
            this.status = 'passed'

        } catch (error) {
            console.debug(`❌ ${this.name}`)
            console.error(error)
            this.errorMessage = error.message
            this.status = 'failed'
        }
        const endTime = window.performance.now()
        this.duration = endTime - startTime
        this.updateElement()
    }
}

export function test(name, callback) {
    testSuite.addTest(name, callback)
    testSuite.tryToRunTests()
}

export function expect(actual) {
    return {
        toBe(expected) {
            if (actual !== expected) {
                throw new Error(`Expected ${actual} to be ${expected}.`)
            }
        },
        toStrictEqual(expected) {
            const actualStr = JSON.stringify(actual)
            const expectedStr = JSON.stringify(expected)
            if (actualStr !== expectedStr) {
                throw new Error(
                    `Expected ${actualStr} to strictly equal ${expectedStr}.`,
                )
            }
        },
        toThrow() {
            let threw = false
            try {
                if (typeof actual === 'function') {
                    actual()
                } else {
                    throw new Error('toThrow requires the actual value to be a function.')
                }
            } catch {
                threw = true
            }
            if (!threw) {
                throw new Error('Expected function to throw, but it did not.')
            }
        },
        not: {
            toBe(expected) {
                if (actual === expected) {
                    throw new Error(`Expected ${actual} not to be ${expected}.`)
                }
            },
            toStrictEqual(expected) {
                const actualStr = JSON.stringify(actual)
                const expectedStr = JSON.stringify(expected)
                if (actualStr === expectedStr) {
                    throw new Error(
                        `Expected ${actualStr} not to strictly equal ${expectedStr}.`,
                    )
                }
            },
            toThrow() {
                let threw = false
                try {
                    if (typeof actual === 'function') {
                        actual()
                    } else {
                        throw new Error('toThrow requires the actual value to be a function.')
                    }
                } catch {
                    threw = true
                }
                if (threw) {
                    throw new Error('Expected function not to throw, but it did.')
                }
            },
        },
    }
}