import {
  FONT_SIZE,
  NODE_G_COLORS,
  NODE_G_MODES,
  NODE_G_MODES_STYLE,
  NODE_RADIUS,
} from "@/common/constant";
import Konva from "konva";
import { Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Circle, Group, Text } from "react-konva";

export type NodeGRef = {
  x: number;
  y: number;
  text: string;
  colorIndex: number | null;
  isSelected: boolean;
  select: () => void;
  deselect: () => void;
  appendCharacter: (character: string) => void;
  deleteCharacter: () => void;
  changeColor: (index: number | null) => void;
};

export default function NodeG({
  ref,
  x,
  y,
  onSelect,
  draggable,
  mode,
}: {
  ref?: Ref<NodeGRef>;
  x: number;
  y: number;
  onSelect?: () => void;
  draggable?: boolean;
  mode: number;
}) {
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [text, setText] = useState<string>("");

  const GroupRef = useRef<Konva.Group>(null);

  const [colorIndex, setColorIndex] = useState<number | null>(null);

  useImperativeHandle(ref, () => ({
    x: GroupRef.current ? GroupRef.current.x() + x : x,
    y: GroupRef.current ? GroupRef.current.y() + y : y,
    text: text,
    colorIndex: colorIndex,
    isSelected: isSelected,
    select: () => {
      setIsSelected(true);
    },
    deselect: () => {
      setIsSelected(false);
    },
    appendCharacter: (character: string) => {
      setText((prev) => prev + character);
    },
    deleteCharacter: () => {
      if (text.length === 0) return;
      setText((prev) => prev.substring(0, prev.length - 1));
    },
    changeColor: (index: number | null) => {
      if (!isSelected) return;
      setColorIndex(index);
    },
  }));

  useEffect(() => {
    if (isSelected) {
      onSelect?.();
    }
  }, [isSelected]);

  return (
    <Group
      ref={GroupRef}
      onClick={() => {
        setIsSelected(!isSelected);
      }}
      onDragStart={() => {
        setIsSelected(true);
      }}
      draggable={draggable}
    >
      <Circle
        x={x}
        y={y}
        radius={NODE_RADIUS}
        fill={colorIndex === null ? "white" : NODE_G_COLORS[colorIndex].hex}
        stroke={
          isSelected
            ? NODE_G_MODES_STYLE[NODE_G_MODES[mode]].strokeColor
            : "black"
        }
      />
      <Text text={text} x={x-5*text.length} y={y-10} fontSize={FONT_SIZE} fill="black" />
    </Group>
  );
}
