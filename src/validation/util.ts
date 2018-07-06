export function IsBasicType(value: any): boolean {
  return typeof value === 'boolean'
    || typeof value === 'number'
    || typeof value === 'string';
}