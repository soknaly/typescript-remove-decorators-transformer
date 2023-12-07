import * as ts from 'typescript';

const removeDecorators = (decorators: string[]): ts.TransformerFactory<ts.SourceFile> => {
    const importsToRemove: ts.ImportDeclaration[] = [];
    const importsToPartialRemove: ts.ImportDeclaration[] = [];
    const updateNamedImports = (factory: ts.NodeFactory, node: ts.NamedImports) => {
        const elements = node.elements.filter((element) => {
            return !decorators.includes(element.name.getText());
        });
        if (elements.length > 0) {
            factory.updateNamedImports(node, elements);
            if (elements.length < node.elements.length) {
                importsToPartialRemove.push(node.parent.parent);
            }
        } else {
            importsToRemove.push(node.parent.parent);
        }
    };

    const visit = (context: ts.TransformationContext) => {
        const visitor = (node: ts.Node): ts.Node => {
            if (ts.isNamedImports(node)) {
                updateNamedImports(context.factory, node);
            }
            if (ts.isDecorator(node)) {
                const decorator = node as ts.Decorator;
                let identifier = decorator.getChildAt(1);
                // Unexpected behavior (in windows am not sure yet). identifer supposed to be a Identifier but it is a CallExpression
                if (ts.isCallExpression(identifier)) {
                    identifier = identifier.expression as ts.Identifier;
                }
                let decoratorName = identifier.getText();
                if (decorators.includes(decoratorName)) {
                    return undefined;
                }
            }
            const resultNode = ts.visitEachChild(node, visitor, context);
            const index = importsToRemove.findIndex(function (id) { return id === resultNode; });
            if (index !== -1) {
                importsToRemove.splice(index, 1);
                return undefined;
            }
            const partialIndex = importsToPartialRemove.findIndex(function (id) { return id === resultNode; });
            if (partialIndex !== -1) {
                if (ts.isImportDeclaration(resultNode)) {
                    const importDeclaration = resultNode as ts.ImportDeclaration;
                    const importClause = resultNode.importClause;
                    if (importClause && ts.isNamedImports(importClause.namedBindings)) {
                        const namedImports = importClause.namedBindings;
                        const elements = namedImports.elements.filter((element) => {
                            return !decorators.includes(element.name.getText());
                        });
                        if (elements.length > 0) {
                            const newNamedImports = ts.factory.updateNamedImports(namedImports, elements);
                            const newImportClause = ts.factory.updateImportClause(importClause, false, importClause.name, newNamedImports);
                            const newImportDeclaration = ts.factory.updateImportDeclaration(
                                importDeclaration,
                                importDeclaration.modifiers,
                                newImportClause,
                                resultNode.moduleSpecifier,
                                importDeclaration.attributes
                            );
                
                            return newImportDeclaration;
                        }
                    }
                }
                return resultNode;
            }
            return resultNode;
        };
        return visitor;
    };

    const factory: ts.TransformerFactory<ts.SourceFile> = (context: ts.TransformationContext) => {
        return (sourceFile: ts.SourceFile) => {
            return ts.visitNode(sourceFile, visit(context)) as ts.SourceFile;
        }
    };

    return factory;
}

export default removeDecorators;