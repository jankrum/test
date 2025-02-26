// function dm(tag, attributes = {}, ...children) {
//     const element = document.createElement(tag)

//     for (const [key, value] of Object.entries(attributes)) {
//         element.setAttribute(key, value)
//     }

//     for (const child of children) {
//         if (typeof child === 'string') {
//             element.appendChild(document.createTextNode(child))
//         } else if (child) {
//             element.appendChild(child)
//         }
//     }

//     return element
// }

// export function describe(name, func) { }

// export function it(name, func) {
//     console.log(`Test: ${name}`)
//     try {
//         func(5)
//         console.log(`%cSuccess: ${name}`, 'background-color: green;')
//     } catch (error) {
//         console.error(`Fail: ${name}\n${error.message}`)
//     }
// }


class Expectation {
    constructor(value) {
        this.value = value
    }

    toBe(expected) {
        if (this.value !== expected) {
            throw new Error(`${this.value} is not equal to ${expected}`)
        }
    }

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
        }
    }
}

class Test {
    constructor(name) {
        this.name = name
    }

    run(func) {
        console.log(`Test: ${this.name}`)
        try {
            func()
            console.log(`%cSuccess: ${this.name}`, 'background-color: green;')
        } catch (error) {
            console.error(`Fail: ${this.name}\n${error.message}`)
        }
    }
}

export class Suite {
    constructor(name) { }

    run(func) {
        func()
    }
}

export const expect = value => new Expectation(value)
export const test = (name, func) => new Test(name).run(func)
export const describe = (name, func) => new Suite(name).run(func)