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

export function test(name, callback) {
    try {
        callback()
        console.log(`✅ ${name}`)
    } catch (error) {
        console.error(`❌ ${name}`)
        console.error(error)
    }
}

export function expect(value) {
    return {
        toBe(expected) {
            if (value !== expected) {
                throw new Error(`${value} is not equal to ${expected}`)
            }
        },
        not: {
            toBe(expected) {
                if (value === expected) {
                    throw new Error(`${value} is equal to ${expected}`)
                }
            }
        }
    }
}