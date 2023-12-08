import pytest
from python.answer_displayers.YesNoField import YesNoFieldDisplayer

_TEST_INPUTS = [
    True,
    False,
]

_TEST_OUTPUTS = [
    "Yes",
    "No",
]


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_csv(answer, expected_result):
    assert YesNoFieldDisplayer(answer).as_csv == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_txt(answer, expected_result):
    assert YesNoFieldDisplayer(answer).as_txt == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_pdf(answer, expected_result):
    assert YesNoFieldDisplayer(answer).as_pdf == expected_result
