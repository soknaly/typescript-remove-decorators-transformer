"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const removeDecorators = (decorators) => {
    const importsToRemove = [];
    const importsToPartialRemove = [];
    const updateNamedImports = (factory, node) => {
        const elements = node.elements.filter((element) => {
            return !decorators.includes(element.name.getText());
        });
        if (elements.length > 0) {
            factory.updateNamedImports(node, elements);
            if (elements.length < node.elements.length) {
                importsToPartialRemove.push(node.parent.parent);
            }
        }
        else {
            importsToRemove.push(node.parent.parent);
        }
    };
    const visit = (context) => {
        const visitor = (node) => {
            if (ts.isNamedImports(node)) {
                updateNamedImports(context.factory, node);
            }
            if (ts.isDecorator(node)) {
                const decorator = node;
                const identifier = decorator.getChildAt(1);
                const decoratorName = identifier.getText();
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
                // remove some imports
                if (ts.isImportDeclaration(resultNode)) {
                    const importDeclaration = resultNode;
                    const importClause = resultNode.importClause;
                    if (importClause && ts.isNamedImports(importClause.namedBindings)) {
                        const namedImports = importClause.namedBindings;
                        const elements = namedImports.elements.filter((element) => {
                            return !decorators.includes(element.name.getText());
                        });
                        if (elements.length > 0) {
                            const newNamedImports = ts.factory.updateNamedImports(namedImports, elements);
                            const newImportClause = ts.factory.updateImportClause(importClause, false, importClause.name, newNamedImports);
                            const newImportDeclaration = ts.factory.updateImportDeclaration(importDeclaration, importDeclaration.modifiers, newImportClause, resultNode.moduleSpecifier, importDeclaration.attributes);
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
    const factory = (context) => {
        return (sourceFile) => {
            return ts.visitNode(sourceFile, visit(context));
        };
    };
    return factory;
};
exports.default = removeDecorators;
