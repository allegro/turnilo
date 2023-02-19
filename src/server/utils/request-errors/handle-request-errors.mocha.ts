/*
 * Copyright 2017-2022 Allegro.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { expect } from "chai";
import { Response } from "express";
import sinon, { SinonSpy, SinonStub } from "sinon";
import { Logger } from "../../../common/logger/logger";
import { handleRequestErrors } from "./handle-request-errors";
import { AccessDeniedError, InvalidRequestError } from "./request-errors";

describe("handleRequestErrors", () => {
  const response: { status: SinonStub, send: SinonStub } = {} as any;
  const logger: { error: SinonSpy } = {} as any;

  beforeEach(() => {
    response.status = sinon.stub().returns(response);
    response.send = sinon.stub().returns(response);
    logger.error = sinon.spy();
  });

  const handleError = (e: Error) => handleRequestErrors(e, response as unknown as Response, logger as unknown as Logger);

  describe("InvalidRequestError", () => {
    it("should set response status to 400", () => {
      handleError(new InvalidRequestError("foobar"));
      expect(response.status.calledWith(400)).to.be.true;
    });

    it("should send error message as response", () => {
      handleError(new InvalidRequestError("foobar"));
      expect(response.send.calledWith({ error: "foobar" })).to.be.true;
    });
  });

  describe("AccessDeniedError", () => {
    it("should set response status to 403", () => {
      handleError(new AccessDeniedError("foobar"));
      expect(response.status.calledWith(403)).to.be.true;
    });

    it("should send error message as response", () => {
      handleError(new AccessDeniedError("foobar"));
      expect(response.send.calledWith({ error: "foobar" })).to.be.true;
    });
  });

  describe("Unexpected error", () => {
    it("should set response status to 500", () => {
      handleError(new Error("foobar"));
      expect(response.status.calledWith(500)).to.be.true;
    });

    it("should send error message in response", () => {
      handleError(new Error("foobar"));
      expect(response.send.calledWith({ message: "foobar", error: "Unexpected error" })).to.be.true;
    });

    it("should log error with stack", () => {
      handleError(new Error("foobar"));
      expect(logger.error.calledWithMatch("foobar\nError: foobar\n    at")).to.be.true;
    });
  });

});
