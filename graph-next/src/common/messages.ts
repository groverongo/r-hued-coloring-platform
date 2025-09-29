const NOT_IN_IMPLEMENTATION = 'Method is not defined in implementaion';

export const CANVAS_ACTIONS = {
    DOUBLE_CLICK: {
        start: "[Canvas - DOUBLE_CLICK]: Action Start",
        end: "[Canvas - DOUBLE_CLICK]: Action End",
    },
    MOUSE_DOWN: {
        start: "[Canvas - MOUSE_DOWN]: Action Start",
        end: "[Canvas - MOUSE_DOWN]: Action End",
    },
    MOUSE_MOVE: {
        start: "[Canvas - MOUSE_MOVE]: Action Start",
        end: "[Canvas - MOUSE_MOVE]: Action End",
    },
    MOUSE_UP: {
        start: "[Canvas - MOUSE_UP]: Action Start",
        end: "[Canvas - MOUSE_UP]: Action End",
    },
};

export const CANVAS_CONDITIONS = {
    MISSING_CANVAS_REF: "[Canvas - Ref]: Is Null",
    MISSING_CANVAS_CONTEXT: "[Canvas - Context]: Is Null",
}