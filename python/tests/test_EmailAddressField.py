import pytest
from python.answer_displayers.EmailAddressField import EmailAddressFieldDisplayer

_TEST_INPUTS = _TEST_OUTPUTS = [
    "testemailfundingservice@testemailfundingservice.com",
    "test@example.com",
    "test@test.com",
]


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_csv(answer, expected_result):
    assert EmailAddressFieldDisplayer(answer).as_csv == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_txt(answer, expected_result):
    assert EmailAddressFieldDisplayer(answer).as_txt == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_pdf(answer, expected_result):
    assert EmailAddressFieldDisplayer(answer).as_pdf == expected_result
