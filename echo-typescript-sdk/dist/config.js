"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = void 0;
exports.getConfig = getConfig;
exports.defaultConfig = {
    baseUrl: process.env.ECHO_BASE_URL || 'http://localhost:3000',
};
function getConfig(overrides) {
    return {
        ...exports.defaultConfig,
        ...overrides,
    };
}
//# sourceMappingURL=config.js.map