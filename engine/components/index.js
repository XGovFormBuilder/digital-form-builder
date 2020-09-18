import nunjucks from 'nunjucks'

// Configure Nunjucks to allow rendering of content that is revealed conditionally.
nunjucks.configure([
  'node_modules/govuk-frontend/govuk/',
  'node_modules/govuk-frontend/govuk/components/',
  'node_modules/@xgovformbuilder/engine/views',
  'node_modules/@xgovformbuilder/engine/views/partials',
  'node_modules/@xgovformbuilder/designer/views',
  'node_modules/hmpo-components/components'
])
