import pytest
from python.answer_displayers.DatePartsField import DatePartsFieldDisplayer

_TEST_INPUTS = [
    "2022-12-01",
    "2007-03-27",
    "2007-03-23",
    None,
]

_TEST_OUTPUTS = [
    "01 December 2022",
    "27 March 2007",
    "23 March 2007",
    None,
]


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_csv(answer, expected_result):
    assert DatePartsFieldDisplayer(answer).as_csv == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_txt(answer, expected_result):
    assert DatePartsFieldDisplayer(answer).as_txt == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_pdf(answer, expected_result):
    assert DatePartsFieldDisplayer(answer).as_pdf == expected_result
