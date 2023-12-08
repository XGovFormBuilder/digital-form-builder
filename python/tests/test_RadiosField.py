import pytest
from python.answer_displayers.RadiosField import RadiosFieldDisplayer

_TEST_INPUTS = [
    "CIO",
    "other",
    "already-leased-by-organisation",
]

_TEST_OUTPUTS = [
    "CIO",
    "Other",
    "Already leased by organisation",
]


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_csv(answer, expected_result):
    assert RadiosFieldDisplayer(answer).as_csv == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_txt(answer, expected_result):
    assert RadiosFieldDisplayer(answer).as_txt == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_pdf(answer, expected_result):
    assert RadiosFieldDisplayer(answer).as_pdf == expected_result
