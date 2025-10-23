import { atom } from "jotai";
import { ColoringAssigmentResponse } from "./validation";

export const screenRatioAtom = atom(0);

export const themeAtom = atom<'light' | 'dark'>('light');

// export const nodesInfoAtom = atom<{ x: number; y: number }[]>([]);

// export const linksInfoAtom = atom<{ fromIndex: number; toIndex: number }[]>([]);

export const vertexCurrentIdAtom = atom<string | null>(null);

export const edgeCurrentIdAtom = atom<string | null>(null);

export const coloringAtom = atom<ColoringAssigmentResponse | null>(null);

export const graphAdjacencyListAtom = atom<Map<string, Set<[string, string]>>>(new Map<string, Set<[string, string]>>());
export const vertexGraphAtom = atom<Map<string, {x: number, y: number, xRelative: number, yRelative: number}>>(new Map<string, {x: number, y: number, xRelative: number, yRelative: number}>());
export const edgeGraphAtom = atom<Map<string, {from: string, to: string, fromEntry: [string, string], toEntry: [string, string]}>>(new Map<string, {from: string, to: string, fromEntry: [string, string], toEntry: [string, string]}>());