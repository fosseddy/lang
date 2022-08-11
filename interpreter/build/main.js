#!/usr/bin/node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
function execFile(path) {
    return __awaiter(this, void 0, void 0, function* () {
        const text = yield promises_1.default.readFile(path, { encoding: "utf8" });
        console.log(text);
    });
}
function execPrompt() {
    console.log("not implemented");
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const args = process.argv.slice(2);
        if (args.length > 1) {
            process.stderr.write("Usage: interp [SCRIPT]\n");
            process.exit(1);
        }
        else if (args.length === 1) {
            yield execFile(args[0]);
        }
        else {
            execPrompt();
        }
    });
}
main().catch(err => {
    process.stderr.write(err.toString() + "\n");
    process.exit(1);
});
//# sourceMappingURL=main.js.map