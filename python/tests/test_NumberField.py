import pytest
from python.answer_displayers.NumberField import NumberFieldDisplayer

_TEST_INPUTS = [
    "2300",
    "43434344343",
    "444444",
]

_TEST_OUTPUTS = [
    "£2,300.00",
    "£43,434,344,343.00",
    "£444,444.00",
]


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_csv(answer, expected_result):
    assert NumberFieldDisplayer(answer).as_csv == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_txt(answer, expected_result):
    assert NumberFieldDisplayer(answer).as_txt == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_pdf(answer, expected_result):
    assert NumberFieldDisplayer(answer).as_pdf == expected_result
