import { FONT_SIZE, NODE_RADIUS } from "@/common/constant";
import { SelectedObjectType } from "@/common/types";
import { drawText, strokeThemeBased } from "@/common/utilities";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Ref, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Circle, Group, Text } from "react-konva";

export type NodeGRef = {
  x: number;
  y: number;
  isSelected: boolean;
  select: () => void;
  deselect: () => void;
  appendCharacter: (character: string) => void;
  deleteCharacter: () => void;
};

export default function NodeG({
  ref,
  x,
  y,
  onSelect,
  draggable,
}: {
  ref?: Ref<NodeGRef>;
  x: number;
  y: number;
  onSelect?: () => void;
  draggable?: boolean;
}) {
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [text, setText] = useState<string>("");

  const GroupRef = useRef<Konva.Group>(null);

  useImperativeHandle(ref, () => ({
    x: GroupRef.current?.x() || x,
    y: GroupRef.current?.y() || y,
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
        console.log(isSelected)
        setIsSelected(!isSelected);
      }}
      onDragStart={() => {
        if (isSelected) return;
        setIsSelected(true);
      }}
      draggable={draggable}
    >
      <Circle
        x={x}
        y={y}
        radius={NODE_RADIUS}
        fill={"white"}
        stroke={isSelected ? "blue" : "black"}
      />
      <Text text={text} x={x} y={y} fontSize={FONT_SIZE} fill="black" />
    </Group>
  );
}
