// Type definitions for compression
// Project: https://github.com/expressjs/compression
// Definitions by: Santi Albo <https://github.com/santialbo/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare module "compression" {
    import express = require('express');

    module e {
        interface CompressionOptions  {
            threshold?: number;
            filter?: Function;
        }
    }

    function e(options?: e.CompressionOptions): express.RequestHandler;
    export = e;
}