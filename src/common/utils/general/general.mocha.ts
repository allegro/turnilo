import { expect } from 'chai';

import { List } from 'immutable';
import { moveInList, verifyUrlSafeName, makeTitle, inlineVars, ensureOneOf } from './general';

describe('General', () => {
  describe('moveInList', () => {
    it('works in simple case 0', () => {
      var list = List("ABCD".split(''));
      expect(moveInList(list, 0, 0).join('')).to.equal('ABCD');
    });

    it('works in simple case 1', () => {
      var list = List("ABCD".split(''));
      expect(moveInList(list, 0, 1).join('')).to.equal('ABCD');
    });

    it('works in simple case 2', () => {
      var list = List("ABCD".split(''));
      expect(moveInList(list, 0, 2).join('')).to.equal('BACD');
    });

    it('works in simple case 3', () => {
      var list = List("ABCD".split(''));
      expect(moveInList(list, 0, 3).join('')).to.equal('BCAD');
    });

    it('works in simple case 4', () => {
      var list = List("ABCD".split(''));
      expect(moveInList(list, 0, 4).join('')).to.equal('BCDA');
    });

  });


  describe('verifyUrlSafeName', () => {
    it('works in good case', () => {
      verifyUrlSafeName('a_b-c.d~E059');
    });

    it('works in bad case', () => {
      expect(() => {
        verifyUrlSafeName('abcd%po#@$moon is!cool');
      }).to.throw("'abcd%po#@$moon is!cool' is not a URL safe name. Try 'abcd_po_moon_is_cool' instead?");
    });

  });


  describe('makeTitle', () => {
    it('works in simple snake case', () => {
      expect(makeTitle('hello_world')).to.equal('Hello World');
    });

    it('works in simple camel case', () => {
      expect(makeTitle('helloWorld')).to.equal('Hello World');
    });

    it('works with leading and trailing _', () => {
      expect(makeTitle('_hello_world_')).to.equal('Hello World');
    });

    it('works with trailing numbers in the middle', () => {
      expect(makeTitle('hello99_world')).to.equal('Hello99 World');
    });

    it('works with trailing numbers at the end', () => {
      expect(makeTitle('hello_world99')).to.equal('Hello World99');
    });

  });


  describe('inlineVars', () => {
    it('works in simple case', () => {
      var json: any = {
        "hello": 1,
        "port": "%{PORT}%",
        "fox says %{}%": "%{FOX_SAYS}%"
      };

      var vars: Lookup<string> = {
        PORT: '1234',
        FOX_SAYS: 'Meow'
      };

      expect(inlineVars(json, vars)).to.deep.equal({
        "hello": 1,
        "port": "1234",
        "fox says %{}%": "Meow"
      });
    });

    it('throw error if can not find var', () => {
      var json: any = {
        "hello": 1,
        "port": "%{PORT}%",
        "fox says %{}%": "%{FOX_SAYS}%"
      };

      var vars: Lookup<string> = {
        PORT: '1234'
      };

      expect(() => inlineVars(json, vars)).to.throw("could not find variable 'FOX_SAYS'");
    });

  });


  describe('ensureOneOf', () => {
    it('does not thrown an error is one of', () => {
      ensureOneOf('Honda', ['Honda', 'Toyota', 'BMW'], 'Car');
    });

    it('throw error not one of', () => {
      expect(() => {
        ensureOneOf('United Kingdom', ['Honda', 'Toyota', 'BMW'], 'Car');
      }).to.throw("Car must be on of 'Honda', 'Toyota', 'BMW' (is 'United Kingdom')");
    });

    it('throw error not one of (undefined)', () => {
      expect(() => {
        ensureOneOf(undefined, ['Honda', 'Toyota', 'BMW'], 'Car');
      }).to.throw("Car must be on of 'Honda', 'Toyota', 'BMW' (is not defined)");
    });

  });

});


