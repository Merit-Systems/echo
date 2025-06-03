"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateApiKey = exports.EchoClient = void 0;
var client_1 = require("./client");
Object.defineProperty(exports, "EchoClient", { enumerable: true, get: function () { return client_1.EchoClient; } });
__exportStar(require("./types"), exports);
var auth_1 = require("./auth");
Object.defineProperty(exports, "validateApiKey", { enumerable: true, get: function () { return auth_1.validateApiKey; } });
//# sourceMappingURL=index.js.map