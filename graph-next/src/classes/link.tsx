
import { Ref, useEffect, useImperativeHandle, useState } from "react";
import { Line } from "react-konva";

export type LinkGProps = {
    fromIndex: number;
    toIndex: number;
    isSelected: boolean;
    select: () => void;
    deselect: () => void;
}

export default function LinkG({
    fromIndex,
    toIndex,
    from,
    to,
    ref,
    onSelect,
}: {
    fromIndex: number;
    toIndex: number;
    from: {x: number, y: number};
    to: {x: number, y: number};
    ref?: Ref<LinkGProps>;
    onSelect?: () => void;
}) {

    const [isSelected, setIsSelected] = useState<boolean>(false);


    useImperativeHandle(ref, () => ({
        fromIndex: fromIndex,
        toIndex: toIndex,
        isSelected: isSelected,
        select: () => setIsSelected(true),
        deselect: () => setIsSelected(false),
    }));

    useEffect(() => {
        if (isSelected) {
            onSelect?.();
        }
    }, [isSelected]);

    return (
        <Line
            points={[from.x, from.y, to.x, to.y]}
            stroke={isSelected ? "blue" : "black"}
            strokeWidth={2}
            onClick={() => {
                setIsSelected(!isSelected);
            }}
        />
    );
}

