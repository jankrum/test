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

class Expectation {
    /**
     * Stores the value to be tested
     * @param {any} value
     */
    constructor(value) {
        this.value = value
    }

    /**
     * Throws an error if the value is not equal to the expected value
     * @param {any} expected
     */
    toBe(expected) {
        if (this.value !== expected) {
            throw new Error(`${this.value} is not equal to ${expected}`)
        }
    }

    /**
     * Throws an error if the value is not equal to the expected value
     * @param {any} expected
     */
    toEqual(expected) {
        const valueJson = JSON.stringify(this.value)
        const expectedJson = JSON.stringify(expected)

        if (valueJson !== expectedJson) {
            throw new Error(`${valueJson} is not equal to ${expectedJson}`)
        }
    }

    not = {
        toBe(expected) {
            if (this.value === expected) {
                throw new Error(`${this.value} is equal to ${expected}`)
            }
        },
        toEqual(expected) {
            const valueJson = JSON.stringify(this.value)
            const expectedJson = JSON.stringify(expected)

            if (valueJson === expectedJson) {
                throw new Error(`${valueJson} is equal to ${expectedJson}`)
            }
        },
    }
}

class Test {
    static statusEnum = Object.freeze({
        initial: 0,
        pending: 1,
        passed: 2,
        failed: 3,
        skipped: 4,
        timeout: 5,
    })

    name
    callback
    #status
    #durationMs
    #errorMessage

    elements = {
        statusSpan: dm('span', { class: 'test-status' }),
        durationSpan: dm('span', { class: 'test-duration' }),
        errorDisplay: dm('p', { class: 'test-error' }),
    }

    constructor(name, callback) {
        this.name = name
        this.callback = callback

        this.status = Test.statusEnum.initial

        const { statusSpan, durationSpan, errorDisplay } = this.elements
        const nameSpan = dm('span', { class: 'test-name' }, name)

        const testParagraph = dm('p', {}, statusSpan, ' ', nameSpan, ' (', durationSpan, ')')
        const testDiv = dm('div', { class: 'test' }, testParagraph, errorDisplay)

        document.body.appendChild(testDiv)
    }

    get status() {
        return this.#status
    }

    set status(value) {
        this.#status = value

        const { initial, pending, passed, failed, skipped, timeout } = Test.statusEnum
        const { statusSpan } = this.elements

        switch (value) {
            case initial:
                statusSpan.innerText = 'Initial'
                statusSpan.className = 'test-status initial'
            case pending:
                statusSpan.innerText = 'Pending'
                statusSpan.className = 'test-status pending'
                break
            case passed:
                statusSpan.innerText = 'Passed'
                statusSpan.className = 'test-status passed'
                break
            case failed:
                statusSpan.innerText = 'Failed'
                statusSpan.className = 'test-status failed'
                break
            case skipped:
                statusSpan.innerText = 'Skipped'
                statusSpan.className = 'test-status skipped'
                break
            case timeout:
                statusSpan.innerText = 'Timeout'
                statusSpan.className = 'test-status timeout'
                break
            default:
                statusSpan.innerText = 'Unknown'
                statusSpan.className = 'test-status unknown'
                break
        }
    }

    get durationMs() {
        return this.#durationMs
    }

    set durationMs(value) {
        this.#durationMs = value
        this.elements.durationSpan.innerText = `${value ?? '?'}ms`
    }

    get errorMessage() {
        return this.#errorMessage
    }

    set errorMessage(value) {
        this.#errorMessage = value
        this.elements.errorDisplay.innerText = value
    }

    run() {
        this.status = Test.statusEnum.pending
        const startTimeMs = performance.now()
        try {
            this.callback(i => new Expectation(i))
            this.status = Test.statusEnum.passed
        } catch (error) {
            this.errorMessage = error.message
            this.status = Test.statusEnum.failed
        }
        const endTimeMs = performance.now()
        this.durationMs = endTimeMs - startTimeMs
    }
}

export class Suite {
    name
    callback
    tests = []

    constructor(name, callback) {
        this.name = name
        this.callback = callback
    }

    run() {
        const innerTest = (name, callback) => {
            const test = new Test(name, callback)
            this.tests.push(test)
        }

        this.callback(innerTest)

        for (const test of this.tests) {
            test.run()
        }
    }
}

class TestRunner {
    static debounceTimeMs = 50
    debounceTimeout = 0
    testsAndSuites = []

    run() {
        for (const testOrSuite of this.testsAndSuites) {
            testOrSuite.run()
        }
    }

    bounceTimer() {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout)
        }

        this.debounceTimeout = setTimeout(() => {
            this.run()
        }, TestRunner.debounceTimeMs)
    }

    makeTest(name, callback) {
        const test = new Test(name, callback)
        this.testsAndSuites.push(test)
        this.bounceTimer()
    }

    makeSuite(name, callback) {
        const suite = new Suite(name, callback)
        this.testsAndSuites.push(suite)
        this.bounceTimer()
    }
}

const testRunner = new TestRunner()

/**
 * Creates a test that will run the given function
 * @param {string} name
 * @param {function(function(any): Expectation): void} func
 */
export function test(name, func) {
    testRunner.makeTest(name, func)
}

/**
 *
 * @param {string} name
 * @param {function(test): void} func
 */
export function describe(name, func) {
    testRunner.makeSuite(name, func)
}
