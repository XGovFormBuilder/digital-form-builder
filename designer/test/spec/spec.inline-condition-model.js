/* eslint-env mocha */
/* global expect */

'use strict'

import { ConditionsModel, Condition, Field, Value } from '../../client/inline-condition-model'

describe('inline condition model', () => {
  let underTest

  beforeEach(() => {
    underTest = new ConditionsModel()
  })

  describe('before adding the first condition', () => {
    it('should return an empty array', () => {
      expect(underTest.asArray()).to.deep.equal([])
    })

    it('should return an empty presentation string', () => {
      expect(underTest.toPresentationString()).to.equal('')
    })

    it('should not have conditions', () => {
      expect(underTest.hasConditions()).to.equal(false)
    })
  })

  describe('adding the first condition', () => {
    beforeEach(() => {
      underTest.add(new Condition(new Field('badger', 'Badger'), 'is', new Value('Monkeys')))
    })

    it('should have one item in the model', () => {
      expect(underTest.asArray()).to.deep.equal([
        { coordinator: undefined, field: { name: 'badger', display: 'Badger' }, operator: 'is', value: { value: 'Monkeys', display: 'Monkeys' } }
      ])
    })

    it('should return a human readable presentation string', () => {
      expect(underTest.toPresentationString()).to.equal('Badger is Monkeys')
    })

    it('should have conditions', () => {
      expect(underTest.hasConditions()).to.equal(true)
    })
  })

  describe('multiple conditions with a simple and', () => {
    beforeEach(() => {
      underTest.add(new Condition(new Field('badger', 'Badger'), 'is', new Value('Monkeys')))
      underTest.add(new Condition(new Field('monkeys', 'Monkeys'), 'is not', new Value('Giraffes'), 'and'))
      underTest.add(new Condition(new Field('squiffy', 'Squiffy'), 'is not', new Value('Donkeys'), 'and'))
    })

    it('should have three items in the model', () => {
      expect(underTest.asArray()).to.deep.equal([
        { coordinator: undefined, field: { display: 'Badger', name: 'badger' }, operator: 'is', value: { value: 'Monkeys', display: 'Monkeys' } },
        { coordinator: 'and', field: { display: 'Monkeys', name: 'monkeys' }, operator: 'is not', value: { value: 'Giraffes', display: 'Giraffes' } },
        { coordinator: 'and', field: { display: 'Squiffy', name: 'squiffy' }, operator: 'is not', value: { value: 'Donkeys', display: 'Donkeys' } }
      ])
    })

    it('should return a human readable presentation string with all properties', () => {
      expect(underTest.toPresentationString()).to.equal('Badger is Monkeys and Monkeys is not Giraffes and Squiffy is not Donkeys')
    })

    it('should have conditions', () => {
      expect(underTest.hasConditions()).to.equal(true)
    })
  })

  describe('multiple conditions with a simple or', () => {
    beforeEach(() => {
      underTest.add(new Condition(new Field('badger', 'Badger'), 'is', new Value('Monkeys')))
      underTest.add(new Condition(new Field('monkeys', 'Monkeys'), 'is not', new Value('Giraffes'), 'or'))
      underTest.add(new Condition(new Field('squiffy', 'Squiffy'), 'is not', new Value('Donkeys'), 'or'))
    })

    it('should have three items in the model', () => {
      expect(underTest.asArray()).to.deep.equal([
        { coordinator: undefined, field: { display: 'Badger', name: 'badger' }, operator: 'is', value: { value: 'Monkeys', display: 'Monkeys' } },
        { coordinator: 'or', field: { display: 'Monkeys', name: 'monkeys' }, operator: 'is not', value: { value: 'Giraffes', display: 'Giraffes' } },
        { coordinator: 'or', field: { display: 'Squiffy', name: 'squiffy' }, operator: 'is not', value: { value: 'Donkeys', display: 'Donkeys' } }
      ])
    })

    it('should return a human readable presentation string with all properties', () => {
      expect(underTest.toPresentationString()).to.equal('Badger is Monkeys or Monkeys is not Giraffes or Squiffy is not Donkeys')
    })
  })

  describe('or followed by and', () => {
    it('should return a human readable presentation string with all properties', () => {
      underTest.add(new Condition(new Field('badger', 'Badger'), 'is', new Value('Zebras')))
      underTest.add(new Condition(new Field('monkeys', 'Monkeys'), 'is', new Value('Giraffes'), 'or'))
      underTest.add(new Condition(new Field('squiffy', 'Squiffy'), 'is not', new Value('Donkeys'), 'and'))
      expect(underTest.toPresentationString()).to.equal('Badger is Zebras or (Monkeys is Giraffes and Squiffy is not Donkeys)')
    })
  })

  describe('and followed by or', () => {
    it('should return a human readable presentation string with all properties', () => {
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

    it('should return a human readable presentation string with all properties', () => {
      expect(underTest.toPresentationString())
        .to.equal('Badger is Zebras or (Monkeys is Giraffes and Squiffy is Donkeys) or Duration is at least 10 or (Birthday is 10/10/2019 and Squiffy is not Donkeys)')
    })
  })

  describe('invalid configuration', () => {
    describe('invalid operator', () => {
      it('should throw an error on condition creation if no operator provided', () => {
        expect(() => new Condition(new Field('badger', 'Badger'), null, new Value('Monkeys'))).to.throw(Error)
      })

      it('should throw an error on condition creation if non-string operator provided', () => {
        expect(() => new Condition(new Field('badger', 'Badger'), {}, new Value('Monkeys'))).to.throw(Error)
      })
    })

    describe('invalid field', () => {
      it('should throw an error on condition creation if no field provided', () => {
        expect(() => new Condition(null, 'is', new Value('Monkeys'))).to.throw(Error)
      })

      it('should throw an error on condition creation if field is not a Field type', () => {
        expect(() => new Condition({ value: 'badger', display: 'Badger' }, 'is', new Value('Monkeys'))).to.throw(Error)
      })

      it('should throw an error on field creation if no value provided', () => {
        expect(() => new Field(null, 'Badger')).to.throw(Error)
      })

      it('should throw an error on field creation if no display value provided', () => {
        expect(() => new Field('badger', null)).to.throw(Error)
      })
    })

    describe('invalid value', () => {
      it('should throw an error on condition creation if no value provided', () => {
        expect(() => new Condition(new Field('badger', 'Badger'), 'is', null)).to.throw(Error)
      })

      it('should throw an error on condition creation if value is not a Value type', () => {
        expect(() => new Condition({ value: 'badger', display: 'Badger' }, 'is', 'Monkeys')).to.throw(Error)
      })

      it('should throw an error on value creation if no value provided', () => {
        expect(() => new Value()).to.throw(Error)
      })

      it('should throw an error on value creation if display value is provided and is not a string', () => {
        expect(() => new Value('badger', {})).to.throw(Error)
      })
    })

    describe('invalid coordinator', () => {
      it('should throw an error on condition creation if invalid coordinator provided', () => {
        expect(() => new Condition(new Field('badger', 'Badger'), 'is', new Value('Monkeys'), 'is')).to.throw(Error)
      })

      it('should throw an error on adding first condition if a coordinator is provided', () => {
        expect(() => underTest.add(new Condition(new Field('badger', 'Badger'), 'is', new Value('Monkeys'), 'or'))).to.throw(Error)
      })

      it('should throw an error on adding subsequent condition if no coordinator is provided', () => {
        underTest.add(new Condition(new Field('badger', 'Badger'), 'is', new Value('Monkeys')))
        expect(() => underTest.add(new Condition(new Field('badger', 'Badger'), 'is', new Value('Monkeys')))).to.throw(Error)
      })
    })
  })
})
