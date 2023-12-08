import pytest
from python.answer_displayers.FreeTextField import FreeTextFieldDisplayer

_TEST_INPUTS = [
    "Tell us how you have engaged with the community about your intention to take ownership of the asset",
    "Tell us about the feasibility studies you have carried out for your project",
    "<p>Test Roles and Recruitment DPI Form</p>",
]

_TEST_OUTPUTS = [
    "Tell us how you have engaged with the community about your intention to take ownership of the asset",
    "Tell us about the feasibility studies you have carried out for your project",
    "Test Roles and Recruitment DPI Form",
]


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_csv(answer, expected_result):
    assert FreeTextFieldDisplayer(answer).as_csv == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_txt(answer, expected_result):
    assert FreeTextFieldDisplayer(answer).as_txt == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_pdf(answer, expected_result):
    assert FreeTextFieldDisplayer(answer).as_pdf == expected_result
