import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'

import { ConditionsModel, Condition, Field, Value, GroupDef } from '../client/inline-condition-model'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab

const { suite, describe, test, beforeEach } = lab

suite('inline condition model', () => {
  let underTest

  beforeEach(() => {
    underTest = new ConditionsModel()
  })

  describe('before adding the first condition', () => {
    test('should return an empty array', () => {
      expect(underTest.asPerUserGroupings).to.equal([])
    })

    test('should return an empty presentation string', () => {
      expect(underTest.toPresentationString()).to.equal('')
    })

    test('should not have conditions', () => {
      expect(underTest.hasConditions).to.equal(false)
    })
  })

  describe('adding the first condition', () => {
    beforeEach(() => {
      underTest.add(new Condition(new Field('badger', 'Badger'), 'is', new Value('Monkeys')))
    })

    test('should have one item in the model', () => {
      expect(underTest.asPerUserGroupings).to.equal([
        { coordinator: undefined, field: { name: 'badger', display: 'Badger' }, operator: 'is', value: { value: 'Monkeys', display: 'Monkeys' } }
      ])
    })

    test('should return a human readable presentation string', () => {
      expect(underTest.toPresentationString()).to.equal('Badger is Monkeys')
    })

    test('should have conditions', () => {
      expect(underTest.hasConditions).to.equal(true)
    })
  })

  describe('multiple conditions with a simple and', () => {
    beforeEach(() => {
      underTest.add(new Condition(new Field('badger', 'Badger'), 'is', new Value('Monkeys')))
      underTest.add(new Condition(new Field('monkeys', 'Monkeys'), 'is not', new Value('Giraffes'), 'and'))
      underTest.add(new Condition(new Field('squiffy', 'Squiffy'), 'is not', new Value('Donkeys'), 'and'))
    })

    test('should have three items in the model', () => {
      expect(underTest.asPerUserGroupings).to.equal([
        { coordinator: undefined, field: { display: 'Badger', name: 'badger' }, operator: 'is', value: { value: 'Monkeys', display: 'Monkeys' } },
        { coordinator: 'and', field: { display: 'Monkeys', name: 'monkeys' }, operator: 'is not', value: { value: 'Giraffes', display: 'Giraffes' } },
        { coordinator: 'and', field: { display: 'Squiffy', name: 'squiffy' }, operator: 'is not', value: { value: 'Donkeys', display: 'Donkeys' } }
      ])
    })

    test('should return a human readable presentation string with all properties', () => {
      expect(underTest.toPresentationString()).to.equal('Badger is Monkeys and Monkeys is not Giraffes and Squiffy is not Donkeys')
    })

    test('should have conditions', () => {
      expect(underTest.hasConditions).to.equal(true)
    })
  })

  describe('multiple conditions with a simple or', () => {
    beforeEach(() => {
      underTest.add(new Condition(new Field('badger', 'Badger'), 'is', new Value('Monkeys')))
      underTest.add(new Condition(new Field('monkeys', 'Monkeys'), 'is not', new Value('Giraffes'), 'or'))
      underTest.add(new Condition(new Field('squiffy', 'Squiffy'), 'is not', new Value('Donkeys'), 'or'))
    })

    test('should have three items in the model', () => {
      expect(underTest.asPerUserGroupings).to.equal([
        { coordinator: undefined, field: { display: 'Badger', name: 'badger' }, operator: 'is', value: { value: 'Monkeys', display: 'Monkeys' } },
        { coordinator: 'or', field: { display: 'Monkeys', name: 'monkeys' }, operator: 'is not', value: { value: 'Giraffes', display: 'Giraffes' } },
        { coordinator: 'or', field: { display: 'Squiffy', name: 'squiffy' }, operator: 'is not', value: { value: 'Donkeys', display: 'Donkeys' } }
      ])
    })

    test('should return a human readable presentation string with all properties', () => {
      expect(underTest.toPresentationString()).to.equal('Badger is Monkeys or Monkeys is not Giraffes or Squiffy is not Donkeys')
    })
  })

  describe('or followed by and', () => {
    test('should return a human readable presentation string with all properties', () => {
      underTest.add(new Condition(new Field('badger', 'Badger'), 'is', new Value('Zebras')))
      underTest.add(new Condition(new Field('monkeys', 'Monkeys'), 'is', new Value('Giraffes'), 'or'))
      underTest.add(new Condition(new Field('squiffy', 'Squiffy'), 'is not', new Value('Donkeys'), 'and'))
      expect(underTest.toPresentationString()).to.equal('Badger is Zebras or (Monkeys is Giraffes and Squiffy is not Donkeys)')
    })
  })

  describe('and followed by or', () => {
    test('should return a human readable presentation string with all properties', () => {
      underTest.add(new Condition(new Field('badger', 'Badger'), 'is', new Value('Zebras')))
      underTest.add(new Condition(new Field('squiffy', 'Squiffy'), 'is not', new Value('Donkeys'), 'and'))
      underTest.add(new Condition(new Field('monkeys', 'Monkeys'), 'is', new Value('Giraffes'), 'or'))
      expect(underTest.toPresentationString()).to.equal('(Badger is Zebras and Squiffy is not Donkeys) or Monkeys is Giraffes')
    })
  })

  describe('complicated conditions', () => {
    beforeEach(() => {
      underTest.add(new Condition(new Field('badger', 'Badger'), 'is', new Value('Zebras')))
      underTest.add(new Condition(new Field('monkeys', 'Monkeys'), 'is', new Value('Giraffes'), 'or'))
      underTest.add(new Condition(new Field('squiffy', 'Squiffy'), 'is', new Value('Donkeys'), 'and'))
      underTest.add(new Condition(new Field('duration', 'Duration'), 'is at least', new Value('10'), 'or'))
      underTest.add(new Condition(new Field('birthday', 'Birthday'), 'is', new Value('10/10/2019'), 'or'))
      underTest.add(new Condition(new Field('squiffy', 'Squiffy'), 'is not', new Value('Donkeys'), 'and'))
    })

    test('should return a human readable presentation string with all properties', () => {
      expect(underTest.toPresentationString())
        .to.equal('Badger is Zebras or (Monkeys is Giraffes and Squiffy is Donkeys) or Duration is at least 10 or (Birthday is 10/10/2019 and Squiffy is not Donkeys)')
    })
  })

  describe('replacing conditions', () => {
    beforeEach(() => {
      underTest.add(new Condition(new Field('badger', 'Badger'), 'is', new Value('Monkeys')))
      underTest.add(new Condition(new Field('monkeys', 'Monkeys'), 'is not', new Value('Giraffes'), 'and'))
      underTest.add(new Condition(new Field('squiffy', 'Squiffy'), 'is not', new Value('Donkeys'), 'and'))
    })

    test('should replace first condition without coordinator', () => {
      underTest.replace(0, new Condition(new Field('badger', 'Badger'), 'is', new Value('Giraffes')))
      expect(underTest.toPresentationString()).to.equal('Badger is Giraffes and Monkeys is not Giraffes and Squiffy is not Donkeys')
    })

    test('should replace subsequent condition with coordinator', () => {
      underTest.replace(2, new Condition(new Field('badger', 'Badger'), 'is', new Value('Giraffes'), 'and'))
      expect(underTest.toPresentationString()).to.equal('Badger is Monkeys and Monkeys is not Giraffes and Badger is Giraffes')
    })

    test('should not replace first condition with coordinator', () => {
      expect(() => underTest.replace(0, new Condition(new Field('badger', 'Badger'), 'is', new Value('Giraffes'), 'and'))).to.throw(Error)
    })

    test('should not replace condition for index equal to conditions length', () => {
      expect(() => underTest.replace(3, new Condition(new Field('badger', 'Badger'), 'is', new Value('Giraffes'), 'and'))).to.throw(Error)
    })

    test('should not replace condition for index greater than conditions length', () => {
      expect(() => underTest.replace(4, new Condition(new Field('badger', 'Badger'), 'is', new Value('Giraffes'), 'and'))).to.throw(Error)
    })

    test('should not replace subsequent condition without coordinator', () => {
      expect(() => underTest.replace(2, new Condition(new Field('badger', 'Badger'), 'is', new Value('Giraffes')))).to.throw(Error)
    })
  })

  describe('adding user generated groups', () => {
    beforeEach(() => {
      underTest.add(new Condition(new Field('badger', 'Badger'), 'is', new Value('Zebras')))
      underTest.add(new Condition(new Field('monkeys', 'Monkeys'), 'is', new Value('giraffes', 'Giraffes'), 'or'))
      underTest.add(new Condition(new Field('squiffy', 'Squiffy'), 'is', new Value('Donkeys'), 'and'))
      underTest.add(new Condition(new Field('duration', 'Duration'), 'is at least', new Value('10'), 'or'))
      underTest.add(new Condition(new Field('birthday', 'Birthday'), 'is', new Value('10/10/2019'), 'or'))
      underTest.add(new Condition(new Field('squiffy', 'Squiffy'), 'is not', new Value('Donkeys'), 'and'))
    })

    test('should apply defined group and auto-group the remaining conditions', () => {
      underTest.addGroups([new GroupDef(0, 1)])
      expect(underTest.toPresentationString())
        .to.equal('((Badger is Zebras or Monkeys is Giraffes) and Squiffy is Donkeys) or Duration is at least 10 or (Birthday is 10/10/2019 and Squiffy is not Donkeys)')
    })

    test('should be able to apply group with single and condition and not need to clarify', () => {
      underTest.addGroups([new GroupDef(1, 2)])
      expect(underTest.toPresentationString())
        .to.equal('Badger is Zebras or (Monkeys is Giraffes and Squiffy is Donkeys) or Duration is at least 10 or (Birthday is 10/10/2019 and Squiffy is not Donkeys)')
    })

    test('should correctly auto-group multiple user groups together', () => {
      underTest.addGroups([new GroupDef(0, 1), new GroupDef(2, 3)])
      expect(underTest.toPresentationString())
        .to.equal('((Badger is Zebras or Monkeys is Giraffes) and (Squiffy is Donkeys or Duration is at least 10)) or (Birthday is 10/10/2019 and Squiffy is not Donkeys)')
    })

    test('should correctly handle trailing and condition with existing groups', () => {
      underTest.addGroups([new GroupDef(0, 1), new GroupDef(2, 4)])
      expect(underTest.toPresentationString())
        .to.equal('(Badger is Zebras or Monkeys is Giraffes) and (Squiffy is Donkeys or Duration is at least 10 or Birthday is 10/10/2019) and Squiffy is not Donkeys')
    })

    test('should correctly clarify conditions inside user generated groups', () => {
      underTest.addGroups([new GroupDef(0, 2), new GroupDef(3, 5)])
      expect(underTest.toPresentationString())
        .to.equal('(Badger is Zebras or (Monkeys is Giraffes and Squiffy is Donkeys)) or (Duration is at least 10 or (Birthday is 10/10/2019 and Squiffy is not Donkeys))')
    })

    test('subsequent calls to addGroups should operate on the previously grouped entries', () => {
      underTest.addGroups([new GroupDef(0, 2)])
      underTest.addGroups([new GroupDef(1, 2)])
      expect(underTest.toPresentationString())
        .to.equal('(Badger is Zebras or (Monkeys is Giraffes and Squiffy is Donkeys)) or ((Duration is at least 10 or Birthday is 10/10/2019) and Squiffy is not Donkeys)')
    })

    test('subsequent calls to addGroups can create nested groups', () => {
      underTest.addGroups([new GroupDef(0, 1)])
      underTest.addGroups([new GroupDef(0, 1)])
      expect(underTest.toPresentationString())
        .to.equal('((Badger is Zebras or Monkeys is Giraffes) and Squiffy is Donkeys) or Duration is at least 10 or (Birthday is 10/10/2019 and Squiffy is not Donkeys)')
    })

    test('user groupings, but not automatic groupings, should be returned from asPerUserGroupings', () => {
      underTest.addGroups([new GroupDef(0, 1)])
      underTest.addGroups([new GroupDef(0, 1)])
      const returned = underTest.asPerUserGroupings
      expect(returned).to.equal([
        {
          conditions: [
            {
              conditions: [
                { coordinator: undefined, field: { display: 'Badger', name: 'badger' }, operator: 'is', value: { value: 'Zebras', display: 'Zebras' } },
                { coordinator: 'or', field: { display: 'Monkeys', name: 'monkeys' }, operator: 'is', value: { value: 'giraffes', display: 'Giraffes' } }
              ]
            },
            { coordinator: 'and', field: { display: 'Squiffy', name: 'squiffy' }, operator: 'is', value: { value: 'Donkeys', display: 'Donkeys' } }
          ]
        },
        { coordinator: 'or', field: { display: 'Duration', name: 'duration' }, operator: 'is at least', value: { value: '10', display: '10' } },
        { coordinator: 'or', field: { display: 'Birthday', name: 'birthday' }, operator: 'is', value: { value: '10/10/2019', display: '10/10/2019' } },
        { coordinator: 'and', field: { display: 'Squiffy', name: 'squiffy' }, operator: 'is not', value: { value: 'Donkeys', display: 'Donkeys' } }
      ])
    })
  })

  describe('splitting user generated groups', () => {
    beforeEach(() => {
      underTest.add(new Condition(new Field('badger', 'Badger'), 'is', new Value('Zebras')))
      underTest.add(new Condition(new Field('monkeys', 'Monkeys'), 'is', new Value('giraffes', 'Giraffes'), 'or'))
      underTest.add(new Condition(new Field('squiffy', 'Squiffy'), 'is', new Value('Donkeys'), 'and'))
      underTest.add(new Condition(new Field('duration', 'Duration'), 'is at least', new Value('10'), 'or'))
      underTest.add(new Condition(new Field('birthday', 'Birthday'), 'is', new Value('10/10/2019'), 'or'))
      underTest.add(new Condition(new Field('squiffy', 'Squiffy'), 'is not', new Value('Donkeys'), 'and'))
    })

    test('should split defined group and auto-group the remaining conditions', () => {
      underTest.addGroups([new GroupDef(0, 1)])
      underTest.splitGroup(0)
      expect(underTest.toPresentationString())
        .to.equal('Badger is Zebras or (Monkeys is Giraffes and Squiffy is Donkeys) or Duration is at least 10 or (Birthday is 10/10/2019 and Squiffy is not Donkeys)')
    })

    test('should split composite group and auto-group the remaining conditions', () => {
      underTest.addGroups([new GroupDef(0, 1)])
      underTest.addGroups([new GroupDef(0, 1)])
      underTest.splitGroup(0)
      expect(underTest.toPresentationString())
        .to.equal('((Badger is Zebras or Monkeys is Giraffes) and Squiffy is Donkeys) or Duration is at least 10 or (Birthday is 10/10/2019 and Squiffy is not Donkeys)')
    })

    test('should do nothing if trying to split a group that is not grouped', () => {
      underTest.splitGroup(0)
      expect(underTest.toPresentationString())
        .to.equal('Badger is Zebras or (Monkeys is Giraffes and Squiffy is Donkeys) or Duration is at least 10 or (Birthday is 10/10/2019 and Squiffy is not Donkeys)')
    })
  })

  describe('removing conditions and groups', () => {
    beforeEach(() => {
      underTest.add(new Condition(new Field('badger', 'Badger'), 'is', new Value('Zebras')))
      underTest.add(new Condition(new Field('monkeys', 'Monkeys'), 'is', new Value('giraffes', 'Giraffes'), 'or'))
      underTest.add(new Condition(new Field('squiffy', 'Squiffy'), 'is', new Value('Donkeys'), 'and'))
      underTest.add(new Condition(new Field('duration', 'Duration'), 'is at least', new Value('10'), 'or'))
      underTest.add(new Condition(new Field('birthday', 'Birthday'), 'is', new Value('10/10/2019'), 'or'))
      underTest.add(new Condition(new Field('squiffy', 'Squiffy'), 'is not', new Value('Donkeys'), 'and'))
    })

    test('should remove the specified condition indexes', () => {
      underTest.remove([1, 4])
      expect(underTest.asPerUserGroupings.length).to.equal(4)

      expect(underTest.toPresentationString())
        .to.equal('(Badger is Zebras and Squiffy is Donkeys) or (Duration is at least 10 and Squiffy is not Donkeys)')
    })

    test('should remove the only condition', () => {
      underTest.addGroups([new GroupDef(0, 5)])
      underTest.remove([0])
      expect(underTest.asPerUserGroupings.length).to.equal(0)
    })

    test('should allow removal of condition before group condition', () => {
      underTest.addGroups([new GroupDef(1, 2)])
      underTest.remove([0])
      expect(underTest.asPerUserGroupings.length).to.equal(4)
    })

    test('should remove all elements from a user-defined group', () => {
      expect(underTest.asPerUserGroupings.length).to.equal(6)
      underTest.addGroups([new GroupDef(0, 1)])
      expect(underTest.asPerUserGroupings.length).to.equal(5)
      underTest.remove([0])
      expect(underTest.asPerUserGroupings.length).to.equal(4)

      expect(underTest.toPresentationString())
        .to.equal('Squiffy is Donkeys or Duration is at least 10 or (Birthday is 10/10/2019 and Squiffy is not Donkeys)')
    })

    test('should remove all elements from a nested group', () => {
      expect(underTest.asPerUserGroupings.length).to.equal(6)
      underTest.addGroups([new GroupDef(0, 1)])
      underTest.addGroups([new GroupDef(0, 1)])
      expect(underTest.asPerUserGroupings.length).to.equal(4)
      underTest.remove([0])
      expect(underTest.asPerUserGroupings.length).to.equal(3)

      expect(underTest.toPresentationString())
        .to.equal('Duration is at least 10 or (Birthday is 10/10/2019 and Squiffy is not Donkeys)')
    })

    test('should do nothing if provided invalid index to remove', () => {
      expect(underTest.asPerUserGroupings.length).to.equal(6)

      underTest.remove([6])

      expect(underTest.toPresentationString())
        .to.equal('Badger is Zebras or (Monkeys is Giraffes and Squiffy is Donkeys) or Duration is at least 10 or (Birthday is 10/10/2019 and Squiffy is not Donkeys)')
    })
  })

  describe('name', () => {
    test('should set and return name', () => {
      underTest.name('some condition name')
      expect(underTest.name()).to.equal('some condition name')
    })

    test('should overwrite name', () => {
      underTest.name('some condition name')
      underTest.name('some condition name 2')
      expect(underTest.name()).to.equal('some condition name 2')
    })

    test('should return undefined if no name set', () => {
      expect(underTest.name()).to.equal(undefined)
    })
  })

  describe('clone', () => {
    beforeEach(() => {
      underTest.name('some condition name')
      underTest.add(new Condition(new Field('badger', 'Badger'), 'is', new Value('Zebras')))
      underTest.add(new Condition(new Field('monkeys', 'Monkeys'), 'is', new Value('giraffes', 'Giraffes'), 'or'))
      underTest.add(new Condition(new Field('squiffy', 'Squiffy'), 'is', new Value('Donkeys'), 'and'))
      underTest.add(new Condition(new Field('duration', 'Duration'), 'is at least', new Value('10'), 'or'))
      underTest.add(new Condition(new Field('birthday', 'Birthday'), 'is', new Value('10/10/2019'), 'or'))
      underTest.add(new Condition(new Field('squiffy', 'Squiffy'), 'is not', new Value('Donkeys'), 'and'))
    })

    test('should be cloned', () => {
      const returned = underTest.clone()
      expect(returned === underTest).to.equal(false)
      expect(returned).to.equal(underTest)

      let returnedCondition1 = returned.asPerUserGroupings[0]
      let underTestCondition1 = underTest.asPerUserGroupings[0]
      returnedCondition1.coordinator = 'or'
      underTestCondition1.coordinator = undefined
      expect(returnedCondition1).to.not.equal(underTestCondition1)
      expect(returned).to.equal(underTest)
    })
  })

  describe('moving conditions and groups', () => {
    beforeEach(() => {
      underTest.add(new Condition(new Field('badger', 'Badger'), 'is', new Value('Zebras')))
      underTest.add(new Condition(new Field('monkeys', 'Monkeys'), 'is', new Value('giraffes', 'Giraffes'), 'or'))
      underTest.add(new Condition(new Field('squiffy', 'Squiffy'), 'is', new Value('Donkeys'), 'and'))
      underTest.add(new Condition(new Field('duration', 'Duration'), 'is at least', new Value('10'), 'or'))
      underTest.add(new Condition(new Field('birthday', 'Birthday'), 'is', new Value('10/10/2019'), 'or'))
      underTest.add(new Condition(new Field('squiffy', 'Squiffy'), 'is not', new Value('Donkeys'), 'and'))
    })

    test('should move a condition earlier when not becoming the first item', () => {
      underTest.moveEarlier(3)

      expect(underTest.toPresentationString())
        .to.equal('Badger is Zebras or Monkeys is Giraffes or (Duration is at least 10 and Squiffy is Donkeys) or (Birthday is 10/10/2019 and Squiffy is not Donkeys)')
    })

    test('should move the last condition earlier', () => {
      underTest.moveEarlier(5)

      expect(underTest.toPresentationString())
        .to.equal('Badger is Zebras or (Monkeys is Giraffes and Squiffy is Donkeys) or (Duration is at least 10 and Squiffy is not Donkeys) or Birthday is 10/10/2019')
    })

    test('should move a condition earlier and switch co-ordinators when becoming the first item', () => {
      underTest.moveEarlier(1)

      expect(underTest.toPresentationString())
        .to.equal('Monkeys is Giraffes or (Badger is Zebras and Squiffy is Donkeys) or Duration is at least 10 or (Birthday is 10/10/2019 and Squiffy is not Donkeys)')
    })

    test('should move a condition group earlier and switch co-ordinators when becoming the first item', () => {
      underTest.addGroups([new GroupDef(1, 2)])
      underTest.moveEarlier(1)

      expect(underTest.toPresentationString())
        .to.equal('(Monkeys is Giraffes and Squiffy is Donkeys) or Badger is Zebras or Duration is at least 10 or (Birthday is 10/10/2019 and Squiffy is not Donkeys)')
    })

    test('move earlier does nothing when already the first item', () => {
      underTest.moveEarlier(0)

      expect(underTest.toPresentationString())
        .to.equal('Badger is Zebras or (Monkeys is Giraffes and Squiffy is Donkeys) or Duration is at least 10 or (Birthday is 10/10/2019 and Squiffy is not Donkeys)')
    })

    test('move earlier does nothing when before the first item', () => {
      underTest.moveEarlier(-1)

      expect(underTest.toPresentationString())
        .to.equal('Badger is Zebras or (Monkeys is Giraffes and Squiffy is Donkeys) or Duration is at least 10 or (Birthday is 10/10/2019 and Squiffy is not Donkeys)')
    })

    test('move earlier does nothing when after the last item', () => {
      underTest.moveEarlier(-1)

      expect(underTest.toPresentationString())
        .to.equal('Badger is Zebras or (Monkeys is Giraffes and Squiffy is Donkeys) or Duration is at least 10 or (Birthday is 10/10/2019 and Squiffy is not Donkeys)')
    })

    test('move later does nothing when already the last item', () => {
      underTest.moveLater(5)

      expect(underTest.toPresentationString())
        .to.equal('Badger is Zebras or (Monkeys is Giraffes and Squiffy is Donkeys) or Duration is at least 10 or (Birthday is 10/10/2019 and Squiffy is not Donkeys)')
    })

    test('move later does nothing when after the last item', () => {
      underTest.moveLater(6)

      expect(underTest.toPresentationString())
        .to.equal('Badger is Zebras or (Monkeys is Giraffes and Squiffy is Donkeys) or Duration is at least 10 or (Birthday is 10/10/2019 and Squiffy is not Donkeys)')
    })

    test('move later does nothing when before the first item', () => {
      underTest.moveLater(-1)

      expect(underTest.toPresentationString())
        .to.equal('Badger is Zebras or (Monkeys is Giraffes and Squiffy is Donkeys) or Duration is at least 10 or (Birthday is 10/10/2019 and Squiffy is not Donkeys)')
    })

    test('should move a condition later when not the first or last item', () => {
      underTest.moveLater(3)

      expect(underTest.toPresentationString())
        .to.equal('Badger is Zebras or (Monkeys is Giraffes and Squiffy is Donkeys) or Birthday is 10/10/2019 or (Duration is at least 10 and Squiffy is not Donkeys)')
    })

    test('should move penultimate condition later', () => {
      underTest.moveLater(4)

      expect(underTest.toPresentationString())
        .to.equal('Badger is Zebras or (Monkeys is Giraffes and Squiffy is Donkeys) or (Duration is at least 10 and Squiffy is not Donkeys) or Birthday is 10/10/2019')
    })

    test('should move a condition later and switch co-ordinators when moving the first item', () => {
      underTest.moveLater(0)

      expect(underTest.toPresentationString())
        .to.equal('Monkeys is Giraffes or (Badger is Zebras and Squiffy is Donkeys) or Duration is at least 10 or (Birthday is 10/10/2019 and Squiffy is not Donkeys)')
    })

    test('should move a condition group later and switch co-ordinators when moving the first item', () => {
      underTest.addGroups([new GroupDef(0, 1)])
      underTest.moveLater(0)

      expect(underTest.toPresentationString())
        .to.equal('(Squiffy is Donkeys and (Badger is Zebras or Monkeys is Giraffes)) or Duration is at least 10 or (Birthday is 10/10/2019 and Squiffy is not Donkeys)')
    })
  })

  describe('invalid configuration', () => {
    describe('invalid operator', () => {
      test('should throw an error on condition creation if no operator provided', () => {
        expect(() => new Condition(new Field('badger', 'Badger'), null, new Value('Monkeys'))).to.throw(Error)
      })

      test('should throw an error on condition creation if non-string operator provided', () => {
        expect(() => new Condition(new Field('badger', 'Badger'), {}, new Value('Monkeys'))).to.throw(Error)
      })
    })

    describe('invalid field', () => {
      test('should throw an error on condition creation if no field provided', () => {
        expect(() => new Condition(null, 'is', new Value('Monkeys'))).to.throw(Error)
      })

      test('should throw an error on condition creation if field is not a Field type', () => {
        expect(() => new Condition({ value: 'badger', display: 'Badger' }, 'is', new Value('Monkeys'))).to.throw(Error)
      })

      test('should throw an error on field creation if no value provided', () => {
        expect(() => new Field(null, 'Badger')).to.throw(Error)
      })

      test('should throw an error on field creation if invalid name value type provided', () => {
        expect(() => new Field({}, 'Badger')).to.throw(Error)
      })

      test('should throw an error on field creation if invalid display value type provided', () => {
        expect(() => new Field('Badger', {})).to.throw(Error)
      })

      test('should throw an error on field creation if no display value provided', () => {
        expect(() => new Field('badger', null)).to.throw(Error)
      })

      test('should throw errors from factory method', () => {
        expect(() => Field.from({ name: 'badger' })).to.throw(Error)
      })
    })

    describe('invalid value', () => {
      test('should throw an error on condition creation if no value provided', () => {
        expect(() => new Condition(new Field('badger', 'Badger'), 'is')).to.throw(Error)
      })

      test('should throw an error on condition creation if value is not a Value type', () => {
        expect(() => new Condition({ value: 'badger', display: 'Badger' }, 'is', 'Monkeys')).to.throw(Error)
      })

      test('should throw an error on value creation if no value provided', () => {
        expect(() => new Value()).to.throw(Error)
      })

      test('should throw an error on value creation if display value is provided and is not a string', () => {
        expect(() => new Value('badger', {})).to.throw(Error)
      })

      test('should throw an error on value creation if value is provided and is not a string', () => {
        expect(() => new Value({}, 'Badger')).to.throw(Error)
      })

      test('should throw errors from factory method', () => {
        expect(() => Value.from({})).to.throw(Error)
      })
    })

    describe('invalid coordinator', () => {
      test('should throw an error on condition creation if invalid coordinator provided', () => {
        expect(() => new Condition(new Field('badger', 'Badger'), 'is', new Value('Monkeys'), 'is')).to.throw(Error)
      })

      test('should throw an error on adding first condition if a coordinator is provided', () => {
        expect(() => underTest.add(new Condition(new Field('badger', 'Badger'), 'is', new Value('Monkeys'), 'or'))).to.throw(Error)
      })

      test('should throw an error on adding subsequent condition if no coordinator is provided', () => {
        underTest.add(new Condition(new Field('badger', 'Badger'), 'is', new Value('Monkeys')))
        expect(() => underTest.add(new Condition(new Field('badger', 'Badger'), 'is', new Value('Monkeys')))).to.throw(Error)
      })
    })

    describe('invalid group def', () => {
      test('should throw error if there is no last value', () => {
        expect(() => new GroupDef(3)).to.throw(Error)
      })

      test('should throw error if there is no first value', () => {
        expect(() => new GroupDef(null, 3)).to.throw(Error)
      })

      test('should throw error if first > last', () => {
        expect(() => new GroupDef(4, 3)).to.throw(Error)
      })

      test('should throw error if first == last', () => {
        expect(() => new GroupDef(4, 4)).to.throw(Error)
      })
    })
  })
})
