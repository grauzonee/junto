import path from "node:path";
import Module from "node:module";

type ResolveFilename = (
    request: string,
    parent: NodeJS.Module | undefined,
    isMain: boolean,
    options?: unknown
) => string;

const originalResolveFilename: ResolveFilename = Reflect.get(Module, "_resolveFilename");
const sourceRoot = path.resolve(__dirname, "..");

Reflect.set(Module, "_resolveFilename", function resolveFilename(
    this: typeof Module,
    request: string,
    parent: NodeJS.Module | undefined,
    isMain: boolean,
    options?: unknown
) {
    if (request.startsWith("@/")) {
        return originalResolveFilename.call(
            this,
            path.join(sourceRoot, request.slice(2)),
            parent,
            isMain,
            options
        );
    }

    return originalResolveFilename.call(this, request, parent, isMain, options);
});
