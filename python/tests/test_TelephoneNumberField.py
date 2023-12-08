import pytest
from python.answer_displayers.TelephoneNumberField import TelephoneNumberFieldDisplayer

_TEST_INPUTS = _TEST_OUTPUTS = [
    "332323232",
    "123",
    "01234567890",
    "0000000000",
    "332332323232",
    "0000000000",
]


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_csv(answer, expected_result):
    assert TelephoneNumberFieldDisplayer(answer).as_csv == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_txt(answer, expected_result):
    assert TelephoneNumberFieldDisplayer(answer).as_txt == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_pdf(answer, expected_result):
    assert TelephoneNumberFieldDisplayer(answer).as_pdf == expected_result
