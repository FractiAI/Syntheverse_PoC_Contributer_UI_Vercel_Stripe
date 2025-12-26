/**
 * Helper functions for working with Drizzle numeric types
 * 
 * Drizzle's numeric() type returns strings, not numbers.
 * These helpers provide safe conversion and type handling.
 */

/**
 * Safely convert a Drizzle numeric string to a number
 * Returns null if the value is null, undefined, or invalid
 */
export function numericToNumber(value: string | null | undefined): number | null {
    if (value === null || value === undefined) {
        return null
    }
    const num = parseFloat(value)
    return isNaN(num) ? null : num
}

/**
 * Safely convert a Drizzle numeric string to a number with a default
 */
export function numericToNumberWithDefault(
    value: string | null | undefined,
    defaultValue: number = 0
): number {
    const num = numericToNumber(value)
    return num !== null ? num : defaultValue
}

/**
 * Type guard to check if a numeric value is valid
 */
export function isValidNumeric(value: string | null | undefined): value is string {
    return value !== null && value !== undefined && !isNaN(parseFloat(value))
}

/**
 * Convert numeric fields from a database result to numbers
 */
export function convertNumericFields<T extends Record<string, any>>(
    obj: T,
    fields: (keyof T)[]
): T {
    const result = { ...obj }
    for (const field of fields) {
        if (result[field] !== null && result[field] !== undefined) {
            result[field] = numericToNumber(result[field] as string) as any
        }
    }
    return result
}

