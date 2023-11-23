# Templating

If you find yourself faced with a form with content that needs to appear based on different field values, and there's a lot of options to choose from, putting all of this content in conditions may be at best very time-consuming, and at worst crash your form runner.

With this in mind, templating may be a good solution for you.

## How it works

You can allow fields to be exposed to the additional context by adding an `exposeToContext` flag to the component's options. This can be done manually, or through the "expose to context" field in the designer.

Once your field is exposed, the field can be used with additional context by adding the field in titles and html components, using nunjucks templating syntax, `{{ fieldName }}`.

You can also access additional values (such as custom html) using the additional context file. This will allow you to populate different variables based of the same user input, and these can be accessed using the format `{{ additionalContexts.contextName[fieldName].variableName }}`.

There is an example form set up to demonstrate this. If you start your runner, and navigate to http://localhost:3009/html-templating-example, you can choose either option and see the dynamic content on the next page.

## Adding your own additional context

You can add your own additional context by modifying the additional context json, located at `runner/src/server/templates/additionalContexts.json`.

Once you have added your own additionalContext namespace in the same way the example namespace is populated, you'll be able to add your context variables to your html component as stated above e.g for the example form, the list is set by referencing `{{ additionalContexts.example[contentToDisplay].listItems }}`.

### Using nunjucks filters

You can also apply nunjucks filters to your context, for example you may want to add the `safe` filter for printing html content. You would do this the same way you would in normal nunjucks, e.g. `{{ additionalContexts.example[contentToDisplay].listItems | safe }}`.

For more information about what nunjucks filters are available to you, [visit the Nunjucks docs](https://mozilla.github.io/nunjucks/templating.html#filters).
