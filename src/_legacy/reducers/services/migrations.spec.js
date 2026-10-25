import oldReducer from '../../keyboard/__test__/reducerstructure0';
import migrations from './migrations';

describe('reducer migrations', function () {
  describe('migration 0', function () {
    let exampleState;
    beforeEach(function () {
      exampleState = {
        a: 'hi',
        keyboard: oldReducer(),
        c: 'world',
      };
    });
    it('should not affect any other keys in state', function () {
      const firstMigration = migrations[0](exampleState);
      expect(firstMigration).to.have.property('a', 'hi');
      expect(firstMigration).to.have.property('c', 'world');
      expect(firstMigration).to.have.property('keyboard').not.deep.equal(oldReducer());
    });
    it('should properly generate the right set of new keyboard command properties', function () {
      for (const value of Object.values(migrations[0](exampleState).keyboard)) {
        expect(value).to.have.all.keys(
          'command',
          'secondaryCommand',
          'key',
          'name',
          'description',
        );
        if (value.command.ctrlKey) {
          expect(value).to.have.property('secondaryCommand').not.be.null;
          expect(value.command).to.have.property('ctrlKey', true);
          expect(value.command).to.have.property('metaKey', false);
          expect(value.secondaryCommand).to.have.property('ctrlKey', false);
          expect(value.secondaryCommand).to.have.property('metaKey', true);
        } else {
          expect(value).to.have.property('secondaryCommand', null);
        }
      }
    });
  });
});
