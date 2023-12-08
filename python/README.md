```markdown
# Digital Form Runner Python Tools

This Python package provides essential tools for seamless integration with the Digital Form Runner, allowing you to handle and render data stored and persisted by the runner. These tools simplify data rendering tasks, making it easy to work with various form components and render data in different formats.

## Installation

You can install this package using pip:

```bash
pip install funding-service-design-digital-form-builder-tools
```

To get started, set up a virtual environment and install the required dependencies:

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows, use .venv\Scripts\activate.bat
pip install -r requirements.txt
```

## Usage

### Answer Displayers

The core functionality of this package is provided by "Answer Displayers." These classes allow you to render data from various form components. To use an Answer Displayer, simply import it and create an instance:

```python
from answer_displayers import CheckboxesFieldDisplayer

# answer typically comes from a database, written to by form-runner
answer = ["community-pride", "delivering-positive"]

displayer = CheckboxesFieldDisplayer(answer)

formatted_answer = displayer.as_csv
```

### Extending Functionality

You can extend this package's functionality by creating custom rendering methods or customizing existing ones. To do so:

1. Subclass the `AnswerDisplayer` abstract base class, name related to the component you want to render.
2. Implement all existing rendering methods, and add any new ones you need.
3. Ensure unit tests are updated to cover your new methods, showing input and expected output.
4. Ensure any new methods have concrete implementations in relevant subclasses.
5. Ensure your new class is imported in the `answer_displayers/__init__.py` file.
6. Update the `dictionaries.py` file to include your new class.

For example, to create a custom renderer for a new data format:

```python
from answer_displayers import AnswerDisplayer

class NewComponentDisplayer(AnswerDisplayer):
    def __init__(self, answer: str):
        self.raw_answer = answer

    @property
    def as_csv(self):
        ... # custom implementation

    @property
    def as_txt(self):
        ... # custom implementation

    @property
    def as_pdf(self):
        ... # custom implementation
```

### Testing

Unit tests are available in the `tests` folder. You can run the tests using `pytest`:

```bash
python -m pytest
```

These tests focus on unit testing and do not rely on external databases or resources.

### Versioning

This package follows semantic versioning. If there are changes that break the API or introduce new features, update the version accordingly in the `pyproject.toml` file.

## Purpose

This package simplifies the process of rendering data from the Digital Form Runner's various components. By using Answer Displayers, you can easily adapt data for different output formats, saving time and effort in data handling and rendering.

For more details, documentation, and updates, visit the [GitHub repository](https://github.com/communitiesuk/digital-form-builder/) for this project.

Feel free to contribute and extend this package with additional tools and functionalities as needed.
```
