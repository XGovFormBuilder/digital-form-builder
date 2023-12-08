import pytest
from python.answer_displayers.CheckboxesField import CheckboxesFieldDisplayer

_TEST_INPUTS = [
    ["community-pride", "delivering-positive"],
    ["support-local-community"],
    [
        "community-pride",
        "social-trust",
        "participation",
        "local-economic",
        "delivering-positive",
    ],
]

_TEST_OUTPUTS = [
    "Community pride\nDelivering positive",
    "Support local community",
    "Community pride\nSocial trust\nParticipation\nLocal economic\nDelivering positive",
]


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_csv(answer, expected_result):
    assert CheckboxesFieldDisplayer(answer).as_csv == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_txt(answer, expected_result):
    assert CheckboxesFieldDisplayer(answer).as_txt == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_pdf(answer, expected_result):
    assert CheckboxesFieldDisplayer(answer).as_pdf == expected_result
