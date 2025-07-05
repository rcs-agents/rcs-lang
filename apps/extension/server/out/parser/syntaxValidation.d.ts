import { Diagnostic } from 'vscode-languageserver/node';
import { RCLDocument } from '../types/rclTypes';
export declare class SyntaxValidator {
    validateDocument(document: RCLDocument): Diagnostic[];
    private validateAgentDefinitions;
    private validateAgentStructure;
    private validateFlowDefinitions;
    private validateFlowStructure;
    private validateTransition;
    private validateMessageDefinitions;
    private validateMessageStructure;
    private validateImports;
    private validateExpressions;
    private validateExpression;
    private validateTypeErrors;
    private validateTypeTag;
    private nodeToRange;
    private getParameterKey;
    private isStartState;
    private getTransitionFromState;
    private getTransitionToState;
    private getStateName;
    private getExpressionCode;
    private getTypeTagType;
    private getTypeTagValue;
    private isValidPhoneNumber;
    private isValidEmail;
    private isValidURL;
}
