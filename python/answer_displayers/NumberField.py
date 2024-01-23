from python.answer_displayers.shared.answer_displayer import AnswerDisplayer


class NumberFieldDisplayer(AnswerDisplayer):
    def __init__(self, answer: str, is_currency: bool = True):
        self.raw_answer = answer
        self.is_currency = is_currency

    @property
    def _answer_as_currency(self):
        return f"£{float(self.raw_answer):,.2f}"

    @property
    def as_csv(self):
        if self.is_currency:
            return self._answer_as_currency
        return self.raw_answer

    @property
    def as_txt(self):
        if self.is_currency:
            return self._answer_as_currency
        return self.raw_answer

    @property
    def as_pdf(self):
        if self.is_currency:
            return self._answer_as_currency
        return self.raw_answer
