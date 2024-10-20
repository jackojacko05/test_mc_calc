declare module 'logic-solver' {
  export class Solver {
    variable(name: string): any;
    require(constraint: any): void;
    maximize(objective: any): Solution | null;
  }

  export class Solution {
    evaluate(variable: any): number;
  }

  export function sum(terms: any[]): any;
  export function multiply(a: any, b: any): any;
  export function lessOrEqual(a: any, b: any): any;
}
