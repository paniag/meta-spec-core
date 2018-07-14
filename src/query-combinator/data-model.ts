export namespace Data {
  export class ModelBuilder {
    constructor() {
      this.model = new Model();
    }

    addEntity(entity: Entity): void {
      // TODO: Implement. Should be idempotent.
    }

    addAttribute(attribute: Attribute): void {
      // TODO: Implement. Should be idempotent.
    }

    addRelationship(relationship: Relationship): void {
      // TODO: Implement. Should be idempotent.
    }

    getModel(): Model {
      return this.model;
    }

    private model: Model;
  }

  export class Model {
    constructor() {
      this.entities = [];
      this.relationships = {};
      this.attributes = {};
    }

    getEntities(): Array<string> {
      return this.entities;
    }

    getRelationships(): relationships {
      return this.relationships;
    }

    getAttributes(): attributes {
      return this.attributes;
    }

    private entities: Array<string>;
    private relationships: relationships;
    private attributes: attributes;
  }

  export interface Type {
    id: string;
    domain?: Type;
    codomain?: Type;
    cardinality?: string;
    innerType?: Type;
  }

  export interface Entity {
    id: string;
  }

  export interface Relationship {
    id: string;
    type: Type;
  }

  export interface Attribute {
    id: string;
    type: Type;
  }

  interface relationships {
    [id: string]: Relationship;
  }

  interface attributes {
    [id: string]: Attribute;
  }

  export const AttributeTypes = ['boolean', 'number', 'string'];
}