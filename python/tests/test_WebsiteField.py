import pytest
from python.answer_displayers.WebsiteField import WebsiteFieldDisplayer

_TEST_INPUTS = _TEST_OUTPUTS = [
    "https://github.com/serenity-bdd/serenity-cucumber-starter",
    "https://fsd-funding-prototype-v2.herokuapp.com/cof-w2-v2/app-task-list-new",
    "https://fsd-funding-prototype-v2.herokuapp.com/cof-w2-v2/application-pages/about-project/about-project-06-yes",
    None,
]


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_csv(answer, expected_result):
    assert WebsiteFieldDisplayer(answer).as_csv == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_txt(answer, expected_result):
    assert WebsiteFieldDisplayer(answer).as_txt == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_pdf(answer, expected_result):
    assert WebsiteFieldDisplayer(answer).as_pdf == expected_result
