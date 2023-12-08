import pytest
from python.answer_displayers.MonthYearField import MonthYearFieldDisplayer
from python.answer_displayers.MonthYearField import MonthYearFieldDisplayerMultiInput

_TEST_INPUTS = [
    "2022-04",
    "2015-02",
    "1222-12",
    "2023-06",
]

_TEST_OUTPUTS = [
    "April 2022",
    "February 2015",
    "December 1222",
    "June 2023",
]


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_csv(answer, expected_result):
    assert MonthYearFieldDisplayer(answer).as_csv == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_txt(answer, expected_result):
    assert MonthYearFieldDisplayer(answer).as_txt == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_pdf(answer, expected_result):
    assert MonthYearFieldDisplayer(answer).as_pdf == expected_result


_TEST_INPUTS_MULTI_INPUT = [
    {"HpLJyL__month": 3, "HpLJyL__year": 2024},
    {"PrulfI__month": 6, "PrulfI__year": 2023},
]

_TEST_OUTPUTS_MULTI_INPUT = [
    "March 2024",
    "June 2023",
]


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS_MULTI_INPUT, _TEST_OUTPUTS_MULTI_INPUT),
)
def test_as_csv_multi_input(answer, expected_result):
    assert MonthYearFieldDisplayerMultiInput(answer).as_csv == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS_MULTI_INPUT, _TEST_OUTPUTS_MULTI_INPUT),
)
def test_as_txt_multi_input(answer, expected_result):
    assert MonthYearFieldDisplayerMultiInput(answer).as_txt == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS_MULTI_INPUT, _TEST_OUTPUTS_MULTI_INPUT),
)
def test_as_pdf_multi_input(answer, expected_result):
    assert MonthYearFieldDisplayerMultiInput(answer).as_pdf == expected_result
