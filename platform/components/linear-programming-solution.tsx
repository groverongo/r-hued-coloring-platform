import { kColorsAtom, rFactorAtom } from "@/lib/atoms";
import { useAtom } from "jotai";
import { Info, Send } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useState } from "react";
import { Button } from "./ui/button";

interface ApiResponse {
    success: boolean;
    message?: string;
    data?: any;
}

export function LPSolution() {
    const [kColors, setKColors] = useState(2);
    const [rFactor, setRFactor] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState<ApiResponse | null>(null);

    const handleSubmit = async () => {
        setIsLoading(true);
        setResponse(null);
        
        try {
            // Replace with your actual API endpoint
            const response = await fetch('https://your-api-endpoint.com/solve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    k: kColors,
                    r: rFactor,
                }),
            });

            const data = await response.json();
            setResponse({
                success: response.ok,
                message: response.ok ? 'Request successful' : 'Request failed',
                data
            });
        } catch (error) {
            console.error('Error:', error);
            setResponse({
                success: false,
                message: 'Failed to connect to the server'
            });
        } finally {
            setIsLoading(false);
        }
    };

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
        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 w-full max-w-md">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center">
                <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm font-mono">E</span>
                                Experimental Solution (LP)

            </h3>
            
            <div className="space-y-4">
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <label htmlFor="k-colors" className="text-sm font-medium text-neutral-800 dark:text-neutral-200 flex items-center">
                            Number of Colors (k)
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button className="ml-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
                                            <Info className="h-4 w-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                        <p>Set the maximum number of colors to use for graph coloring (2-10)</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </label>
                        <div className="relative">
                            <input
                                id="k-colors"
                                type="number"
                                min="2"
                                max="10"
                                value={kColors}
                                onChange={handleKColorsChange}
                                className="w-24 px-3 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-md text-right font-mono text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-neutral-500 focus:border-transparent transition-all"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400 text-sm pointer-events-none">
                                {kColors}
                            </span>
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 px-1">
                        <span>2</span>
                        <span>10</span>
                    </div>
                    <input
                        type="range"
                        min="2"
                        max="10"
                        value={kColors}
                        onChange={handleKColorsChange}
                        className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full appearance-none cursor-pointer accent-neutral-900 dark:accent-neutral-200"
                    />
                </div>

                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <label htmlFor="r-factor" className="text-sm font-medium text-neutral-800 dark:text-neutral-200 flex items-center">
                            R-Factor
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button className="ml-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
                                            <Info className="h-4 w-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                        <p>Set the r-factor for the coloring algorithm (1 to k-1)</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </label>
                        <div className="relative">
                            <input
                                id="r-factor"
                                type="number"
                                min="1"
                                max={kColors - 1}
                                value={rFactor}
                                onChange={handleRFactorChange}
                                className="w-24 px-3 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-md text-right font-mono text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-neutral-500 focus:border-transparent transition-all"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400 text-sm pointer-events-none">
                                {rFactor}
                            </span>
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 px-1">
                        <span>1</span>
                        <span>{kColors - 1}</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max={kColors - 1}
                        value={rFactor}
                        onChange={handleRFactorChange}
                        className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full appearance-none cursor-pointer accent-neutral-900 dark:accent-neutral-200"
                    />
                </div>

                <div className="pt-4">
                    <Button 
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
                    >
                        {isLoading ? (
                            'Processing...'
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                Solve Linear Program
                            </>
                        )}
                    </Button>

                    {response && (
                        <div className={`mt-4 p-3 rounded-md text-sm relative ${
                            response.success 
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
                                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                        }`}>
                            <button 
                                onClick={() => setResponse(null)}
                                className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-600 dark:text-neutral-400 dark:hover:text-neutral-200"
                                aria-label="Close message"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                            <div className="pr-4">
                                <p className="font-medium">
                                    {response.success ? 'Success!' : 'Error'}
                                </p>
                                <p className="mt-1">{response.message}</p>
                                {response.data && (
                                    <pre className="mt-2 p-2 bg-white/50 dark:bg-black/20 rounded overflow-auto text-xs">
                                        {JSON.stringify(response.data, null, 2)}
                                    </pre>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}