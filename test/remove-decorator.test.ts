import * as ts from 'typescript';
import removeDecorators from '../src';

describe('removeDecorators', () => {
  it('should remove all specified decorators from the code', () => {
    const source = `
      @decoratorToRemove
      class TestClass {
        @anotherDecoratorToRemove
        method() {}
      }
    `;
    const decoratorsToRemove = ['decoratorToRemove', 'anotherDecoratorToRemove']
    const sourceFile = ts.createSourceFile('temp.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const result = ts.transform(sourceFile!, [removeDecorators(decoratorsToRemove)]);
    const printer = ts.createPrinter();
    const code = printer.printFile(result.transformed[0]);
    expect(code).not.toContain('@decoratorToRemove');
    expect(code).not.toContain('@anotherDecoratorToRemove');
  });
  it('should remove only specified decorators from the code', () => {
    const source = `
      @decoratorToRemove
      class TestClass {
        @anotherDecoratorToRemove
        method() {}
      }
    `;
    const decoratorsToRemove = ['decoratorToRemove']
    const sourceFile = ts.createSourceFile('temp.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const result = ts.transform(sourceFile!, [removeDecorators(decoratorsToRemove)]);
    const printer = ts.createPrinter();
    const code = printer.printFile(result.transformed[0]);
    expect(code).not.toContain('@decoratorToRemove');
    expect(code).toContain('@anotherDecoratorToRemove');
  });
  it('should remove import statements for all specified decorators', () => {
    const source = `
      import { decoratorToRemove, anotherDecoratorToRemove } from './decorators';
      @decoratorToRemove
      class TestClass {
        @anotherDecoratorToRemove
        method() {}
      }
    `;
    const decoratorsToRemove = ['decoratorToRemove', 'anotherDecoratorToRemove'];
    const sourceFile = ts.createSourceFile('temp.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const result = ts.transform(sourceFile!, [removeDecorators(decoratorsToRemove)]);
    const printer = ts.createPrinter();
    const code = printer.printFile(result.transformed[0]);
    expect(code).not.toContain('import { decoratorToRemove, anotherDecoratorToRemove } from \'./decorators\';');
    expect(code).not.toContain('@decoratorToRemove');
    expect(code).not.toContain('@anotherDecoratorToRemove');
  });
  it('should remove import statements for all only specified decorators', () => {
    const source = `
      import { decoratorToRemove, anotherDecoratorToRemove } from './decorators';
      import { dA } from './decorators';
      @decoratorToRemove
      class TestClass {
        @anotherDecoratorToRemove
        @dA
        method() {}
      }
    `;
    const decoratorsToRemove = ['decoratorToRemove', 'dA'];
    const sourceFile = ts.createSourceFile('temp.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const result = ts.transform(sourceFile!, [removeDecorators(decoratorsToRemove)]);
    const printer = ts.createPrinter();
    const code = printer.printFile(result.transformed[0]);
    expect(code).toContain('import { anotherDecoratorToRemove } from \'./decorators\';');
    expect(code).not.toContain('import { dA } from \'./decorators\';');
    expect(code).not.toContain('@decoratorToRemove');
    expect(code).toContain('@anotherDecoratorToRemove');
  });
});