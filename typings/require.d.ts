// from: https://github.com/TypeStrong/ts-loader/issues/146
// require in webpack clashes with NodeRequire so extending it here

interface NodeRequire {
   ensure: (paths: string[], callback: (require: <T>(path: string) => any) => void, name?: string) => void;
}