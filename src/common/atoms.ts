import { atom } from "jotai";

export const screenRatioAtom = atom(0);

export const themeAtom = atom<'light' | 'dark'>('light');

export const nodesInfoAtom = atom<{ x: number; y: number }[]>([]);

export const linksInfoAtom = atom<{ fromIndex: number; toIndex: number }[]>([]);

export const nodeCurrentIndexAtom = atom<number | null>(null);

export const linkCurrentIndexAtom = atom<number | null>(null);