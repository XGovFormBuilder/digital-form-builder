from python.answer_displayers.shared.answer_displayer import AnswerDisplayer


class UkAddressFieldDisplayer(AnswerDisplayer):
    def __init__(self, answer: str):
        self.raw_answer = answer

    @property
    def _answer_with_null_replaced(self):
        if self.raw_answer.strip() == "null":
            return ""
        return self.raw_answer.replace(" null, ", " ")

    @property
    def as_csv(self):
        return self._answer_with_null_replaced

    @property
    def as_txt(self):
        return self._answer_with_null_replaced

    @property
    def as_pdf(self):
        return self._answer_with_null_replaced


class UkAddressFieldDisplayerMultiInput(AnswerDisplayer):
    def __init__(self, answer: dict[str, str]):
        self.raw_answer = answer

    @property
    def _comma_separated_address(self):
        return ", ".join(v for v in self.raw_answer.values() if v).strip()

    @property
    def as_csv(self):
        return self._comma_separated_address

    @property
    def as_txt(self):
        return self._comma_separated_address

    @property
    def as_pdf(self):
        return self._comma_separated_address
