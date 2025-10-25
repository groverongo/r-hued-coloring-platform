export default class CreateGraphRequestSerializer {
    static vertexGraphSerializer(value: Map<string, {
        x: number;
        y: number;
        xRelative: number;
        yRelative: number;
    }>): string {
        const result: Record<string, object> = {};
        for(const [k, v] of value.entries()) {
            result[k] = v;
        }
        return JSON.stringify(result);
    }

    static edgeGraphSerializer(value: Map<string, {
        from: string;
        to: string;
        fromEntry: [string, string];
        toEntry: [string, string];
    }>): string {
        const result: Record<string, object> = {};
        for(const [k, v] of value.entries()) {
            result[k] = v;
        }
        return JSON.stringify(result);
    }

    static graphAdjacencyListSerializer(value: Map<string, Set<[string, string]>>): string {
        const adjacencyList: Record<string, [string, string][]> = {};
        for(const [vertex, edges] of value) {
            adjacencyList[vertex] = Array.from(edges);
        }
        return JSON.stringify(adjacencyList);
    }

    static simpleGraphAdjacencyListSerializer(value: Map<string, Set<[string, string]>>): string {
        const adjacencyList: Record<string, string[]> = {};
        for(const [vertex, edges] of value) {
            adjacencyList[vertex] = Array.from(edges).map(([to, _]) => to);
        }
        return JSON.stringify(adjacencyList, null, 2);
    }

    static coloringSerializer(value: Record<string, number>): string {
        return JSON.stringify(value);
    }
};