from python.answer_displayers.shared.answer_displayer import AnswerDisplayer


class YesNoFieldDisplayer(AnswerDisplayer):
    def __init__(self, answer: bool):
        self.raw_answer: bool = answer

    @property
    def _bool_to_yes_no(self):
        return "Yes" if self.raw_answer else "No"

    @property
    def as_csv(self):
        return self._bool_to_yes_no

    @property
    def as_txt(self):
        return self._bool_to_yes_no

    @property
    def as_pdf(self):
        return self._bool_to_yes_no
