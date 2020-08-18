import findByPostcode from './address-service'
import * as ComponentTypes from '@xgovformbuilder/model/lib/component-types'
import * as ConditionalComponentTypes from '@xgovformbuilder/model/lib/conditional-component-types'
import * as Helpers from './helpers'
import Model from './model'
import Page from './page'
import Schema from '@xgovformbuilder/model/lib/schema'
import { plugin } from './index'

import {
  FeedbackContextInfo, RelativeUrl, decode
} from './feedback'

export { findByPostcode, ComponentTypes, ConditionalComponentTypes, Helpers, Model, Page, Schema, FeedbackContextInfo, RelativeUrl, decode }
export default plugin
