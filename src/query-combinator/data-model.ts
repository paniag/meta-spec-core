export namespace Data {
  export interface Model {
    entities: Array<string>;
    relationships: {
      [id: string]: Relationship;
    }
    attributes: {
      [id: string]: Attribute;
    }
  }

  export interface Relationship { }

  export interface Attribute { }

  export const AttributeTypes = ['boolean', 'number', 'string'];
}