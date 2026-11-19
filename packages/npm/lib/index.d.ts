export interface Estimate { cubicFeet: number; cubicYards: number; orderYards: number; bags80: number; bags60: number; bags40: number; suggestion: 'bags' | 'ready-mix'; }
export interface Rebar { barsAlongLength: number; barsAlongWidth: number; linearFeet: number; sticks20: number; }
export interface CostRange { low: number; high: number; currency: 'USD'; }
export type Finish = 'broom' | 'colored' | 'exposed' | 'stamped';
export interface PourAdvice { risk: 'low' | 'moderate' | 'high' | 'extreme'; start: string; tips: string[]; monsoon: boolean; cure: { footTrafficDays: number; vehicleDays: number; moistCureDays: number; fullStrengthDays: number }; }
export const BAG_YIELD: { 80: number; 60: number; 40: number };
export const FINISHES: Record<Finish, [number, number]>;
export function slabVolume(lengthFt: number, widthFt: number, thicknessIn: number): number;
export function footingVolume(lengthFt: number, widthIn: number, depthIn: number): number;
export function columnVolume(diameterIn: number, heightFt: number, count?: number): number;
export function stepsVolume(steps: number, riseIn: number, runIn: number, widthFt: number): number;
export function estimate(cubicFeet: number, waste?: number): Estimate;
export function rebar(lengthFt: number, widthFt: number, spacingIn?: number): Rebar;
export function meshSheets(areaSqFt: number): number;
export function costRange(areaSqFt: number, finish?: Finish, thicknessIn?: number, removeOld?: boolean): CostRange;
export function pourAdvice(forecastHighF: number, month?: number): PourAdvice;
