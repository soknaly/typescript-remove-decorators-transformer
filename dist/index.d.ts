import * as ts from 'typescript';
declare const removeDecorators: (decorators: string[]) => ts.TransformerFactory<ts.SourceFile>;
export default removeDecorators;
