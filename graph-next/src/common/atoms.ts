import NodeC from "@/classes/node";
import { atom } from "jotai";
import { CurrentLinkType, LinksType, SelectedObjectType } from "./types";

export const screenRatioAtom = atom(0);

export const themeAtom = atom<'light' | 'dark'>('light');

export const selectedObjectAtom = atom<SelectedObjectType>(null); 

export const currentLinkAtom = atom<CurrentLinkType>(null); 

export const nodesAtom = atom<NodeC[]>([]);

export const linksAtom = atom<LinksType[]>([]);

export const bodySavedAtom = atom<string>();

export const caretTimerAtom = atom<number>();

export const confirmWindowAtom = atom<bootstrap.Modal>();

export const jsonEditorAtom = atom<object>({"name": "exampleName", "outputs": { "output1": "string_val1", "output2": 2 }, "isAcceptState": false});

export const nodesInfoAtom = atom<{ x: number; y: number }[]>([]);

export const linksInfoAtom = atom<{ fromIndex: number; toIndex: number }[]>([]);
