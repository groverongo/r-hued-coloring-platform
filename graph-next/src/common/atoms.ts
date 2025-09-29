import NodeC from "@/classes/node";
import { atom } from "jotai";
import { CurrentLinkType, LinksType, SelectedObjectType } from "./types";

export const screenRatioAtom = atom(0);

export const shiftAtom = atom(false);

export const themeAtom = atom('light');

export const selectedObjectAtom = atom<SelectedObjectType>(null); 

export const currentLinkAtom = atom<CurrentLinkType>(null); 

export const movingObjectAtom = atom(false);

export const nodesAtom = atom<NodeC[]>([]);

export const linksAtom = atom<LinksType[]>([]);

export const bodySavedAtom = atom<string>();

export const inPanelAtom = atom(false);

export const inCanvasAtom = atom(false);

export const caretVisibleAtom = atom(true);

export const caretTimerAtom = atom<number>();

export const confirmWindowAtom = atom<bootstrap.Modal>();

export const originalClickAtom = atom<{x: number, y: number}>();

export const jsonEditorAtom = atom<object>({"name": "exampleName", "outputs": { "output1": "string_val1", "output2": 2 }, "isAcceptState": false});