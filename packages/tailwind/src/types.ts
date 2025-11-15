/* eslint-disable @typescript-eslint/no-explicit-any */
export type VariableMap = Record<string, any>;

export interface TailwindThemeConfig {
  variables: VariableMap;
  componentVariables?: VariableMap;
}
