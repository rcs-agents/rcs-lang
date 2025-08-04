/**
 * JSON Schema validation utility for CSM machine definitions
 */

import Ajv from 'ajv';

// Re-export for convenience
export { default as Ajv } from 'ajv';

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    path: string;
    message: string;
    schemaPath?: string;
    data?: any;
    params?: any;
  }>;
}

export interface StructuralIssue {
  type: 'schema_reference' | 'structure_mismatch' | 'property_mismatch';
  severity: 'error' | 'warning' | 'info';
  message: string;
  recommendation?: string;
}

/**
 * Validates a machine definition against the CSM JSON schema
 */
export function validateMachineDefinition(
  machineDefinition: any,
  schema: any
): ValidationResult {
  const ajv = new Ajv({ allErrors: true, verbose: true });
  const validate = ajv.compile(schema);
  const isValid = validate(machineDefinition);

  const errors = (validate.errors || []).map(error => ({
    path: error.instancePath || 'root',
    message: error.message || 'Unknown validation error',
    schemaPath: error.schemaPath,
    data: error.data,
    params: error.params
  }));

  return { isValid, errors };
}

/**
 * Performs structural analysis to identify schema-implementation mismatches
 */
export function analyzeStructuralIssues(machineDefinition: any): StructuralIssue[] {
  const issues: StructuralIssue[] = [];

  // Check for multi-flow vs single-flow structure mismatch
  if (machineDefinition.flows && !machineDefinition.states) {
    issues.push({
      type: 'structure_mismatch',
      severity: 'error',
      message: 'Machine uses multi-flow structure but CSM implementation expects single-flow structure',
      recommendation: 'Either update CSM implementation to handle multi-flow machines, or flatten to single-flow structure'
    });
  }

  // Check for property naming mismatches
  if (machineDefinition.initialFlow && !machineDefinition.initial) {
    issues.push({
      type: 'property_mismatch',
      severity: 'error',
      message: 'Machine has "initialFlow" property but CSM implementation expects "initial"',
      recommendation: 'Update machine definition to use "initial" property or update CSM implementation'
    });
  }

  // Check $schema reference
  if (machineDefinition.$schema) {
    const schemaRef = machineDefinition.$schema;
    if (schemaRef.includes('csm-definition.schema.json') && !schemaRef.includes('csm.schema.json')) {
      issues.push({
        type: 'schema_reference',
        severity: 'warning',
        message: `Schema reference "${schemaRef}" may not match actual schema file name`,
        recommendation: 'Verify schema file name matches reference'
      });
    }
  }

  return issues;
}

/**
 * Comprehensive validation that includes both schema validation and structural analysis
 */
export function validateMachineDefinitionComprehensive(
  machineDefinition: any,
  schema: any
): {
  schemaValidation: ValidationResult;
  structuralIssues: StructuralIssue[];
  isFullyValid: boolean;
} {
  const schemaValidation = validateMachineDefinition(machineDefinition, schema);
  const structuralIssues = analyzeStructuralIssues(machineDefinition);
  
  const hasStructuralErrors = structuralIssues.some(issue => issue.severity === 'error');
  const isFullyValid = schemaValidation.isValid && !hasStructuralErrors;

  return {
    schemaValidation,
    structuralIssues,
    isFullyValid
  };
}

/**
 * Extracts the first flow from a multi-flow machine definition for single-flow compatibility
 */
export function extractSingleFlow(machineDefinition: any): any {
  if (!machineDefinition.flows) {
    return machineDefinition;
  }

  const flowNames = Object.keys(machineDefinition.flows);
  if (flowNames.length === 0) {
    throw new Error('No flows found in machine definition');
  }

  // Use initialFlow if specified, otherwise use first flow
  const targetFlowName = machineDefinition.initialFlow || flowNames[0];
  const targetFlow = machineDefinition.flows[targetFlowName];

  if (!targetFlow) {
    throw new Error(`Flow "${targetFlowName}" not found in machine definition`);
  }

  // Create single-flow compatible structure (legacy format)
  return {
    id: machineDefinition.id || targetFlow.id,
    initial: targetFlow.initial,
    states: targetFlow.states,
    meta: {
      ...machineDefinition.meta,
      ...targetFlow.meta,
      originalStructure: 'multi-flow',
      extractedFlow: targetFlowName
    }
  };
}