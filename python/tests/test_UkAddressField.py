import pytest
from python.answer_displayers.UkAddressField import UkAddressFieldDisplayer
from python.answer_displayers.UkAddressField import UkAddressFieldDisplayerMultiInput

_TEST_INPUTS = [
    "test, null, test, null, te3 2bf",
    "",
    "Test Address, null, Test Town Or City, null, QQ12 7QQ",
    "test, test, test, null, sa10 6fg",
    "null",
]

_TEST_OUTPUTS = [
    "test, test, te3 2bf",
    "",
    "Test Address, Test Town Or City, QQ12 7QQ",
    "test, test, test, sa10 6fg",
    "",
]


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_csv(answer, expected_result):
    assert UkAddressFieldDisplayer(answer).as_csv == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_txt(answer, expected_result):
    assert UkAddressFieldDisplayer(answer).as_txt == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS, _TEST_OUTPUTS),
)
def test_as_pdf(answer, expected_result):
    assert UkAddressFieldDisplayer(answer).as_pdf == expected_result


_TEST_INPUTS_MULTI_INPUT = [
    {
        "addressLine1": "268 Schultz Fold",
        "addressLine2": "",
        "town": "Upper Berge",
        "county": "",
        "postcode": "W12 0HS",
    }
]

_TEST_OUTPUTS_MULTI_INPUT = ["268 Schultz Fold, Upper Berge, W12 0HS"]


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS_MULTI_INPUT, _TEST_OUTPUTS_MULTI_INPUT),
)
def test_as_csv_multi_input(answer, expected_result):
    assert UkAddressFieldDisplayerMultiInput(answer).as_csv == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS_MULTI_INPUT, _TEST_OUTPUTS_MULTI_INPUT),
)
def test_as_txt_multi_input(answer, expected_result):
    assert UkAddressFieldDisplayerMultiInput(answer).as_txt == expected_result


@pytest.mark.parametrize(
    "answer, expected_result",
    zip(_TEST_INPUTS_MULTI_INPUT, _TEST_OUTPUTS_MULTI_INPUT),
)
def test_as_pdf_multi_input(answer, expected_result):
    assert UkAddressFieldDisplayerMultiInput(answer).as_pdf == expected_result
