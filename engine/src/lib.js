import findByPostcode from './address-service'
import * as ComponentTypes from 'digital-form-builder-model/src/component-types'
import * as ConditionalComponentTypes from 'digital-form-builder-model/src/conditional-component-types'
import * as Helpers from './helpers'
import Model from './model'
import Page from './page'
import Schema from 'digital-form-builder-model/src/schema'
import { plugin } from './index'

export { findByPostcode, ComponentTypes, ConditionalComponentTypes, Helpers, Model, Page, Schema }
export default plugin
