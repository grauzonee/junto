import path from "path";
import Module from "module";

type ResolveFilename = (
    request: string,
    parent: NodeJS.Module | undefined,
    isMain: boolean,
    options?: unknown
) => string;

const moduleWithResolver = Module as typeof Module & { _resolveFilename: ResolveFilename };
const originalResolveFilename = moduleWithResolver._resolveFilename;
const sourceRoot = path.resolve(__dirname, "..");

moduleWithResolver._resolveFilename = function resolveFilename(
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
};
