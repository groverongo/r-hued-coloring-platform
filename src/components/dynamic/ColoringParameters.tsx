import { kColorsAtom, rFactorAtom } from "@/common/atoms";
import { useAtom } from "jotai";

export function ColoringParameters() {
    const [kColors, setKColors] = useAtom(kColorsAtom);
    const [rFactor, setRFactor] = useAtom(rFactorAtom);

    const handleRFactorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number.parseInt(e.target.value, 10);
        if (!Number.isNaN(value) && value >= 1) {
            setRFactor(value);
        }
    };

    const handleKColorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number.parseInt(e.target.value, 10);
        if (!Number.isNaN(value) && value >= 2) {
            setKColors(value);
        }
    };

    return (
        <div className="flex flex-col space-y-2 p-4">
            <label className="text-sm font-medium">
                k:
                <input
                    type="number"
                    min="2"
                    value={kColors}
                    onChange={handleKColorsChange}
                    className="ml-2 p-1 border rounded w-20"
                />
            </label>
            <label className="text-sm font-medium">
                r:
                <input
                    type="number"
                    min="1"
                    max={kColors-1}
                    value={rFactor}
                    onChange={handleRFactorChange}
                    className="ml-2 p-1 border rounded w-20"
                />
            </label>
        </div>
    );
}