const { expect } = require('chai');
import { updater } from './updater';

function valueEqual(a: any, b: any) {
  return a.value === b.value;
}

describe('updater', function () {
  it('one enter', () => {
    var ops: string[] = [];

    updater(
      [],
      [{ name: 'A' }],
      {
        equals: valueEqual,
        onEnter: (newThing) => {
          ops.push(`Enter ${newThing.name}`);
        },
        onUpdate: (newThing, oldThing) => {
          ops.push(`Update ${oldThing.name} ${oldThing.value} => ${newThing.value}`);
        },
        onExit: (oldThing) => {
          ops.push(`Exit ${oldThing.name}`);
        }
      }
    );

    expect(ops.join('; ')).to.equal('Enter A');
  });

  it('one exit', () => {
    var ops: string[] = [];

    updater(
      [{ name: 'A' }],
      [],
      {
        equals: valueEqual,
        onEnter: (newThing) => {
          ops.push(`Enter ${newThing.name}`);
        },
        onUpdate: (newThing, oldThing) => {
          ops.push(`Update ${oldThing.name} ${oldThing.value} => ${newThing.value}`);
        },
        onExit: (oldThing) => {
          ops.push(`Exit ${oldThing.name}`);
        }
      }
    );

    expect(ops.join('; ')).to.equal('Exit A');
  });

  it('enter / exit', () => {
    var ops: string[] = [];

    updater(
      [{ name: 'A' }],
      [{ name: 'B' }],
      {
        equals: valueEqual,
        onEnter: (newThing) => {
          ops.push(`Enter ${newThing.name}`);
        },
        onUpdate: (newThing, oldThing) => {
          ops.push(`Update ${oldThing.name} ${oldThing.value} => ${newThing.value}`);
        },
        onExit: (oldThing) => {
          ops.push(`Exit ${oldThing.name}`);
        }
      }
    );

    expect(ops.join('; ')).to.equal('Enter B; Exit A');
  });

  it('enter / update / exit', () => {
    var ops: string[] = [];

    updater(
      [{ name: 'A', value: 1 }, { name: 'B', value: 2 }],
      [{ name: 'B', value: 3 }, { name: 'C', value: 4 }],
      {
        equals: valueEqual,
        onEnter: (newThing) => {
          ops.push(`Enter ${newThing.name}`);
        },
        onUpdate: (newThing, oldThing) => {
          ops.push(`Update ${oldThing.name} ${oldThing.value} => ${newThing.value}`);
        },
        onExit: (oldThing) => {
          ops.push(`Exit ${oldThing.name}`);
        }
      }
    );

    expect(ops.join('; ')).to.equal('Update B 2 => 3; Enter C; Exit A');
  });

});

